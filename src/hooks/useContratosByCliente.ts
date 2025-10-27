import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratosByCliente = (clienteId: string | null) => {
  return useQuery({
    queryKey: ["contratos-by-cliente", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from("contratos")
        .select(`
          id,
          numero_contrato,
          banco_id,
          cliente_id,
          escritorio_id,
          tipo_operacao,
          valor_contrato,
          valor_financiado,
          valor_parcela,
          numero_parcelas,
          taxa_juros_contratual,
          data_assinatura,
          data_primeiro_vencimento,
          data_ultimo_pagamento,
          status,
          observacoes,
          created_at,
          updated_at,
          clientes:clientes (nome, cpf_cnpj),
          bancos:bancos_provisao (nome),
          analises_provisionamento (
            id,
            valor_divida,
            dias_atraso,
            meses_atraso,
            classificacao_risco,
            percentual_provisao,
            valor_provisao,
            data_calculo,
            created_at
          ),
          analises_juros_abusivos (
            id,
            taxa_contratual,
            taxa_media_bacen,
            diferenca_percentual,
            abusividade_detectada,
            data_analise,
            created_at
          )
        `)
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar contratos do cliente: ${error.message}`);
      }

      // Mapear dados das análises mais recentes para cada contrato
      const contratosComAnalises = data.map((contrato: any) => {
        // Pegar análise de Passivo mais recente
        const analisesPassivo = contrato.analises_provisionamento || [];
        const analisePassivo = analisesPassivo.length > 0
          ? analisesPassivo.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;

        // Pegar análise de Juros mais recente
        const analisesJuros = contrato.analises_juros_abusivos || [];
        const analiseJuros = analisesJuros.length > 0
          ? analisesJuros.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;

        return {
          ...contrato,
          // Dados de Gestão de Passivo Bancário
          valor_divida: analisePassivo?.valor_divida || contrato.valor_contrato || contrato.valor_financiado,
          dias_atraso: analisePassivo?.dias_atraso,
          meses_atraso: analisePassivo?.meses_atraso,
          classificacao: analisePassivo?.classificacao_risco,
          percentual_provisao: analisePassivo?.percentual_provisao,
          valor_provisao: analisePassivo?.valor_provisao,
          estagio_risco: analisePassivo?.classificacao_risco?.includes('Estágio 1') ? 1
                       : analisePassivo?.classificacao_risco?.includes('Estágio 2') ? 2
                       : analisePassivo?.classificacao_risco?.includes('Estágio 3') ? 3
                       : null,
          // Dados de Análise de Abusividades
          taxa_contratual: analiseJuros?.taxa_contratual,
          taxa_media_bacen: analiseJuros?.taxa_media_bacen,
          diferenca_percentual: analiseJuros?.diferenca_percentual,
          abusividade_detectada: analiseJuros?.abusividade_detectada,
          // Indicadores de análises realizadas
          temAnalisePassivo: !!analisePassivo,
          temAnaliseJuros: !!analiseJuros,
          // Situação do contrato (baseada no status ou análise)
          situacao: contrato.status || "Em análise",
        };
      });

      return contratosComAnalises as Contrato[];
    },
    enabled: !!clienteId,
  });
};

export const useContratosCountByCliente = () => {
  return useQuery({
    queryKey: ["contratos-count-by-cliente"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select("cliente_id, id")
        .order("cliente_id");

      if (error) {
        throw new Error(`Erro ao buscar contagem de contratos: ${error.message}`);
      }

      // Agrupar contratos por cliente
      const countMap = data.reduce((acc, contrato) => {
        acc[contrato.cliente_id] = (acc[contrato.cliente_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return countMap;
    },
  });
};