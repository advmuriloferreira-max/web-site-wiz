import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface DividaSuperendividamento {
  id: string;
  cliente_id: string;
  credor: string;
  valor_original: number;
  valor_atual: number;
  parcela_mensal_atual?: number;
  tipo_divida: "inclusa" | "excluida";
  observacoes?: string;
  created_at: string;
}

export type CreateDividaSuperendividamento = Omit<DividaSuperendividamento, 'id' | 'created_at'>;
export type UpdateDividaSuperendividamento = Partial<CreateDividaSuperendividamento>;

export const useDividasSuperendividamento = (clienteId?: string) => {
  const queryClient = useQueryClient();

  const { data: dividas, isLoading } = useQuery({
    queryKey: ["dividas-superendividamento", clienteId],
    queryFn: async () => {
      let query = supabase
        .from("dividas_superendividamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as DividaSuperendividamento[];
    },
    enabled: !!clienteId,
  });

  const createDivida = useMutation({
    mutationFn: async (newDivida: CreateDividaSuperendividamento) => {
      const { data, error } = await supabase
        .from("dividas_superendividamento")
        .insert([newDivida as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dividas-superendividamento"] });
      toast.success("Dívida cadastrada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao cadastrar dívida: " + error.message);
    },
  });

  const updateDivida = useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDividaSuperendividamento & { id: string }) => {
      const { data, error } = await supabase
        .from("dividas_superendividamento")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dividas-superendividamento"] });
      toast.success("Dívida atualizada com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar dívida: " + error.message);
    },
  });

  const deleteDivida = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dividas_superendividamento")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dividas-superendividamento"] });
      toast.success("Dívida excluída com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao excluir dívida: " + error.message);
    },
  });

  return {
    dividas,
    isLoading,
    createDivida: createDivida.mutate,
    updateDivida: updateDivida.mutate,
    deleteDivida: deleteDivida.mutate,
  };
};
