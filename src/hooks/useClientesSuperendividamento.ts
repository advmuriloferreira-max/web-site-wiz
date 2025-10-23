import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ClienteSuperendividamento {
  id: string;
  nome: string;
  cpf?: string;
  renda_bruta?: number;
  renda_liquida?: number;
  desconto_inss?: number;
  desconto_ir?: number;
  composicao_familiar?: any;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export type CreateClienteSuperendividamento = Omit<ClienteSuperendividamento, 'id' | 'created_at' | 'updated_at'>;
export type UpdateClienteSuperendividamento = Partial<CreateClienteSuperendividamento>;

export const useClientesSuperendividamento = () => {
  const queryClient = useQueryClient();

  const { data: clientes, isLoading } = useQuery({
    queryKey: ["clientes-superendividamento"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clientes_superendividamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ClienteSuperendividamento[];
    },
  });

  const createCliente = useMutation({
    mutationFn: async (newCliente: CreateClienteSuperendividamento) => {
      const { data, error } = await supabase
        .from("clientes_superendividamento")
        .insert([newCliente])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-superendividamento"] });
      toast.success("Cliente cadastrado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar cliente: " + error.message);
    },
  });

  const updateCliente = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateClienteSuperendividamento & { id: string }) => {
      const { data, error } = await supabase
        .from("clientes_superendividamento")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-superendividamento"] });
      toast.success("Cliente atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar cliente: " + error.message);
    },
  });

  const deleteCliente = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("clientes_superendividamento")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-superendividamento"] });
      toast.success("Cliente excluído com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir cliente: " + error.message);
    },
  });

  return {
    clientes,
    isLoading,
    createCliente: createCliente.mutate,
    updateCliente: updateCliente.mutate,
    deleteCliente: deleteCliente.mutate,
    isCreating: createCliente.isPending,
    isUpdating: updateCliente.isPending,
    isDeleting: deleteCliente.isPending,
  };
};
