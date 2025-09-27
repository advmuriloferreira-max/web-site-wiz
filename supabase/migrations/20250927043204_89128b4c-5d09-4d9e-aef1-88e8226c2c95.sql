-- Limpar dados problemáticos no campo numero_contrato
UPDATE contratos 
SET numero_contrato = NULL 
WHERE numero_contrato = 'Chheque especial ' 
   OR numero_contrato = 'Chheque especial'
   OR TRIM(numero_contrato) = 'Chheque especial';