-- ============================================
-- MIGRAÇÃO: Estrutura Final de Juros BACEN
-- ============================================

-- 1. Garantir que as tabelas corretas existem
CREATE TABLE IF NOT EXISTS public.modalidades_bacen_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_sgs TEXT NOT NULL UNIQUE,
  categoria TEXT NOT NULL,
  tipo_pessoa TEXT NOT NULL,
  tipo_recurso TEXT NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.series_temporais_bacen (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  modalidade_id UUID NOT NULL REFERENCES public.modalidades_bacen_juros(id) ON DELETE CASCADE,
  data_referencia DATE NOT NULL,
  ano INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  taxa_mensal NUMERIC NOT NULL,
  taxa_anual NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(modalidade_id, data_referencia)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_series_temporais_modalidade ON public.series_temporais_bacen(modalidade_id);
CREATE INDEX IF NOT EXISTS idx_series_temporais_data ON public.series_temporais_bacen(data_referencia DESC);
CREATE INDEX IF NOT EXISTS idx_modalidades_codigo_sgs ON public.modalidades_bacen_juros(codigo_sgs);
CREATE INDEX IF NOT EXISTS idx_modalidades_ativo ON public.modalidades_bacen_juros(ativo) WHERE ativo = true;

-- 3. Habilitar RLS
ALTER TABLE public.modalidades_bacen_juros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_temporais_bacen ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas de acesso público para leitura
DROP POLICY IF EXISTS "Acesso público leitura modalidades" ON public.modalidades_bacen_juros;
CREATE POLICY "Acesso público leitura modalidades"
  ON public.modalidades_bacen_juros FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins podem gerenciar modalidades" ON public.modalidades_bacen_juros;
CREATE POLICY "Admins podem gerenciar modalidades"
  ON public.modalidades_bacen_juros FOR ALL
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Acesso público leitura séries temporais" ON public.series_temporais_bacen;
CREATE POLICY "Acesso público leitura séries temporais"
  ON public.series_temporais_bacen FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins podem gerenciar séries temporais" ON public.series_temporais_bacen;
CREATE POLICY "Admins podem gerenciar séries temporais"
  ON public.series_temporais_bacen FOR ALL
  USING (is_admin(auth.uid()));

-- 5. Criar cron job único (4h da manhã, horário de Brasília = 7h UTC)
DO $$
BEGIN
  -- Remover job se existir
  PERFORM cron.unschedule('sync-bacen-rates-daily');
EXCEPTION
  WHEN OTHERS THEN
    NULL; -- Ignorar se não existir
END $$;

SELECT cron.schedule(
  'sync-bacen-rates-daily',
  '0 7 * * *',
  $$
  SELECT net.http_post(
    url := 'https://uemxacekhtyvmmcuzhef.supabase.co/functions/v1/atualizar-taxas-juros-bacen',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlbXhhY2VraHR5dm1tY3V6aGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg3Njc4NjMsImV4cCI6MjA3NDM0Mzg2M30.FwivQ40YPnSt7N5ypMugNhth6nZtQitVopDP78RS9Bk"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);