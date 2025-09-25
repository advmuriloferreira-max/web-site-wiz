import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Banco {
  id: string;
  nome: string;
  codigo_banco: string | null;
  contato: string | null;
  telefone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

export const useBancos = () => {
  return useQuery({
    queryKey: ["bancos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bancos")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        throw new Error(`Erro ao buscar bancos: ${error.message}`);
      }

      return data as Banco[];
    },
  });
};

export const useCreateBanco = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (banco: Omit<Banco, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("bancos")
        .insert([banco])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar banco: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bancos"] });
      toast.success("Banco criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};