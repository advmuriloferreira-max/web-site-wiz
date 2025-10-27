-- ETAPA 3: Configurar atualização automática diária das taxas BACEN
-- Habilita extensões necessárias e cria cron job

-- Habilitar extensão pg_cron (para agendamento de tarefas)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Habilitar extensão pg_net (para fazer requisições HTTP)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Criar job para executar diariamente às 3h da manhã (horário UTC)
-- Nota: Ajuste o horário conforme necessário (UTC vs. horário local)
SELECT cron.schedule(
  'atualizar-taxas-bacen-diario',
  '0 6 * * *', -- Diariamente às 6h UTC (3h da manhã em Brasília UTC-3)
  $$
  SELECT
    net.http_post(
      url := 'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/atualizar-taxas-juros-bacen',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXhhY2VraHR5dm1tY3V6aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Njc4NjMsImV4cCI6MjA3NDM0Mzg2M30.FwivQ40YPnSt7N5ypMugNhth6nZtQitVopDP78RS9Bk"}'::jsonb,
      body := concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);

-- Comentários explicativos
COMMENT ON EXTENSION pg_cron IS 'Extensão para agendamento de tarefas periódicas no PostgreSQL';
COMMENT ON EXTENSION pg_net IS 'Extensão para fazer requisições HTTP assíncronas do PostgreSQL';