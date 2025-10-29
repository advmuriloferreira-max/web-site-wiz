import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AnaliseGestaoPassivo } from "@/types/gestaoPassivo";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export const useCreateGestaoPassivo = () => {
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
      toast.success("Análise criada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar análise:", error);
      toast.error("Erro ao criar análise. Tente novamente.");
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
