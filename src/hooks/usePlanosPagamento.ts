import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PlanoPagamento {
  id: string;
  cliente_id: string;
  percentual_renda: 30 | 35;
  valor_mensal_total: number;
  total_dividas: number;
  total_fases: number;
  total_parcelas: number;
  status: "ativo" | "concluido" | "suspenso";
  created_at: string;
}

export type CreatePlanoPagamento = Omit<PlanoPagamento, 'id' | 'created_at'>;
export type UpdatePlanoPagamento = Partial<CreatePlanoPagamento>;

export const usePlanosPagamento = (clienteId?: string) => {
  const queryClient = useQueryClient();

  const { data: planos, isLoading } = useQuery({
    queryKey: ["planos-pagamento", clienteId],
    queryFn: async () => {
      let query = supabase
        .from("planos_pagamento")
        .select("*")
        .order("created_at", { ascending: false });

      if (clienteId) {
        query = query.eq("cliente_id", clienteId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PlanoPagamento[];
    },
  });

  const createPlano = useMutation({
    mutationFn: async (newPlano: CreatePlanoPagamento) => {
      const { data, error } = await supabase
        .from("planos_pagamento")
        .insert([newPlano as any])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos-pagamento"] });
      toast.success("Plano criado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao criar plano: " + error.message);
    },
  });

  const updatePlano = useMutation({
    mutationFn: async ({ id, ...updates }: UpdatePlanoPagamento & { id: string }) => {
      const { data, error } = await supabase
        .from("planos_pagamento")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["planos-pagamento"] });
      toast.success("Plano atualizado com sucesso!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar plano: " + error.message);
    },
  });

  return {
    planos,
    isLoading,
    createPlano: createPlano.mutate,
    updatePlano: updatePlano.mutate,
  };
};
