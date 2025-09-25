-- Tornar campo tipo_operacao opcional e adicionar constraint para tipo_operacao_bcb
ALTER TABLE contratos ALTER COLUMN tipo_operacao DROP NOT NULL;

-- Atualizar contratos existentes que não têm tipo_operacao_bcb
UPDATE contratos 
SET tipo_operacao_bcb = tipo_operacao 
WHERE tipo_operacao_bcb IS NULL AND tipo_operacao IS NOT NULL;