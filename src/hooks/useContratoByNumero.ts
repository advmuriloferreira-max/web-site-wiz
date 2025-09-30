import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratoByNumero = (numeroContrato: string | null) => {
  return useQuery({
    queryKey: ["contrato-by-numero", numeroContrato],
    queryFn: async () => {
      if (!numeroContrato?.trim()) {
        return null;
      }

      const { data, error } = await supabase
        .from("contratos_provisao")
        .select(`
          *,
          clientes_provisao (nome, cpf_cnpj, responsavel),
          bancos_provisao (nome)
        `)
        .eq("numero_contrato", numeroContrato.trim())
        .maybeSingle();

      if (error) {
        throw new Error(`Erro ao buscar contrato: ${error.message}`);
      }

      return data as Contrato | null;
    },
    enabled: !!numeroContrato?.trim(),
  });
};