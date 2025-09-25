import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TipoOperacaoBCB {
  id: string;
  nome: string;
  descricao: string;
  carteira: 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
  created_at: string;
  updated_at: string;
}

export const useTiposOperacao = () => {
  return useQuery({
    queryKey: ["tipos-operacao-bcb"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tipos_operacao_bcb")
        .select("*")
        .order("carteira", { ascending: true })
        .order("nome", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar tipos de operação: ${error.message}`);
      }

      return data as TipoOperacaoBCB[];
    },
  });
};

export const useGetTipoOperacaoById = (id: string | null) => {
  return useQuery({
    queryKey: ["tipo-operacao-bcb", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("tipos_operacao_bcb")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar tipo de operação: ${error.message}`);
      }

      return data as TipoOperacaoBCB;
    },
    enabled: !!id,
  });
};