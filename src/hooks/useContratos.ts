import { supabase } from "@/integrations/supabase/client";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface Contrato {
  id: string;
  cliente_id: string;
  banco_id: string;
  numero_contrato: string | null;
  tipo_operacao: string;
  tipo_operacao_bcb: string | null;
  valor_divida: number;
  saldo_contabil: number | null;
  data_ultimo_pagamento: string | null;
  data_vencimento: string | null;
  dias_atraso: number;
  meses_atraso: number;
  classificacao: 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | null;
  percentual_provisao: number;
  valor_provisao: number;
  situacao: string;
  data_entrada: string;
  data_conclusao: string | null;
  proposta_acordo: number | null;
  acordo_final: number | null;
  quantidade_planos: number | null;
  observacoes: string | null;
  taxa_bacen: number | null;
  taxa_referencia: string | null;
  valor_parcela: number | null;
  numero_parcelas: number | null;
  created_at: string;
  updated_at: string;
  // Relacionamentos
  clientes?: {
    nome: string;
    cpf_cnpj: string | null;
    responsavel: string | null;
  };
  bancos?: {
    nome: string;
  };
}

export const useContratos = () => {
  return useRealtimeQuery({
    queryKey: ["contratos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes (nome, cpf_cnpj, responsavel),
          bancos (nome)
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar contratos: ${error.message}`);
      }

      return data as Contrato[];
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
        .select("valor_divida, saldo_contabil, valor_provisao, classificacao, situacao");

      if (error) {
        throw new Error(`Erro ao buscar estatísticas: ${error.message}`);
      }

      const totalContratos = contratos.length;
      const valorTotalDividas = contratos.reduce((sum, c) => {
        // Se tem dívida contábil, usar ele; senão usar valor da dívida
        const valorBase = c.saldo_contabil ? c.saldo_contabil : (c.valor_divida || 0);
        return sum + valorBase;
      }, 0);
      const valorTotalProvisao = contratos.reduce((sum, c) => sum + (c.valor_provisao || 0), 0);
      
      const porClassificacao = contratos.reduce((acc, c) => {
        if (c.classificacao) {
          acc[c.classificacao] = (acc[c.classificacao] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const porSituacao = contratos.reduce((acc, c) => {
        acc[c.situacao] = (acc[c.situacao] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        totalContratos,
        valorTotalDividas,
        valorTotalProvisao,
        porClassificacao,
        porSituacao,
        percentualProvisao: valorTotalDividas > 0 ? (valorTotalProvisao / valorTotalDividas) * 100 : 0
      };
    },
    tableName: "contratos",
  });
};