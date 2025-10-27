import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';
import { Loader2, Building, Shield } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres')
});

const signupSchema = z.object({
  email: z.string().email('Email inválido').trim(),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  nome: z.string().trim().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo')
});

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const validation = loginSchema.parse({ email, password });
      const { error } = await signIn(validation.email, validation.password);
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setError('Email ou senha incorretos');
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao sistema de gestão de passivo bancário."
        });
        navigate('/');
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const nome = formData.get('nome') as string;

    try {
      const validation = signupSchema.parse({ email, password, nome });
      const { error } = await signUp(validation.email, validation.password, validation.nome);
      
      if (error) {
        if (error.message.includes('User already registered')) {
          setError('Este email já está cadastrado. Tente fazer login.');
        } else {
          setError(error.message);
        }
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu email para confirmar a conta."
        });
      }
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else {
        setError('Erro inesperado. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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
            INTELLBANK
          </h1>
          <p className="text-muted-foreground">
            Sistema de Gestão de Passivo Bancário
          </p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center">Autenticação</CardTitle>
            <CardDescription className="text-center">
              Entre com suas credenciais de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="space-y-4">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="login">Entrar</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Login Tab */}
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      name="email"
                      type="email"
                      placeholder="seu.email@escritorio.com"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Senha</Label>
                    <Input
                      id="login-password"
                      name="password"
                      type="password"
                      placeholder="Sua senha"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Entrando...
                      </>
                    ) : (
                      'Entrar'
                    )}
                  </Button>
                </form>
              </TabsContent>

              {/* Registro desabilitado - apenas admins podem criar usuários */}
            </Tabs>
          </CardContent>
        </Card>

        {/* Link para Cadastro de Escritório */}
        <Card className="shadow-lg bg-gradient-to-r from-primary/10 to-accent/10">
          <CardContent className="pt-6 text-center space-y-3">
            <p className="text-sm font-medium">Ainda não tem uma conta?</p>
            <p className="text-xs text-muted-foreground">
              Cadastre seu escritório e comece a usar o INTELLBANK gratuitamente por 7 dias
            </p>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/cadastro/escritorio')}
            >
              <Building className="mr-2 h-4 w-4" />
              Cadastrar Escritório
            </Button>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          INTELLBANK • Sistema interno
        </p>
      </div>
    </div>
  );
}