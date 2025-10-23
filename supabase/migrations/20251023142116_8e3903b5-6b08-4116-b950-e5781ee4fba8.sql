-- Módulo Superendividamento - Lei 14.181/2021

-- Clientes do módulo superendividamento
CREATE TABLE public.clientes_superendividamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  renda_bruta NUMERIC,
  renda_liquida NUMERIC,
  desconto_inss NUMERIC,
  desconto_ir NUMERIC,
  composicao_familiar JSONB DEFAULT '[]'::jsonb,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Análises socioeconômicas
CREATE TABLE public.analises_socioeconomicas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes_superendividamento(id) ON DELETE CASCADE,
  renda_liquida NUMERIC NOT NULL,
  despesas_essenciais NUMERIC NOT NULL,
  minimo_existencial NUMERIC NOT NULL,
  capacidade_pagamento NUMERIC NOT NULL,
  percentual_comprometimento NUMERIC NOT NULL,
  situacao TEXT CHECK (situacao IN ('controlado', 'risco', 'superendividado')),
  detalhes_despesas JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Dívidas do cliente
CREATE TABLE public.dividas_superendividamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes_superendividamento(id) ON DELETE CASCADE,
  credor TEXT NOT NULL,
  valor_original NUMERIC NOT NULL,
  valor_atual NUMERIC NOT NULL,
  parcela_mensal_atual NUMERIC,
  tipo_divida TEXT DEFAULT 'inclusa' CHECK (tipo_divida IN ('inclusa', 'excluida')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Planos de pagamento
CREATE TABLE public.planos_pagamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES public.clientes_superendividamento(id) ON DELETE CASCADE,
  percentual_renda INTEGER CHECK (percentual_renda IN (30, 35)),
  valor_mensal_total NUMERIC NOT NULL,
  total_dividas NUMERIC NOT NULL,
  total_fases INTEGER NOT NULL,
  total_parcelas INTEGER NOT NULL,
  status TEXT DEFAULT 'ativo' CHECK (status IN ('ativo', 'concluido', 'suspenso')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fases do plano de pagamento
CREATE TABLE public.fases_plano (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plano_id UUID REFERENCES public.planos_pagamento(id) ON DELETE CASCADE,
  numero_fase INTEGER NOT NULL,
  parcelas_na_fase INTEGER NOT NULL,
  credores_ativos JSONB DEFAULT '[]'::jsonb,
  credor_quitado TEXT,
  distribuicao JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX idx_analises_cliente ON public.analises_socioeconomicas(cliente_id);
CREATE INDEX idx_dividas_cliente ON public.dividas_superendividamento(cliente_id);
CREATE INDEX idx_planos_cliente ON public.planos_pagamento(cliente_id);
CREATE INDEX idx_fases_plano ON public.fases_plano(plano_id);

-- Trigger para updated_at
CREATE TRIGGER update_clientes_superendividamento_updated_at
  BEFORE UPDATE ON public.clientes_superendividamento
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.clientes_superendividamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_socioeconomicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas_superendividamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_pagamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fases_plano ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Usuários autenticados podem gerenciar clientes superendividamento"
  ON public.clientes_superendividamento
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar análises"
  ON public.analises_socioeconomicas
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar dívidas"
  ON public.dividas_superendividamento
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar planos"
  ON public.planos_pagamento
  FOR ALL
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem gerenciar fases"
  ON public.fases_plano
  FOR ALL
  USING (true)
  WITH CHECK (true);