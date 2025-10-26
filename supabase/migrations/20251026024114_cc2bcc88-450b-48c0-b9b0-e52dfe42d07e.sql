-- ====================================================================
-- UNIFICAÇÃO E PADRONIZAÇÃO DAS TABELAS DE ANÁLISES
-- ====================================================================

-- PASSO 1: Ajustar planos_pagamento para incluir vínculo com análises
-- ====================================================================
DO $$ 
BEGIN
  -- Adicionar coluna analise_superendividamento_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'planos_pagamento' 
    AND column_name = 'analise_superendividamento_id'
  ) THEN
    ALTER TABLE public.planos_pagamento 
    ADD COLUMN analise_superendividamento_id UUID REFERENCES public.analises_superendividamento(id) ON DELETE SET NULL;
    
    RAISE NOTICE '✅ Coluna analise_superendividamento_id adicionada a planos_pagamento';
  END IF;
END $$;

-- PASSO 2: Ajustar fases_plano para usar plano_pagamento_id
-- ====================================================================
DO $$ 
BEGIN
  -- Adicionar coluna plano_pagamento_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'plano_pagamento_id'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN plano_pagamento_id UUID REFERENCES public.planos_pagamento(id) ON DELETE CASCADE;
    
    -- Copiar dados de plano_id para plano_pagamento_id se houver dados
    UPDATE public.fases_plano 
    SET plano_pagamento_id = plano_id 
    WHERE plano_pagamento_id IS NULL AND plano_id IS NOT NULL;
    
    RAISE NOTICE '✅ Coluna plano_pagamento_id adicionada a fases_plano';
  END IF;
  
  -- Adicionar coluna tipo_fase se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'tipo_fase'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN tipo_fase VARCHAR(50);
  END IF;
  
  -- Adicionar coluna duracao_meses se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'duracao_meses'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN duracao_meses INTEGER;
  END IF;
  
  -- Adicionar coluna valor_mensal_total se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'valor_mensal_total'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN valor_mensal_total DECIMAL(15,2);
  END IF;
  
  -- Adicionar coluna detalhes_json se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'detalhes_json'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN detalhes_json JSONB;
  END IF;
  
  -- Adicionar coluna escritorio_id se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'fases_plano' 
    AND column_name = 'escritorio_id'
  ) THEN
    ALTER TABLE public.fases_plano 
    ADD COLUMN escritorio_id UUID REFERENCES public.escritorios(id) ON DELETE CASCADE;
  END IF;
END $$;

-- PASSO 3: Criar view unificada para dívidas (compatibilidade)
-- ====================================================================
CREATE OR REPLACE VIEW public.v_dividas_superendividamento AS
SELECT 
  ds.id,
  ds.escritorio_id,
  NULL::uuid as analise_superendividamento_id,
  NULL::uuid as contrato_id,
  ds.credor,
  ds.tipo_divida,
  ds.valor_atual as valor_total_divida,
  ds.parcela_mensal_atual,
  NULL::integer as numero_parcelas_restantes,
  ds.created_at,
  ds.escritorio_id as escritorio_id_original,
  'antiga'::text as fonte
FROM public.dividas_superendividamento ds

UNION ALL

SELECT 
  da.id,
  da.escritorio_id,
  da.analise_superendividamento_id,
  da.contrato_id,
  da.credor,
  da.tipo_divida,
  da.valor_total_divida,
  da.parcela_mensal_atual,
  da.numero_parcelas_restantes,
  da.created_at,
  da.escritorio_id,
  'nova'::text as fonte
FROM public.dividas_analise_super da;

-- PASSO 4: Garantir RLS e triggers em fases_plano
-- ====================================================================
ALTER TABLE public.fases_plano ENABLE ROW LEVEL SECURITY;

-- Remover política antiga se existir
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar fases" ON public.fases_plano;
DROP POLICY IF EXISTS "Isolamento por Escritório - Fases Plano" ON public.fases_plano;

-- Criar nova política baseada em escritorio_id
CREATE POLICY "Isolamento por Escritório - Fases Plano" 
ON public.fases_plano FOR ALL 
USING (
  CASE 
    WHEN escritorio_id IS NOT NULL THEN escritorio_id = public.get_user_escritorio_id()
    ELSE true
  END
);

-- Criar trigger para auto-preencher escritorio_id
DROP TRIGGER IF EXISTS set_escritorio_id_fases ON public.fases_plano;

CREATE TRIGGER set_escritorio_id_fases 
BEFORE INSERT ON public.fases_plano 
FOR EACH ROW 
WHEN (NEW.escritorio_id IS NULL)
EXECUTE FUNCTION public.set_escritorio_id();

-- VALIDAÇÃO FINAL
-- ====================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Estrutura de análises unificada com sucesso!';
  RAISE NOTICE '✅ planos_pagamento agora suporta analise_superendividamento_id';
  RAISE NOTICE '✅ fases_plano atualizada com novas colunas';
  RAISE NOTICE '✅ View unificada v_dividas_superendividamento criada';
  RAISE NOTICE '✅ RLS e triggers configurados';
END $$;