-- Tabela para armazenar alertas de provisionamento
CREATE TABLE IF NOT EXISTS public.alertas_provisionamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL,
  analise_id UUID NOT NULL REFERENCES public.analises_gestao_passivo(id) ON DELETE CASCADE,
  numero_contrato TEXT NOT NULL,
  tipo_alerta TEXT NOT NULL, -- 'mudanca_marco', 'momento_premium', 'momento_total'
  marco_anterior TEXT,
  marco_atual TEXT NOT NULL,
  percentual_provisao_anterior NUMERIC,
  percentual_provisao_atual NUMERIC NOT NULL,
  mensagem TEXT NOT NULL,
  lido BOOLEAN DEFAULT FALSE,
  lido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_alertas_provisionamento_escritorio ON public.alertas_provisionamento(escritorio_id);
CREATE INDEX idx_alertas_provisionamento_analise ON public.alertas_provisionamento(analise_id);
CREATE INDEX idx_alertas_provisionamento_lido ON public.alertas_provisionamento(lido);
CREATE INDEX idx_alertas_provisionamento_created ON public.alertas_provisionamento(created_at DESC);

-- RLS Policies
ALTER TABLE public.alertas_provisionamento ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Alertas isolados por escritório"
ON public.alertas_provisionamento
FOR ALL
USING (escritorio_id = get_user_escritorio_id());

-- Trigger para atualizar updated_at
CREATE TRIGGER update_alertas_provisionamento_updated_at
BEFORE UPDATE ON public.alertas_provisionamento
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para definir escritorio_id automaticamente
CREATE TRIGGER set_alertas_provisionamento_escritorio_id
BEFORE INSERT ON public.alertas_provisionamento
FOR EACH ROW
EXECUTE FUNCTION set_escritorio_id();

-- Tabela para histórico de provisões (para comparação diária)
CREATE TABLE IF NOT EXISTS public.historico_provisao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL,
  analise_id UUID NOT NULL REFERENCES public.analises_gestao_passivo(id) ON DELETE CASCADE,
  percentual_provisao NUMERIC NOT NULL,
  valor_provisao NUMERIC NOT NULL,
  marco_provisionamento TEXT NOT NULL,
  meses_atraso INTEGER NOT NULL,
  data_snapshot DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para histórico
CREATE INDEX idx_historico_provisao_analise ON public.historico_provisao(analise_id);
CREATE INDEX idx_historico_provisao_data ON public.historico_provisao(data_snapshot DESC);
CREATE UNIQUE INDEX idx_historico_provisao_analise_data ON public.historico_provisao(analise_id, data_snapshot);

-- RLS para histórico
ALTER TABLE public.historico_provisao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Histórico isolado por escritório"
ON public.historico_provisao
FOR ALL
USING (escritorio_id = get_user_escritorio_id());

-- Trigger para definir escritorio_id no histórico
CREATE TRIGGER set_historico_provisao_escritorio_id
BEFORE INSERT ON public.historico_provisao
FOR EACH ROW
EXECUTE FUNCTION set_escritorio_id();