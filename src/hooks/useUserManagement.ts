import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { z } from "zod";

interface UpdateUserStatusParams {
  userId: string;
  status: 'ativo' | 'inativo';
}

interface UpdateUserRoleParams {
  userId: string;
  role: 'admin' | 'advogado' | 'assistente';
}

export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, status }: UpdateUserStatusParams) => {
      // Validação com Zod
      const validation = z.object({
        userId: z.string().uuid('ID de usuário inválido'),
        status: z.enum(['ativo', 'inativo'], { message: 'Status deve ser ativo ou inativo' })
      }).parse({ userId, status });

      const { data, error } = await supabase
        .from("profiles")
        .update({ status: validation.status })
        .eq("id", validation.userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Erro ao atualizar status: ${error.message}`);
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Status do usuário alterado para ${data.status}`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar status:', error);
      toast.error(error.message || 'Erro ao atualizar status do usuário');
    }
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ userId, role }: UpdateUserRoleParams) => {
      // Validação com Zod
      const validation = z.object({
        userId: z.string().uuid('ID de usuário inválido'),
        role: z.enum(['admin', 'advogado', 'assistente'], { message: 'Função inválida' })
      }).parse({ userId, role });

      // Primeiro atualizamos o perfil
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .update({ role: validation.role })
        .eq("id", validation.userId)
        .select()
        .single();

      if (profileError) {
        throw new Error(`Erro ao atualizar função no perfil: ${profileError.message}`);
      }

      // Depois atualizamos ou inserimos na tabela user_roles
      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({
          user_id: validation.userId,
          role: validation.role
        }, {
          onConflict: 'user_id'
        });

      if (roleError) {
        throw new Error(`Erro ao atualizar função: ${roleError.message}`);
      }

      return profileData;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success(`Função alterada para ${data.role}`);
    },
    onError: (error) => {
      console.error('Erro ao atualizar função:', error);
      toast.error(error.message || 'Erro ao atualizar função do usuário');
    }
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userId: string) => {
      // Validação com Zod
      const validation = z.object({
        userId: z.string().uuid('ID de usuário inválido')
      }).parse({ userId });

      // Primeiro removemos da tabela user_roles
      await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", validation.userId);

      // Depois removemos o perfil
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", validation.userId);

      if (profileError) {
        throw new Error(`Erro ao remover perfil: ${profileError.message}`);
      }

      return validation.userId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profiles"] });
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("Usuário removido com sucesso");
    },
    onError: (error) => {
      console.error('Erro ao deletar usuário:', error);
      toast.error(error.message || 'Erro ao remover usuário');
    }
  });
};