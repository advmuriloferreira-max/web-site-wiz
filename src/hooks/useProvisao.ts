import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface ProvisaoPerda {
  id: string;
  periodo_atraso: string;
  prazo_inicial: number;
  prazo_final: number;
  c1_percentual: number;
  c2_percentual: number;
  c3_percentual: number;
  c4_percentual: number;
  c5_percentual: number;
  created_at: string;
  updated_at: string;
}

export interface ProvisaoPerdaIncorrida {
  id: string;
  criterio: string;
  prazo_inicial: number;
  prazo_final: number;
  c1_percentual: number;
  c2_percentual: number;
  c3_percentual: number;
  c4_percentual: number;
  c5_percentual: number;
  created_at: string;
  updated_at: string;
}

export const useProvisaoPerda = () => {
  return useRealtimeQuery({
    queryKey: ["provisao-perda"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_perda_esperada")
        .select("*")
        .order("prazo_inicial", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar tabela de provisão: ${error.message}`);
      }

      return data as ProvisaoPerda[];
    },
    tableName: "provisao_perda_esperada",
  });
};

export const useProvisaoPerdaIncorrida = () => {
  return useRealtimeQuery({
    queryKey: ["provisao-perda-incorrida"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provisao_perdas_incorridas")
        .select("*")
        .order("prazo_inicial", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar tabela de perdas incorridas: ${error.message}`);
      }

      return data as ProvisaoPerdaIncorrida[];
    },
    tableName: "provisao_perdas_incorridas",
  });
};

export const useUpdateContrato = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<any> }) => {
      const { data, error } = await supabase
        .from("contratos")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar contrato: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contratos"] });
      queryClient.invalidateQueries({ queryKey: ["contratos-stats"] });
      toast.success("Contrato atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};