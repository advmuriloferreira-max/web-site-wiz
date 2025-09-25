-- Corrigir as tabelas de provisão com os percentuais corretos das resoluções BCB

-- Limpar e recriar tabela de perda esperada (até 90 dias) - Anexo II
DELETE FROM provisao_perda_esperada;

INSERT INTO provisao_perda_esperada (periodo_atraso, prazo_inicial, prazo_final, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('De zero a 14 dias', 0, 14, 1.4, 1.4, 1.9, 1.9, 1.9),
('De 15 a 30 dias', 15, 30, 3.5, 3.5, 3.5, 3.5, 7.5),
('De 31 a 60 dias', 31, 60, 4.5, 6.0, 13.0, 13.0, 15.0),
('De 61 a 90 dias', 61, 90, 5.0, 17.0, 32.0, 32.0, 38.0);

-- Limpar e recriar tabela de perdas incorridas (acima de 90 dias) - Anexo I
DELETE FROM provisao_perdas_incorridas;

INSERT INTO provisao_perdas_incorridas (criterio, prazo_inicial, prazo_final, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('Menor que um mês', 0, 0.99, 5.5, 30.0, 45.0, 35.0, 50.0),
('Igual ou maior que 1 e menor que 2 meses', 1, 1.99, 10.0, 33.4, 48.7, 39.5, 53.4),
('Igual ou maior que 2 e menor que 3 meses', 2, 2.99, 14.5, 36.8, 52.4, 44.0, 56.8),
('Igual ou maior que 3 e menor que 4 meses', 3, 3.99, 19.0, 40.2, 56.1, 48.5, 60.2),
('Igual ou maior que 4 e menor que 5 meses', 4, 4.99, 23.5, 43.6, 59.8, 53.0, 63.6),
('Igual ou maior que 5 e menor que 6 meses', 5, 5.99, 28.0, 47.0, 63.5, 57.5, 67.0),
('Igual ou maior que 6 e menor que 7 meses', 6, 6.99, 32.5, 50.4, 67.2, 62.0, 70.4),
('Igual ou maior que 7 e menor que 8 meses', 7, 7.99, 37.0, 53.8, 70.9, 66.5, 73.8),
('Igual ou maior que 8 e menor que 9 meses', 8, 8.99, 41.5, 57.2, 74.6, 71.0, 77.2),
('Igual ou maior que 9 e menor que 10 meses', 9, 9.99, 46.0, 60.6, 78.3, 75.5, 80.6),
('Igual ou maior que 10 e menor que 11 meses', 10, 10.99, 50.5, 64.0, 82.0, 80.0, 84.0),
('Igual ou maior que 11 e menor que 12 meses', 11, 11.99, 55.0, 67.4, 85.7, 84.5, 87.4),
('Igual ou maior que 12 e menor que 13 meses', 12, 12.99, 59.5, 70.8, 89.4, 89.0, 90.8),
('Igual ou maior que 13 e menor que 14 meses', 13, 13.99, 64.0, 74.2, 93.1, 93.5, 94.2),
('Igual ou maior que 14 e menor que 15 meses', 14, 14.99, 68.5, 77.6, 96.8, 98.0, 97.6),
('Igual ou maior que 15 e menor que 16 meses', 15, 15.99, 73.0, 81.0, 100.0, 100.0, 100.0),
('Igual ou maior que 16 e menor que 17 meses', 16, 16.99, 77.5, 84.4, 100.0, 100.0, 100.0),
('Igual ou maior que 17 e menor que 18 meses', 17, 17.99, 82.0, 87.8, 100.0, 100.0, 100.0),
('Igual ou maior que 18 e menor que 19 meses', 18, 18.99, 86.5, 91.2, 100.0, 100.0, 100.0),
('Igual ou maior que 19 e menor que 20 meses', 19, 19.99, 91.0, 94.6, 100.0, 100.0, 100.0),
('Igual ou maior que 20 e menor que 21 meses', 20, 20.99, 95.5, 98.0, 100.0, 100.0, 100.0),
('Igual ou maior que 21 meses', 21, 999, 100.0, 100.0, 100.0, 100.0, 100.0);

-- Adicionar campo para classificação por tipo de operação na tabela contratos
ALTER TABLE contratos ADD COLUMN IF NOT EXISTS tipo_operacao_bcb text;

-- Criar tabela de tipos de operação para vincular com classificações C1-C5
CREATE TABLE IF NOT EXISTS tipos_operacao_bcb (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    nome text NOT NULL,
    descricao text,
    carteira text NOT NULL CHECK (carteira IN ('C1', 'C2', 'C3', 'C4', 'C5')),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Inserir os tipos de operação baseados no Art. 81 da Resolução BCB 352/2023
INSERT INTO tipos_operacao_bcb (nome, descricao, carteira) VALUES
-- Carteira C1
('Crédito com Alienação Fiduciária de Imóveis', 'Créditos garantidos por alienação fiduciária de imóveis', 'C1'),
('Crédito com Garantia da União', 'Créditos com garantia fidejussória da União ou organismos multilaterais', 'C1'),

-- Carteira C2  
('Arrendamento Mercantil', 'Créditos de arrendamento mercantil (Lei 6.099/1974)', 'C2'),
('Crédito Hipotecário Residencial', 'Créditos garantidos por hipoteca de primeiro grau de imóveis residenciais', 'C2'),
('Crédito com Penhor', 'Créditos garantidos por penhor de bens móveis ou imóveis', 'C2'),
('Crédito com Alienação Fiduciária de Móveis', 'Créditos garantidos por alienação fiduciária de bens móveis', 'C2'),
('Crédito Garantido por Depósitos', 'Créditos garantidos por depósitos à vista, a prazo ou poupança', 'C2'),
('Crédito com Garantia de IF', 'Créditos com garantia fidejussória de instituições financeiras', 'C2'),
('Crédito com Seguro de Crédito', 'Créditos com cobertura de seguro de crédito por entidade não relacionada', 'C2'),

-- Carteira C3
('Desconto de Recebíveis', 'Créditos de desconto de direitos creditórios e recebíveis comerciais', 'C3'),
('Crédito com Cessão Fiduciária', 'Créditos garantidos por cessão fiduciária ou caução de direitos creditórios', 'C3'),
('Outros com Garantia Real/Fidejussória', 'Outros créditos com cobertura de seguro, garantia real ou fidejussória', 'C3'),

-- Carteira C4
('Capital de Giro sem Garantia', 'Créditos para capital de giro sem garantias ou colaterais', 'C4'),
('Adiantamento sobre Câmbio', 'Adiantamentos sobre contratos de câmbio e cambiais', 'C4'),
('Debêntures e Títulos Privados', 'Debêntures e títulos emitidos por empresas privadas', 'C4'),
('Crédito Rural para Investimento', 'Operações de crédito rural sem garantias destinadas a investimentos', 'C4'),

-- Carteira C5
('Crédito Pessoal', 'Operações de crédito pessoal com ou sem consignação', 'C5'),
('Crédito Direto ao Consumidor', 'Crédito direto ao consumidor sem garantias', 'C5'),
('Crédito Rotativo', 'Crédito na modalidade rotativo sem garantias', 'C5'),
('Crédito Rural sem Garantia', 'Crédito rural não abrangido por outras categorias', 'C5'),
('Outros sem Garantia', 'Créditos sem garantias não abrangidos pelas demais categorias', 'C5'),
('Operações Mercantis', 'Créditos de operações mercantis e outras com características de concessão de crédito', 'C5');

-- Habilitar RLS na nova tabela
ALTER TABLE tipos_operacao_bcb ENABLE ROW LEVEL SECURITY;

-- Criar política de acesso público
CREATE POLICY "Acesso público aos tipos de operação BCB" 
ON tipos_operacao_bcb 
FOR ALL 
USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_tipos_operacao_bcb_updated_at
    BEFORE UPDATE ON tipos_operacao_bcb
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();