import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface NovoClienteData {
  nome: string;
  cpf_cnpj?: string | null;
  telefone?: string | null;
  email?: string | null;
  endereco?: string | null;
  cidade?: string | null;
  estado?: string | null;
  cep?: string | null;
  data_nascimento?: string | null;
  observacoes?: string | null;
}

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (clienteData: NovoClienteData) => {
      const { data, error } = await supabase
        .from("clientes")
        .insert([{
          nome: clienteData.nome,
          cpf_cnpj: clienteData.cpf_cnpj,
          telefone: clienteData.telefone,
          email: clienteData.email,
          endereco: clienteData.endereco,
          cidade: clienteData.cidade,
          estado: clienteData.estado,
          cep: clienteData.cep,
          data_nascimento: clienteData.data_nascimento,
          observacoes: clienteData.observacoes,
        } as any])
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