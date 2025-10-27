import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModalidadeBacenJuros {
  id: string;
  nome: string;
  codigo_sgs: string;
  categoria: string;
  tipo_pessoa: string;
  tipo_recurso: string;
  descricao: string | null;
}

export interface SerieTemporal {
  id: string;
  modalidade_id: string;
  data_referencia: string;
  ano: number;
  mes: number;
  taxa_mensal: number;
  taxa_anual: number | null;
  modalidades_bacen_juros: ModalidadeBacenJuros;
}

/**
 * Hook para buscar todas as modalidades únicas disponíveis
 */
export const useModalidadesJurosBacen = () => {
  return useQuery({
    queryKey: ["modalidades-juros-bacen"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("modalidades_bacen_juros")
        .select("*")
        .eq("ativo", true)
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as ModalidadeBacenJuros[];
    },
  });
};

/**
 * Hook para buscar taxa específica de uma modalidade em uma data
 */
export const useTaxaJurosBacenPorData = (
  modalidadeId: string | null,
  dataReferencia: string | null
) => {
  return useQuery({
    queryKey: ["taxa-juros-bacen", modalidadeId, dataReferencia],
    queryFn: async () => {
      if (!modalidadeId || !dataReferencia) return null;

      // Buscar taxa exata para a data
      const { data, error } = await supabase
        .from("series_temporais_bacen")
        .select(`
          *,
          modalidades_bacen_juros (*)
        `)
        .eq("modalidade_id", modalidadeId)
        .eq("data_referencia", dataReferencia)
        .maybeSingle();

      if (error) throw error;

      // Se não encontrar taxa exata, buscar a mais próxima anterior
      if (!data) {
        const { data: proximaData, error: proximaError } = await supabase
          .from("series_temporais_bacen")
          .select(`
            *,
            modalidades_bacen_juros (*)
          `)
          .eq("modalidade_id", modalidadeId)
          .lte("data_referencia", dataReferencia)
          .order("data_referencia", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (proximaError) throw proximaError;
        return proximaData as SerieTemporal | null;
      }

      return data as SerieTemporal;
    },
    enabled: !!modalidadeId && !!dataReferencia,
  });
};

/**
 * Hook para buscar histórico de taxas de uma modalidade
 */
export const useHistoricoTaxasJurosBacen = (
  modalidadeId: string | null,
  limite: number = 12
) => {
  return useQuery({
    queryKey: ["historico-taxas-bacen", modalidadeId, limite],
    queryFn: async () => {
      if (!modalidadeId) return [];

      const { data, error } = await supabase
        .from("series_temporais_bacen")
        .select(`
          *,
          modalidades_bacen_juros (*)
        `)
        .eq("modalidade_id", modalidadeId)
        .order("data_referencia", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data as SerieTemporal[];
    },
    enabled: !!modalidadeId,
  });
};
