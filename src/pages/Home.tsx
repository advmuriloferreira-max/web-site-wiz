import React from "react";
import { Link } from "react-router-dom";
import { 
  Brain, 
  Users, 
  FileText, 
  Calculator, 
  BarChart3, 
  Handshake, 
  AlertTriangle,
  TrendingUp,
  ChevronRight,
  Zap,
  Shield,
  Target
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResponsiveContainer } from "@/components/ui/layout-consistency";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientText, GradientBackground } from "@/components/ui/gradient-elements";
import { ColoredIcon } from "@/components/ui/color-consistency";
import { ModernBadge } from "@/components/ui/modern-badge";
import { useContratosStats } from "@/hooks/useContratos";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export default function Home() {
  const { data: stats, isLoading } = useContratosStats();

  const features = [
    {
      title: "Gestão de Clientes",
      description: "Cadastro completo e organizado de todos os clientes bancários",
      icon: Users,
      href: "/clientes",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10"
    },
    {
      title: "Contratos",
      description: "Controle total de contratos e operações bancárias",
      icon: FileText,
      href: "/contratos",
      color: "text-green-500",
      bgColor: "bg-green-500/10"
    },
    {
      title: "Calculadoras",
      description: "Cálculos precisos de provisão conforme BCB",
      icon: Calculator,
      href: "/calculos",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10"
    },
    {
      title: "Processos Jurídicos",
      description: "Acompanhamento de processos e litígios",
      icon: AlertTriangle,
      href: "/processos",
      color: "text-amber-500",
      bgColor: "bg-amber-500/10"
    },
    {
      title: "Acordos",
      description: "Negociação e gestão de acordos de pagamento",
      icon: Handshake,
      href: "/acordos",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10"
    },
    {
      title: "Relatórios",
      description: "Análises avançadas e relatórios gerenciais",
      icon: TrendingUp,
      href: "/relatorios",
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10"
    }
  ];

  const quickStats = [
    {
      title: "Total de Contratos",
      value: stats?.totalContratos || 0,
      icon: FileText,
      description: "Contratos cadastrados",
      color: "text-blue-500"
    },
    {
      title: "Valor Total",
      value: stats?.valorTotalDividas || 0,
      icon: TrendingUp,
      description: "Em dívidas ativas",
      color: "text-green-500",
      isCurrency: true
    },
    {
      title: "Provisão Total",
      value: stats?.valorTotalProvisao || 0,
      icon: AlertTriangle,
      description: "Valor provisionado",
      color: "text-red-500",
      isCurrency: true
    },
    {
      title: "% Provisão",
      value: stats?.percentualProvisao || 0,
      icon: Target,
      description: "Percentual médio",
      color: "text-purple-500",
      isPercentage: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <ResponsiveContainer className="py-8 animate-fade-in">
        {/* Hero Section */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center mb-6">
            <div className="glass-element p-4 rounded-full">
              <Brain className="h-12 w-12 text-primary animate-pulse" />
            </div>
          </div>
          <GradientText variant="hero" className="text-4xl md:text-5xl font-bold mb-4">
            INTELLBANK
          </GradientText>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Sistema Inteligente de Gestão de Dívidas Bancárias com conformidade total ao Banco Central
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <ModernBadge variant="success" icon={Shield} size="lg">
              Conforme BCB
            </ModernBadge>
            <ModernBadge variant="info" icon={Zap} size="lg">
              IA Integrada
            </ModernBadge>
            <ModernBadge variant="purple" icon={Target} size="lg">
              Precisão Total
            </ModernBadge>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-slide-up animate-stagger-1">
          {quickStats.map((stat, index) => (
            <GlassCard key={stat.title} variant="subtle" className={`text-center animate-scale-in animate-delay-${index}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-center mb-2">
                  <div className="glass-element p-3 rounded-full">
                    <ColoredIcon icon={stat.icon} className={stat.color} />
                  </div>
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">
                  {stat.isCurrency ? (
                    <AnimatedCounter
                      value={stat.value}
                      duration={2000}
                      prefix="R$ "
                      decimals={0}
                    />
                  ) : stat.isPercentage ? (
                    <AnimatedCounter
                      value={stat.value}
                      duration={2000}
                      suffix="%"
                      decimals={1}
                    />
                  ) : (
                    <AnimatedCounter value={stat.value} duration={2000} />
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </CardContent>
            </GlassCard>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <GradientText variant="primary" className="text-2xl font-bold mb-2">
              Funcionalidades Principais
            </GradientText>
            <p className="text-muted-foreground">
              Acesse todas as ferramentas para gestão completa de dívidas bancárias
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up animate-stagger-2">
            {features.map((feature, index) => (
              <Link key={feature.title} to={feature.href} className="group">
                <GlassCard 
                  variant="subtle" 
                  className={`h-full interactive-card animate-scale-in hover:shadow-xl transition-all duration-300 animate-delay-${index}`}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <ColoredIcon icon={feature.icon} className={feature.color} />
                    </div>
                    <CardTitle className="flex items-center justify-between">
                      <span>{feature.title}</span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </GlassCard>
              </Link>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="text-center animate-slide-up animate-stagger-3">
          <GradientText variant="primary" className="text-xl font-semibold mb-6">
            Ações Rápidas
          </GradientText>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="interactive-button group">
              <Link to="/clientes/novo">
                <Users className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Novo Cliente
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="interactive-button group">
              <Link to="/contratos/novo">
                <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Novo Contrato
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="interactive-button group">
              <Link to="/calculos">
                <Calculator className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                Calcular Provisão
              </Link>
            </Button>
          </div>
        </div>
      </ResponsiveContainer>
    </div>
  );
}