-- Remover constraint de unicidade do codigo_sgs
-- Isso permite que várias modalidades usem o mesmo código SGS do BACEN
ALTER TABLE modalidades_bacen_juros 
DROP CONSTRAINT IF EXISTS modalidades_bacen_juros_codigo_sgs_key;

-- Atualizar código SGS correto para Cartão de Crédito Parcelado - PJ
UPDATE modalidades_bacen_juros 
SET codigo_sgs = '25456'
WHERE id = '32c50cc8-d2b8-4afc-9ba2-339d936eb965';