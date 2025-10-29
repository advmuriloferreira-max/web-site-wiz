-- =====================================================
-- INTELLIBANK - Gestão de Passivo Bancário
-- Estrutura completa de banco de dados
-- =====================================================

-- 1. TABELA: provisao_bcb352_anexo1 (Perda Incorrida - 90+ dias)
CREATE TABLE IF NOT EXISTS public.provisao_bcb352_anexo1 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faixa_meses TEXT NOT NULL,
  meses_min INTEGER NOT NULL,
  meses_max INTEGER,
  c1_percentual NUMERIC(5,2) NOT NULL,
  c2_percentual NUMERIC(5,2) NOT NULL,
  c3_percentual NUMERIC(5,2) NOT NULL,
  c4_percentual NUMERIC(5,2) NOT NULL,
  c5_percentual NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 2. TABELA: provisao_bcb352_anexo2 (Perda Esperada - 0-90 dias)
CREATE TABLE IF NOT EXISTS public.provisao_bcb352_anexo2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  faixa_dias TEXT NOT NULL,
  dias_min INTEGER NOT NULL,
  dias_max INTEGER NOT NULL,
  c1_percentual NUMERIC(5,2) NOT NULL,
  c2_percentual NUMERIC(5,2) NOT NULL,
  c3_percentual NUMERIC(5,2) NOT NULL,
  c4_percentual NUMERIC(5,2) NOT NULL,
  c5_percentual NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 3. ADICIONAR NOVOS CAMPOS EM analises_gestao_passivo
ALTER TABLE public.analises_gestao_passivo 
  ADD COLUMN IF NOT EXISTS tipo_pessoa TEXT CHECK (tipo_pessoa IN ('PF', 'PJ')),
  ADD COLUMN IF NOT EXISTS descricao_garantia TEXT,
  ADD COLUMN IF NOT EXISTS estagio_cmn4966 INTEGER CHECK (estagio_cmn4966 IN (1, 2, 3)),
  ADD COLUMN IF NOT EXISTS tipo_provisao TEXT CHECK (tipo_provisao IN ('ANEXO_I', 'ANEXO_II')),
  ADD COLUMN IF NOT EXISTS percentual_desconto NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS banco_id UUID REFERENCES public.bancos_brasil(id);

-- 4. CRIAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_analises_usuario_id ON public.analises_gestao_passivo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_analises_banco_id ON public.analises_gestao_passivo(banco_id);
CREATE INDEX IF NOT EXISTS idx_analises_carteira ON public.analises_gestao_passivo(carteira_bcb352);
CREATE INDEX IF NOT EXISTS idx_analises_estagio ON public.analises_gestao_passivo(estagio_cmn4966);
CREATE INDEX IF NOT EXISTS idx_bancos_compe ON public.bancos_brasil(codigo_compe);
CREATE INDEX IF NOT EXISTS idx_bancos_segmento ON public.bancos_brasil(segmento_bcb);

-- 5. HABILITAR ROW LEVEL SECURITY
ALTER TABLE public.provisao_bcb352_anexo1 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisao_bcb352_anexo2 ENABLE ROW LEVEL SECURITY;

-- 6. CRIAR POLÍTICAS RLS
-- Provisão Anexo 1: Leitura pública
CREATE POLICY "Leitura pública provisão anexo 1"
  ON public.provisao_bcb352_anexo1
  FOR SELECT
  TO authenticated
  USING (true);

-- Provisão Anexo 2: Leitura pública
CREATE POLICY "Leitura pública provisão anexo 2"
  ON public.provisao_bcb352_anexo2
  FOR SELECT
  TO authenticated
  USING (true);

-- 7. POPULAR DADOS - ANEXO I (Perda Incorrida - 90+ dias)
INSERT INTO public.provisao_bcb352_anexo1 (faixa_meses, meses_min, meses_max, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
  ('Menor que 1 mês', 0, 0, 10.00, 5.00, 5.00, 5.00, 10.00),
  ('1 a 2 meses', 1, 2, 20.00, 10.00, 10.00, 10.00, 20.00),
  ('3 a 5 meses', 3, 5, 30.00, 20.00, 20.00, 20.00, 30.00),
  ('6 a 8 meses', 6, 8, 50.00, 30.00, 30.00, 30.00, 50.00),
  ('9 a 11 meses', 9, 11, 70.00, 50.00, 50.00, 50.00, 70.00),
  ('12 a 14 meses', 12, 14, 90.00, 70.00, 70.00, 70.00, 90.00),
  ('15 a 17 meses', 15, 17, 90.00, 90.00, 90.00, 90.00, 90.00),
  ('18 a 20 meses', 18, 20, 90.00, 90.00, 90.00, 90.00, 90.00),
  ('21 meses ou mais', 21, NULL, 100.00, 100.00, 100.00, 100.00, 100.00)
ON CONFLICT DO NOTHING;

-- 8. POPULAR DADOS - ANEXO II (Perda Esperada - 0-90 dias)
INSERT INTO public.provisao_bcb352_anexo2 (faixa_dias, dias_min, dias_max, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
  ('0 a 14 dias', 0, 14, 0.50, 0.25, 0.25, 0.25, 0.50),
  ('15 a 30 dias', 15, 30, 1.00, 0.50, 0.50, 0.50, 1.00),
  ('31 a 60 dias', 31, 60, 3.00, 1.50, 1.50, 1.50, 3.00),
  ('61 a 90 dias', 61, 90, 10.00, 5.00, 5.00, 5.00, 10.00)
ON CONFLICT DO NOTHING;

-- 9. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE public.provisao_bcb352_anexo1 IS 'Tabela de provisão conforme Resolução BCB 352/2023 - Anexo I (Perda Incorrida - contratos com atraso superior a 90 dias)';
COMMENT ON TABLE public.provisao_bcb352_anexo2 IS 'Tabela de provisão conforme Resolução BCB 352/2023 - Anexo II (Perda Esperada - contratos com atraso de 0 a 90 dias)';
COMMENT ON COLUMN public.analises_gestao_passivo.estagio_cmn4966 IS 'Estágio de risco conforme Resolução CMN 4.966/2021: 1=Risco Normal, 2=Risco Aumentado, 3=Default';
COMMENT ON COLUMN public.analises_gestao_passivo.tipo_provisao IS 'Tipo de provisão aplicada: ANEXO_I (>90 dias) ou ANEXO_II (0-90 dias)';
COMMENT ON COLUMN public.analises_gestao_passivo.carteira_bcb352 IS 'Carteira de classificação BCB 352: C1 a C5';
COMMENT ON COLUMN public.analises_gestao_passivo.tipo_pessoa IS 'Tipo de pessoa: PF (Pessoa Física) ou PJ (Pessoa Jurídica)';