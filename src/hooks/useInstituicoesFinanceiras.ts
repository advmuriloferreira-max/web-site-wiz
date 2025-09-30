import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface InstituicaoFinanceira {
  id: string;
  nome: string;
  codigo_banco: string | null;
  cnpj: string | null;
  telefone: string | null;
  email: string | null;
  contato: string | null;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
}

export const useInstituicoesFinanceiras = () => {
  return useQuery({
    queryKey: ["instituicoes-financeiras"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instituicoes_financeiras")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as InstituicaoFinanceira[];
    },
  });
};

export const useInstituicaoFinanceiraById = (id: string | null) => {
  return useQuery({
    queryKey: ["instituicao-financeira", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("instituicoes_financeiras")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as InstituicaoFinanceira;
    },
    enabled: !!id,
  });
};

export const useCreateInstituicaoFinanceira = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (instituicao: Omit<InstituicaoFinanceira, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("instituicoes_financeiras")
        .insert([instituicao])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instituicoes-financeiras"] });
      toast({
        title: "Instituição cadastrada",
        description: "Instituição financeira cadastrada com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar instituição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateInstituicaoFinanceira = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<InstituicaoFinanceira> & { id: string }) => {
      const { data, error } = await supabase
        .from("instituicoes_financeiras")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instituicoes-financeiras"] });
      toast({
        title: "Instituição atualizada",
        description: "Dados da instituição atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar instituição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteInstituicaoFinanceira = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("instituicoes_financeiras")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["instituicoes-financeiras"] });
      toast({
        title: "Instituição excluída",
        description: "Instituição removida do sistema com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir instituição",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
