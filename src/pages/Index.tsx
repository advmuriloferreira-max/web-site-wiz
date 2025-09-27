import { Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
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
      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-20" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-80 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <ProgressBarComponent />

      {/* Hero Section */}
      <HeroSection />

      {/* Premium Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4" data-tour="dashboard-stats">
        <PremiumStatsCard
          title="Total de Contratos"
          value={stats?.totalContratos || 0}
          description="Contratos ativos"
          icon={FileText}
          color="blue"
        />
        <PremiumStatsCard
          title="Valor Total da Dívida"
          value={`R$ ${((stats?.valorTotalDividas || 0) / 1000).toFixed(0)}K`}
          description="Portfolio total"
          icon={DollarSign}
          color="emerald"
        />
        <PremiumStatsCard
          title="Provisão Total"
          value={`R$ ${((stats?.valorTotalProvisao || 0) / 1000).toFixed(0)}K`}
          description="Valor provisionado"
          icon={Calculator}
          color="amber"
        />
        <PremiumStatsCard
          title="% Provisão Média"
          value={`${(stats?.percentualProvisao ?? 0).toFixed(1)}%`}
          description="Risco do portfolio"
          icon={TrendingUp}
          color={(stats?.percentualProvisao ?? 0) > 50 ? "red" : "blue"}
        />
      </div>

      {/* Dashboard Tabs */}
      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="acordos" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Acordos</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Tendências</span>
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ClassificacaoChart data={stats?.porClassificacao || {}} />
            </div>
            <PerformanceCard />
          </div>
          
          <div className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 p-6 border-b border-white/20">
              <h3 className="text-lg font-semibold flex items-center space-x-2 text-slate-900 dark:text-white">
                <AlertTriangle className="h-5 w-5" />
                <span>Status dos Contratos</span>
              </h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(stats?.porSituacao || {}).map(([situacao, quantidade]) => (
                  <div key={situacao} className="group text-center p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                    <div className={`w-5 h-5 rounded-full mx-auto mb-3 shadow-lg ${
                      situacao === 'Concluído' ? 'bg-emerald-500' :
                      situacao === 'Em análise' ? 'bg-amber-500' :
                      situacao === 'Cancelado' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <p className="text-2xl font-bold text-slate-900 dark:text-white group-hover:scale-110 transition-transform duration-300">{quantidade}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">{situacao}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Análise de Acordos */}
        <TabsContent value="acordos" className="space-y-6">
          <AcordosChart />
        </TabsContent>

        {/* Análise de Clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <ClienteSelector 
              selectedClienteId={selectedClienteId}
              onClienteSelect={setSelectedClienteId}
            />
            <div className="lg:col-span-2">
              {selectedClienteId ? (
                <ClienteAnalysisDetails clienteId={selectedClienteId} />
              ) : (
                <ClientesAnalysisChart />
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="tendencias" className="space-y-6">
          <TendenciasChart />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <QuickActionsSection />
      
    </div>
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
