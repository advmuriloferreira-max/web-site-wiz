-- ====================================================================
-- CRIAR TABELA DIVIDAS_SUPERENDIVIDAMENTO (SEM ÍNDICES PRIMEIRO)
-- ====================================================================

-- Verificar se a tabela analises_superendividamento existe antes de criar a FK
DO $$ 
BEGIN
  -- Criar a tabela apenas se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'dividas_superendividamento'
  ) THEN
    CREATE TABLE public.dividas_superendividamento (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      escritorio_id UUID NOT NULL,
      analise_superendividamento_id UUID NOT NULL,
      contrato_id UUID,
      
      credor VARCHAR(255) NOT NULL,
      tipo_divida VARCHAR(100),
      valor_total_divida DECIMAL(15,2) NOT NULL,
      parcela_mensal_atual DECIMAL(15,2) NOT NULL,
      numero_parcelas_restantes INTEGER,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Adicionar FKs após criar a tabela
    ALTER TABLE public.dividas_superendividamento
      ADD CONSTRAINT fk_dividas_super_escritorio 
      FOREIGN KEY (escritorio_id) REFERENCES public.escritorios(id) ON DELETE CASCADE;
    
    ALTER TABLE public.dividas_superendividamento
      ADD CONSTRAINT fk_dividas_super_analise 
      FOREIGN KEY (analise_superendividamento_id) REFERENCES public.analises_superendividamento(id) ON DELETE CASCADE;
    
    ALTER TABLE public.dividas_superendividamento
      ADD CONSTRAINT fk_dividas_super_contrato 
      FOREIGN KEY (contrato_id) REFERENCES public.contratos(id);
    
    -- Habilitar RLS
    ALTER TABLE public.dividas_superendividamento ENABLE ROW LEVEL SECURITY;
    
    -- Criar política RLS
    CREATE POLICY "Isolamento por Escritório - Dívidas Superendividamento" 
    ON public.dividas_superendividamento FOR ALL 
    USING (escritorio_id = public.get_user_escritorio_id());
    
    -- Criar trigger
    CREATE TRIGGER set_escritorio_id_dividas_super 
    BEFORE INSERT ON public.dividas_superendividamento 
    FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
    
    RAISE NOTICE '✅ Tabela dividas_superendividamento criada!';
  ELSE
    RAISE NOTICE '⚠️ Tabela dividas_superendividamento já existe';
  END IF;
END $$;

-- ====================================================================
-- ATUALIZAR TABELA PLANOS_PAGAMENTO
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
    ADD COLUMN analise_superendividamento_id UUID;
    
    -- Adicionar FK após criar a coluna
    ALTER TABLE public.planos_pagamento
      ADD CONSTRAINT fk_planos_analise_super 
      FOREIGN KEY (analise_superendividamento_id) 
      REFERENCES public.analises_superendividamento(id) ON DELETE CASCADE;
    
    RAISE NOTICE '✅ Coluna analise_superendividamento_id adicionada a planos_pagamento';
  END IF;
  
  -- Adicionar outras colunas
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'planos_pagamento' 
    AND column_name = 'total_fases'
  ) THEN
    ALTER TABLE public.planos_pagamento 
    ADD COLUMN total_fases INTEGER,
    ADD COLUMN total_meses INTEGER,
    ADD COLUMN valor_total_pago DECIMAL(15,2),
    ADD COLUMN dividas_impagaveis DECIMAL(15,2);
    
    RAISE NOTICE '✅ Colunas adicionais incluídas em planos_pagamento';
  END IF;
END $$;