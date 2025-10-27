import { supabase } from "@/integrations/supabase/client";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface Contrato {
  id: string;
  escritorio_id: string;
  cliente_id: string;
  banco_id: string | null;
  numero_contrato: string | null;
  tipo_operacao: string | null;
  modalidade_bacen_id: string | null;
  valor_contrato: number | null;
  valor_financiado: number | null;
  valor_parcela: number | null;
  numero_parcelas: number | null;
  taxa_juros_contratual: number | null;
  data_assinatura: string | null;
  data_primeiro_vencimento: string | null;
  data_ultimo_pagamento: string | null;
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  clientes?: {
    nome: string;
    cpf_cnpj: string | null;
  };
  bancos?: {
    nome: string;
  };
  analises_provisionamento?: Array<{
    id: string;
    valor_divida: number;
    dias_atraso: number;
    meses_atraso: number;
    classificacao_risco: string;
    percentual_provisao: number;
    valor_provisao: number;
    data_calculo: string;
    created_at: string;
  }>;
  // Campos de análise de provisionamento (buscar da tabela analises_provisionamento)
  valor_divida?: number;
  saldo_contabil?: number | null;
  dias_atraso?: number;
  meses_atraso?: number;
  classificacao?: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | string | null;
  estagio_risco?: number | null;
  percentual_provisao?: number;
  valor_provisao?: number;
  situacao?: string;
  data_entrada?: string;
  data_conclusao?: string | null;
  proposta_acordo?: number | null;
  acordo_final?: number | null;
  quantidade_planos?: number | null;
  taxa_bacen?: number | null;
  taxa_referencia?: string | null;
  tempo_escritorio?: number | null;
  valor_honorarios?: number | null;
  percentual_honorarios?: number | null;
  data_vencimento?: string | null;
}

export const useContratos = () => {
  return useRealtimeQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
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
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar contratos: ${error.message}`);
      }

      // Mapear dados da análise mais recente para o contrato
      const contratosComAnalise = data.map((contrato: any) => {
        // Pegar a análise mais recente (primeira do array, pois vem ordenada)
        const analises = contrato.analises_provisionamento || [];
        const analiseRecente = analises.length > 0 
          ? analises.sort((a: any, b: any) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )[0]
          : null;

        return {
          ...contrato,
          // Adicionar campos da análise de passivo ao contrato
          valor_divida: analiseRecente?.valor_divida,
          dias_atraso: analiseRecente?.dias_atraso,
          meses_atraso: analiseRecente?.meses_atraso,
          classificacao: analiseRecente?.classificacao_risco,
          estagio_risco: analiseRecente?.classificacao_risco === 'Estágio 1' ? 1 
                       : analiseRecente?.classificacao_risco === 'Estágio 2' ? 2
                       : analiseRecente?.classificacao_risco === 'Estágio 3' ? 3
                       : null,
          percentual_provisao: analiseRecente?.percentual_provisao,
          valor_provisao: analiseRecente?.valor_provisao,
        };
      });

      return contratosComAnalise as Contrato[];
    },
    tableName: "contratos",
  });
};

export const useContratosStats = () => {
  return useRealtimeQuery({
    queryKey: ["contratos-stats"],
    queryFn: async () => {
      const { data: contratos, error } = await supabase
        .from("contratos")
        .select("valor_contrato, valor_financiado, status");

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const totalContratos = contratos.length;
      const valorTotalContratos = contratos.reduce((sum, c) => sum + (c.valor_contrato || c.valor_financiado || 0), 0);
      
      const porStatus = contratos.reduce((acc, c) => {
        acc[c.status] = (acc[c.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalContratos,
        valorTotalContratos,
        porStatus,
      };
    },
    tableName: "contratos",
  });
};
