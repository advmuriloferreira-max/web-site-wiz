import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface AnaliseJuros {
  id: string;
  escritorio_id: string;
  contrato_id: string;
  modalidade_bacen_id: string | null;
  valor_financiado: number | null;
  valor_parcela: number | null;
  numero_parcelas: number | null;
  taxa_contratual: number | null;
  data_referencia: string | null;
  taxa_real_aplicada: number | null;
  taxa_media_bacen: number | null;
  diferenca_absoluta: number | null;
  diferenca_percentual: number | null;
  abusividade_detectada: boolean;
  metodologia: string;
  fonte_taxa_bacen: string | null;
  data_analise: string;
  usuario_id: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const useAnaliseJurosByContrato = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["analise-juros", contratoId],
    queryFn: async () => {
      if (!contratoId) return null;

      const { data, error } = await supabase
        .from("analises_juros_abusivos")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_analise", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data as AnaliseJuros | null;
    },
    enabled: !!contratoId,
  });
};

export const useCreateAnaliseJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analise: Omit<AnaliseJuros, "id" | "created_at" | "updated_at" | "escritorio_id">) => {
      const { data, error } = await supabase
        .from("analises_juros_abusivos")
        .insert([analise as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analise-juros", data.contrato_id] });
      toast({
        title: "Análise salva",
        description: "Análise de juros salva com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao salvar análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateAnaliseJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<AnaliseJuros> & { id: string }) => {
      const { data, error } = await supabase
        .from("analises_juros_abusivos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["analise-juros", data.contrato_id] });
      toast({
        title: "Análise atualizada",
        description: "Análise de juros atualizada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar análise",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
