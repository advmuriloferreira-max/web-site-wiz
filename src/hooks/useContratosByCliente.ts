import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Contrato } from "./useContratos";

export const useContratosByCliente = (clienteId: string | null) => {
  return useQuery({
    queryKey: ["contratos-by-cliente", clienteId],
    queryFn: async () => {
      if (!clienteId) return [];

      const { data, error } = await supabase
        .from("contratos_provisao")
        .select(`
          *,
          clientes:clientes_provisao (nome, cpf_cnpj, responsavel),
          bancos:bancos_provisao (nome)
        `)
        .eq("cliente_id", clienteId)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar contratos do cliente: ${error.message}`);
      }

      return data as Contrato[];
    },
    enabled: !!clienteId,
  });
};

export const useContratosCountByCliente = () => {
  return useQuery({
    queryKey: ["contratos-count-by-cliente"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_provisao")
        .select("cliente_id, id")
        .order("cliente_id");

      if (error) {
        throw new Error(`Erro ao buscar contagem de contratos: ${error.message}`);
      }

      // Agrupar contratos por cliente
      const countMap = data.reduce((acc, contrato) => {
        acc[contrato.cliente_id] = (acc[contrato.cliente_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return countMap;
    },
  });
};