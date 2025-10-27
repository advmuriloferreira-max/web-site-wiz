import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  Users, 
  TrendingUp, 
  Shield, 
  Clock, 
  Star,
  ArrowRight,
  Play,
  Award,
  BarChart3,
  Calculator,
  FileText,
  Zap
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();
  const [videoPlaying, setVideoPlaying] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header/Navbar */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                INTELLBANK
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate("/auth")}>
                Entrar
              </Button>
              <Button 
                onClick={() => navigate("/cadastro")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Teste Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-blue-100 text-blue-800 border-blue-200">
                  🚀 Revolucione sua Advocacia Bancária
                </Badge>
                
                <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  A Plataforma Definitiva para{" "}
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Advogados Bancários
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 leading-relaxed">
                  Gestão de passivo bancário, análise de juros abusivos e planos de superendividamento 
                  em uma única plataforma. Aumente sua produtividade em <strong>300%</strong> e 
                  impressione seus clientes com relatórios profissionais.
                </p>
              </div>

              {/* Key Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Conforme Lei 14.181/2021</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Dados do BACEN em tempo real</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">Relatórios profissionais</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">7 dias grátis</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate("/cadastro")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
                >
                  Começar Teste Grátis
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setVideoPlaying(true)}
                  className="text-lg px-8 py-4 border-2"
                >
                  <Play className="mr-2 h-5 w-5" />
                  Ver Demonstração
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">500+</div>
                  <div className="text-sm text-gray-600">Escritórios</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">50k+</div>
                  <div className="text-sm text-gray-600">Contratos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Satisfação</div>
                </div>
              </div>
            </div>

            {/* Right Column - Visual */}
            <div className="relative">
              <div className="relative bg-white rounded-2xl shadow-2xl p-8 border border-gray-200">
                {/* Mock Dashboard */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Dashboard</h3>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-600" />
                        <span className="text-sm text-blue-600">Clientes</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">247</div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="text-sm text-green-600">Análises</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">1,234</div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-500 p-4 rounded-lg text-white">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm opacity-90">Economia Gerada</div>
                        <div className="text-2xl font-bold">R$ 2.4M</div>
                      </div>
                      <Award className="h-8 w-8 opacity-80" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg border border-gray-200">
                <Shield className="h-6 w-6 text-green-500" />
              </div>
              
              <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg border border-gray-200">
                <Zap className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Três Produtos Poderosos em Uma Plataforma
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo que você precisa para dominar a advocacia bancária e superendividamento
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Produto 1: Provisionamento */}
            <Card className="relative overflow-hidden border-2 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <BarChart3 className="h-6 w-6 text-blue-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Gestão de Passivo Bancário
                    </h3>
                    <p className="text-gray-600">
                      Cálculos precisos conforme Resoluções BCB 352 e 4966. 
                      Relatórios profissionais que impressionam clientes e juízes.
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Conformidade regulatória</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Relatórios automáticos</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Dashboard do cliente</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Produto 2: Análise de Juros */}
            <Card className="relative overflow-hidden border-2 hover:border-green-300 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Análise de Juros Abusivos
                    </h3>
                    <p className="text-gray-600">
                      Compare taxas com dados do BACEN em tempo real. 
                      Identifique abusividade com precisão jurídica.
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">48 modalidades BACEN</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Critério 1,5x automático</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Calculadora rápida</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Produto 3: Superendividamento */}
            <Card className="relative overflow-hidden border-2 hover:border-purple-300 transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-6 w-6 text-purple-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Planos de Superendividamento
                    </h3>
                    <p className="text-gray-600">
                      Conforme Lei 14.181/2021. Cálculo automático do mínimo existencial 
                      e planos de pagamento em até 60 meses.
                    </p>
                  </div>
                  
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Lei 14.181/2021</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Análise socioeconômica</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm text-gray-700">Exportação Word/PDF</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Planos que Cabem no Seu Orçamento
            </h2>
            <p className="text-xl text-gray-600">
              Comece grátis e escale conforme seu escritório cresce
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Plano Essencial */}
            <Card className="relative border-2 border-gray-200 hover:border-blue-300 transition-all duration-300">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Essencial</h3>
                    <p className="text-gray-600">Perfeito para escritórios em crescimento</p>
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">R$ 397</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>5 usuários inclusos</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>100 clientes</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>500 contratos</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Todos os módulos</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Suporte por email</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => navigate("/cadastro")}
                  >
                    Começar Teste Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Plano Premium */}
            <Card className="relative border-2 border-blue-300 hover:border-blue-400 transition-all duration-300 shadow-lg">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-1">
                  Mais Popular
                </Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Premium</h3>
                    <p className="text-gray-600">Para escritórios estabelecidos</p>
                  </div>
                  
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">R$ 597</span>
                    <span className="text-gray-600">/mês</span>
                  </div>
                  
                  <ul className="space-y-3">
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>15 usuários inclusos</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>500 clientes</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Contratos ilimitados</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Todos os módulos</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Suporte prioritário</span>
                    </li>
                    <li className="flex items-center space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Treinamento incluído</span>
                    </li>
                  </ul>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    onClick={() => navigate("/cadastro")}
                  >
                    Começar Teste Grátis
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              ✨ <strong>7 dias grátis</strong> em qualquer plano • Cancele quando quiser • Sem taxa de setup
            </p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Pronto para Revolucionar sua Advocacia?
            </h2>
            
            <p className="text-xl text-blue-100">
              Junte-se a centenas de escritórios que já transformaram sua prática com o INTELLBANK
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate("/cadastro")}
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                Começar Teste Grátis Agora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            
            <p className="text-sm text-blue-200">
              Sem cartão de crédito • Setup em 5 minutos • Suporte especializado
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">INTELLBANK</span>
            </div>
            
            <p className="text-gray-400">
              A plataforma definitiva para advocacia bancária e superendividamento
            </p>
            
            <div className="flex justify-center space-x-8 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
              <a href="#" className="hover:text-white transition-colors">Política de Privacidade</a>
              <a href="#" className="hover:text-white transition-colors">Suporte</a>
            </div>
            
            <p className="text-sm text-gray-500">
              © 2024 INTELLBANK. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
