import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NovoClienteData {
  nome: string;
  cpf_cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  responsavel?: string | null;
  observacoes?: string | null;
}

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clienteData: NovoClienteData) => {
      const { data, error } = await supabase
        .from("clientes_provisao")
        .insert([{
          nome: clienteData.nome,
          cpf_cnpj: clienteData.cpf_cnpj,
          telefone: clienteData.telefone,
          email: clienteData.email,
          endereco: clienteData.endereco,
          responsavel: clienteData.responsavel,
          observacoes: clienteData.observacoes,
        }])
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao criar cliente: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes-provisao"] });
      toast.success("Cliente criado com sucesso!");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};