-- ============================================================================
-- SEPARAÇÃO COMPLETA: PROVISIONAMENTO vs ANÁLISE DE JUROS
-- ============================================================================

-- ============================================================================
-- PRODUTO 1: PROVISIONAMENTO BANCÁRIO INTELIGENTE
-- ============================================================================

-- Renomear tabelas existentes para o produto de provisionamento
ALTER TABLE IF EXISTS public.clientes RENAME TO clientes_provisao;
ALTER TABLE IF EXISTS public.contratos RENAME TO contratos_provisao;
ALTER TABLE IF EXISTS public.bancos RENAME TO bancos_provisao;
ALTER TABLE IF EXISTS public.processos RENAME TO processos_provisao;
ALTER TABLE IF EXISTS public.garantias RENAME TO garantias_provisao;
ALTER TABLE IF EXISTS public.propostas_acordo RENAME TO propostas_acordo_provisao;

-- Atualizar foreign keys da tabela contratos_provisao
ALTER TABLE public.contratos_provisao 
  DROP CONSTRAINT IF EXISTS contratos_banco_id_fkey,
  DROP CONSTRAINT IF EXISTS contratos_cliente_id_fkey;

ALTER TABLE public.contratos_provisao
  ADD CONSTRAINT contratos_provisao_banco_id_fkey 
    FOREIGN KEY (banco_id) REFERENCES public.bancos_provisao(id) ON DELETE CASCADE,
  ADD CONSTRAINT contratos_provisao_cliente_id_fkey 
    FOREIGN KEY (cliente_id) REFERENCES public.clientes_provisao(id) ON DELETE CASCADE;

-- Atualizar foreign keys de garantias
ALTER TABLE public.garantias_provisao 
  DROP CONSTRAINT IF EXISTS garantias_contrato_id_fkey;

ALTER TABLE public.garantias_provisao
  ADD CONSTRAINT garantias_provisao_contrato_id_fkey 
    FOREIGN KEY (contrato_id) REFERENCES public.contratos_provisao(id) ON DELETE CASCADE;

-- Atualizar foreign keys de processos
ALTER TABLE public.processos_provisao 
  DROP CONSTRAINT IF EXISTS processos_contrato_id_fkey;

ALTER TABLE public.processos_provisao
  ADD CONSTRAINT processos_provisao_contrato_id_fkey 
    FOREIGN KEY (contrato_id) REFERENCES public.contratos_provisao(id) ON DELETE CASCADE;

-- Atualizar foreign keys de propostas
ALTER TABLE public.propostas_acordo_provisao 
  DROP CONSTRAINT IF EXISTS propostas_acordo_contrato_id_fkey;

ALTER TABLE public.propostas_acordo_provisao
  ADD CONSTRAINT propostas_acordo_provisao_contrato_id_fkey 
    FOREIGN KEY (contrato_id) REFERENCES public.contratos_provisao(id) ON DELETE CASCADE;

-- ============================================================================
-- PRODUTO 2: ANÁLISE DE ABUSIVIDADE NA TAXA DE JUROS
-- ============================================================================

-- Criar tabela de clientes para análise de juros
CREATE TABLE IF NOT EXISTS public.clientes_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  responsavel TEXT,
  observacoes TEXT,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de instituições financeiras para análise de juros
CREATE TABLE IF NOT EXISTS public.instituicoes_financeiras (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo_banco TEXT,
  cnpj TEXT,
  telefone TEXT,
  email TEXT,
  contato TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de contratos para análise de juros
CREATE TABLE IF NOT EXISTS public.contratos_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_contrato TEXT,
  cliente_id UUID NOT NULL,
  instituicao_id UUID NOT NULL,
  
  -- Dados do contrato
  modalidade_bacen_id UUID REFERENCES public.modalidades_bacen_juros(id),
  tipo_operacao TEXT,
  data_contratacao DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Valores e condições contratuais
  valor_financiado NUMERIC NOT NULL,
  valor_parcela NUMERIC,
  numero_parcelas INTEGER,
  taxa_juros_contratual NUMERIC, -- Taxa declarada no contrato
  
  -- Análise de juros
  taxa_juros_real NUMERIC, -- Taxa efetivamente aplicada (calculada)
  diferenca_taxa NUMERIC, -- Diferença entre contratual e real
  percentual_diferenca NUMERIC, -- % de diferença
  taxa_bacen_referencia NUMERIC, -- Taxa BACEN no período
  diferenca_vs_bacen NUMERIC, -- Diferença vs taxa BACEN
  
  -- Status e classificação
  status_analise TEXT DEFAULT 'Pendente',
  tem_abusividade BOOLEAN DEFAULT false,
  grau_abusividade TEXT, -- 'Leve', 'Moderado', 'Grave', 'Muito Grave'
  
  -- Dados adicionais
  observacoes TEXT,
  ultima_analise_em TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT contratos_juros_cliente_fkey 
    FOREIGN KEY (cliente_id) REFERENCES public.clientes_juros(id) ON DELETE CASCADE,
  CONSTRAINT contratos_juros_instituicao_fkey 
    FOREIGN KEY (instituicao_id) REFERENCES public.instituicoes_financeiras(id) ON DELETE CASCADE
);

-- Criar tabela de análises detalhadas
CREATE TABLE IF NOT EXISTS public.analises_juros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos_juros(id) ON DELETE CASCADE,
  
  -- Dados da análise
  data_analise TIMESTAMPTZ NOT NULL DEFAULT now(),
  analista_id UUID REFERENCES auth.users(id),
  
  -- Cálculos realizados
  calculo_regra_3 JSONB, -- Armazena os 4 valores da regra de 3
  taxa_efetiva_mensal NUMERIC,
  taxa_efetiva_anual NUMERIC,
  custo_efetivo_total NUMERIC,
  
  -- Comparações
  taxa_mercado_periodo NUMERIC,
  diferenca_mercado NUMERIC,
  percentual_acima_mercado NUMERIC,
  
  -- Conclusões
  parecer TEXT,
  recomendacao TEXT,
  valor_cobrado_indevido NUMERIC, -- Valor que pode ser questionado
  
  -- Documentos e evidências
  documentos JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Criar tabela de histórico de parcelas (para análise detalhada)
CREATE TABLE IF NOT EXISTS public.parcelas_contrato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id UUID NOT NULL REFERENCES public.contratos_juros(id) ON DELETE CASCADE,
  
  numero_parcela INTEGER NOT NULL,
  data_vencimento DATE NOT NULL,
  valor_principal NUMERIC NOT NULL,
  valor_juros NUMERIC NOT NULL,
  valor_total NUMERIC NOT NULL,
  
  data_pagamento DATE,
  valor_pago NUMERIC,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT parcelas_contrato_unique UNIQUE (contrato_id, numero_parcela)
);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger para updated_at em clientes_juros
CREATE TRIGGER update_clientes_juros_updated_at
  BEFORE UPDATE ON public.clientes_juros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em instituicoes_financeiras
CREATE TRIGGER update_instituicoes_financeiras_updated_at
  BEFORE UPDATE ON public.instituicoes_financeiras
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em contratos_juros
CREATE TRIGGER update_contratos_juros_updated_at
  BEFORE UPDATE ON public.contratos_juros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em analises_juros
CREATE TRIGGER update_analises_juros_updated_at
  BEFORE UPDATE ON public.analises_juros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE public.clientes_juros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instituicoes_financeiras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos_juros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analises_juros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcelas_contrato ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes_juros
CREATE POLICY "Usuários autenticados podem gerenciar clientes juros"
  ON public.clientes_juros FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para instituicoes_financeiras
CREATE POLICY "Usuários autenticados podem gerenciar instituições"
  ON public.instituicoes_financeiras FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para contratos_juros
CREATE POLICY "Usuários autenticados podem gerenciar contratos juros"
  ON public.contratos_juros FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para analises_juros
CREATE POLICY "Usuários autenticados podem gerenciar análises"
  ON public.analises_juros FOR ALL
  USING (true)
  WITH CHECK (true);

-- Políticas para parcelas_contrato
CREATE POLICY "Usuários autenticados podem gerenciar parcelas"
  ON public.parcelas_contrato FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_contratos_juros_cliente ON public.contratos_juros(cliente_id);
CREATE INDEX IF NOT EXISTS idx_contratos_juros_instituicao ON public.contratos_juros(instituicao_id);
CREATE INDEX IF NOT EXISTS idx_contratos_juros_modalidade ON public.contratos_juros(modalidade_bacen_id);
CREATE INDEX IF NOT EXISTS idx_contratos_juros_status ON public.contratos_juros(status_analise);
CREATE INDEX IF NOT EXISTS idx_analises_juros_contrato ON public.analises_juros(contrato_id);
CREATE INDEX IF NOT EXISTS idx_parcelas_contrato ON public.parcelas_contrato(contrato_id);

-- ============================================================================
-- INSERIR DADOS INICIAIS
-- ============================================================================

-- Inserir algumas instituições financeiras comuns
INSERT INTO public.instituicoes_financeiras (nome, codigo_banco, cnpj) VALUES
  ('Banco do Brasil S.A.', '001', '00.000.000/0001-91'),
  ('Caixa Econômica Federal', '104', '00.360.305/0001-04'),
  ('Banco Bradesco S.A.', '237', '60.746.948/0001-12'),
  ('Banco Itaú S.A.', '341', '60.701.190/0001-04'),
  ('Banco Santander Brasil S.A.', '033', '90.400.888/0001-42')
ON CONFLICT DO NOTHING;