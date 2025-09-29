import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
import { ResponsiveGrid, AdaptiveCard } from "@/components/ui/responsive-grid";
import { HeroSection } from "@/components/dashboard/HeroSection";
import { PremiumStatsCard } from "@/components/dashboard/PremiumStatsCard";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { QuickActions } from "@/components/ui/quick-actions";
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
import { LegalIcons } from "@/components/ui/legal-icons";
import { BCBComplianceBadge } from "@/components/ui/legal-compliance-badge";

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
      <div className="container mx-auto space-y-8 animate-fade-in">
        <ProgressBarComponent />

        {/* Hero Section - Seção Principal */}
        <EntranceAnimation animation="fade" delay={100}>
          <div className="px-4 md:px-6">
            <HeroSection />
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
                    title="Provisão Total"
                    value={`R$ ${((stats?.valorTotalProvisao || 0) / 1000000).toFixed(1)}M`}
                    description="Valor provisionado"
                    icon={LegalIcons.warning}
                    trend={{ value: -5, isPositive: false }}
                    color="amber"
                  />
                </div>
                <div className="flex-1 min-w-[200px]">
                  <PremiumStatsCard
                    title="Taxa Média"
                    value={`${(stats?.percentualProvisao || 0).toFixed(1)}%`}
                    description="Risco do portfolio"
                    icon={LegalIcons.compliance}
                    trend={{ value: 3, isPositive: true }}
                    color={(stats?.percentualProvisao ?? 0) > 50 ? "red" : "blue"}
                  />
                </div>
              </div>
            </EntranceAnimation>

            {/* Charts - Dashboard Tabs */}
            <EntranceAnimation animation="scale" delay={300}>
              <Tabs defaultValue="visao-geral" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4 bg-muted/50 border shadow-sm">
                  <TabsTrigger value="visao-geral" className="flex items-center space-x-2 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    <LegalIcons.dashboard className="h-4 w-4" />
                    <span className="hidden sm:inline text-sm font-medium">Painel</span>
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
                    <ClassificacaoChart data={stats?.porClassificacao || {}} />
                    <PerformanceCard />
                  </div>
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
                      <ClienteAnalysisDetails clienteId={selectedClienteId} />
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
