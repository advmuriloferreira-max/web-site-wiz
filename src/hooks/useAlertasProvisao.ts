import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { marcarAlertaComoLido, marcarTodosAlertasComoLidos } from '@/lib/verificarAlertasProvisao';
import { toast } from 'sonner';

export interface AlertaProvisao {
  id: string;
  analise_id: string;
  numero_contrato: string;
  tipo_alerta: 'mudanca_marco' | 'momento_premium' | 'momento_total';
  marco_anterior: string | null;
  marco_atual: string;
  percentual_provisao_anterior: number | null;
  percentual_provisao_atual: number;
  mensagem: string;
  lido: boolean;
  lido_em: string | null;
  created_at: string;
}

export function useAlertasProvisao() {
  return useQuery({
    queryKey: ['alertas-provisao'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertas_provisionamento')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Erro ao buscar alertas:', error);
        throw error;
      }

      return data as AlertaProvisao[];
    },
    refetchInterval: 60000, // Refetch a cada 1 minuto
  });
}

export function useAlertasNaoLidos() {
  return useQuery({
    queryKey: ['alertas-provisao-nao-lidos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('alertas_provisionamento')
        .select('*')
        .eq('lido', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar alertas não lidos:', error);
        throw error;
      }

      return data as AlertaProvisao[];
    },
    refetchInterval: 30000, // Refetch a cada 30 segundos
  });
}

export function useMarcarAlertaLido() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (alertaId: string) => {
      return await marcarAlertaComoLido(alertaId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-provisao'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-provisao-nao-lidos'] });
    },
    onError: (error) => {
      toast.error('Erro ao marcar alerta como lido');
      console.error(error);
    }
  });
}

export function useMarcarTodosLidos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return await marcarTodosAlertasComoLidos();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alertas-provisao'] });
      queryClient.invalidateQueries({ queryKey: ['alertas-provisao-nao-lidos'] });
      toast.success('Todos os alertas foram marcados como lidos');
    },
    onError: (error) => {
      toast.error('Erro ao marcar alertas como lidos');
      console.error(error);
    }
  });
}
