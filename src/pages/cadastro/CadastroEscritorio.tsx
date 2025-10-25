import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { 
  ArrowLeft, 
  CheckCircle, 
  Shield, 
  Clock, 
  Users, 
  Star,
  BarChart3,
  Zap,
  Award
} from "lucide-react";

const formSchema = z.object({
  nome: z.string().trim().min(3, "Nome do escritório deve ter no mínimo 3 caracteres").max(200),
  cnpj: z.string().trim().max(18).optional(),
  email: z.string().trim().email("Email inválido").max(255),
  telefone: z.string().trim().min(10, "Telefone inválido").max(20),
  endereco: z.string().trim().max(500).optional(),
  plano: z.enum(["essencial", "premium"]),
  nomeResponsavel: z.string().trim().min(3, "Nome deve ter no mínimo 3 caracteres").max(200),
  emailResponsavel: z.string().trim().email("Email inválido").max(255),
  cargoResponsavel: z.string().trim().max(100),
  senha: z.string().min(6, "Senha deve ter no mínimo 6 caracteres").max(100),
  confirmarSenha: z.string().min(6).max(100),
  aceitaTermos: z.boolean().refine(val => val === true, "Você deve aceitar os termos"),
  aceitaMarketing: z.boolean().optional()
});

type FormData = z.infer<typeof formSchema>;

export default function CadastroEscritorio() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    cnpj: "",
    email: "",
    telefone: "",
    endereco: "",
    plano: "essencial",
    nomeResponsavel: "",
    emailResponsavel: "",
    cargoResponsavel: "Sócio",
    senha: "",
    confirmarSenha: "",
    aceitaTermos: false,
    aceitaMarketing: true
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação de senhas
    if (formData.senha !== formData.confirmarSenha) {
      toast({
        title: "Erro",
        description: "As senhas não coincidem",
        variant: "destructive",
      });
      return;
    }
    
    // Validação com Zod
    try {
      formSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Erro de validação",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      // Chamar edge function para cadastrar escritório
      const { data, error } = await supabase.functions.invoke('cadastrar-escritorio', {
        body: {
          nome: formData.nome,
          cnpj: formData.cnpj,
          email: formData.email,
          telefone: formData.telefone,
          endereco: formData.endereco,
          plano: formData.plano,
          nomeResponsavel: formData.nomeResponsavel,
          emailResponsavel: formData.emailResponsavel,
          senha: formData.senha
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Sucesso! 🎉",
        description: "Seu escritório foi cadastrado. Agora você pode fazer login.",
      });

      navigate("/cadastro/sucesso");

    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      toast({
        title: "Erro no cadastro",
        description: error.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                INTELLBANK
              </span>
            </div>
            
            <Button variant="ghost" onClick={() => navigate("/")} className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Benefits */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
                  Cadastre seu Escritório
                </h1>
                <p className="text-xl text-gray-600">
                  Junte-se a centenas de advogados que já revolucionaram sua prática
                </p>
              </div>

              {/* Benefits Cards */}
              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">30 Dias Grátis</h3>
                    <p className="text-gray-600 text-sm">
                      Teste todas as funcionalidades por 30 dias
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">100% Seguro</h3>
                    <p className="text-gray-600 text-sm">
                      Seus dados protegidos com criptografia de ponta
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white rounded-lg border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Zap className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Setup Rápido</h3>
                    <p className="text-gray-600 text-sm">
                      Comece a usar em menos de 5 minutos
                    </p>
                  </div>
                </div>
              </div>

              {/* Social Proof */}
              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="w-10 h-10 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full border-2 border-white flex items-center justify-center">
                        <Users className="h-5 w-5 text-white" />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">500+ escritórios confiam no INTELLBANK</p>
                  </div>
                </div>
                
                <blockquote className="text-gray-700 italic">
                  "O INTELLBANK revolucionou nossa prática. Aumentamos nossa produtividade em 300% 
                  e nossos clientes ficam impressionados com os relatórios profissionais."
                </blockquote>
                <cite className="text-sm text-gray-500 mt-2 block">
                  — Dr. João Silva, Silva & Associados
                </cite>
              </div>
            </div>

            {/* Right Column - Form */}
            <div className="lg:sticky lg:top-8">
              <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center pb-2">
                  <div className="flex justify-center space-x-2 mb-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                          step >= i
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {step > i ? <CheckCircle className="h-4 w-4" /> : i}
                      </div>
                    ))}
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900">
                    {step === 1 && "Dados do Escritório"}
                    {step === 2 && "Escolha seu Plano"}
                    {step === 3 && "Dados do Responsável"}
                  </h2>
                  
                  <p className="text-gray-600">
                    {step === 1 && "Informações básicas do seu escritório"}
                    {step === 2 && "Selecione o plano ideal para você"}
                    {step === 3 && "Dados para acesso à plataforma"}
                  </p>
                </CardHeader>

                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Step 1: Dados do Escritório */}
                    {step === 1 && (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome do Escritório *</Label>
                          <Input
                            id="nome"
                            required
                            placeholder="Ex: Silva & Associados Advogados"
                            value={formData.nome}
                            onChange={(e) => setFormData({...formData, nome: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="cnpj">CNPJ</Label>
                            <Input
                              id="cnpj"
                              placeholder="00.000.000/0000-00"
                              value={formData.cnpj}
                              onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="telefone">Telefone *</Label>
                            <Input
                              id="telefone"
                              required
                              placeholder="(11) 99999-9999"
                              value={formData.telefone}
                              onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="email">Email do Escritório *</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="contato@seuescritorio.com.br"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="endereco">Endereço</Label>
                          <Textarea
                            id="endereco"
                            placeholder="Rua, número, bairro, cidade - UF"
                            value={formData.endereco}
                            onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        
                        <Button type="button" onClick={nextStep} className="w-full" size="lg">
                          Continuar
                        </Button>
                      </div>
                    )}

                    {/* Step 2: Escolha do Plano */}
                    {step === 2 && (
                      <div className="space-y-6">
                        <div className="grid gap-4">
                          {/* Plano Essencial */}
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              formData.plano === 'essencial' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData({...formData, plano: 'essencial'})}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  formData.plano === 'essencial' 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {formData.plano === 'essencial' && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Essencial</h3>
                                  <p className="text-sm text-gray-600">5 usuários • 100 clientes • 500 contratos</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">R$ 397</div>
                                <div className="text-sm text-gray-600">/mês</div>
                              </div>
                            </div>
                          </div>

                          {/* Plano Premium */}
                          <div 
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all relative ${
                              formData.plano === 'premium' 
                                ? 'border-blue-500 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setFormData({...formData, plano: 'premium'})}
                          >
                            <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-blue-600 to-indigo-600">
                              Mais Popular
                            </Badge>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center space-x-3">
                                <div className={`w-4 h-4 rounded-full border-2 ${
                                  formData.plano === 'premium' 
                                    ? 'border-blue-500 bg-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {formData.plano === 'premium' && (
                                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold text-gray-900">Premium</h3>
                                  <p className="text-sm text-gray-600">15 usuários • 500 clientes • Ilimitado</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-gray-900">R$ 597</div>
                                <div className="text-sm text-gray-600">/mês</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                          <div className="flex items-center space-x-2">
                            <Award className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-800">30 dias grátis!</span>
                          </div>
                          <p className="text-sm text-green-700 mt-1">
                            Teste todas as funcionalidades por 30 dias. Cancele antes do vencimento se não gostar.
                          </p>
                        </div>
                        
                        <div className="flex space-x-4">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                            Voltar
                          </Button>
                          <Button type="button" onClick={nextStep} className="flex-1">
                            Continuar
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Step 3: Dados do Responsável */}
                    {step === 3 && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="nomeResponsavel">Nome Completo *</Label>
                            <Input
                              id="nomeResponsavel"
                              required
                              placeholder="Seu nome completo"
                              value={formData.nomeResponsavel}
                              onChange={(e) => setFormData({...formData, nomeResponsavel: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="cargoResponsavel">Cargo</Label>
                            <Select 
                              value={formData.cargoResponsavel} 
                              onValueChange={(value) => setFormData({...formData, cargoResponsavel: value})}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Sócio">Sócio</SelectItem>
                                <SelectItem value="Advogado">Advogado</SelectItem>
                                <SelectItem value="Coordenador">Coordenador</SelectItem>
                                <SelectItem value="Gerente">Gerente</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="emailResponsavel">Email de Login *</Label>
                          <Input
                            id="emailResponsavel"
                            type="email"
                            required
                            placeholder="seu.email@exemplo.com"
                            value={formData.emailResponsavel}
                            onChange={(e) => setFormData({...formData, emailResponsavel: e.target.value})}
                            className="mt-1"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="senha">Senha *</Label>
                            <Input
                              id="senha"
                              type="password"
                              required
                              minLength={6}
                              placeholder="Mínimo 6 caracteres"
                              value={formData.senha}
                              onChange={(e) => setFormData({...formData, senha: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="confirmarSenha">Confirmar Senha *</Label>
                            <Input
                              id="confirmarSenha"
                              type="password"
                              required
                              placeholder="Confirme sua senha"
                              value={formData.confirmarSenha}
                              onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        {/* Termos e Condições */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="termos"
                              checked={formData.aceitaTermos}
                              onCheckedChange={(checked) => setFormData({...formData, aceitaTermos: checked as boolean})}
                              className="mt-1"
                            />
                            <Label htmlFor="termos" className="text-sm leading-relaxed cursor-pointer">
                              Aceito os{" "}
                              <a href="#" className="text-blue-600 hover:underline">
                                Termos de Uso
                              </a>{" "}
                              e{" "}
                              <a href="#" className="text-blue-600 hover:underline">
                                Política de Privacidade
                              </a>
                            </Label>
                          </div>
                          
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              id="marketing"
                              checked={formData.aceitaMarketing}
                              onCheckedChange={(checked) => setFormData({...formData, aceitaMarketing: checked as boolean})}
                              className="mt-1"
                            />
                            <Label htmlFor="marketing" className="text-sm leading-relaxed cursor-pointer">
                              Quero receber dicas, novidades e conteúdos exclusivos sobre advocacia bancária
                            </Label>
                          </div>
                        </div>
                        
                        <div className="flex space-x-4 pt-4">
                          <Button type="button" variant="outline" onClick={prevStep} className="flex-1">
                            Voltar
                          </Button>
                          <Button 
                            type="submit" 
                            disabled={loading || !formData.aceitaTermos}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                          >
                            {loading ? "Criando conta..." : "Criar Conta Grátis"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
