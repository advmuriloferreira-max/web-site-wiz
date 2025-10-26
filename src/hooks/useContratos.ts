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
          bancos:bancos_provisao (nome)
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
        .from("contratos_provisao")
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
    tableName: "contratos_provisao",
  });
};
