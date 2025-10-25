-- ============================================
-- ESTRUTURA DE MULTI-TENANCY - ESCRITÓRIOS
-- ============================================

-- 1. CRIAR TABELA DE ESCRITÓRIOS (TENANTS)
CREATE TABLE IF NOT EXISTS public.escritorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(18) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefone VARCHAR(20),
  endereco TEXT,
  plano VARCHAR(50) DEFAULT 'essencial', -- 'essencial', 'premium'
  status VARCHAR(20) DEFAULT 'ativo', -- 'ativo', 'suspenso', 'cancelado'
  data_vencimento DATE,
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  configuracoes JSONB DEFAULT '{}',
  limite_usuarios INTEGER DEFAULT 5,
  limite_clientes INTEGER DEFAULT 100,
  limite_contratos INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE USUÁRIOS DO ESCRITÓRIO
CREATE TABLE IF NOT EXISTS public.usuarios_escritorio (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  escritorio_id UUID REFERENCES public.escritorios(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  cargo VARCHAR(100),
  permissoes JSONB DEFAULT '{"read": true, "write": true, "admin": false}',
  status VARCHAR(20) DEFAULT 'ativo',
  data_cadastro TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ultimo_acesso TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(escritorio_id, user_id)
);

-- 3. ADICIONAR COLUNA escritorio_id EM TODAS AS TABELAS EXISTENTES
ALTER TABLE public.clientes_provisao ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.contratos_provisao ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.clientes_juros ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.contratos_juros ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.analises_juros ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.clientes_superendividamento ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.dividas_superendividamento ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.analises_socioeconomicas ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.planos_pagamento ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.processos_provisao ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.propostas_acordo_provisao ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.garantias_provisao ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);
ALTER TABLE public.parcelas_contrato ADD COLUMN IF NOT EXISTS escritorio_id UUID REFERENCES public.escritorios(id);

-- 4. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_clientes_provisao_escritorio ON public.clientes_provisao(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_contratos_provisao_escritorio ON public.contratos_provisao(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_clientes_juros_escritorio ON public.clientes_juros(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_contratos_juros_escritorio ON public.contratos_juros(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_analises_juros_escritorio ON public.analises_juros(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_clientes_superendividamento_escritorio ON public.clientes_superendividamento(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_dividas_superendividamento_escritorio ON public.dividas_superendividamento(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_analises_socioeconomicas_escritorio ON public.analises_socioeconomicas(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_planos_pagamento_escritorio ON public.planos_pagamento(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_processos_provisao_escritorio ON public.processos_provisao(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_propostas_acordo_escritorio ON public.propostas_acordo_provisao(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_garantias_provisao_escritorio ON public.garantias_provisao(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_contrato_escritorio ON public.parcelas_contrato(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_escritorio_escritorio ON public.usuarios_escritorio(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_escritorio_user ON public.usuarios_escritorio(user_id);

-- 5. CRIAR FUNÇÃO SECURITY DEFINER PARA OBTER ESCRITÓRIO DO USUÁRIO
CREATE OR REPLACE FUNCTION public.get_user_escritorio_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT escritorio_id 
  FROM public.usuarios_escritorio 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- 6. CRIAR FUNÇÃO PARA AUTO-INSERIR escritorio_id
CREATE OR REPLACE FUNCTION public.set_escritorio_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.escritorio_id IS NULL THEN
    NEW.escritorio_id = public.get_user_escritorio_id();
  END IF;
  RETURN NEW;
END;
$$;

-- 7. CRIAR TRIGGERS PARA AUTO-INSERIR escritorio_id
DROP TRIGGER IF EXISTS trigger_clientes_provisao_escritorio_id ON public.clientes_provisao;
CREATE TRIGGER trigger_clientes_provisao_escritorio_id
  BEFORE INSERT ON public.clientes_provisao
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_contratos_provisao_escritorio_id ON public.contratos_provisao;
CREATE TRIGGER trigger_contratos_provisao_escritorio_id
  BEFORE INSERT ON public.contratos_provisao
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_clientes_juros_escritorio_id ON public.clientes_juros;
CREATE TRIGGER trigger_clientes_juros_escritorio_id
  BEFORE INSERT ON public.clientes_juros
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_contratos_juros_escritorio_id ON public.contratos_juros;
CREATE TRIGGER trigger_contratos_juros_escritorio_id
  BEFORE INSERT ON public.contratos_juros
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_analises_juros_escritorio_id ON public.analises_juros;
CREATE TRIGGER trigger_analises_juros_escritorio_id
  BEFORE INSERT ON public.analises_juros
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_clientes_superendividamento_escritorio_id ON public.clientes_superendividamento;
CREATE TRIGGER trigger_clientes_superendividamento_escritorio_id
  BEFORE INSERT ON public.clientes_superendividamento
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_dividas_superendividamento_escritorio_id ON public.dividas_superendividamento;
CREATE TRIGGER trigger_dividas_superendividamento_escritorio_id
  BEFORE INSERT ON public.dividas_superendividamento
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_analises_socioeconomicas_escritorio_id ON public.analises_socioeconomicas;
CREATE TRIGGER trigger_analises_socioeconomicas_escritorio_id
  BEFORE INSERT ON public.analises_socioeconomicas
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_planos_pagamento_escritorio_id ON public.planos_pagamento;
CREATE TRIGGER trigger_planos_pagamento_escritorio_id
  BEFORE INSERT ON public.planos_pagamento
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_processos_provisao_escritorio_id ON public.processos_provisao;
CREATE TRIGGER trigger_processos_provisao_escritorio_id
  BEFORE INSERT ON public.processos_provisao
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_propostas_acordo_escritorio_id ON public.propostas_acordo_provisao;
CREATE TRIGGER trigger_propostas_acordo_escritorio_id
  BEFORE INSERT ON public.propostas_acordo_provisao
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_garantias_provisao_escritorio_id ON public.garantias_provisao;
CREATE TRIGGER trigger_garantias_provisao_escritorio_id
  BEFORE INSERT ON public.garantias_provisao
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

DROP TRIGGER IF EXISTS trigger_parcelas_contrato_escritorio_id ON public.parcelas_contrato;
CREATE TRIGGER trigger_parcelas_contrato_escritorio_id
  BEFORE INSERT ON public.parcelas_contrato
  FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

-- 8. HABILITAR RLS NAS NOVAS TABELAS
ALTER TABLE public.escritorios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_escritorio ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLÍTICAS RLS PARA ESCRITÓRIOS
DROP POLICY IF EXISTS "Escritórios podem ver apenas seus dados" ON public.escritorios;
CREATE POLICY "Escritórios podem ver apenas seus dados" ON public.escritorios
  FOR ALL 
  USING (
    id = public.get_user_escritorio_id()
  );

-- 10. CRIAR POLÍTICAS RLS PARA USUÁRIOS DO ESCRITÓRIO
DROP POLICY IF EXISTS "Usuários veem apenas colegas do escritório" ON public.usuarios_escritorio;
CREATE POLICY "Usuários veem apenas colegas do escritório" ON public.usuarios_escritorio
  FOR ALL 
  USING (
    escritorio_id = public.get_user_escritorio_id()
  );

-- 11. ATUALIZAR POLÍTICAS RLS DAS TABELAS EXISTENTES
-- Clientes Provisão
DROP POLICY IF EXISTS "Acesso público aos clientes" ON public.clientes_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem ver clientes" ON public.clientes_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir clientes" ON public.clientes_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar clientes" ON public.clientes_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar clientes" ON public.clientes_provisao;

CREATE POLICY "Clientes isolados por escritório" ON public.clientes_provisao
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Contratos Provisão
DROP POLICY IF EXISTS "Acesso público aos contratos" ON public.contratos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem ver contratos" ON public.contratos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir contratos" ON public.contratos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar contratos" ON public.contratos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar contratos" ON public.contratos_provisao;

CREATE POLICY "Contratos isolados por escritório" ON public.contratos_provisao
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Clientes Juros
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes juros" ON public.clientes_juros;

CREATE POLICY "Clientes juros isolados por escritório" ON public.clientes_juros
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Contratos Juros
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar contratos juros" ON public.contratos_juros;

CREATE POLICY "Contratos juros isolados por escritório" ON public.contratos_juros
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Análises Juros
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar análises" ON public.analises_juros;

CREATE POLICY "Análises juros isoladas por escritório" ON public.analises_juros
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Clientes Superendividamento
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar clientes superendividame" ON public.clientes_superendividamento;

CREATE POLICY "Clientes superendividamento isolados por escritório" ON public.clientes_superendividamento
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Dívidas Superendividamento
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar dívidas" ON public.dividas_superendividamento;

CREATE POLICY "Dívidas isoladas por escritório" ON public.dividas_superendividamento
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Análises Socioeconômicas
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar análises" ON public.analises_socioeconomicas;

CREATE POLICY "Análises socioeconômicas isoladas por escritório" ON public.analises_socioeconomicas
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Planos Pagamento
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar planos" ON public.planos_pagamento;

CREATE POLICY "Planos pagamento isolados por escritório" ON public.planos_pagamento
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Processos Provisão
DROP POLICY IF EXISTS "Acesso público aos processos" ON public.processos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem ver processos" ON public.processos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir processos" ON public.processos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar processos" ON public.processos_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar processos" ON public.processos_provisao;

CREATE POLICY "Processos isolados por escritório" ON public.processos_provisao
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Propostas Acordo
DROP POLICY IF EXISTS "Usuários autenticados podem ver propostas" ON public.propostas_acordo_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir propostas" ON public.propostas_acordo_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar propostas" ON public.propostas_acordo_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar propostas" ON public.propostas_acordo_provisao;

CREATE POLICY "Propostas isoladas por escritório" ON public.propostas_acordo_provisao
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Garantias Provisão
DROP POLICY IF EXISTS "Usuários autenticados podem ver garantias" ON public.garantias_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem inserir garantias" ON public.garantias_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem atualizar garantias" ON public.garantias_provisao;
DROP POLICY IF EXISTS "Usuários autenticados podem deletar garantias" ON public.garantias_provisao;

CREATE POLICY "Garantias isoladas por escritório" ON public.garantias_provisao
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- Parcelas Contrato
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar parcelas" ON public.parcelas_contrato;

CREATE POLICY "Parcelas isoladas por escritório" ON public.parcelas_contrato
  FOR ALL 
  USING (escritorio_id = public.get_user_escritorio_id());

-- 12. CRIAR TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION public.update_escritorio_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_escritorios_updated_at ON public.escritorios;
CREATE TRIGGER trigger_escritorios_updated_at
  BEFORE UPDATE ON public.escritorios
  FOR EACH ROW EXECUTE FUNCTION public.update_escritorio_updated_at();

DROP TRIGGER IF EXISTS trigger_usuarios_escritorio_updated_at ON public.usuarios_escritorio;
CREATE TRIGGER trigger_usuarios_escritorio_updated_at
  BEFORE UPDATE ON public.usuarios_escritorio
  FOR EACH ROW EXECUTE FUNCTION public.update_escritorio_updated_at();