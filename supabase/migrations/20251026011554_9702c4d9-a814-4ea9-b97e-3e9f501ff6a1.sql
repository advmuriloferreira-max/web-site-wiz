-- ====================================================================
-- MIGRATION: ARQUITETURA INTEGRADA - CLIENTE ÚNICO, MÚLTIPLAS ANÁLISES
-- ====================================================================

-- PASSO 1: GARANTIR ESTRUTURA UNIFICADA DE CLIENTES E CONTRATOS
-- ====================================================================

-- Tabela de Clientes (UMA por cliente, independente do módulo)
CREATE TABLE IF NOT EXISTS public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  cpf_cnpj VARCHAR(18) UNIQUE NOT NULL,
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco TEXT,
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  data_nascimento DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Contratos (UMA por contrato, vinculado ao cliente)
CREATE TABLE IF NOT EXISTS public.contratos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  banco_id UUID REFERENCES public.bancos_provisao(id),
  numero_contrato VARCHAR(100),
  tipo_operacao VARCHAR(100),
  modalidade_bacen_id UUID REFERENCES public.modalidades_bacen_juros(id),
  valor_contrato DECIMAL(15,2),
  valor_financiado DECIMAL(15,2),
  valor_parcela DECIMAL(15,2),
  numero_parcelas INTEGER,
  taxa_juros_contratual DECIMAL(10,4),
  data_assinatura DATE,
  data_primeiro_vencimento DATE,
  data_ultimo_pagamento DATE,
  status VARCHAR(50) DEFAULT 'ativo',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 2: CRIAR TABELAS DE ANÁLISES SEPARADAS POR MÓDULO
-- ====================================================================

-- MÓDULO 1: PROVISIONAMENTO BANCÁRIO (Resolução 4966 BACEN)
CREATE TABLE IF NOT EXISTS public.analises_provisionamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  
  valor_divida DECIMAL(15,2) NOT NULL,
  data_ultimo_pagamento DATE,
  dias_atraso INTEGER,
  meses_atraso DECIMAL(10,2),
  
  classificacao_risco VARCHAR(10),
  percentual_provisao DECIMAL(10,4),
  valor_provisao DECIMAL(15,2),
  
  metodologia VARCHAR(100) DEFAULT 'Resolução 4966 BACEN e 352 CMN',
  base_calculo TEXT,
  
  data_calculo TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MÓDULO 2: JUROS ABUSIVOS (Séries Temporais BACEN)
CREATE TABLE IF NOT EXISTS public.analises_juros_abusivos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  
  modalidade_bacen_id UUID REFERENCES public.modalidades_bacen_juros(id),
  valor_financiado DECIMAL(15,2),
  valor_parcela DECIMAL(15,2),
  numero_parcelas INTEGER,
  taxa_contratual DECIMAL(10,4),
  data_referencia DATE,
  
  taxa_real_aplicada DECIMAL(10,4),
  taxa_media_bacen DECIMAL(10,4),
  diferenca_absoluta DECIMAL(10,4),
  diferenca_percentual DECIMAL(10,2),
  abusividade_detectada BOOLEAN DEFAULT FALSE,
  
  metodologia VARCHAR(100) DEFAULT 'Comparação com Séries Temporais BACEN',
  fonte_taxa_bacen TEXT,
  
  data_analise TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MÓDULO 3: SUPERENDIVIDAMENTO (Lei 14.181/2021)
CREATE TABLE IF NOT EXISTS public.analises_superendividamento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  
  renda_liquida DECIMAL(15,2) NOT NULL,
  percentual_comprometimento DECIMAL(5,2) DEFAULT 30.00,
  total_dividas DECIMAL(15,2),
  encargo_mensal_atual DECIMAL(15,2),
  encargo_mensal_proposto DECIMAL(15,2),
  reducao_mensal DECIMAL(15,2),
  reducao_percentual DECIMAL(10,2),
  
  metodologia VARCHAR(100) DEFAULT 'Lei 14.181/2021 - Limite de 30% da renda',
  
  data_analise TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario_id UUID REFERENCES auth.users(id),
  observacoes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dividas_analise_super (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  analise_superendividamento_id UUID NOT NULL REFERENCES public.analises_superendividamento(id) ON DELETE CASCADE,
  contrato_id UUID REFERENCES public.contratos(id),
  
  credor VARCHAR(255) NOT NULL,
  tipo_divida VARCHAR(100),
  valor_total_divida DECIMAL(15,2) NOT NULL,
  parcela_mensal_atual DECIMAL(15,2) NOT NULL,
  numero_parcelas_restantes INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.planos_pagamento_super (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  analise_superendividamento_id UUID NOT NULL REFERENCES public.analises_superendividamento(id) ON DELETE CASCADE,
  
  total_fases INTEGER,
  total_meses INTEGER,
  valor_total_pago DECIMAL(15,2),
  dividas_impagaveis DECIMAL(15,2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fases_plano_super (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escritorio_id UUID NOT NULL REFERENCES public.escritorios(id) ON DELETE CASCADE,
  plano_pagamento_id UUID NOT NULL REFERENCES public.planos_pagamento_super(id) ON DELETE CASCADE,
  
  numero_fase INTEGER NOT NULL,
  tipo_fase VARCHAR(50),
  duracao_meses INTEGER NOT NULL,
  valor_mensal_total DECIMAL(15,2) NOT NULL,
  detalhes_json JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PASSO 3: ADICIONAR ÍNDICES PARA PERFORMANCE
-- ====================================================================

CREATE INDEX IF NOT EXISTS idx_clientes_escritorio ON public.clientes(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON public.clientes(cpf_cnpj);

CREATE INDEX IF NOT EXISTS idx_contratos_escritorio ON public.contratos(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_contratos_cliente ON public.contratos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_numero ON public.contratos(numero_contrato);

CREATE INDEX IF NOT EXISTS idx_analises_prov_escritorio ON public.analises_provisionamento(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_analises_prov_contrato ON public.analises_provisionamento(contrato_id);

CREATE INDEX IF NOT EXISTS idx_analises_juros_escritorio ON public.analises_juros_abusivos(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_analises_juros_contrato ON public.analises_juros_abusivos(contrato_id);

CREATE INDEX IF NOT EXISTS idx_analises_super_escritorio ON public.analises_superendividamento(escritorio_id);
CREATE INDEX IF NOT EXISTS idx_analises_super_cliente ON public.analises_superendividamento(cliente_id);

-- PASSO 4: HABILITAR RLS
-- ====================================================================

ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_provisionamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_juros_abusivos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_superendividamento ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dividas_analise_super ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planos_pagamento_super ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fases_plano_super ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Isolamento por Escritório - Clientes" ON public.clientes;
DROP POLICY IF EXISTS "Isolamento por Escritório - Contratos" ON public.contratos;
DROP POLICY IF EXISTS "Isolamento por Escritório - Análises Provisionamento" ON public.analises_provisionamento;
DROP POLICY IF EXISTS "Isolamento por Escritório - Análises Juros" ON public.analises_juros_abusivos;
DROP POLICY IF EXISTS "Isolamento por Escritório - Análises Superendividamento" ON public.analises_superendividamento;
DROP POLICY IF EXISTS "Isolamento por Escritório - Dívidas Análise Super" ON public.dividas_analise_super;
DROP POLICY IF EXISTS "Isolamento por Escritório - Planos Pagamento Super" ON public.planos_pagamento_super;
DROP POLICY IF EXISTS "Isolamento por Escritório - Fases Plano Super" ON public.fases_plano_super;

CREATE POLICY "Isolamento por Escritório - Clientes" ON public.clientes FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Contratos" ON public.contratos FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Análises Provisionamento" ON public.analises_provisionamento FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Análises Juros" ON public.analises_juros_abusivos FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Análises Superendividamento" ON public.analises_superendividamento FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Dívidas Análise Super" ON public.dividas_analise_super FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Planos Pagamento Super" ON public.planos_pagamento_super FOR ALL USING (escritorio_id = public.get_user_escritorio_id());
CREATE POLICY "Isolamento por Escritório - Fases Plano Super" ON public.fases_plano_super FOR ALL USING (escritorio_id = public.get_user_escritorio_id());

-- PASSO 5: CRIAR TRIGGERS DE AUTO-INSERÇÃO
-- ====================================================================

DROP TRIGGER IF EXISTS set_escritorio_id_clientes ON public.clientes;
DROP TRIGGER IF EXISTS set_escritorio_id_contratos ON public.contratos;
DROP TRIGGER IF EXISTS set_escritorio_id_analises_prov ON public.analises_provisionamento;
DROP TRIGGER IF EXISTS set_escritorio_id_analises_juros ON public.analises_juros_abusivos;
DROP TRIGGER IF EXISTS set_escritorio_id_analises_super ON public.analises_superendividamento;
DROP TRIGGER IF EXISTS set_escritorio_id_dividas_super ON public.dividas_analise_super;
DROP TRIGGER IF EXISTS set_escritorio_id_planos ON public.planos_pagamento_super;
DROP TRIGGER IF EXISTS set_escritorio_id_fases ON public.fases_plano_super;

CREATE TRIGGER set_escritorio_id_clientes BEFORE INSERT ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_contratos BEFORE INSERT ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_analises_prov BEFORE INSERT ON public.analises_provisionamento FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_analises_juros BEFORE INSERT ON public.analises_juros_abusivos FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_analises_super BEFORE INSERT ON public.analises_superendividamento FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_dividas_super BEFORE INSERT ON public.dividas_analise_super FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_planos BEFORE INSERT ON public.planos_pagamento_super FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();
CREATE TRIGGER set_escritorio_id_fases BEFORE INSERT ON public.fases_plano_super FOR EACH ROW EXECUTE FUNCTION public.set_escritorio_id();

-- PASSO 6: MIGRAÇÃO DE DADOS EXISTENTES
-- ====================================================================

-- Migrar clientes_provisao
INSERT INTO public.clientes (id, escritorio_id, nome, cpf_cnpj, email, telefone, endereco, observacoes, created_at)
SELECT id, escritorio_id, nome, cpf_cnpj, email, telefone, endereco, observacoes, created_at
FROM public.clientes_provisao
WHERE cpf_cnpj IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf_cnpj = clientes_provisao.cpf_cnpj)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Migrar clientes_juros
INSERT INTO public.clientes (id, escritorio_id, nome, cpf_cnpj, email, telefone, created_at)
SELECT id, escritorio_id, nome, cpf_cnpj, email, telefone, created_at
FROM public.clientes_juros
WHERE cpf_cnpj IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf_cnpj = clientes_juros.cpf_cnpj)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Migrar clientes_superendividamento (sem email)
INSERT INTO public.clientes (id, escritorio_id, nome, cpf_cnpj, observacoes, created_at)
SELECT gen_random_uuid(), escritorio_id, nome, cpf, observacoes, created_at
FROM public.clientes_superendividamento
WHERE cpf IS NOT NULL 
  AND NOT EXISTS (SELECT 1 FROM public.clientes WHERE cpf_cnpj = clientes_superendividamento.cpf)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- PASSO 7: DELETAR TABELA INVÁLIDA
-- ====================================================================

DROP TABLE IF EXISTS public.for;