import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratosByCliente = (clienteId: string | null) => {
  return useQuery({
    queryKey: ["contratos-by-cliente", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      console.log('🔍 Buscando contratos para cliente:', clienteId);

      const { data, error } = await supabase
        .from("contratos")
        .select(`
          id,
          created_at,
          updated_at,
          cliente_id,
          banco_id,
          modalidade_bacen_id,
          numero_contrato,
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
          escritorio_id,
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
        console.error('❌ Erro ao buscar contratos:', error);
        throw new Error(`Erro ao buscar contratos do cliente: ${error.message}`);
      }

      console.log('✅ Contratos retornados do Supabase:', data);
      console.log('🔑 IDs dos contratos:', data?.map(c => c.id));

      if (!data || data.length === 0) {
        console.log('⚠️ Nenhum contrato encontrado para este cliente');
        return [];
      }

      // Mapear dados das análises mais recentes para cada contrato
      const contratosComAnalises = data.map((contrato: any) => {
        console.log('📝 Processando contrato:', contrato.id, contrato.numero_contrato);

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

        const contratoProcessado = {
          // IMPORTANTE: Garantir que o ID seja sempre retornado
          id: contrato.id,
          created_at: contrato.created_at,
          updated_at: contrato.updated_at,
          cliente_id: contrato.cliente_id,
          banco_id: contrato.banco_id,
          modalidade_bacen_id: contrato.modalidade_bacen_id,
          numero_contrato: contrato.numero_contrato,
          tipo_operacao: contrato.tipo_operacao,
          valor_contrato: contrato.valor_contrato,
          valor_financiado: contrato.valor_financiado,
          valor_parcela: contrato.valor_parcela,
          numero_parcelas: contrato.numero_parcelas,
          taxa_juros_contratual: contrato.taxa_juros_contratual,
          data_assinatura: contrato.data_assinatura,
          data_primeiro_vencimento: contrato.data_primeiro_vencimento,
          data_ultimo_pagamento: contrato.data_ultimo_pagamento,
          status: contrato.status,
          observacoes: contrato.observacoes,
          escritorio_id: contrato.escritorio_id,
          
          // Relacionamentos
          clientes: contrato.clientes,
          bancos: contrato.bancos,
          
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
          
          // Situação do contrato
          situacao: contrato.status || "Em análise",
        };

        console.log('✅ Contrato processado com ID:', contratoProcessado.id);
        
        return contratoProcessado;
      });

      console.log('🎯 Total de contratos processados:', contratosComAnalises.length);
      console.log('🔑 IDs finais:', contratosComAnalises.map(c => c.id));

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
