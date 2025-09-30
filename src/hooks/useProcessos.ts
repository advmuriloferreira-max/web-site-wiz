import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useRealtimeQuery } from "./useRealtimeQuery";

export interface Processo {
  id: string;
  contrato_id: string;
  numero_processo: string | null;
  acao: string | null;
  status: string | null;
  protocolo: string | null;
  prazo: string | null;
  liminar: boolean | null;
  justica_gratuita: boolean | null;
  diligencias: string | null;
  created_at: string;
  updated_at: string;
  contratos_provisao?: {
    clientes?: {
      nome: string;
    };
    bancos?: {
      nome: string;
    };
    numero_contrato: string | null;
    valor_divida: number;
  };
}

export const useProcessos = () => {
  return useRealtimeQuery({
    queryKey: ["processos-provisao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("processos_provisao")
        .select(`
          *,
          contratos_provisao (
            numero_contrato,
            valor_divida,
            clientes:clientes_provisao (nome),
            bancos:bancos_provisao (nome)
          )
        `)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar processos: ${error.message}`);
      }

      return data as Processo[];
    },
    tableName: "processos_provisao",
  });
};

export const useCreateProcesso = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (processo: Partial<Omit<Processo, 'id' | 'created_at' | 'updated_at' | 'contratos_provisao'>> & { contrato_id: string }) => {
      const { data, error } = await supabase
        .from("processos_provisao")
        .insert([processo])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar processo: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos-provisao"] });
      toast.success("Processo criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateProcesso = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...processo }: Partial<Processo> & { id: string }) => {
      const { data, error } = await supabase
        .from("processos_provisao")
        .update(processo)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar processo: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processos-provisao"] });
      toast.success("Processo atualizado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
