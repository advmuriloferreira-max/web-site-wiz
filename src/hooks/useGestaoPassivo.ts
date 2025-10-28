import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnaliseGestaoPassivo } from "@/types/gestaoPassivo";
import { toast } from "sonner";

export const useGestaoPassivo = () => {
  return useQuery({
    queryKey: ["analises-gestao-passivo"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("analises_gestao_passivo" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any as AnaliseGestaoPassivo[];
    },
  });
};

export const useGestaoPassivoById = (id: string | null) => {
  return useQuery({
    queryKey: ["analise-gestao-passivo", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("analises_gestao_passivo" as any)
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as any as AnaliseGestaoPassivo;
    },
    enabled: !!id,
  });
};

export const useCreateGestaoPassivo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (analise: Partial<AnaliseGestaoPassivo>) => {
      const { data, error } = await supabase
        .from("analises_gestao_passivo" as any)
        .insert(analise as any)
        .select()
        .single();

      if (error) throw error;
      return data as any as AnaliseGestaoPassivo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analises-gestao-passivo"] });
      toast.success("Análise criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar análise:", error);
      toast.error("Erro ao criar análise. Tente novamente.");
    },
  });
};

export const useUpdateGestaoPassivo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: Partial<AnaliseGestaoPassivo> & { id: string }) => {
      const { data, error } = await supabase
        .from("analises_gestao_passivo" as any)
        .update(updates as any)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data as any as AnaliseGestaoPassivo;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analises-gestao-passivo"] });
      toast.success("Análise atualizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar análise:", error);
      toast.error("Erro ao atualizar análise. Tente novamente.");
    },
  });
};

export const useBancosBrasil = () => {
  return useQuery({
    queryKey: ["bancos-brasil"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bancos_brasil")
        .select("*")
        .eq("ativo", true)
        .order("nome_curto", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
};
