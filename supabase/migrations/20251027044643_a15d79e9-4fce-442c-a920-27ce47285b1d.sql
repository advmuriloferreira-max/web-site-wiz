-- Remover a constraint que limita o ano a >= 2011
-- As séries BACEN têm dados históricos desde 1994
ALTER TABLE public.series_temporais_bacen
DROP CONSTRAINT IF EXISTS series_temporais_bacen_ano_check;

-- Adicionar nova constraint que aceita anos desde 1990 (cobrindo todo histórico BACEN)
ALTER TABLE public.series_temporais_bacen
ADD CONSTRAINT series_temporais_bacen_ano_check CHECK (ano >= 1990 AND ano <= 2100);