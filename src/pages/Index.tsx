import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
import { ResponsiveGrid, AdaptiveCard } from "@/components/ui/responsive-grid";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { ClassificacaoChart } from "@/components/dashboard/ClassificacaoChart";
import { AcordosChart } from "@/components/dashboard/AcordosChart";
import { ClientesAnalysisChart } from "@/components/dashboard/ClientesAnalysisChart";
import { ClienteSelector } from "@/components/dashboard/ClienteSelector";
import { ClienteAnalysisDetails } from "@/components/dashboard/ClienteAnalysisDetails";
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Calculator,
  BarChart3,
  Target,
  Clock
} from "lucide-react";

function DashboardContent() {
  const { data: stats, isLoading, error } = useContratosStats();
  const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);

  const { ProgressBarComponent } = useProgressBar(isLoading, {
    label: "Carregando dados do dashboard...",
    minDuration: 1500
  });

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
      <div className="container mx-auto p-6 space-section animate-fade-in">
        <ProgressBarComponent />

        {/* Hero Section com espaçamento consistente */}
        <EntranceAnimation animation="fade" delay={100}>
          <div className="padding-content">
            <HeroSection />
          </div>
        </EntranceAnimation>

        {/* Premium Statistics Cards com simetria */}
        <EntranceAnimation animation="slide" delay={200}>
          <div className="space-content">
            <ResponsiveGrid 
              cols={{ default: 1, sm: 2, lg: 4 }} 
              gap={6} 
              className="padding-content" 
              data-tour="dashboard-stats"
            >
              <PremiumStatsCard
                title="Total de Contratos"
                value={stats?.totalContratos || 0}
                description="Contratos ativos"
                icon={FileText}
                trend={{ value: 12, isPositive: true }}
                color="blue"
              />
              <PremiumStatsCard
                title="Valor Total"
                value={`R$ ${(stats?.valorTotalDividas || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                description="Portfolio total"
                icon={DollarSign}
                trend={{ value: 8, isPositive: true }}
                color="emerald"
              />
              <PremiumStatsCard
                title="Provisão Total"
                value={`R$ ${(stats?.valorTotalProvisao || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                description="Valor provisionado"
                icon={AlertTriangle}
                trend={{ value: -5, isPositive: false }}
                color="amber"
              />
              <PremiumStatsCard
                title="Taxa Média"
                value={`${(stats?.percentualProvisao || 0).toFixed(1)}%`}
                description="Risco do portfolio"
                icon={TrendingUp}
                trend={{ value: 3, isPositive: true }}
                color={(stats?.percentualProvisao ?? 0) > 50 ? "red" : "blue"}
              />
            </ResponsiveGrid>
          </div>
        </EntranceAnimation>

        {/* Dashboard Tabs com espaçamento simétrico */}
        <EntranceAnimation animation="scale" delay={300}>
          <div className="space-content padding-content">
            <Tabs defaultValue="visao-geral" className="space-y-6 animate-fade-in">
              {/* Mobile: Scrollable tabs, Desktop: Grid */}
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-4 min-w-max md:min-w-0 interactive-button">
                  <TabsTrigger value="visao-geral" className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 transition-all duration-200">
                    <BarChart3 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="text-xs md:text-sm">Visão Geral</span>
                  </TabsTrigger>
                  <TabsTrigger value="acordos" className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 transition-all duration-200">
                    <Target className="h-4 w-4 flex-shrink-0 text-accent" />
                    <span className="text-xs md:text-sm">Acordos</span>
                  </TabsTrigger>
                  <TabsTrigger value="clientes" className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 transition-all duration-200">
                    <Users className="h-4 w-4 flex-shrink-0 text-success" />
                    <span className="text-xs md:text-sm">Clientes</span>
                  </TabsTrigger>
                  <TabsTrigger value="tendencias" className="flex items-center space-x-1 md:space-x-2 px-2 md:px-4 transition-all duration-200">
                    <Clock className="h-4 w-4 flex-shrink-0 text-warning" />
                    <span className="text-xs md:text-sm">Tendências</span>
                  </TabsTrigger>
                </TabsList>
              </div>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6 lg:space-y-8">
          <ResponsiveGrid 
            cols={{ default: 1, lg: 3 }} 
            gap={6} 
            className="lg:gap-8"
          >
            <div className="lg:col-span-2">
              <ClassificacaoChart data={stats?.porClassificacao || {}} />
            </div>
            <div className="lg:col-span-1">
              <PerformanceCard />
            </div>
          </ResponsiveGrid>
          
          <AdaptiveCard className="overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 p-4 sm:p-6 border-b border-slate-200">
              <h3 className="text-base sm:text-lg font-semibold flex items-center space-x-2 text-slate-900 dark:text-white">
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>Status dos Contratos</span>
              </h3>
            </div>
            <div className="p-4 sm:p-6">
              <ResponsiveGrid 
                cols={{ default: 2, md: 4 }} 
                gap={4} 
                className="sm:gap-6"
              >
                {Object.entries(stats?.porSituacao || {}).map(([situacao, quantidade]) => (
                  <div key={situacao} className="group text-center p-3 sm:p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full mx-auto mb-2 sm:mb-3 shadow-lg ${
                      situacao === 'Concluído' ? 'bg-emerald-500' :
                      situacao === 'Em análise' ? 'bg-amber-500' :
                      situacao === 'Cancelado' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <p className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">{quantidade}</p>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">{situacao}</p>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </AdaptiveCard>
        </TabsContent>

        {/* Análise de Acordos */}
        <TabsContent value="acordos" className="space-y-4 sm:space-y-6">
          <AcordosChart />
        </TabsContent>

        {/* Análise de Clientes */}
        <TabsContent value="clientes" className="space-y-4 sm:space-y-6">
          <ResponsiveGrid 
            cols={{ default: 1, lg: 3 }} 
            gap={4} 
            className="sm:gap-6"
          >
            <div className="lg:col-span-1">
              <ClienteSelector 
                selectedClienteId={selectedClienteId}
                onClienteSelect={setSelectedClienteId}
              />
            </div>
            <div className="lg:col-span-2">
              {selectedClienteId ? (
                <ClienteAnalysisDetails clienteId={selectedClienteId} />
              ) : (
                <ClientesAnalysisChart />
              )}
            </div>
          </ResponsiveGrid>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="tendencias" className="space-y-4 sm:space-y-6">
          <TendenciasChart />
        </TabsContent>
              </Tabs>
            </div>
          </EntranceAnimation>

          {/* Quick Actions com padding consistente */}
          <EntranceAnimation animation="fade" delay={400}>
            <div className="padding-content">
              <QuickActionsSection />
            </div>
          </EntranceAnimation>
          
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
