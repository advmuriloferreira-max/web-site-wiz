import { Suspense } from "react";
import { Link } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClassificacaoChart } from "@/components/dashboard/ClassificacaoChart";
import { AcordosChart } from "@/components/dashboard/AcordosChart";
import { ClientesAnalysisChart } from "@/components/dashboard/ClientesAnalysisChart";
import { TendenciasChart } from "@/components/dashboard/TendenciasChart";
import { PerformanceCard } from "@/components/dashboard/PerformanceCard";
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">
            Monitoramento Inteligente de Provisionamento Bancário
          </p>
        </div>
      </div>

      {/* KPI Cards Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Contratos"
          value={stats?.totalContratos || 0}
          description="Contratos ativos"
          icon={FileText}
        />
        <StatsCard
          title="Valor Total de Dívidas"
          value={`R$ ${((stats?.valorTotalDividas || 0) / 1000).toFixed(0)}K`}
          description="Portfolio total"
          icon={DollarSign}
        />
        <StatsCard
          title="Provisão Total"
          value={`R$ ${((stats?.valorTotalProvisao || 0) / 1000).toFixed(0)}K`}
          description="Valor provisionado"
          icon={Calculator}
        />
        <StatsCard
          title="% Provisão Média"
          value={`${(stats?.percentualProvisao || 0).toFixed(1)}%`}
          description="Risco do portfolio"
          icon={TrendingUp}
          className={
            (stats?.percentualProvisao || 0) > 50 
              ? "border-destructive/20 bg-destructive/5" 
              : "border-primary/20 bg-primary/5"
          }
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
        <TabsContent value="visao-geral" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <ClassificacaoChart data={stats?.porClassificacao || {}} />
            </div>
            <PerformanceCard />
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Status dos Contratos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats?.porSituacao || {}).map(([situacao, quantidade]) => (
                  <div key={situacao} className="text-center p-3 border border-border rounded-lg">
                    <div className={`w-4 h-4 rounded-full mx-auto mb-2 ${
                      situacao === 'Concluído' ? 'bg-green-500' :
                      situacao === 'Em análise' ? 'bg-yellow-500' :
                      situacao === 'Cancelado' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <p className="text-2xl font-bold text-foreground">{quantidade}</p>
                    <p className="text-sm text-muted-foreground">{situacao}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Análise de Acordos */}
        <TabsContent value="acordos" className="space-y-6">
          <AcordosChart />
        </TabsContent>

        {/* Análise de Clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <ClientesAnalysisChart />
        </TabsContent>

        {/* Tendências */}
        <TabsContent value="tendencias" className="space-y-6">
          <TendenciasChart />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Link to="/clientes/novo" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium text-foreground">Novo Cliente</h3>
                <p className="text-sm text-muted-foreground">Cadastrar cliente</p>
              </div>
            </Link>
            <Link to="/contratos/novo" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium text-foreground">Novo Contrato</h3>
                <p className="text-sm text-muted-foreground">Registrar dívida</p>
              </div>
            </Link>
            <Link to="/calculos" className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <Calculator className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium text-foreground">Calculadora</h3>
                <p className="text-sm text-muted-foreground">Calcular provisões</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
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
