import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TaxaJurosBacen {
  id: number;
  codigo_serie: number;
  nome_modalidade: string;
  categoria: string;
  sub_categoria: string;
  data_referencia: string;
  taxa_mensal: number;
  created_at: string;
}

/**
 * Hook para buscar todas as modalidades únicas disponíveis
 * Retorna apenas um registro por modalidade (mais recente)
 */
export const useModalidadesJurosBacen = () => {
  return useQuery({
    queryKey: ["modalidades-juros-bacen"],
    queryFn: async () => {
      // Buscar modalidades únicas agrupadas por codigo_serie
      const { data, error } = await supabase
        .from("taxas_juros_bacen")
        .select("codigo_serie, nome_modalidade, categoria, sub_categoria")
        .order("codigo_serie", { ascending: true });

      if (error) throw error;

      // Remover duplicatas (manter apenas uma entrada por código de série)
      const modalidadesUnicas = data.reduce((acc, curr) => {
        if (!acc.find(m => m.codigo_serie === curr.codigo_serie)) {
          acc.push(curr);
        }
        return acc;
      }, [] as typeof data);

      return modalidadesUnicas;
    },
  });
};

/**
 * Hook para buscar taxa específica de uma modalidade em uma data
 */
export const useTaxaJurosBacenPorData = (
  codigoSerie: number | null,
  dataReferencia: string | null
) => {
  return useQuery({
    queryKey: ["taxa-juros-bacen", codigoSerie, dataReferencia],
    queryFn: async () => {
      if (!codigoSerie || !dataReferencia) return null;

      // Buscar taxa exata para a data
      const { data, error } = await supabase
        .from("taxas_juros_bacen")
        .select("*")
        .eq("codigo_serie", codigoSerie)
        .eq("data_referencia", dataReferencia)
        .maybeSingle();

      if (error) throw error;

      // Se não encontrar taxa exata, buscar a mais próxima anterior
      if (!data) {
        const { data: proximaData, error: proximaError } = await supabase
          .from("taxas_juros_bacen")
          .select("*")
          .eq("codigo_serie", codigoSerie)
          .lte("data_referencia", dataReferencia)
          .order("data_referencia", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (proximaError) throw proximaError;
        return proximaData;
      }

      return data;
    },
    enabled: !!codigoSerie && !!dataReferencia,
  });
};

/**
 * Hook para buscar histórico de taxas de uma modalidade
 */
export const useHistoricoTaxasJurosBacen = (
  codigoSerie: number | null,
  limite: number = 12
) => {
  return useQuery({
    queryKey: ["historico-taxas-bacen", codigoSerie, limite],
    queryFn: async () => {
      if (!codigoSerie) return [];

      const { data, error } = await supabase
        .from("taxas_juros_bacen")
        .select("*")
        .eq("codigo_serie", codigoSerie)
        .order("data_referencia", { ascending: false })
        .limit(limite);

      if (error) throw error;
      return data;
    },
    enabled: !!codigoSerie,
  });
};
