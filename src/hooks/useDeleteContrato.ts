import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useDeleteContrato = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contratos")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao excluir contrato: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos-stats"] });
      toast.success("Contrato excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};