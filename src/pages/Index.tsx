import { Suspense } from "react";
import { Link } from "react-router-dom";
import { useContratosStats } from "@/hooks/useContratos";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ClassificacaoChart } from "@/components/dashboard/ClassificacaoChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  FileText, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Calculator
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
            Monitoramento de Provisionamento Bancário
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Contratos"
          value={stats?.totalContratos || 0}
          description="Contratos cadastrados"
          icon={FileText}
        />
        <StatsCard
          title="Valor Total de Dívidas"
          value={`R$ ${((stats?.valorTotalDividas || 0) / 1000).toFixed(0)}K`}
          description="Somatório das dívidas"
          icon={DollarSign}
        />
        <StatsCard
          title="Provisão Total"
          value={`R$ ${((stats?.valorTotalProvisao || 0) / 1000).toFixed(0)}K`}
          description="Valor total provisionado"
          icon={Calculator}
        />
        <StatsCard
          title="% Provisão"
          value={`${(stats?.percentualProvisao || 0).toFixed(1)}%`}
          description="Percentual de provisão"
          icon={TrendingUp}
          className={
            (stats?.percentualProvisao || 0) > 50 
              ? "border-destructive/20 bg-destructive/5" 
              : "border-primary/20 bg-primary/5"
          }
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <ClassificacaoChart data={stats?.porClassificacao || {}} />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Status dos Contratos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.porSituacao || {}).map(([situacao, quantidade]) => (
                <div key={situacao} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      situacao === 'Concluído' ? 'bg-green-500' :
                      situacao === 'Em análise' ? 'bg-yellow-500' :
                      situacao === 'Cancelado' ? 'bg-red-500' :
                      'bg-blue-500'
                    }`} />
                    <span className="text-sm font-medium text-foreground">
                      {situacao}
                    </span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {quantidade}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
            <div className="flex items-center space-x-3 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors">
              <AlertTriangle className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-medium text-foreground">Alertas</h3>
                <p className="text-sm text-muted-foreground">Verificar pendências</p>
              </div>
            </div>
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
