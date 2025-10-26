import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  FileText, 
  Calculator, 
  TrendingDown, 
  PiggyBank,
  DollarSign,
  Activity,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [metricas, setMetricas] = useState({
    totalClientes: 0,
    totalContratos: 0,
    totalAnalisesMes: 0,
    valorProvisaoTotal: 0,
    valorRecuperavel: 0,
    economiaGerada: 0,
  });
  const [atividadesRecentes, setAtividadesRecentes] = useState<any[]>([]);

  useEffect(() => {
    carregarDashboard();
  }, [user]);

  const carregarDashboard = async () => {
    try {
      setLoading(true);

      // Buscar escritorio_id do usuário
      const { data: userData } = await supabase.auth.getUser();
      const { data: escritorioData } = await supabase
        .from("usuarios_escritorio")
        .select("escritorio_id")
        .eq("user_id", userData.user?.id)
        .single();

      const escritorioId = escritorioData?.escritorio_id;

      // 1. Total de clientes
      const { count: totalClientes } = await supabase
        .from("clientes_provisao")
        .select("*", { count: "exact", head: true })
        .eq("escritorio_id", escritorioId);

      // 2. Total de contratos
      const { count: totalContratos } = await supabase
        .from("contratos_provisao")
        .select("*", { count: "exact", head: true })
        .eq("escritorio_id", escritorioId);

      // 3. Análises deste mês
      const primeiroDiaMes = new Date();
      primeiroDiaMes.setDate(1);
      primeiroDiaMes.setHours(0, 0, 0, 0);

      const { count: analisesProvisionamento } = await supabase
        .from("analises_provisionamento")
        .select("*", { count: "exact", head: true })
        .eq("escritorio_id", escritorioId)
        .gte("created_at", primeiroDiaMes.toISOString());

      const { count: analisesJuros } = await supabase
        .from("analises_juros_abusivos")
        .select("*", { count: "exact", head: true })
        .eq("escritorio_id", escritorioId)
        .gte("created_at", primeiroDiaMes.toISOString());

      const { count: analisesSuperendividamento } = await supabase
        .from("analises_superendividamento")
        .select("*", { count: "exact", head: true })
        .eq("escritorio_id", escritorioId)
        .gte("created_at", primeiroDiaMes.toISOString());

      const totalAnalisesMes = (analisesProvisionamento || 0) + (analisesJuros || 0) + (analisesSuperendividamento || 0);

      // 4. Valor total de provisão
      const { data: provisoes } = await supabase
        .from("analises_provisionamento")
        .select("valor_provisao")
        .eq("escritorio_id", escritorioId);

      const valorProvisaoTotal = provisoes?.reduce((sum, p) => sum + (p.valor_provisao || 0), 0) || 0;

      // 5. Valor recuperável (juros abusivos)
      const { data: jurosAbusivos } = await supabase
        .from("analises_juros_abusivos")
        .select("*")
        .eq("escritorio_id", escritorioId)
        .eq("abusividade_detectada", true);

      // Calcular valor indevido total (simplificado)
      const valorRecuperavel = jurosAbusivos?.reduce((sum, j) => {
        const valorFinanciado = j.valor_financiado || 0;
        const numeroParcelas = j.numero_parcelas || 1;
        const valorParcela = j.valor_parcela || 0;
        const totalPago = valorParcela * numeroParcelas;
        const diferenca = totalPago - valorFinanciado;
        return sum + Math.max(0, diferenca * 0.3); // Estimativa conservadora
      }, 0) || 0;

      // 6. Economia gerada (superendividamento)
      const { data: superendividamentos } = await supabase
        .from("analises_superendividamento")
        .select("*")
        .eq("escritorio_id", escritorioId);

      const economiaGerada = superendividamentos?.reduce((sum, s) => {
        const encargoAtual = s.encargo_mensal_atual || 0;
        const encargoProposto = s.encargo_mensal_proposto || 0;
        const reducao = s.reducao_mensal || 0;
        return sum + Math.max(0, reducao * 12); // Estimativa anual
      }, 0) || 0;

      // 7. Atividades recentes (últimas 5)
      const { data: atividades } = await supabase
        .from("clientes_provisao")
        .select(`
          id,
          nome,
          created_at
        `)
        .eq("escritorio_id", escritorioId)
        .order("created_at", { ascending: false })
        .limit(5);

      // Buscar contratos para cada cliente
      const atividadesComContratos = await Promise.all(
        (atividades || []).map(async (cliente) => {
          const { count: totalContratos } = await supabase
            .from("contratos_provisao")
            .select("*", { count: "exact", head: true })
            .eq("cliente_id", cliente.id);
          
          return {
            ...cliente,
            contratos: { length: totalContratos || 0 }
          };
        })
      );

      setMetricas({
        totalClientes: totalClientes || 0,
        totalContratos: totalContratos || 0,
        totalAnalisesMes,
        valorProvisaoTotal,
        valorRecuperavel,
        economiaGerada,
      });

      setAtividadesRecentes(atividadesComContratos || []);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo ao INTELLBANK 🎯
        </h1>
        <p className="text-muted-foreground">
          Seu SaaS especializado em Direito Bancário
        </p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Card 1: Clientes e Contratos */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gestão de Casos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalClientes}</div>
            <p className="text-xs text-muted-foreground">
              Clientes ativos
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              {metricas.totalContratos} contratos cadastrados
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Análises */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Análises Este Mês</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas.totalAnalisesMes}</div>
            <p className="text-xs text-muted-foreground">
              Análises realizadas
            </p>
            <div className="mt-2">
              <Badge variant="outline" className="text-xs">
                +{Math.round((metricas.totalAnalisesMes / Math.max(metricas.totalClientes, 1)) * 100)}% produtividade
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Valor Gerado */}
        <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Gerado</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-400">
              {formatCurrency(metricas.valorRecuperavel + metricas.economiaGerada)}
            </div>
            <p className="text-xs text-muted-foreground">
              Potencial de recuperação
            </p>
            <div className="mt-2 text-xs text-green-700 dark:text-green-400">
              {formatCurrency(metricas.valorRecuperavel)} em juros abusivos
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Seção de Análise Rápida */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">⚡ Análise Rápida</h2>
            <p className="text-muted-foreground">
              Resultados imediatos sem necessidade de cadastro
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Provisionamento Rápido */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-orange-300 bg-gradient-to-br from-white to-orange-50 dark:border-orange-600 dark:from-orange-950/20 dark:to-orange-900/10"
                onClick={() => navigate("/app/quick/provisionamento")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500 rounded-lg shadow-md">
                  <Calculator className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Provisionamento</CardTitle>
                  <CardDescription>Resolução BCB 4966/2021</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Calcule a provisão bancária (C1-C5) de forma rápida e precisa
              </p>
              <Button className="w-full" variant="outline">
                Calcular Agora →
              </Button>
            </CardContent>
          </Card>

          {/* Card 2: Juros Abusivos Rápido */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-red-300 bg-gradient-to-br from-white to-red-50 dark:border-red-600 dark:from-red-950/20 dark:to-red-900/10"
                onClick={() => navigate("/app/quick/juros-abusivos")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-500 rounded-lg shadow-md">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Juros Abusivos</CardTitle>
                  <CardDescription>Comparação com BACEN</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Identifique abusividade comparando com taxas médias BACEN
              </p>
              <Button className="w-full" variant="outline">
                Analisar Agora →
              </Button>
            </CardContent>
          </Card>

          {/* Card 3: Superendividamento Rápido */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-blue-300 bg-gradient-to-br from-white to-blue-50 dark:border-blue-600 dark:from-blue-950/20 dark:to-blue-900/10"
                onClick={() => navigate("/app/quick/superendividamento")}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500 rounded-lg shadow-md">
                  <PiggyBank className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-lg">Superendividamento</CardTitle>
                  <CardDescription>Lei 14.181/2021</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                Crie plano de pagamento personalizado rapidamente
              </p>
              <Button className="w-full" variant="outline">
                Criar Plano →
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
          <p className="text-sm text-center text-muted-foreground">
            💡 <strong>Dica:</strong> Análises rápidas podem ser salvas e vinculadas a clientes posteriormente
          </p>
        </div>
      </section>

      {/* Atividades Recentes */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Atividades Recentes</h2>
            <p className="text-muted-foreground">
              Últimos clientes e contratos adicionados
            </p>
          </div>
          <Button variant="ghost" onClick={() => navigate("/app/clientes")}>
            Ver Todos <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            {atividadesRecentes.length > 0 ? (
              <div className="space-y-4">
                {atividadesRecentes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/app/clientes/${cliente.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold">{cliente.nome}</p>
                        <p className="text-sm text-muted-foreground">
                          {cliente.contratos?.length || 0} contrato(s)
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(cliente.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum cliente cadastrado ainda</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate("/app/clientes")}
                >
                  Cadastrar Primeiro Cliente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Ações Rápidas */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/app/clientes")}
          >
            <Users className="h-5 w-5" />
            <span>Novo Cliente</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/app/analises/provisionamento")}
          >
            <BarChart3 className="h-5 w-5" />
            <span>Ver Análises</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/app/quick/provisionamento")}
          >
            <Calculator className="h-5 w-5" />
            <span>Análise Rápida</span>
          </Button>
          
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => navigate("/app/clientes")}
          >
            <FileText className="h-5 w-5" />
            <span>Relatórios</span>
          </Button>
        </div>
      </section>
    </div>
  );
}