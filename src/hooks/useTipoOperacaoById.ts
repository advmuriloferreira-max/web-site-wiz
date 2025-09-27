import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useTipoOperacaoById = (tipoOperacaoId: string | null) => {
  return useQuery({
    queryKey: ["tipo-operacao", tipoOperacaoId],
    queryFn: async () => {
      if (!tipoOperacaoId) return null;

      const { data, error } = await supabase
        .from("tipos_operacao_bcb")
        .select("nome, carteira")
        .eq("id", tipoOperacaoId)
        .maybeSingle();

      if (error) {
        console.error("Erro ao buscar tipo de operação:", error);
        return null;
      }

      return data;
    },
    enabled: !!tipoOperacaoId,
  });
};