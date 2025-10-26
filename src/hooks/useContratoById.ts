import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratoById = (contratoId: string | null) => {
  return useQuery({
    queryKey: ["contrato-by-id", contratoId],
    queryFn: async () => {
      if (!contratoId?.trim()) {
        return null;
      }

      const { data, error } = await supabase
        .from("contratos")
        .select(`
          *,
          clientes:clientes (id, nome, cpf_cnpj),
          bancos:bancos_provisao (id, nome)
        `)
        .eq("id", contratoId.trim())
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar contrato: ${error.message}`);
      }

      return data as Contrato | null;
    },
    enabled: !!contratoId?.trim(),
    staleTime: 0,
    gcTime: 0,
  });
};
