import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useGarantiaExists = (contratoId: string) => {
  return useQuery({
    queryKey: ["garantia-exists", contratoId],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("garantias_provisao")
        .select("*", { count: "exact", head: true })
        .eq("contrato_id", contratoId);

      if (error) {
        throw new Error(`Erro ao verificar garantias: ${error.message}`);
      }

      return (count || 0) > 0;
    },
    enabled: !!contratoId,
  });
};