-- ETAPA 3: Configurar atualização automática diária das taxas BACEN

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar job para executar diariamente às 3h da manhã
SELECT cron.schedule(
  'atualizar-taxas-bacen-diario',
  '0 3 * * *',
  $cron$
  SELECT net.http_post(
    url := 'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/atualizar-taxas-juros-bacen',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXhhY2VraHR5dm1tY3V6aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Njc4NjMsImV4cCI6MjA3NDM0Mzg2M30.FwivQ40YPnSt7N5ypMugNhth6nZtQitVopDP78RS9Bk"}'::jsonb,
    body := concat('{"timestamp": "', now(), '"}')::jsonb
  ) as request_id;
  $cron$
);

-- Comentários
COMMENT ON EXTENSION pg_cron IS 'Extensão para agendamento de tarefas periódicas no PostgreSQL';
COMMENT ON EXTENSION pg_net IS 'Extensão para fazer requisições HTTP assíncronas do PostgreSQL';