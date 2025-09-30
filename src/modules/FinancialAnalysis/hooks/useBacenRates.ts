/**
 * Hook para consultar taxas do Banco Central
 * Bacen Loan Wizard - Módulo independente
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface BacenRateResponse {
  success: boolean;
  taxa: number;
  referencia: string;
  analysis: {
    id: string;
    contrato_id: string;
    taxa_bacen: number;
    taxa_referencia: string;
    data_consulta: string;
    metadata: Record<string, any>;
  };
}

/**
 * Busca as análises de um contrato
 */
export const useContratoAnalyses = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["contrato-analyses", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_consulta", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar análises: ${error.message}`);
      }

      return data;
    },
    enabled: !!contratoId,
  });
};

/**
 * Busca a última análise de um contrato
 */
export const useLatestAnalysis = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["latest-analysis", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;

      const { data, error } = await supabase
        .from("analyses")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_consulta", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar última análise: ${error.message}`);
      }

      return data;
    },
    enabled: !!contratoId,
  });
};

/**
 * Consulta taxa do Bacen para um contrato
 */
export const useConsultarTaxaBacen = () => {
  return useMutation({
    mutationFn: async ({
      contratoId,
      tipoOperacao,
      dataConsulta,
    }: {
      contratoId: string;
      tipoOperacao?: string;
      dataConsulta?: string;
    }) => {
      console.log('Consultando taxa Bacen para contrato:', contratoId);

      const { data, error } = await supabase.functions.invoke<BacenRateResponse>(
        "get-bacen-rate",
        {
          body: {
            contratoId,
            tipoOperacao,
            dataConsulta,
          },
        }
      );

      if (error) {
        console.error('Erro ao consultar taxa Bacen:', error);
        throw new Error(`Erro ao consultar taxa Bacen: ${error.message}`);
      }

      if (!data) {
        throw new Error("Nenhum dado retornado da função");
      }

      console.log('Taxa Bacen consultada com sucesso:', data);
      return data;
    },
    onSuccess: (data) => {
      toast.success(
        `Taxa Bacen consultada: ${data.taxa.toFixed(2)}% (${data.referencia})`
      );
    },
    onError: (error) => {
      console.error('Erro na mutation:', error);
      toast.error(error.message || "Erro ao consultar taxa Bacen");
    },
  });
};

/**
 * Atualiza manualmente a taxa Bacen de um contrato
 */
export const useAtualizarTaxaBacen = () => {
  return useMutation({
    mutationFn: async ({
      contratoId,
      taxa,
      referencia,
    }: {
      contratoId: string;
      taxa: number;
      referencia: string;
    }) => {
      const { error } = await supabase
        .from("contratos")
        .update({
          taxa_bacen: taxa,
          taxa_referencia: referencia,
        })
        .eq("id", contratoId);

      if (error) {
        throw new Error(`Erro ao atualizar taxa: ${error.message}`);
      }

      // Criar registro de análise
      const { data: analysis, error: analysisError } = await supabase
        .from("analyses")
        .insert({
          contrato_id: contratoId,
          taxa_bacen: taxa,
          taxa_referencia: referencia,
          data_consulta: new Date().toISOString(),
          metadata: {
            tipo_atualizacao: "manual",
          },
        })
        .select()
        .single();

      if (analysisError) {
        throw new Error(`Erro ao criar análise: ${analysisError.message}`);
      }

      return analysis;
    },
    onSuccess: () => {
      toast.success("Taxa Bacen atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao atualizar taxa Bacen");
    },
  });
};

/**
 * Deleta uma análise
 */
export const useDeleteAnalysis = () => {
  return useMutation({
    mutationFn: async (analysisId: string) => {
      const { error } = await supabase
        .from("analyses")
        .delete()
        .eq("id", analysisId);

      if (error) {
        throw new Error(`Erro ao deletar análise: ${error.message}`);
      }
    },
    onSuccess: () => {
      toast.success("Análise excluída com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao excluir análise");
    },
  });
};