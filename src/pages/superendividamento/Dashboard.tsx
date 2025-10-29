import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PiggyBank, FileText, Calculator, ListChecks, TrendingDown, Users, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function DashboardSuperendividamento() {
  const navigate = useNavigate();

  // Buscar estatísticas
  const { data: stats } = useQuery({
    queryKey: ["superendividamento-stats"],
    queryFn: async () => {
      const [relatoriosRes, planosRes, dividasRes] = await Promise.all([
        supabase.from("analises_socioeconomicas").select("id", { count: "exact" }),
        supabase.from("planos_pagamento").select("id, status", { count: "exact" }),
        supabase.from("dividas_superendividamento").select("valor_atual", { count: "exact" }),
      ]);

      const totalPlanos = planosRes.count || 0;
      const planosAtivos = planosRes.data?.filter(p => p.status === "ativo").length || 0;
      const totalDividas = dividasRes.data?.reduce((sum, d) => sum + (d.valor_atual || 0), 0) || 0;

      return {
        totalRelatorios: relatoriosRes.count || 0,
        totalPlanos,
        planosAtivos,
        totalDividas,
      };
    },
  });

  const quickActions = [
    {
      title: "Novo Relatório Socioeconômico",
      description: "Coletar renda, despesas e dívidas do cliente",
      icon: FileText,
      color: "from-blue-500 to-blue-600",
      action: () => navigate("/app/clientes"), // Selecionar cliente primeiro
    },
    {
      title: "Novo Plano de Pagamento",
      description: "Criar plano com base na Lei 14.181/2021",
      icon: PiggyBank,
      color: "from-green-500 to-green-600",
      action: () => navigate("/app/clientes"), // Selecionar cliente primeiro
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Relatórios Salvos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalRelatorios || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Planos Criados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats?.totalPlanos || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Planos Ativos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats?.planosAtivos || 0}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
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
