import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import {
  BarChart3,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Scale,
  Star,
  Check,
  ArrowRight,
  Zap,
  Target,
  FileText,
  Calculator,
  AlertCircle,
  DollarSign,
  ChevronRight
} from "lucide-react";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      
      {/* Header Fixo */}
      <header className="bg-white/90 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  INTELLIBANK
                </span>
                <p className="text-xs text-gray-500">Inteligência Jurídica Bancária</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="ghost" onClick={() => navigate("/auth")} className="hidden sm:flex">
                Entrar
              </Button>
              <Button onClick={() => navigate("/cadastro/escritorio")} className="shadow-lg">
                <Zap className="mr-2 h-4 w-4" />
                Começar Grátis
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Impacto Imediato */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background decorativo */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 opacity-50" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            
            {/* Badges de Credibilidade */}
            <div className="flex flex-wrap justify-center gap-3">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Shield className="mr-2 h-4 w-4" />
                100% Seguro e Criptografado
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Users className="mr-2 h-4 w-4" />
                500+ Escritórios Ativos
              </Badge>
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                <Star className="mr-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                4.9/5 Avaliação
              </Badge>
            </div>

            {/* Título Principal */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 leading-tight">
                Domine Ações Bancárias
                <br />
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  com Inteligência Artificial
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                Sistema completo para <strong>Gestão de Passivo Bancário</strong>, 
                <strong> Superendividamento</strong> e <strong>Ações Revisionais</strong>.
                <br />
                Aumente sua produtividade em <span className="text-green-600 font-bold">300%</span> e 
                impressione seus clientes com relatórios profissionais.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                onClick={() => navigate("/cadastro/escritorio")} 
                className="text-lg px-8 py-6 shadow-2xl hover:shadow-3xl transition-all bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Zap className="mr-2 h-5 w-5" />
                Começar Grátis por 7 Dias
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-2"
              >
                <FileText className="mr-2 h-5 w-5" />
                Ver Demonstração
              </Button>
            </div>
            
            <p className="text-sm text-gray-500">
              ✓ Sem cartão de crédito  ✓ Cancele quando quiser  ✓ Suporte dedicado
            </p>
          </div>
        </div>
      </section>

      {/* Problemas do Advogado */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <Badge variant="destructive" className="mb-4">
              <AlertCircle className="mr-2 h-4 w-4" />
              Problemas que você enfrenta HOJE
            </Badge>
            <h2 className="text-4xl font-bold text-gray-900">
              Reconhece alguma dessas situações?
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                problema: "Cálculos Manuais Demorados",
                descricao: "Gasta horas calculando provisões bancárias, planos de pagamento e juros abusivos na HP-12C",
                impacto: "20+ horas/semana perdidas"
              },
              {
                problema: "Relatórios Pouco Profissionais",
                descricao: "Entrega planilhas Excel simples que não impressionam clientes nem juízes",
                impacto: "Perda de credibilidade"
              },
              {
                problema: "Oportunidades Perdidas",
                descricao: "Não identifica contratos com alta provisão prontos para negociação estratégica",
                impacto: "Milhões em economia não realizados"
              }
            ].map((item, i) => (
              <Card key={i} className="border-2 border-red-200 bg-red-50/30">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">{item.problema}</h3>
                  <p className="text-gray-600 mb-3">{item.descricao}</p>
                  <Badge variant="destructive">{item.impacto}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Solução - 3 Módulos Poderosos */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-700">
              <Check className="mr-2 h-4 w-4" />
              A Solução Definitiva
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              3 Módulos que Transformam sua Prática
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Tudo integrado em uma única plataforma poderosa
            </p>
          </div>
          
          {/* Módulo 1: Gestão de Passivo Bancário */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-1">Módulo 1</Badge>
                    <h3 className="text-3xl font-bold text-gray-900">
                      Gestão de Passivo Bancário
                    </h3>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600">
                  Identifique automaticamente contratos com <strong>alta provisão bancária</strong> 
                  e negocie com poder. Baseado 100% na <strong>Resolução BCB 352/2023</strong>.
                </p>
                
                <div className="space-y-4">
                  {[
                    {
                      icon: Target,
                      titulo: "Radar de Oportunidades",
                      descricao: "Dashboard inteligente identifica contratos prontos para negociação"
                    },
                    {
                      icon: Calculator,
                      titulo: "Cálculo Automático de Provisão",
                      descricao: "37 modalidades de garantia, 33 bancos, precisão de 0,00001%"
                    },
                    {
                      icon: DollarSign,
                      titulo: "Economia Comprovada",
                      descricao: "Clientes economizam milhões com propostas baseadas em provisão real"
                    },
                    {
                      icon: FileText,
                      titulo: "Relatórios Profissionais",
                      descricao: "PDFs de 15-25 páginas prontos para juntada judicial"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.titulo}</h4>
                        <p className="text-sm text-gray-600">{feature.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/cadastro/escritorio")}>
                  Testar Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-2">Exemplo Real</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Saldo Devedor:</span>
                      <span className="font-bold text-lg">R$ 500.000,00</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Provisão (90%):</span>
                      <span className="font-bold text-lg text-red-600">R$ 450.000,00</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between items-center">
                      <span className="text-gray-700">Proposta Inteligente:</span>
                      <span className="font-bold text-2xl text-green-600">R$ 50.000,00</span>
                    </div>
                    <Badge className="w-full justify-center py-2 bg-green-100 text-green-700">
                      Economia de R$ 450.000,00 para o cliente! 🎉
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Módulo 2: Superendividamento */}
          <div className="mb-20">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-4">Plano de Pagamento Automático</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Renda Mensal:</span>
                      <span className="font-semibold">R$ 5.000,00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Despesas Essenciais:</span>
                      <span className="font-semibold">R$ 3.500,00</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">Sobra para Dívidas:</span>
                      <span className="font-semibold text-green-600">R$ 1.500,00</span>
                    </div>
                    <div className="border-t pt-3">
                      <div className="text-xs text-gray-500 mb-2">Distribuição em 5 Fases:</div>
                      <div className="space-y-1">
                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span>Fase 1: R$ 600/mês (Créditos Alimentares)</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                          <span>Fase 2: R$ 400/mês (Créditos Habitacionais)</span>
                        </div>
                        <div className="flex items-center text-xs">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                          <span>Fase 3-5: Demais credores</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="w-full justify-center py-2 bg-purple-100 text-purple-700">
                      Fundamentado na Lei 14.181/2021 ✓
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="order-1 md:order-2 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-1 bg-purple-100 text-purple-700">Módulo 2</Badge>
                    <h3 className="text-3xl font-bold text-gray-900">
                      Superendividamento
                    </h3>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600">
                  Crie <strong>Relatórios Socioeconômicos</strong> completos e 
                  <strong> Planos de Pagamento</strong> automáticos em minutos. 
                  Fundamentação total na <strong>Lei 14.181/2021</strong>.
                </p>
                
                <div className="space-y-4">
                  {[
                    {
                      icon: FileText,
                      titulo: "Relatório Socioeconômico Completo",
                      descricao: "Coleta renda, despesas e dívidas com análise de comprometimento"
                    },
                    {
                      icon: Calculator,
                      titulo: "Plano de Pagamento Automático",
                      descricao: "Distribui sobra mensal em 5 fases conforme ordem legal"
                    },
                    {
                      icon: Target,
                      titulo: "Simulador de Cenários",
                      descricao: "Compare diferentes estratégias de repactuação"
                    },
                    {
                      icon: Shield,
                      titulo: "Proteção do Mínimo Existencial",
                      descricao: "Garante 75% da renda para despesas essenciais"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.titulo}</h4>
                        <p className="text-sm text-gray-600">{feature.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => navigate("/cadastro/escritorio")}>
                  Testar Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Módulo 3: Ações Revisionais */}
          <div>
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-14 h-14 bg-gradient-to-br from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Scale className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <Badge className="mb-1 bg-amber-100 text-amber-700">Módulo 3</Badge>
                    <h3 className="text-3xl font-bold text-gray-900">
                      Ações Revisionais
                    </h3>
                  </div>
                </div>
                
                <p className="text-lg text-gray-600">
                  Identifique <strong>juros abusivos</strong> automaticamente comparando com 
                  <strong> taxas BACEN</strong>. Calcule prejuízo e gere petição inicial completa.
                </p>
                
                <div className="space-y-4">
                  {[
                    {
                      icon: Target,
                      titulo: "Análise de Juros Abusivos",
                      descricao: "Compara taxa contratual com taxa média BACEN (regra 1,5x)"
                    },
                    {
                      icon: Calculator,
                      titulo: "Cálculo de Prejuízo (CDC Art. 42)",
                      descricao: "Precisão de 0,00001% usando método Newton-Raphson"
                    },
                    {
                      icon: FileText,
                      titulo: "Petição Inicial Automática",
                      descricao: "PDF de 15-25 páginas com fundamentação STJ + CDC + Súmulas"
                    },
                    {
                      icon: TrendingUp,
                      titulo: "Score de Prioridade",
                      descricao: "Algoritmo identifica contratos com maior chance de êxito"
                    }
                  ].map((feature, i) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <feature.icon className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{feature.titulo}</h4>
                        <p className="text-sm text-gray-600">{feature.descricao}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-amber-600 to-orange-600" onClick={() => navigate("/cadastro/escritorio")}>
                  Testar Grátis
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-8 shadow-xl">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="text-sm text-gray-500 mb-4">Exemplo de Análise</div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Taxa Contratual:</span>
                      <span className="font-bold text-lg text-red-600">8,5% a.m.</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Taxa Média BACEN:</span>
                      <span className="font-bold text-lg">4,2% a.m.</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Limite Legal (1,5x):</span>
                      <span className="font-bold text-lg text-orange-600">6,3% a.m.</span>
                    </div>
                    <div className="border-t pt-3">
                      <Badge variant="destructive" className="w-full justify-center py-2">
                        ABUSIVO! Excesso de 2,2% a.m.
                      </Badge>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                      <div className="text-xs text-gray-600 mb-1">Prejuízo Estimado:</div>
                      <div className="text-2xl font-bold text-green-700">R$ 87.543,21</div>
                      <div className="text-xs text-gray-500 mt-1">Devolução em dobro (CDC Art. 42)</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resultados Concretos */}
      <section className="py-16 px-4 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Resultados Reais, Mensuráveis
            </h2>
            <p className="text-xl opacity-90">
              Veja o impacto do INTELLIBANK na sua prática
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                numero: "300%",
                titulo: "Aumento de Produtividade",
                descricao: "Automatize cálculos e relatórios que levavam horas"
              },
              {
                numero: "20h",
                titulo: "Economizadas por Semana",
                descricao: "Foque em estratégia, não em planilhas"
              },
              {
                numero: "R$ 2M+",
                titulo: "Economizados para Clientes",
                descricao: "Negociações baseadas em provisão real"
              }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-5xl md:text-6xl font-extrabold mb-2">{stat.numero}</div>
                <div className="text-xl font-semibold mb-2">{stat.titulo}</div>
                <div className="text-sm opacity-80">{stat.descricao}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Depoimentos */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              O que dizem nossos clientes
            </h2>
            <div className="flex items-center justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
              <span className="ml-2 text-gray-600">4.9/5 baseado em 247 avaliações</span>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                nome: "Dr. João Silva",
                cargo: "Sócio",
                escritorio: "Silva & Associados",
                foto: "👨‍💼",
                texto: "O INTELLIBANK revolucionou nossa prática. Conseguimos identificar R$ 3 milhões em oportunidades de negociação que estavam invisíveis antes. Nossos clientes ficam impressionados com os relatórios profissionais."
              },
              {
                nome: "Dra. Maria Santos",
                cargo: "Advogada",
                escritorio: "Santos Advocacia",
                foto: "👩‍💼",
                texto: "A precisão dos cálculos é impecável. Ganhamos todas as ações revisionais que propusemos usando o módulo de juros abusivos. O sistema se paga sozinho com apenas 1 caso."
              },
              {
                nome: "Dr. Pedro Costa",
                cargo: "Diretor Jurídico",
                escritorio: "Costa & Partners",
                foto: "👨‍⚖️",
                texto: "O módulo de superendividamento é fantástico. Conseguimos ajudar 5x mais clientes no mesmo tempo. A fundamentação legal é robusta e os juízes aceitam nossos planos sem questionamentos."
              }
            ].map((depoimento, i) => (
              <Card key={i} className="border-2 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic mb-4">"{depoimento.texto}"</p>
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{depoimento.foto}</div>
                    <div>
                      <p className="font-semibold text-gray-900">{depoimento.nome}</p>
                      <p className="text-sm text-gray-600">{depoimento.cargo}</p>
                      <p className="text-xs text-gray-500">{depoimento.escritorio}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Preços */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Planos Transparentes
            </h2>
            <p className="text-xl text-gray-600">
              Escolha o plano ideal para seu escritório
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {[
              {
                nome: "Essencial",
                preco: "R$ 297",
                periodo: "/mês",
                descricao: "Perfeito para advogados autônomos e pequenos escritórios",
                features: [
                  "Até 3 usuários",
                  "100 clientes",
                  "500 contratos/análises",
                  "3 módulos completos",
                  "Suporte por email",
                  "Atualizações incluídas"
                ]
              },
              {
                nome: "Premium",
                preco: "R$ 597",
                periodo: "/mês",
                popular: true,
                descricao: "Ideal para escritórios em crescimento e médio porte",
                features: [
                  "Usuários ilimitados",
                  "Clientes ilimitados",
                  "Contratos ilimitados",
                  "3 módulos completos",
                  "Suporte prioritário 24/7",
                  "Atualizações incluídas",
                  "Treinamento dedicado",
                  "API de integração"
                ]
              }
            ].map((plano, i) => (
              <Card key={i} className={`border-2 ${plano.popular ? 'border-blue-600 shadow-2xl scale-105' : 'border-gray-200'}`}>
                {plano.popular && (
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-center py-3 text-sm font-bold rounded-t-lg">
                    ⭐ MAIS POPULAR
                  </div>
                )}
                <CardContent className="pt-6">
                  <h3 className="text-2xl font-bold mb-2">{plano.nome}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plano.descricao}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-bold">{plano.preco}</span>
                    <span className="text-gray-600">{plano.periodo}</span>
                  </div>
                  <Button 
                    className={`w-full mb-6 ${plano.popular ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : ''}`}
                    size="lg"
                    variant={plano.popular ? "default" : "outline"}
                    onClick={() => navigate("/cadastro/escritorio")}
                  >
                    <Zap className="mr-2 h-5 w-5" />
                    Começar Grátis por 7 Dias
                  </Button>
                  <ul className="space-y-3">
                    {plano.features.map((feature, j) => (
                      <li key={j} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <p className="text-center text-gray-600 mt-8">
            💳 Aceitamos todas as formas de pagamento • 🔒 Dados 100% seguros • ✓ Cancele quando quiser
          </p>
        </div>
      </section>

      {/* CTA Final Poderoso */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="relative max-w-4xl mx-auto text-center space-y-8">
          <Badge className="bg-white/20 text-white border-white/30">
            <Clock className="mr-2 h-4 w-4" />
            Oferta por Tempo Limitado
          </Badge>
          
          <h2 className="text-4xl md:text-6xl font-extrabold leading-tight">
            Pronto para Revolucionar
            <br />
            sua Prática Jurídica?
          </h2>
          
          <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
            Junte-se a mais de <strong>500 escritórios</strong> que já transformaram 
            seus resultados com o INTELLIBANK
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              variant="secondary" 
              className="text-lg px-10 py-7 shadow-2xl hover:shadow-3xl transition-all text-blue-600 font-bold"
              onClick={() => navigate("/cadastro/escritorio")}
            >
              <Zap className="mr-2 h-6 w-6" />
              Começar Grátis por 7 Dias
              <ArrowRight className="ml-2 h-6 w-6" />
            </Button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5" />
              Sem cartão de crédito
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5" />
              Cancele quando quiser
            </div>
            <div className="flex items-center">
              <Check className="mr-2 h-5 w-5" />
              Suporte dedicado
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">INTELLIBANK</span>
              </div>
              <p className="text-sm text-gray-400">
                Sistema de Inteligência Jurídica Bancária
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Funcionalidades</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Preços</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Demonstração</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Suporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status do Sistema</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacidade</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LGPD</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
            <p>© 2025 INTELLIBANK. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
