import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ModalidadeBacenJuros {
  id: string;
  codigo_sgs: string;
  nome: string;
  descricao: string | null;
  tipo_pessoa: 'PF' | 'PJ';
  tipo_recurso: 'Livre' | 'Direcionado';
  categoria: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export const useModalidadesBacenJuros = (tipoPessoa?: 'PF' | 'PJ') => {
  return useQuery({
    queryKey: ["modalidades-bacen-juros", tipoPessoa],
    queryFn: async () => {
      let query = supabase
        .from("modalidades_bacen_juros")
        .select("*")
        .eq("ativo", true)
        .order("tipo_pessoa", { ascending: true })
        .order("tipo_recurso", { ascending: true })
        .order("categoria", { ascending: true })
        .order("nome", { ascending: true });

      if (tipoPessoa) {
        query = query.eq("tipo_pessoa", tipoPessoa);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(`Erro ao buscar modalidades BACEN: ${error.message}`);
      }

      return data as ModalidadeBacenJuros[];
    },
  });
};

export const useModalidadeBacenById = (id: string | null) => {
  return useQuery({
    queryKey: ["modalidade-bacen-juros", id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from("modalidades_bacen_juros")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(`Erro ao buscar modalidade BACEN: ${error.message}`);
      }

      return data as ModalidadeBacenJuros;
    },
    enabled: !!id,
  });
};
