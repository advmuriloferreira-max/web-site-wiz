-- ETAPA 2: Complementar estrutura da tabela taxas_juros_bacen
-- Garante que todos os índices e políticas estejam configurados corretamente

-- Criar índices caso não existam
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_taxas_bacen_serie_data') THEN
    CREATE INDEX idx_taxas_bacen_serie_data ON public.taxas_juros_bacen (codigo_serie, data_referencia DESC);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_taxas_bacen_categoria') THEN
    CREATE INDEX idx_taxas_bacen_categoria ON public.taxas_juros_bacen (categoria, sub_categoria);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_taxas_bacen_data_ref') THEN
    CREATE INDEX idx_taxas_bacen_data_ref ON public.taxas_juros_bacen (data_referencia DESC);
  END IF;
END $$;

-- Criar política de admin se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'taxas_juros_bacen' 
    AND policyname = 'Admins can manage bacen rates'
  ) THEN
    CREATE POLICY "Admins can manage bacen rates" 
      ON public.taxas_juros_bacen
      FOR ALL 
      USING (is_admin(auth.uid()));
  END IF;
END $$;

-- Adicionar comentários para documentação
COMMENT ON TABLE public.taxas_juros_bacen IS 'Armazena as 48 séries temporais oficiais de taxas de juros do BACEN com recursos livres';
COMMENT ON COLUMN public.taxas_juros_bacen.codigo_serie IS 'Código SGS da série temporal no sistema do BACEN (ex: 20714, 20715, etc.)';
COMMENT ON COLUMN public.taxas_juros_bacen.nome_modalidade IS 'Nome completo da modalidade de crédito (ex: "Crédito pessoal não consignado - Total")';
COMMENT ON COLUMN public.taxas_juros_bacen.categoria IS 'Categoria principal: "Pessoas Jurídicas" ou "Pessoas Físicas"';
COMMENT ON COLUMN public.taxas_juros_bacen.sub_categoria IS 'Subcategoria da modalidade (ex: "Crédito Pessoal", "Capital de Giro rotativo")';
COMMENT ON COLUMN public.taxas_juros_bacen.taxa_mensal IS 'Taxa de juros mensal em percentual (ex: 2.5 = 2,5% a.m.)';
COMMENT ON COLUMN public.taxas_juros_bacen.data_referencia IS 'Data de referência da taxa (primeiro dia do mês)';