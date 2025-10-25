import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PropostaAcordo {
  id: string;
  contrato_id: string;
  data_proposta: string;
  valor_proposta: number;
  tipo_proposta: 'enviada' | 'recebida';
  status: 'pendente' | 'aceita' | 'recusada';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePropostaData {
  contrato_id: string;
  valor_proposta: number;
  tipo_proposta: 'enviada' | 'recebida';
  observacoes?: string;
}

export interface UpdatePropostaData {
  status?: 'pendente' | 'aceita' | 'recusada';
  observacoes?: string;
}

export const usePropostasAcordo = (contratoId?: string) => {
  return useQuery({
    queryKey: ["propostas-acordo-provisao", contratoId],
    queryFn: async () => {
      if (!contratoId) return [];
      
      const { data, error } = await supabase
        .from("propostas_acordo_provisao")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("data_proposta", { ascending: false });

      if (error) {
        console.error("Erro ao buscar propostas:", error);
        throw error;
      }

      return data as PropostaAcordo[];
    },
    enabled: !!contratoId,
  });
};

export const useCreateProposta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePropostaData) => {
      const { data: result, error } = await supabase
        .from("propostas_acordo_provisao")
        .insert(data as any)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["propostas-acordo-provisao", variables.contrato_id],
      });
      toast.success("Proposta registrada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao criar proposta:", error);
      toast.error("Erro ao registrar proposta");
    },
  });
};

export const useUpdateProposta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdatePropostaData }) => {
      const { data: result, error } = await supabase
        .from("propostas_acordo_provisao")
        .update(data)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: ["propostas-acordo-provisao", result.contrato_id],
      });
      toast.success("Status da proposta atualizado!");
    },
    onError: (error) => {
      console.error("Erro ao atualizar proposta:", error);
      toast.error("Erro ao atualizar status da proposta");
    },
  });
};

export const useDeleteProposta = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("propostas_acordo_provisao")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["propostas-acordo-provisao"] });
      toast.success("Proposta removida com sucesso!");
    },
    onError: (error) => {
      console.error("Erro ao deletar proposta:", error);
      toast.error("Erro ao remover proposta");
    },
  });
};
