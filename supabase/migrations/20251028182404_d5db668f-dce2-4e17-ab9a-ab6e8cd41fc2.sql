-- Criar tabela bancos_brasil
CREATE TABLE IF NOT EXISTS bancos_brasil (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo_compe TEXT UNIQUE NOT NULL,
  nome_completo TEXT NOT NULL,
  nome_curto TEXT NOT NULL,
  segmento_bcb TEXT CHECK (segmento_bcb IN ('S1', 'S2', 'S3', 'S4', 'S5')),
  tipo_instituicao TEXT,
  controle TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bancos_segmento ON bancos_brasil(segmento_bcb);
CREATE INDEX IF NOT EXISTS idx_bancos_codigo ON bancos_brasil(codigo_compe);
CREATE INDEX IF NOT EXISTS idx_bancos_ativo ON bancos_brasil(ativo);

-- Habilitar RLS
ALTER TABLE bancos_brasil ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (tabela de referência)
CREATE POLICY "Acesso público leitura bancos"
ON bancos_brasil
FOR SELECT
TO authenticated
USING (true);

-- Policy para administradores gerenciarem
CREATE POLICY "Admins podem gerenciar bancos"
ON bancos_brasil
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- SEGMENTO S1 - Bancos Sistêmicos (≥ 10% do PIB)
INSERT INTO bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, tipo_instituicao, controle) VALUES
('001', 'Banco do Brasil S.A.', 'BB', 'S1', 'Banco Múltiplo', 'Público Federal'),
('237', 'Banco Bradesco S.A.', 'Bradesco', 'S1', 'Banco Múltiplo', 'Privado Nacional'),
('208', 'Banco BTG Pactual S.A.', 'BTG Pactual', 'S1', 'Banco Múltiplo', 'Privado Nacional'),
('104', 'Caixa Econômica Federal', 'CEF', 'S1', 'Banco Múltiplo', 'Público Federal'),
('341', 'Itaú Unibanco S.A.', 'Itaú', 'S1', 'Banco Múltiplo', 'Privado Nacional'),
('033', 'Banco Santander Brasil S.A.', 'Santander', 'S1', 'Banco Múltiplo', 'Privado Estrangeiro');

-- SEGMENTO S2 - Bancos Grandes (1% a 10% do PIB)
INSERT INTO bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, tipo_instituicao, controle) VALUES
('422', 'Banco Safra S.A.', 'Safra', 'S2', 'Banco Múltiplo', 'Privado Nacional'),
('655', 'Banco Votorantim S.A.', 'Votorantim', 'S2', 'Banco Múltiplo', 'Privado Nacional'),
('041', 'Banco do Estado do Rio Grande do Sul S.A.', 'Banrisul', 'S2', 'Banco Múltiplo', 'Público Estadual'),
('756', 'Banco Cooperativo do Brasil S.A.', 'Sicoob', 'S2', 'Banco Cooperativo', 'Cooperativa'),
('748', 'Banco Cooperativo Sicredi S.A.', 'Sicredi', 'S2', 'Banco Cooperativo', 'Cooperativa'),
('752', 'Banco BNP Paribas Brasil S.A.', 'BNP Paribas', 'S2', 'Banco Múltiplo', 'Privado Estrangeiro'),
('745', 'Banco Citibank S.A.', 'Citibank', 'S2', 'Banco Múltiplo', 'Privado Estrangeiro'),
('004', 'Banco do Nordeste do Brasil S.A.', 'BNB', 'S2', 'Banco Múltiplo', 'Público Federal'),
('003', 'Banco da Amazônia S.A.', 'BASA', 'S2', 'Banco Múltiplo', 'Público Federal'),
('336', 'Banco C6 S.A.', 'C6', 'S2', 'Banco Múltiplo', 'Privado Nacional'),
('218', 'Banco BS2 S.A.', 'BS2', 'S2', 'Banco Múltiplo', 'Privado Nacional'),
('389', 'Banco Mercantil do Brasil S.A.', 'Mercantil', 'S2', 'Banco Múltiplo', 'Privado Nacional');

-- SEGMENTO S3 - Bancos Médios (0,1% a 1% do PIB)
INSERT INTO bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, tipo_instituicao, controle) VALUES
('077', 'Banco Inter S.A.', 'Inter', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('623', 'Banco Pan S.A.', 'Pan', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('318', 'Banco BMG S.A.', 'BMG', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('212', 'Banco Original S.A.', 'Original', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('707', 'Banco Daycoval S.A.', 'Daycoval', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('643', 'Banco Pine S.A.', 'Pine', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('637', 'Banco Sofisa S.A.', 'Sofisa', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('604', 'Banco Industrial do Brasil S.A.', 'BIB', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('246', 'Banco ABC Brasil S.A.', 'ABC Brasil', 'S3', 'Banco Múltiplo', 'Privado Estrangeiro'),
('224', 'Banco Fibra S.A.', 'Fibra', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('633', 'Banco Rendimento S.A.', 'Rendimento', 'S3', 'Banco Múltiplo', 'Privado Nacional'),
('746', 'Banco Modal S.A.', 'Modal', 'S3', 'Banco Múltiplo', 'Privado Nacional');