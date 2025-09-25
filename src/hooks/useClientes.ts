import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface Cliente {
  id: string;
  nome: string;
  cpf_cnpj: string | null;
  email: string | null;
  telefone: string | null;
  endereco: string | null;
  responsavel: string | null;
  observacoes: string | null;
  data_cadastro: string;
  created_at: string;
  updated_at: string;
}

export const useClientes = () => {
  return useRealtimeQuery({
    queryKey: ["clientes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar clientes: ${error.message}`);
      }

      return data as Cliente[];
    },
    tableName: "clientes",
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at' | 'data_cadastro'>) => {
      const { data, error } = await supabase
        .from("clientes")
        .insert([cliente])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...cliente }: Partial<Cliente> & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes")
        .update(cliente)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar cliente: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao excluir cliente: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};