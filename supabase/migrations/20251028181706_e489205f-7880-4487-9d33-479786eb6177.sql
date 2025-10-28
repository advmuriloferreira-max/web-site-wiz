-- Criar tabela de provisão BCB 352 (se não existir)
CREATE TABLE IF NOT EXISTS tabela_provisao_bcb352 (
  id SERIAL PRIMARY KEY,
  meses_atraso_min INTEGER NOT NULL,
  meses_atraso_max INTEGER,
  carteira TEXT NOT NULL CHECK (carteira IN ('C1', 'C2', 'C3', 'C4', 'C5')),
  percentual_provisao DECIMAL(5,4) NOT NULL,
  descricao TEXT,
  UNIQUE(meses_atraso_min, carteira)
);

CREATE INDEX IF NOT EXISTS idx_provisao_carteira ON tabela_provisao_bcb352(carteira);
CREATE INDEX IF NOT EXISTS idx_provisao_meses ON tabela_provisao_bcb352(meses_atraso_min);

-- Habilitar RLS
ALTER TABLE tabela_provisao_bcb352 ENABLE ROW LEVEL SECURITY;

-- Policy para leitura pública (tabela de referência)
CREATE POLICY "Acesso público leitura provisão BCB 352"
ON tabela_provisao_bcb352
FOR SELECT
TO authenticated
USING (true);

-- Policy para administradores gerenciarem
CREATE POLICY "Admins podem gerenciar provisão BCB 352"
ON tabela_provisao_bcb352
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Limpar dados anteriores (se houver)
DELETE FROM tabela_provisao_bcb352;

-- CARTEIRA C1 - Operações de crédito de varejo não consignado
INSERT INTO tabela_provisao_bcb352 (meses_atraso_min, meses_atraso_max, carteira, percentual_provisao, descricao) VALUES
(0, 0, 'C1', 0.0140, 'Menor que 1 mês'),
(1, 1, 'C1', 0.0350, 'Igual ou maior que 1 e menor que 2 meses'),
(2, 2, 'C1', 0.0450, 'Igual ou maior que 2 e menor que 3 meses'),
(3, 3, 'C1', 0.0500, 'Igual ou maior que 3 e menor que 4 meses'),
(4, 4, 'C1', 0.0550, 'Igual ou maior que 4 e menor que 5 meses'),
(5, 5, 'C1', 0.0600, 'Igual ou maior que 5 e menor que 6 meses'),
(6, 6, 'C1', 0.0650, 'Igual ou maior que 6 e menor que 7 meses'),
(7, 7, 'C1', 0.0700, 'Igual ou maior que 7 e menor que 8 meses'),
(8, 8, 'C1', 0.0750, 'Igual ou maior que 8 e menor que 9 meses'),
(9, 9, 'C1', 0.0800, 'Igual ou maior que 9 e menor que 10 meses'),
(10, 10, 'C1', 0.0850, 'Igual ou maior que 10 e menor que 11 meses'),
(11, 11, 'C1', 0.0900, 'Igual ou maior que 11 e menor que 12 meses'),
(12, 12, 'C1', 0.0950, 'Igual ou maior que 12 e menor que 13 meses'),
(13, 13, 'C1', 0.1000, 'Igual ou maior que 13 e menor que 14 meses'),
(14, 14, 'C1', 0.1500, 'Igual ou maior que 14 e menor que 15 meses'),
(15, 15, 'C1', 0.2500, 'Igual ou maior que 15 e menor que 16 meses'),
(16, 16, 'C1', 0.4000, 'Igual ou maior que 16 e menor que 17 meses'),
(17, 17, 'C1', 0.5500, 'Igual ou maior que 17 e menor que 18 meses'),
(18, 18, 'C1', 0.6500, 'Igual ou maior que 18 e menor que 19 meses'),
(19, 19, 'C1', 0.7300, 'Igual ou maior que 19 e menor que 20 meses'),
(20, 20, 'C1', 0.8000, 'Igual ou maior que 20 e menor que 21 meses'),
(21, 21, 'C1', 0.8500, 'Igual ou maior que 21 e menor que 22 meses'),
(22, NULL, 'C1', 1.0000, 'Igual ou maior que 22 meses');

-- CARTEIRA C2 - Operações de crédito de varejo consignado
INSERT INTO tabela_provisao_bcb352 (meses_atraso_min, meses_atraso_max, carteira, percentual_provisao, descricao) VALUES
(0, 0, 'C2', 0.0140, 'Menor que 1 mês'),
(1, 1, 'C2', 0.0350, 'Igual ou maior que 1 e menor que 2 meses'),
(2, 2, 'C2', 0.0600, 'Igual ou maior que 2 e menor que 3 meses'),
(3, 3, 'C2', 0.1700, 'Igual ou maior que 3 e menor que 4 meses'),
(4, 4, 'C2', 0.3000, 'Igual ou maior que 4 e menor que 5 meses'),
(5, 5, 'C2', 0.4200, 'Igual ou maior que 5 e menor que 6 meses'),
(6, 6, 'C2', 0.5200, 'Igual ou maior que 6 e menor que 7 meses'),
(7, 7, 'C2', 0.6000, 'Igual ou maior que 7 e menor que 8 meses'),
(8, 8, 'C2', 0.6600, 'Igual ou maior que 8 e menor que 9 meses'),
(9, 9, 'C2', 0.7100, 'Igual ou maior que 9 e menor que 10 meses'),
(10, 10, 'C2', 0.7500, 'Igual ou maior que 10 e menor que 11 meses'),
(11, 11, 'C2', 0.7800, 'Igual ou maior que 11 e menor que 12 meses'),
(12, 12, 'C2', 0.8000, 'Igual ou maior que 12 e menor que 13 meses'),
(13, 21, 'C2', 0.8100, 'Igual ou maior que 13 e menor que 22 meses'),
(22, NULL, 'C2', 1.0000, 'Igual ou maior que 22 meses');

-- CARTEIRA C3 - Operações de crédito de atacado
INSERT INTO tabela_provisao_bcb352 (meses_atraso_min, meses_atraso_max, carteira, percentual_provisao, descricao) VALUES
(0, 0, 'C3', 0.0190, 'Menor que 1 mês'),
(1, 1, 'C3', 0.0350, 'Igual ou maior que 1 e menor que 2 meses'),
(2, 2, 'C3', 0.1300, 'Igual ou maior que 2 e menor que 3 meses'),
(3, 3, 'C3', 0.3200, 'Igual ou maior que 3 e menor que 4 meses'),
(4, 4, 'C3', 0.4500, 'Igual ou maior que 4 e menor que 5 meses'),
(5, 5, 'C3', 0.5600, 'Igual ou maior que 5 e menor que 6 meses'),
(6, 6, 'C3', 0.6500, 'Igual ou maior que 6 e menor que 7 meses'),
(7, 7, 'C3', 0.7200, 'Igual ou maior que 7 e menor que 8 meses'),
(8, 8, 'C3', 0.7800, 'Igual ou maior que 8 e menor que 9 meses'),
(9, 9, 'C3', 0.8300, 'Igual ou maior que 9 e menor que 10 meses'),
(10, 10, 'C3', 0.8700, 'Igual ou maior que 10 e menor que 11 meses'),
(11, 11, 'C3', 0.9000, 'Igual ou maior que 11 e menor que 12 meses'),
(12, 12, 'C3', 0.9200, 'Igual ou maior que 12 e menor que 13 meses'),
(13, 13, 'C3', 0.9400, 'Igual ou maior que 13 e menor que 14 meses'),
(14, 14, 'C3', 0.9500, 'Igual ou maior que 14 e menor que 15 meses'),
(15, 15, 'C3', 0.9600, 'Igual ou maior que 15 e menor que 16 meses'),
(16, 16, 'C3', 0.9700, 'Igual ou maior que 16 e menor que 17 meses'),
(17, 17, 'C3', 0.9800, 'Igual ou maior que 17 e menor que 18 meses'),
(18, 18, 'C3', 0.9900, 'Igual ou maior que 18 e menor que 19 meses'),
(19, NULL, 'C3', 1.0000, 'Igual ou maior que 19 meses');

-- CARTEIRA C4 - Operações de arrendamento mercantil
INSERT INTO tabela_provisao_bcb352 (meses_atraso_min, meses_atraso_max, carteira, percentual_provisao, descricao) VALUES
(0, 0, 'C4', 0.0190, 'Menor que 1 mês'),
(1, 1, 'C4', 0.0350, 'Igual ou maior que 1 e menor que 2 meses'),
(2, 2, 'C4', 0.1300, 'Igual ou maior que 2 e menor que 3 meses'),
(3, 3, 'C4', 0.3200, 'Igual ou maior que 3 e menor que 4 meses'),
(4, 4, 'C4', 0.3500, 'Igual ou maior que 4 e menor que 5 meses'),
(5, 5, 'C4', 0.3800, 'Igual ou maior que 5 e menor que 6 meses'),
(6, 6, 'C4', 0.4100, 'Igual ou maior que 6 e menor que 7 meses'),
(7, 7, 'C4', 0.4400, 'Igual ou maior que 7 e menor que 8 meses'),
(8, 8, 'C4', 0.4700, 'Igual ou maior que 8 e menor que 9 meses'),
(9, 9, 'C4', 0.5000, 'Igual ou maior que 9 e menor que 10 meses'),
(10, 10, 'C4', 0.5300, 'Igual ou maior que 10 e menor que 11 meses'),
(11, 11, 'C4', 0.5600, 'Igual ou maior que 11 e menor que 12 meses'),
(12, 12, 'C4', 0.5900, 'Igual ou maior que 12 e menor que 13 meses'),
(13, 13, 'C4', 0.6200, 'Igual ou maior que 13 e menor que 14 meses'),
(14, 14, 'C4', 0.6500, 'Igual ou maior que 14 e menor que 15 meses'),
(15, 15, 'C4', 0.6800, 'Igual ou maior que 15 e menor que 16 meses'),
(16, 16, 'C4', 0.7100, 'Igual ou maior que 16 e menor que 17 meses'),
(17, 17, 'C4', 0.7400, 'Igual ou maior que 17 e menor que 18 meses'),
(18, 18, 'C4', 0.7700, 'Igual ou maior que 18 e menor que 19 meses'),
(19, 19, 'C4', 0.8000, 'Igual ou maior que 19 e menor que 20 meses'),
(20, 20, 'C4', 0.8300, 'Igual ou maior que 20 e menor que 21 meses'),
(21, 21, 'C4', 0.8600, 'Igual ou maior que 21 e menor que 22 meses'),
(22, NULL, 'C4', 1.0000, 'Igual ou maior que 22 meses');

-- CARTEIRA C5 - Outros ativos financeiros
INSERT INTO tabela_provisao_bcb352 (meses_atraso_min, meses_atraso_max, carteira, percentual_provisao, descricao) VALUES
(0, 0, 'C5', 0.0190, 'Menor que 1 mês'),
(1, 1, 'C5', 0.0750, 'Igual ou maior que 1 e menor que 2 meses'),
(2, 2, 'C5', 0.1500, 'Igual ou maior que 2 e menor que 3 meses'),
(3, 3, 'C5', 0.3800, 'Igual ou maior que 3 e menor que 4 meses'),
(4, 4, 'C5', 0.5000, 'Igual ou maior que 4 e menor que 5 meses'),
(5, 5, 'C5', 0.6000, 'Igual ou maior que 5 e menor que 6 meses'),
(6, 6, 'C5', 0.6800, 'Igual ou maior que 6 e menor que 7 meses'),
(7, 7, 'C5', 0.7400, 'Igual ou maior que 7 e menor que 8 meses'),
(8, 8, 'C5', 0.7900, 'Igual ou maior que 8 e menor que 9 meses'),
(9, 9, 'C5', 0.8300, 'Igual ou maior que 9 e menor que 10 meses'),
(10, 10, 'C5', 0.8600, 'Igual ou maior que 10 e menor que 11 meses'),
(11, 11, 'C5', 0.8900, 'Igual ou maior que 11 e menor que 12 meses'),
(12, 12, 'C5', 0.9100, 'Igual ou maior que 12 e menor que 13 meses'),
(13, 13, 'C5', 0.9300, 'Igual ou maior que 13 e menor que 14 meses'),
(14, 14, 'C5', 0.9400, 'Igual ou maior que 14 e menor que 15 meses'),
(15, 15, 'C5', 0.9500, 'Igual ou maior que 15 e menor que 16 meses'),
(16, 16, 'C5', 0.9600, 'Igual ou maior que 16 e menor que 17 meses'),
(17, 17, 'C5', 0.9700, 'Igual ou maior que 17 e menor que 18 meses'),
(18, 18, 'C5', 0.9800, 'Igual ou maior que 18 e menor que 19 meses'),
(19, 19, 'C5', 0.9900, 'Igual ou maior que 19 e menor que 20 meses'),
(20, NULL, 'C5', 1.0000, 'Igual ou maior que 20 meses');