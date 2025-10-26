import { Suspense, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
import { useClientes } from "@/hooks/useClientes";
import { useAuth } from "@/hooks/useAuth";
import { ResponsiveGrid, AdaptiveCard } from "@/components/ui/responsive-grid";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { QuickActions } from "@/components/ui/quick-actions";
import { ClassificacaoChart } from "@/components/dashboard/ClassificacaoChart";
import { AcordosChart } from "@/components/dashboard/AcordosChart";
import { ClientesAnalysisChart } from "@/components/dashboard/ClientesAnalysisChart";
import { ClienteSelector } from "@/components/dashboard/ClienteSelector";
import { TendenciasChart } from "@/components/dashboard/TendenciasChart";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
import { DashboardLoading } from "@/components/ui/loading-states";
import { ListAnimation } from "@/components/ui/page-transition";
import { useProgressBar } from "@/components/ui/progress-bar";
import { EntranceAnimation, LoadingAnimation } from "@/components/ui/global-animations";
import { AnimatedList } from "@/components/ui/animated-list";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { GlassCard } from "@/components/ui/glassmorphism";
import { GradientBackground, GradientText } from "@/components/ui/gradient-elements";
import { LoadingIllustration } from "@/components/ui/premium-illustrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LegalIcons } from "@/components/ui/legal-icons";
import { BCBComplianceBadge } from "@/components/ui/legal-compliance-badge";
import { Calculator, TrendingUp, AlertCircle, AlertTriangle, Calendar, Users as UsersIcon } from "lucide-react";

function DashboardContent() {
  const { usuarioEscritorio, loading: authLoading } = useAuth();
  const { data: stats, isLoading, error } = useContratosStats();
  const { data: clientes = [] } = useClientes();
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
  const navigate = useNavigate();

  const escritorio = usuarioEscritorio?.escritorio;
  const totalContratos = stats?.totalContratos || 0;
  const totalClientes = clientes.length;

  // Calcular status e alertas do plano
  const getPlanoStatus = () => {
    if (!escritorio) return null;
    
    const dataVencimento = new Date(escritorio.data_vencimento);
    const hoje = new Date();
    const diasRestantes = Math.ceil((dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    const isExpired = diasRestantes < 0;
    const isTrial = diasRestantes <= 30 && diasRestantes >= 0;

    const percentualClientes = (totalClientes / (escritorio.limite_clientes || 1)) * 100;
    const percentualContratos = (totalContratos / (escritorio.limite_contratos || 1)) * 100;

    const alertas = [];
    if (isExpired) {
      alertas.push({ tipo: 'critico', mensagem: 'Plano vencido! Regularize para continuar usando.' });
    } else if (isTrial && diasRestantes <= 7) {
      alertas.push({ tipo: 'warning', mensagem: `Trial expira em ${diasRestantes} dias` });
    }
    if (percentualClientes >= 90) {
      alertas.push({ tipo: 'warning', mensagem: `${percentualClientes.toFixed(0)}% do limite de clientes atingido` });
    }
    if (percentualContratos >= 90) {
      alertas.push({ tipo: 'warning', mensagem: `${percentualContratos.toFixed(0)}% do limite de contratos atingido` });
    }

    return {
      isExpired,
      isTrial,
      diasRestantes,
      percentualClientes,
      percentualContratos,
      alertas,
    };
  };

  const planoStatus = getPlanoStatus();

  const { ProgressBarComponent } = useProgressBar(isLoading || authLoading, {
    label: "Carregando dados do dashboard...",
    minDuration: 1500
  });

  // Loading do Auth
  if (authLoading) {
    return (
      <GradientBackground variant="subtle" className="min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          <EntranceAnimation animation="fade" className="space-y-6">
            <LoadingIllustration size="lg" className="mx-auto" />
            <p className="text-center text-muted-foreground">Carregando informações do escritório...</p>
          </EntranceAnimation>
        </div>
      </GradientBackground>
    );
  }

  // Verificar se escritório existe
  if (!escritorio) {
    return (
      <div className="p-6">
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-4">
          <h3 className="font-medium text-warning">Escritório não encontrado</h3>
          <p className="text-sm text-warning/80 mt-1">
            Não foi possível carregar as informações do escritório.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <h3 className="font-medium text-destructive">Erro ao carregar dados</h3>
          <p className="text-sm text-destructive/80 mt-1">
            Não foi possível carregar as estatísticas do dashboard.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <GradientBackground variant="subtle" className="min-h-screen">
        <div className="p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
          <EntranceAnimation animation="fade" className="space-y-6">
            <LoadingIllustration size="lg" className="mx-auto" />
            
            <ResponsiveGrid 
              cols={{ default: 1, sm: 2, lg: 4 }} 
              gap={4}
            >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <GlassCard variant="subtle" className="animate-pulse">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gradient-to-r from-muted to-muted-foreground/30 rounded animate-shimmer" />
                      <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-6 sm:h-8 w-16 sm:w-24 bg-gradient-to-r from-primary/20 to-accent/20 rounded animate-shimmer" />
                    <div className="h-3 w-24 sm:w-32 bg-muted rounded animate-shimmer" />
                  </div>
                </GlassCard>
              </div>
            ))}
            </ResponsiveGrid>
          </EntranceAnimation>
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground variant="subtle" className="min-h-screen">
      <div className="container mx-auto space-y-8 animate-fade-in">
        <ProgressBarComponent />

        {/* Status do Escritório e Alertas */}
        {escritorio && planoStatus && (
          <EntranceAnimation animation="fade" delay={50}>
            <div className="px-4 md:px-6 space-y-4">
              {/* Card de Status do Escritório */}
              <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{escritorio.nome}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="uppercase font-bold">
                          {escritorio.plano}
                        </Badge>
                        {planoStatus.isExpired ? (
                          <Badge variant="destructive">VENCIDO</Badge>
                        ) : planoStatus.isTrial ? (
                          <Badge variant="secondary" className="bg-warning/20 text-warning">
                            TRIAL - {planoStatus.diasRestantes} dias
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-success/20 text-success">ATIVO</Badge>
                        )}
                      </CardDescription>
                    </div>
                    {!planoStatus.isExpired && (
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Expira em {planoStatus.diasRestantes} dias</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Limites de Uso */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <UsersIcon className="h-4 w-4" />
                          Clientes
                        </span>
                        <span className="font-medium">{totalClientes} / {escritorio.limite_clientes}</span>
                      </div>
                      <Progress value={planoStatus.percentualClientes} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground flex items-center gap-2">
                          <LegalIcons.contract className="h-4 w-4" />
                          Contratos
                        </span>
                        <span className="font-medium">{totalContratos} / {escritorio.limite_contratos}</span>
                      </div>
                      <Progress value={planoStatus.percentualContratos} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Alertas */}
              {planoStatus.alertas.length > 0 && (
                <div className="space-y-2">
                  {planoStatus.alertas.map((alerta, idx) => (
                    <Alert key={idx} variant={alerta.tipo === 'critico' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>{alerta.tipo === 'critico' ? 'Atenção Crítica' : 'Aviso'}</AlertTitle>
                      <AlertDescription>{alerta.mensagem}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </div>
          </EntranceAnimation>
        )}

        {/* Hero Section - Seção Principal */}
        <EntranceAnimation animation="fade" delay={100}>
          <div className="px-4 md:px-6">
            <HeroSection />
          </div>
        </EntranceAnimation>

        {/* Card de Destaque - Análise de Juros Abusivos */}
        <EntranceAnimation animation="scale" delay={150}>
          <div className="px-4 md:px-6">
            <Card className="border-2 border-primary/50 shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-2xl font-bold flex items-center gap-2">
                      <Calculator className="h-6 w-6 text-primary" />
                      Análise de Juros Abusivos
                    </CardTitle>
                    <CardDescription className="text-base">
                      A ferramenta definitiva para auditoria de contratos bancários
                    </CardDescription>
                  </div>
                  <AlertCircle className="h-5 w-5 text-primary animate-pulse" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-muted-foreground">
                    Calcule a taxa de juros real de contratos, compare com a média do BACEN e identifique abusividades com precisão em segundos.
                  </p>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <TrendingUp className="h-4 w-4" />
                    <span>Baseado em dados oficiais do Banco Central</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  size="lg"
                  onClick={() => navigate("/calculadora-juros")}
                >
                  <Calculator className="mr-2 h-5 w-5" />
                  Abrir Calculadora Rápida
                </Button>
              </CardFooter>
            </Card>
          </div>
        </EntranceAnimation>

        {/* Layout Principal com Quick Actions */}
        <div className="grid gap-8 lg:grid-cols-3 px-4 md:px-6">
          {/* Dashboard Principal - 2/3 da tela */}
          <div className="lg:col-span-2 space-y-8">
            {/* Premium Statistics Cards */}
            <EntranceAnimation animation="slide" delay={200}>
              <div className="flex gap-3 overflow-x-auto pb-2">
                <div className="flex-1 min-w-[200px]">
                  <PremiumStatsCard
                    title="Contratos Ativos"
                    value={stats?.totalContratos || 0}
                    description="Total em análise"
                    icon={LegalIcons.contract}
                    trend={{ value: 12, isPositive: true }}
                    color="blue"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <PremiumStatsCard
                    title="Valor Total"
                    value={`R$ ${((stats?.valorTotalContratos || 0) / 1000000).toFixed(1)}M`}
                    description="Valor de contratos"
                    icon={LegalIcons.warning}
                    trend={{ value: -5, isPositive: false }}
                    color="amber"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <PremiumStatsCard
                    title="Contratos Ativos"
                    value={`${stats?.porStatus?.['ativo'] || 0}`}
                    description="Status ativo"
                    icon={LegalIcons.compliance}
                    trend={{ value: 3, isPositive: true }}
                    color="blue"
                  />
                </div>
              </div>
            </EntranceAnimation>

            {/* Charts - Dashboard Tabs */}
            <EntranceAnimation animation="scale" delay={300}>
              <Tabs defaultValue="visao-geral" className="space-y-6">
                <TabsList className="grid w-full grid-cols-5 bg-muted/50 border shadow-sm">
                  <TabsTrigger value="visao-geral" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LegalIcons.dashboard className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Painel</span>
                  </TabsTrigger>
                  <TabsTrigger value="estrategia" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Estratégia</span>
                  </TabsTrigger>
                  <TabsTrigger value="acordos" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LegalIcons.agreement className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Acordos</span>
                  </TabsTrigger>
                  <TabsTrigger value="clientes" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LegalIcons.clients className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Clientes</span>
                  </TabsTrigger>
                  <TabsTrigger value="tendencias" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LegalIcons.reports className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Análises</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="visao-geral" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Status dos Contratos</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">Dados de contratos disponíveis</p>
                      </CardContent>
                    </Card>
                    <PerformanceCard />
                  </div>
                </TabsContent>

                <TabsContent value="estrategia" className="space-y-6">
                  <Card className="border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" />
                        Painel de Análise Estratégica
                      </CardTitle>
                      <CardDescription>
                        Análise individual por contrato com estratégias de negociação detalhadas
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center py-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                          <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-xl mb-2">Análise Individualizada por Contrato</h3>
                        <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                          Cada contrato tem sua própria análise estratégica baseada em dados reais:
                          termômetro de oportunidade, projeções, calendário e estratégias específicas.
                        </p>
                        <a 
                          href="/painel-cliente"
                          className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
                        >
                          Acessar Painel do Cliente
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="acordos">
                  <AcordosChart />
                </TabsContent>

                <TabsContent value="clientes" className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <ClienteSelector 
                      selectedClienteId={selectedClienteId}
                      onClienteSelect={setSelectedClienteId}
                    />
                    {selectedClienteId ? (
                      <Card>
                        <CardHeader>
                          <CardTitle>Resumo do Cliente</CardTitle>
                          <CardDescription>
                            Para análise completa, acesse a aba "Estratégia"
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => {
                              const tabs = document.querySelector('[value="estrategia"]') as HTMLButtonElement;
                              tabs?.click();
                            }}
                            className="w-full"
                          >
                            Ver Análise Estratégica Completa
                          </Button>
                        </CardContent>
                      </Card>
                    ) : (
                      <ClientesAnalysisChart />
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="tendencias">
                  <TendenciasChart />
                </TabsContent>
              </Tabs>
            </EntranceAnimation>
          </div>
          
          {/* Quick Actions Sidebar - 1/3 da tela */}
          <div className="lg:col-span-1 space-y-6">
            <EntranceAnimation animation="fade" delay={400}>
              <QuickActions />
            </EntranceAnimation>
            
            <EntranceAnimation animation="fade" delay={500}>
              <BCBComplianceBadge />
            </EntranceAnimation>
          </div>
        </div>
      </div>
    </GradientBackground>
  );
}

const Index = () => {
  return (
    <Suspense fallback={
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-72 mb-6" />
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
};

export default Index;
