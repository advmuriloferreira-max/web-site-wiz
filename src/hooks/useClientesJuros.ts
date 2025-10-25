import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface ClienteJuros {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  telefone: string | null;
  email: string | null;
  endereco: string | null;
  responsavel: string | null;
  observacoes: string | null;
  data_cadastro: string;
  created_at: string;
  updated_at: string;
}

export const useClientesJuros = () => {
  return useQuery({
    queryKey: ["clientes-juros"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes_juros")
        .select("*")
        .order("nome", { ascending: true });

      if (error) throw error;
      return data as ClienteJuros[];
    },
  });
};

export const useClienteJurosById = (id: string | null) => {
  return useQuery({
    queryKey: ["cliente-juros", id],
    queryFn: async () => {
      if (!id) return null;

      const { data, error } = await supabase
        .from("clientes_juros")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as ClienteJuros;
    },
    enabled: !!id,
  });
};

export const useCreateClienteJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (cliente: Omit<ClienteJuros, "id" | "created_at" | "updated_at" | "escritorio_id">) => {
      const { data, error } = await supabase
        .from("clientes_juros")
        .insert([cliente as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-juros"] });
      toast({
        title: "Cliente cadastrado",
        description: "Cliente cadastrado com sucesso no sistema de análise de juros.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao cadastrar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useUpdateClienteJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ClienteJuros> & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes_juros")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-juros"] });
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente atualizados com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

export const useDeleteClienteJuros = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clientes_juros")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-juros"] });
      toast({
        title: "Cliente excluído",
        description: "Cliente removido do sistema com sucesso.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir cliente",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};
