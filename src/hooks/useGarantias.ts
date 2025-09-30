import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface Garantia {
  id: string;
  contrato_id: string;
  tipo_garantia: 'Real' | 'Fidejussória';
  descricao?: string;
  valor_avaliacao?: number;
  percentual_cobertura?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGarantiaInput {
  contrato_id: string;
  tipo_garantia: 'Real' | 'Fidejussória';
  descricao?: string;
  valor_avaliacao?: number;
  percentual_cobertura?: number;
}

export interface UpdateGarantiaInput extends CreateGarantiaInput {
  id: string;
}

// Hook para buscar garantias por contrato
export const useGarantiasByContrato = (contratoId: string | null) => {
  return useRealtimeQuery({
    queryKey: ["garantias-provisao", contratoId],
    queryFn: async () => {
      if (!contratoId) {
        return [] as Garantia[];
      }
      
      const { data, error } = await supabase
        .from("garantias_provisao")
        .select("*")
        .eq("contrato_id", contratoId)
        .order("created_at", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar garantias: ${error.message}`);
      }

      return data as Garantia[];
    },
    enabled: !!contratoId,
    tableName: "garantias_provisao",
  });
};

// Hook para criar garantia
export const useCreateGarantia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (garantiaInput: CreateGarantiaInput) => {
      const { data, error } = await supabase
        .from("garantias_provisao")
        .insert(garantiaInput)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar garantia: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["garantias-provisao", data.contrato_id] });
      toast.success("Garantia adicionada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Hook para atualizar garantia
export const useUpdateGarantia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (garantiaInput: UpdateGarantiaInput) => {
      const { id, ...updateData } = garantiaInput;
      const { data, error } = await supabase
        .from("garantias_provisao")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar garantia: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["garantias-provisao", data.contrato_id] });
      toast.success("Garantia atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

// Hook para deletar garantia
export const useDeleteGarantia = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("garantias_provisao")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao deletar garantia: ${error.message}`);
      }

      return id;
    },
    onSuccess: (_, variables) => {
      // Invalidate todas as queries de garantias para refletir a mudança
      queryClient.invalidateQueries({ queryKey: ["garantias-provisao"] });
      toast.success("Garantia removida com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
