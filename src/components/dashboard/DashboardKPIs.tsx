import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardKPIs } from "@/hooks/useDashboardData";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Users, FileText, TrendingDown, PiggyBank, DollarSign } from "lucide-react";

export function DashboardKPIs() {
  const { data: kpis, isLoading } = useDashboardKPIs();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2" />
              <div className="h-3 bg-muted rounded w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {/* Total de Clientes */}
      <Link to="/app/clientes">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <AnimatedCounter value={kpis?.totalClientes || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Clientes cadastrados
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Total de Contratos */}
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            <AnimatedCounter value={kpis?.totalContratos || 0} />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Distribuídos entre {kpis?.totalClientes || 0} clientes
          </p>
        </CardContent>
      </Card>

      {/* Análises de Juros Abusivos */}
      <Link to="/app/analises/juros-abusivos">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-destructive/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Juros Abusivos</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              <AnimatedCounter value={kpis?.analisesJurosAbusivos || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {kpis?.totalAnalisesJuros || 0} análises realizadas
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Análises de Passivo Bancário */}
      <Link to="/app/analises/provisionamento">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-warning/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passivo Alto Risco</CardTitle>
            <PiggyBank className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">
              <AnimatedCounter value={kpis?.analisesPassivoAltoRisco || 0} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {kpis?.totalAnalisesPassivo || 0} análises realizadas
            </p>
          </CardContent>
        </Card>
      </Link>

      {/* Valor Total em Análise */}
      <Card className="hover:shadow-lg transition-shadow border-primary/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor em Análise</CardTitle>
          <DollarSign className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-primary">
            R$ <AnimatedCounter 
              value={(kpis?.valorTotalEmAnalise || 0) / 1000} 
              suffix="k"
              decimals={0}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Potencial de recuperação
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
