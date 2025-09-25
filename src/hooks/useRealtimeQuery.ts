import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UseRealtimeQueryOptions<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  tableName: string;
  enabled?: boolean;
}

export function useRealtimeQuery<T>({
  queryKey,
  queryFn,
  tableName,
  enabled = true,
}: UseRealtimeQueryOptions<T>) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey,
    queryFn,
    enabled,
  });

  useEffect(() => {
    if (!enabled) return;

    const channel = supabase
      .channel(`${tableName}-changes`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: tableName,
        },
        () => {
          // Invalidate and refetch the query when any change happens
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryKey, tableName, queryClient, enabled]);

  return query;
}