import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Building2, Mail, Phone, MapPin, User, Lock, CreditCard } from "lucide-react";
import { z } from "zod";

const cadastroSchema = z.object({
  nome: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(255),
  cnpj: z.string().optional(),
  email: z.string().email("Email inválido").max(255),
  telefone: z.string().optional(),
  endereco: z.string().optional(),
  plano: z.enum(["essencial", "premium"]),
  nomeResponsavel: z.string().min(3, "Nome deve ter no mínimo 3 caracteres").max(255),
  emailResponsavel: z.string().email("Email inválido").max(255),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100)
});

type CadastroFormData = z.infer<typeof cadastroSchema>;

export default function NovoEscritorio() {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof CadastroFormData, string>>>({});
  const [formData, setFormData] = useState<CadastroFormData>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "essencial",
    nomeResponsavel: "",
    emailResponsavel: "",
    senha: ""
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateForm = (): boolean => {
    try {
      cadastroSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof CadastroFormData, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof CadastroFormData] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro de validação",
        description: "Por favor, corrija os erros no formulário.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. Criar usuário no Supabase Auth
      const redirectUrl = `${window.location.origin}/`;
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.emailResponsavel,
        password: formData.senha,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nome: formData.nomeResponsavel,
            escritorio: formData.nome
          }
        }
      });

      if (authError) {
        if (authError.message.includes("already registered")) {
          throw new Error("Este email já está cadastrado. Tente fazer login.");
        }
        throw authError;
      }

      if (!authData.user) {
        throw new Error("Erro ao criar usuário. Tente novamente.");
      }

      // 2. Criar escritório
      const dataVencimento = new Date();
      dataVencimento.setDate(dataVencimento.getDate() + 30); // 30 dias trial

      const { data: escritorio, error: escritorioError } = await supabase
        .from('escritorios')
        .insert({
          nome: formData.nome,
          cnpj: formData.cnpj || null,
          email: formData.email,
          telefone: formData.telefone || null,
          endereco: formData.endereco || null,
          plano: formData.plano,
          data_vencimento: dataVencimento.toISOString().split('T')[0]
        })
        .select()
        .single();

      if (escritorioError) throw escritorioError;

      // 3. Criar usuário administrador do escritório
      const { error: userError } = await supabase
        .from('usuarios_escritorio')
        .insert({
          escritorio_id: escritorio.id,
          user_id: authData.user.id,
          nome: formData.nomeResponsavel,
          email: formData.emailResponsavel,
          cargo: "Administrador",
          permissoes: { read: true, write: true, admin: true }
        });

      if (userError) throw userError;

      toast({
        title: "✅ Escritório cadastrado com sucesso!",
        description: "Verifique seu email para confirmar o cadastro e fazer login.",
      });

      // Aguardar 2 segundos antes de redirecionar
      setTimeout(() => {
        navigate("/auth");
      }, 2000);

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao cadastrar o escritório. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl shadow-2xl">
        <CardHeader className="text-center space-y-2 pb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Building2 className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Cadastrar Escritório
          </CardTitle>
          <p className="text-muted-foreground">
            Junte-se ao INTELLBANK e revolucione sua advocacia bancária
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Dados do Escritório */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dados do Escritório</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Escritório *</Label>
                  <Input
                    id="nome"
                    required
                    placeholder="Escritório Advocacia Silva"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                    className={errors.nome ? "border-destructive" : ""}
                  />
                  {errors.nome && (
                    <p className="text-sm text-destructive mt-1">{errors.nome}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="cnpj">CNPJ</Label>
                  <Input
                    id="cnpj"
                    placeholder="00.000.000/0000-00"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email do Escritório *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="contato@escritorio.com.br"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className={errors.email ? "border-destructive" : ""}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="telefone">
                    <Phone className="h-4 w-4 inline mr-1" />
                    Telefone
                  </Label>
                  <Input
                    id="telefone"
                    placeholder="(11) 99999-9999"
                    value={formData.telefone}
                    onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="endereco">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Endereço
                </Label>
                <Textarea
                  id="endereco"
                  placeholder="Rua, número, bairro, cidade - UF"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  rows={2}
                />
              </div>
            </div>

            {/* Plano */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Plano de Assinatura</h3>
              </div>
              
              <div>
                <Label htmlFor="plano">Escolha seu plano *</Label>
                <Select 
                  value={formData.plano} 
                  onValueChange={(value) => setFormData({...formData, plano: value as "essencial" | "premium"})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="essencial">
                      <div className="flex flex-col">
                        <span className="font-semibold">Essencial - R$ 397/mês</span>
                        <span className="text-sm text-muted-foreground">5 usuários • 100 clientes • 500 contratos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="premium">
                      <div className="flex flex-col">
                        <span className="font-semibold">Premium - R$ 597/mês</span>
                        <span className="text-sm text-muted-foreground">15 usuários • 500 clientes • ilimitados contratos</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  🎉 <strong>30 dias grátis!</strong> Teste todas as funcionalidades sem compromisso.
                </p>
              </div>
            </div>

            {/* Dados do Responsável */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">Dados do Responsável</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="nomeResponsavel">Nome Completo *</Label>
                  <Input
                    id="nomeResponsavel"
                    required
                    placeholder="João Silva"
                    value={formData.nomeResponsavel}
                    onChange={(e) => setFormData({...formData, nomeResponsavel: e.target.value})}
                    className={errors.nomeResponsavel ? "border-destructive" : ""}
                  />
                  {errors.nomeResponsavel && (
                    <p className="text-sm text-destructive mt-1">{errors.nomeResponsavel}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="emailResponsavel">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Email de Login *
                  </Label>
                  <Input
                    id="emailResponsavel"
                    type="email"
                    required
                    placeholder="joao@escritorio.com.br"
                    value={formData.emailResponsavel}
                    onChange={(e) => setFormData({...formData, emailResponsavel: e.target.value})}
                    className={errors.emailResponsavel ? "border-destructive" : ""}
                  />
                  {errors.emailResponsavel && (
                    <p className="text-sm text-destructive mt-1">{errors.emailResponsavel}</p>
                  )}
                </div>
              </div>
              
              <div>
                <Label htmlFor="senha">
                  <Lock className="h-4 w-4 inline mr-1" />
                  Senha *
                </Label>
                <Input
                  id="senha"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Mínimo 6 caracteres"
                  value={formData.senha}
                  onChange={(e) => setFormData({...formData, senha: e.target.value})}
                  className={errors.senha ? "border-destructive" : ""}
                />
                {errors.senha && (
                  <p className="text-sm text-destructive mt-1">{errors.senha}</p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  Mínimo 6 caracteres
                </p>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg" 
              disabled={loading}
            >
              {loading ? "Cadastrando..." : "Cadastrar Escritório"}
            </Button>
            
            <p className="text-center text-sm text-muted-foreground">
              Já tem uma conta?{" "}
              <Button 
                variant="link" 
                onClick={() => navigate("/auth")} 
                className="p-0 h-auto"
                type="button"
              >
                Fazer login
              </Button>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
