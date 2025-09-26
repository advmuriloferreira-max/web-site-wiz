-- Atualizar estagio_risco para todos os contratos existentes baseado nos dias_atraso
UPDATE public.contratos 
SET estagio_risco = CASE 
  WHEN dias_atraso <= 30 THEN 1
  WHEN dias_atraso <= 90 THEN 2
  ELSE 3
END
WHERE estagio_risco IS NULL OR estagio_risco = 1;