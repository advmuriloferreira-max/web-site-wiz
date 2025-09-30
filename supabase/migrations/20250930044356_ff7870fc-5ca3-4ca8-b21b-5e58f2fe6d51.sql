-- Adicionar constraint única para evitar duplicatas nas séries temporais
ALTER TABLE public.series_temporais_bacen 
ADD CONSTRAINT series_temporais_bacen_modalidade_mes_ano_key 
UNIQUE (modalidade_id, mes, ano);