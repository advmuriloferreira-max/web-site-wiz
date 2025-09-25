import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { usePWANavigation } from '@/hooks/usePWANavigation';
import { z } from 'zod';
import { Loader2, Building, Shield, UserCheck } from 'lucide-react';

const signupSchema = z.object({
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(8, 'Confirmação de senha obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

interface ConviteData {
  email: string;
  nome: string;
  role: string;
}

export default function Convite() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  usePWANavigation(); // Initialize PWA navigation
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [convite, setConvite] = useState<ConviteData | null>(null);
  const [conviteValido, setConviteValido] = useState(false);

  useEffect(() => {
    if (token) {
      verificarConvite();
    }
  }, [token]);

  const verificarConvite = async () => {
    try {
      const { data, error } = await supabase
        .rpc('get_convite_data', { invite_token: token });

      if (error) throw error;

      if (data && data.length > 0) {
        setConvite(data[0]);
        setConviteValido(true);
      } else {
        setError('Convite inválido ou expirado');
      }
    } catch (error) {
      console.error('Erro ao verificar convite:', error);
      setError('Erro ao verificar convite. Verifique se o link está correto.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsCreating(true);

    if (!convite) {
      setError('Dados do convite não encontrados');
      setIsCreating(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    try {
      const validation = signupSchema.parse({ password, confirmPassword });
      
      // Registrar usuário
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: convite.email,
        password: validation.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            nome: convite.nome,
            role: convite.role
          }
        }
      });

      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError(signUpError.message);
        }
        return;
      }

      // Marcar convite como usado
      if (data.user) {
        await supabase
          .from('convites')
          .update({ 
            usado: true, 
            usado_em: new Date().toISOString() 
          })
          .eq('token', token);

        // Criar role do usuário
        await supabase.from('user_roles').insert([{
          user_id: data.user.id,
          role: convite.role as 'admin' | 'advogado' | 'assistente'
        }]);
      }

      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Verifique seu email para confirmar a conta."
      });

      // Redirecionar após sucesso
      setTimeout(() => {
        navigate('/auth');
      }, 2000);

    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'advogado':
        return 'Advogado';
      case 'assistente':
        return 'Assistente';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!conviteValido || !convite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Convite Inválido</CardTitle>
            <CardDescription>
              Este link de convite é inválido ou já expirou.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Entre em contato com o administrador para obter um novo convite.
            </p>
            <Button onClick={() => navigate('/auth')} className="w-full">
              Ir para Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center space-x-2">
            <Building className="h-8 w-8 text-primary" />
            <Shield className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Murilo Ferreira Advocacia
          </h1>
          <p className="text-muted-foreground">
            Você foi convidado para acessar o sistema
          </p>
        </div>

        {/* Convite Info */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <UserCheck className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-800">{convite.nome}</p>
                <p className="text-sm text-green-600">{convite.email}</p>
                <p className="text-xs text-green-600">
                  Função: {getRoleLabel(convite.role)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Signup Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Complete seu Cadastro</CardTitle>
            <CardDescription className="text-center">
              Defina uma senha segura para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Digite a senha novamente"
                  required
                  disabled={isCreating}
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando Conta...
                  </>
                ) : (
                  'Criar Minha Conta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Murilo Ferreira Advocacia • Sistema interno
        </p>
      </div>
    </div>
  );
}