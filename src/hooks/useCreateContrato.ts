import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCreateContrato = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contrato: any) => {
      const { data, error } = await supabase
        .from("contratos")
        .insert(contrato)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      toast.success("Contrato criado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar contrato:", error);
      toast.error("Erro ao criar contrato. Tente novamente.");
    },
  });
};
