-- Criar tabela analises_gestao_passivo
CREATE TABLE IF NOT EXISTS analises_gestao_passivo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  escritorio_id UUID NOT NULL,
  
  -- Dados do Contrato
  numero_contrato TEXT NOT NULL,
  banco_nome TEXT NOT NULL,
  banco_codigo_compe TEXT,
  banco_segmento TEXT CHECK (banco_segmento IN ('S1', 'S2', 'S3', 'S4', 'S5')),
  
  -- Tipo de Operação (Carteira BCB 352)
  carteira_bcb352 TEXT NOT NULL CHECK (carteira_bcb352 IN ('C1', 'C2', 'C3', 'C4', 'C5')),
  tipo_operacao TEXT NOT NULL,
  
  -- Valores Financeiros
  valor_original DECIMAL(15,2) NOT NULL,
  saldo_devedor_atual DECIMAL(15,2) NOT NULL,
  data_contratacao DATE NOT NULL,
  data_vencimento_original DATE,
  data_inadimplencia DATE NOT NULL,
  
  -- Cálculo de Atraso
  dias_atraso INTEGER NOT NULL DEFAULT 0,
  meses_atraso INTEGER NOT NULL DEFAULT 0,
  
  -- Provisão BCB 352 (Anexo I)
  percentual_provisao_bcb352 DECIMAL(5,4) NOT NULL,
  valor_provisao_bcb352 DECIMAL(15,2) NOT NULL,
  
  -- Proposta de Acordo (LÓGICA PREMIUM)
  valor_proposta_acordo DECIMAL(15,2),
  percentual_proposta_acordo DECIMAL(5,2),
  marco_provisionamento TEXT CHECK (marco_provisionamento IN ('50', '60', '70', '80', '90', '100')),
  momento_negociacao TEXT CHECK (momento_negociacao IN ('inicial', 'favoravel', 'muito_favoravel', 'otimo', 'premium', 'total')),
  
  -- Status de Default (Art. 3º CMN 4.966)
  em_default BOOLEAN DEFAULT FALSE,
  motivo_default TEXT[],
  
  -- Reestruturação/Renegociação
  foi_reestruturado BOOLEAN DEFAULT FALSE,
  data_reestruturacao DATE,
  provisao_adicional_reestruturacao DECIMAL(15,2),
  
  -- Garantias
  possui_garantias BOOLEAN DEFAULT FALSE,
  valor_garantias DECIMAL(15,2),
  tipo_garantias TEXT[],
  
  -- Negociação
  status_negociacao TEXT DEFAULT 'pendente' CHECK (status_negociacao IN ('pendente', 'proposta_enviada', 'em_analise', 'contraproposta', 'aceita', 'recusada', 'acordo_fechado')),
  data_proposta_enviada DATE,
  data_resposta_banco DATE,
  observacoes_negociacao TEXT,
  
  -- Análise e Recomendações
  fundamentacao_juridica TEXT,
  estrategia_negociacao TEXT,
  observacoes TEXT,
  
  -- Metadados
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_analises_gestao_usuario ON analises_gestao_passivo(usuario_id);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_cliente ON analises_gestao_passivo(cliente_id);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_banco ON analises_gestao_passivo(banco_nome);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_carteira ON analises_gestao_passivo(carteira_bcb352);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_default ON analises_gestao_passivo(em_default);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_marco ON analises_gestao_passivo(marco_provisionamento);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_status ON analises_gestao_passivo(status_negociacao);
CREATE INDEX IF NOT EXISTS idx_analises_gestao_escritorio ON analises_gestao_passivo(escritorio_id);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_analises_gestao_passivo_updated_at
BEFORE UPDATE ON analises_gestao_passivo
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Trigger para setar escritorio_id automaticamente
CREATE TRIGGER set_analises_gestao_passivo_escritorio_id
BEFORE INSERT ON analises_gestao_passivo
FOR EACH ROW
EXECUTE FUNCTION set_escritorio_id();

-- Habilitar RLS
ALTER TABLE analises_gestao_passivo ENABLE ROW LEVEL SECURITY;

-- Policy para isolamento por escritório
CREATE POLICY "Análises gestão passivo isoladas por escritório"
ON analises_gestao_passivo
FOR ALL
TO authenticated
USING (escritorio_id = get_user_escritorio_id())
WITH CHECK (escritorio_id = get_user_escritorio_id());