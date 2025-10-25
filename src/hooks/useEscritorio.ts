import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Escritorio {
  id: string;
  nome: string;
  cnpj?: string;
  email: string;
  telefone?: string;
  endereco?: string;
  plano: 'essencial' | 'premium';
  status: 'ativo' | 'suspenso' | 'cancelado';
  data_vencimento?: string;
  data_cadastro: string;
  configuracoes?: any;
  limite_usuarios: number;
  limite_clientes: number;
  limite_contratos: number;
  created_at: string;
  updated_at: string;
}

export interface UsuarioEscritorio {
  id: string;
  escritorio_id: string;
  user_id: string;
  nome: string;
  email: string;
  cargo?: string;
  permissoes: {
    read: boolean;
    write: boolean;
    admin: boolean;
  };
  status: 'ativo' | 'inativo';
  data_cadastro: string;
  ultimo_acesso?: string;
  created_at: string;
  updated_at: string;
}

export const useEscritorio = () => {
  return useQuery({
    queryKey: ["escritorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("escritorios")
        .select("*")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Nenhum escritório encontrado
          return null;
        }
        throw new Error(`Erro ao buscar escritório: ${error.message}`);
      }

      return data as Escritorio;
    },
  });
};

export const useUsuariosEscritorio = () => {
  return useQuery({
    queryKey: ["usuarios-escritorio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("usuarios_escritorio")
        .select("*")
        .order("data_cadastro", { ascending: false });

      if (error) {
        throw new Error(`Erro ao buscar usuários: ${error.message}`);
      }

      return data as UsuarioEscritorio[];
    },
  });
};

export const useUpdateEscritorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<Escritorio> & { id: string }) => {
      const { id, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from("escritorios")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar escritório: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["escritorio"] });
      toast.success("Escritório atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useConvidarUsuario = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (dados: {
      nome: string;
      email: string;
      cargo?: string;
      permissoes: { read: boolean; write: boolean; admin: boolean };
    }) => {
      // Aqui você pode integrar com o sistema de convites existente
      // ou criar um novo fluxo de convite
      
      toast.info("Funcionalidade em desenvolvimento");
      return dados;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-escritorio"] });
      toast.success("Convite enviado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useUpdateUsuarioEscritorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: Partial<UsuarioEscritorio> & { id: string }) => {
      const { id, ...updateData } = updates;
      
      const { data, error } = await supabase
        .from("usuarios_escritorio")
        .update(updateData)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar usuário: ${error.message}`);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-escritorio"] });
      toast.success("Usuário atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

export const useDeleteUsuarioEscritorio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("usuarios_escritorio")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Erro ao remover usuário: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usuarios-escritorio"] });
      toast.success("Usuário removido com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};
