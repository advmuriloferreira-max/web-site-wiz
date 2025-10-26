import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnaliseProvisionamento {
  id: string;
  escritorio_id: string;
  contrato_id: string;
  valor_divida: number;
  data_ultimo_pagamento: string | null;
  dias_atraso: number | null;
  meses_atraso: number | null;
  classificacao_risco: string | null;
  percentual_provisao: number | null;
  valor_provisao: number | null;
  metodologia: string;
  base_calculo: string | null;
  data_calculo: string;
  usuario_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAnaliseProvisionamentoByContrato = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["analise-provisionamento", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;

      const { data, error } = await supabase
        .from("analises_provisionamento")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_calculo", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AnaliseProvisionamento | null;
    },
    enabled: !!contratoId,
  });
};

export const useAnalisesProvisionamento = () => {
  return useQuery({
    queryKey: ["analises-provisionamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_provisionamento")
        .select("*")
        .order("data_calculo", { ascending: false });

      if (error) throw error;
      return data as AnaliseProvisionamento[];
    },
  });
};

export const useCreateAnaliseProvisionamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analise: Omit<AnaliseProvisionamento, "id" | "created_at" | "updated_at" | "escritorio_id">) => {
      const { data, error } = await supabase
        .from("analises_provisionamento")
        .insert([analise as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analise-provisionamento", data.contrato_id] });
      queryClient.invalidateQueries({ queryKey: ["analises-provisionamento"] });
      toast.success("Análise de provisionamento salva com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar análise: ${error.message}`);
    },
  });
};

export const useUpdateAnaliseProvisionamento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AnaliseProvisionamento> & { id: string }) => {
      const { data, error } = await supabase
        .from("analises_provisionamento")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analise-provisionamento", data.contrato_id] });
      queryClient.invalidateQueries({ queryKey: ["analises-provisionamento"] });
      toast.success("Análise de provisionamento atualizada com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar análise: ${error.message}`);
    },
  });
};
