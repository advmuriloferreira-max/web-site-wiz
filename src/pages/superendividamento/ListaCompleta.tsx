import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, PiggyBank, Eye, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function ListaCompletaSuperendividamento() {
  const navigate = useNavigate();

  // Buscar relatórios socioeconômicos
  const { data: relatorios, isLoading: loadingRelatorios } = useQuery({
    queryKey: ["analises-socioeconomicas-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_socioeconomicas")
        .select(`
          *,
          cliente:clientes(nome, cpf_cnpj)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Buscar planos de pagamento
  const { data: planos, isLoading: loadingPlanos } = useQuery({
    queryKey: ["planos-pagamento-lista"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("planos_pagamento")
        .select(`
          *,
          cliente:clientes(nome, cpf_cnpj)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; label: string }> = {
      ativo: { variant: "default", label: "Ativo" },
      concluido: { variant: "secondary", label: "Concluído" },
      suspenso: { variant: "destructive", label: "Suspenso" },
    };

    const config = variants[status] || variants.ativo;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Análises Completas
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Relatórios socioeconômicos e planos de pagamento salvos
          </p>
        </div>
        <Button onClick={() => navigate("/app/superendividamento/dashboard")}>
          Voltar ao Dashboard
        </Button>
      </div>

      {/* Relatórios Socioeconômicos */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Relatórios Socioeconômicos
        </h2>
        {loadingRelatorios ? (
          <p className="text-gray-500">Carregando...</p>
        ) : !relatorios || relatorios.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum relatório encontrado
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relatorios.map((relatorio: any) => (
              <Card key={relatorio.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{relatorio.cliente?.nome || "Cliente não informado"}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    {relatorio.cliente?.cpf_cnpj || "CPF não informado"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(relatorio.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                      <p className="text-gray-500">Renda Total</p>
                      <p className="font-semibold">{formatCurrency(relatorio.renda_total || 0)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Dívidas</p>
                      <p className="font-semibold">{formatCurrency(relatorio.dividas_total || 0)}</p>
                    </div>
                  </div>
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/clientes/${relatorio.cliente_id}/analise-socioeconomica`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Planos de Pagamento */}
      <div>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Planos de Pagamento
        </h2>
        {loadingPlanos ? (
          <p className="text-gray-500">Carregando...</p>
        ) : !planos || planos.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Nenhum plano encontrado
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {planos.map((plano: any) => (
              <Card key={plano.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span className="truncate">{plano.cliente?.nome || "Cliente não informado"}</span>
                    {getStatusBadge(plano.status)}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <User className="h-4 w-4" />
                    {plano.cliente?.cpf_cnpj || "CPF não informado"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(plano.created_at), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
                    <div>
                      <p className="text-gray-500">% Renda</p>
                      <p className="font-semibold">{plano.percentual_renda}%</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Fases</p>
                      <p className="font-semibold">{plano.total_fases}</p>
                    </div>
                  </div>
                  <div className="text-sm pt-2 border-t">
                    <p className="text-gray-500">Valor Mensal</p>
                    <p className="font-semibold text-lg">{formatCurrency(plano.valor_mensal_total || 0)}</p>
                  </div>
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(`/app/clientes/${plano.cliente_id}/superendividamento`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalhes
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
