import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, FileText, Calculator, ListChecks, TrendingDown, Users, AlertTriangle, DollarSign, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardSuperendividamento() {
  const navigate = useNavigate();

  // Buscar estatísticas e dados
  const { data: stats } = useQuery({
    queryKey: ["superendividamento-stats"],
    queryFn: async () => {
      const [relatoriosRes, planosRes, dividasRes, analisesRes, clientesRes] = await Promise.all([
        supabase.from("analises_socioeconomicas").select("*"),
        supabase.from("planos_pagamento").select("*, cliente:clientes(nome, cpf_cnpj)").order("created_at", { ascending: false }),
        supabase.from("dividas_superendividamento").select("valor_atual, cliente_id"),
        supabase.from("analises_superendividamento").select("*"),
        supabase.from("clientes").select("id"),
      ]);

      const totalPlanos = planosRes.data?.length || 0;
      const planosAtivos = planosRes.data?.filter(p => p.status === "ativo").length || 0;
      const totalDividas = dividasRes.data?.reduce((sum, d) => sum + (d.valor_atual || 0), 0) || 0;
      
      // Calcular economia média
      const economiasArray = analisesRes.data
        ?.filter(a => a.reducao_mensal && a.reducao_mensal > 0)
        .map(a => a.reducao_mensal) || [];
      const economiaMedia = economiasArray.length > 0 
        ? economiasArray.reduce((sum, val) => sum + val, 0) / economiasArray.length 
        : 0;

      // Distribuição por comprometimento de renda
      const distribuicaoComprometimento = [
        { nome: "0-30%", value: 0, fill: "#22c55e" },
        { nome: "30-50%", value: 0, fill: "#eab308" },
        { nome: "50-70%", value: 0, fill: "#f97316" },
        { nome: "70%+", value: 0, fill: "#ef4444" },
      ];
      
      relatoriosRes.data?.forEach((rel: any) => {
        const perc = rel.percentual_comprometimento || 0;
        if (perc <= 30) distribuicaoComprometimento[0].value++;
        else if (perc <= 50) distribuicaoComprometimento[1].value++;
        else if (perc <= 70) distribuicaoComprometimento[2].value++;
        else distribuicaoComprometimento[3].value++;
      });

      // Número de credores por cliente (mock - ajustar conforme estrutura real)
      const credoresPorCliente = [
        { faixa: "1-3", quantidade: 12 },
        { faixa: "4-6", quantidade: 8 },
        { faixa: "7-10", quantidade: 5 },
        { faixa: "10+", quantidade: 2 },
      ];

      // Evolução de planos nos últimos 6 meses
      const evolucaoPlanos = [];
      for (let i = 5; i >= 0; i--) {
        const mes = subMonths(new Date(), i);
        const mesFormatado = format(mes, "MMM/yy", { locale: ptBR });
        const planosMes = planosRes.data?.filter((p: any) => {
          const dataCriacao = new Date(p.created_at);
          return dataCriacao.getMonth() === mes.getMonth() && 
                 dataCriacao.getFullYear() === mes.getFullYear();
        }).length || 0;
        
        evolucaoPlanos.push({
          mes: mesFormatado,
          planos: planosMes,
        });
      }

      return {
        totalRelatorios: relatoriosRes.data?.length || 0,
        totalClientes: clientesRes.data?.length || 0,
        totalPlanos,
        planosAtivos,
        totalDividas,
        economiaMedia,
        distribuicaoComprometimento,
        credoresPorCliente,
        evolucaoPlanos,
        ultimosPlanos: planosRes.data?.slice(0, 5) || [],
      };
    },
  });

  const quickActions = [
    {
      title: "Novo Relatório Socioeconômico",
      description: "Coletar renda, despesas e dívidas do cliente",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/app/superendividamento/novo-relatorio"),
    },
    {
      title: "Novo Plano de Pagamento",
      description: "Criar plano com base na Lei 14.181/2021",
      icon: PiggyBank,
      color: "from-green-500 to-green-600",
      action: () => navigate("/app/superendividamento/novo-plano"),
    },
    {
      title: "Simulação Rápida",
      description: "Calcular plano sem vincular a cliente",
      icon: Calculator,
      color: "from-purple-500 to-purple-600",
      action: () => navigate("/app/superendividamento/simulacao-rapida"),
    },
    {
      title: "Lista Completa",
      description: "Ver todos os relatórios e planos salvos",
      icon: ListChecks,
      color: "from-orange-500 to-orange-600",
      action: () => navigate("/app/superendividamento/lista"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Superendividamento
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Lei 14.181/2021 - Planos de pagamento e análise socioeconômica
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes em Análise
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalClientes || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Relatórios Criados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats?.totalRelatorios || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <PiggyBank className="h-4 w-4" />
              Planos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.planosAtivos || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total em Dívidas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats?.totalDividas || 0)}
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Economia Média
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(stats?.economiaMedia || 0)}
            </div>
            <p className="text-xs text-gray-500 mt-1">por mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary"
                onClick={action.action}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${action.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{action.title}</CardTitle>
                      <CardDescription className="mt-1">{action.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Pizza - Distribuição por Comprometimento */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comprometimento de Renda</CardTitle>
            <CardDescription>Distribuição de clientes por percentual</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats?.distribuicaoComprometimento || []}
                  dataKey="value"
                  nameKey="nome"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {stats?.distribuicaoComprometimento?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Barras - Credores por Cliente */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Credores por Cliente</CardTitle>
            <CardDescription>Número de credores por faixa</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats?.credoresPorCliente || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="faixa" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de Linha - Evolução dos Planos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Evolução de Planos</CardTitle>
            <CardDescription>Últimos 6 meses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats?.evolucaoPlanos || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="planos" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Últimos Planos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Últimos Planos Criados</CardTitle>
          <CardDescription>5 planos mais recentes</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>CPF/CNPJ</TableHead>
                <TableHead>% Renda</TableHead>
                <TableHead>Valor Mensal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!stats?.ultimosPlanos || stats.ultimosPlanos.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nenhum plano encontrado
                  </TableCell>
                </TableRow>
              ) : (
                stats.ultimosPlanos.map((plano: any) => (
                  <TableRow key={plano.id}>
                    <TableCell className="font-medium">
                      {plano.cliente?.nome || "Cliente não informado"}
                    </TableCell>
                    <TableCell>{plano.cliente?.cpf_cnpj || "-"}</TableCell>
                    <TableCell>{plano.percentual_renda}%</TableCell>
                    <TableCell>
                      {new Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(plano.valor_mensal_total || 0)}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          plano.status === "ativo"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : plano.status === "concluido"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {plano.status || "ativo"}
                      </span>
                    </TableCell>
                    <TableCell>
                      {format(new Date(plano.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/app/clientes/${plano.cliente_id}/superendividamento`)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <AlertTriangle className="h-5 w-5" />
            Lei 14.181/2021 - Superendividamento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
          <p>
            <strong>Limite de comprometimento:</strong> 30% ou 35% da renda líquida mensal
          </p>
          <p>
            <strong>Prazo máximo:</strong> 60 meses para pagamento das dívidas
          </p>
          <p>
            <strong>Redistribuição:</strong> Ao quitar um credor, a sobra é redistribuída proporcionalmente entre os demais
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
