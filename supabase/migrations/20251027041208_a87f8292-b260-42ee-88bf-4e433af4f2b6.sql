-- ETAPA 3.2: Ajustar horário do Cron Job para 4h da manhã (Brasília) = 7h UTC

-- Remover o job anterior (3h da manhã)
SELECT cron.unschedule('atualizar-taxas-bacen-diario')
WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'atualizar-taxas-bacen-diario'
);

-- Criar novo job para executar às 4h da manhã (Brasília) = 7h UTC
SELECT cron.schedule(
  'atualizacao-diaria-taxas-bacen',
  '0 7 * * *', -- 7h UTC = 4h horário de Brasília
  $cron$
    SELECT net.http_post(
      url := 'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/atualizar-taxas-juros-bacen',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXhhY2VraHR5dm1tY3V6aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Njc4NjMsImV4cCI6MjA3NDM0Mzg2M30.FwivQ40YPnSt7N5ypMugNhth6nZtQitVopDP78RS9Bk"}'::jsonb,
      body := '{"timestamp": "' || now()::text || '"}'::jsonb
    ) as request_id;
  $cron$
);

-- Verificar jobs agendados
COMMENT ON EXTENSION pg_cron IS 'Atualização diária das taxas BACEN agendada para 4h AM (horário de Brasília)';