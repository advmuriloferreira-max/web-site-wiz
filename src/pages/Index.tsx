import { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { DashboardKPIs } from "@/components/dashboard/DashboardKPIs";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { UltimasAnalisesTable } from "@/components/dashboard/UltimasAnalisesTable";
import { BancoDistributionChart } from "@/components/dashboard/BancoDistributionChart";
import { JurosStatusChart } from "@/components/dashboard/JurosStatusChart";
import { QuickActionsSection } from "@/components/dashboard/QuickActionsSection";
import { EntranceAnimation } from "@/components/ui/global-animations";
import { GradientBackground } from "@/components/ui/gradient-elements";
import { LoadingIllustration } from "@/components/ui/premium-illustrations";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, AlertTriangle, Calendar, Users as UsersIcon } from "lucide-react";
import { LegalIcons } from "@/components/ui/legal-icons";
import { useClientes } from "@/hooks/useClientes";
import { useContratosStats } from "@/hooks/useContratos";

function DashboardContent() {
  const { usuarioEscritorio, loading: authLoading } = useAuth();
  const { data: stats } = useContratosStats();
  const { data: clientes = [] } = useClientes();
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

  // Loading do Auth
  if (authLoading) {
    return (
      <GradientBackground variant="subtle" className="min-h-screen">
        <div className="p-6 space-y-6">
          <EntranceAnimation animation="fade">
            <LoadingIllustration size="lg" className="mx-auto" />
            <p className="text-center text-muted-foreground mt-4">Carregando Painel do Advogado...</p>
          </EntranceAnimation>
        </div>
      </GradientBackground>
    );
  }

  // Verificar se escritório existe
  if (!escritorio) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Escritório não encontrado</AlertTitle>
          <AlertDescription>
            Não foi possível carregar as informações do escritório.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <GradientBackground variant="subtle" className="min-h-screen">
      <div className="container mx-auto p-6 space-y-8 animate-fade-in">
        {/* Header */}
        <EntranceAnimation animation="fade" delay={0}>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-foreground">Painel do Advogado</h1>
            <p className="text-muted-foreground">
              Visão consolidada e estratégica da sua carteira de clientes e contratos
            </p>
          </div>
        </EntranceAnimation>

        {/* Status do Escritório */}
        {escritorio && planoStatus && (
          <EntranceAnimation animation="fade" delay={50}>
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{escritorio.nome}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
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
                    </div>
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

            {planoStatus.alertas.length > 0 && (
              <div className="space-y-2 mt-4">
                {planoStatus.alertas.map((alerta, idx) => (
                  <Alert key={idx} variant={alerta.tipo === 'critico' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>{alerta.tipo === 'critico' ? 'Atenção Crítica' : 'Aviso'}</AlertTitle>
                    <AlertDescription>{alerta.mensagem}</AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </EntranceAnimation>
        )}

        {/* KPIs Cards */}
        <EntranceAnimation animation="slide" delay={100}>
          <DashboardKPIs />
        </EntranceAnimation>

        {/* Alertas e Pendências */}
        <EntranceAnimation animation="fade" delay={150}>
          <DashboardAlerts />
        </EntranceAnimation>

        {/* CTA - Análise de Juros */}
        <EntranceAnimation animation="scale" delay={200}>
          <Card className="border-2 border-primary/50 shadow-lg bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Calculator className="h-6 w-6 text-primary" />
                    Análise de Juros Abusivos
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Calcule taxas de juros reais, compare com BACEN e identifique abusividades em segundos
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => navigate("/calculadora-juros")}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Abrir Calculadora Rápida
              </Button>
            </CardContent>
          </Card>
        </EntranceAnimation>

        {/* Últimas Análises */}
        <EntranceAnimation animation="fade" delay={250}>
          <UltimasAnalisesTable />
        </EntranceAnimation>

        {/* Gráficos */}
        <EntranceAnimation animation="scale" delay={300}>
          <div className="grid gap-6 md:grid-cols-2">
            <BancoDistributionChart />
            <JurosStatusChart />
          </div>
        </EntranceAnimation>

        {/* Quick Actions */}
        <EntranceAnimation animation="fade" delay={350}>
          <QuickActionsSection />
        </EntranceAnimation>
      </div>
    </GradientBackground>
  );
}

function Index() {
  return (
    <Suspense
      fallback={
        <GradientBackground variant="subtle" className="min-h-screen">
          <div className="p-6 space-y-6">
            <LoadingIllustration size="lg" className="mx-auto" />
            <p className="text-center text-muted-foreground">Carregando dashboard...</p>
          </div>
        </GradientBackground>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

export default Index;
