import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ContratoJuros {
  id: string;
  numero_contrato: string | null;
  cliente_id: string;
  instituicao_id: string;
  modalidade_bacen_id: string | null;
  tipo_operacao: string | null;
  data_contratacao: string;
  valor_financiado: number;
  valor_parcela: number | null;
  numero_parcelas: number | null;
  taxa_juros_contratual: number | null;
  taxa_juros_real: number | null;
  diferenca_taxa: number | null;
  percentual_diferenca: number | null;
  taxa_bacen_referencia: number | null;
  diferenca_vs_bacen: number | null;
  status_analise: string;
  tem_abusividade: boolean;
  grau_abusividade: string | null;
  observacoes: string | null;
  ultima_analise_em: string | null;
  created_at: string;
  updated_at: string;
}

export const useContratosJuros = () => {
  return useQuery({
    queryKey: ["contratos-juros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contratos_juros")
        .select(`
          *,
          clientes_juros(nome, cpf_cnpj),
          instituicoes_financeiras(nome),
          modalidades_bacen_juros(nome)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
};

export const useContratoJurosById = (id: string | null) => {
  return useQuery({
    queryKey: ["contrato-juros", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("contratos_juros")
        .select(`
          *,
          clientes_juros(*),
          instituicoes_financeiras(*),
          modalidades_bacen_juros(*)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
};

export const useCreateContratoJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contrato: Omit<ContratoJuros, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("contratos_juros")
        .insert([contrato])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos-juros"] });
      toast({
        title: "Contrato cadastrado",
        description: "Contrato de análise de juros cadastrado com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateContratoJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContratoJuros> & { id: string }) => {
      const { data, error } = await supabase
        .from("contratos_juros")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos-juros"] });
      toast({
        title: "Contrato atualizado",
        description: "Dados do contrato atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteContratoJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("contratos_juros")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos-juros"] });
      toast({
        title: "Contrato excluído",
        description: "Contrato removido do sistema com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir contrato",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
