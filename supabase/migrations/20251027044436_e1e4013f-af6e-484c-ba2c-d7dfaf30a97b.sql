-- Adicionar constraint UNIQUE para permitir upsert na tabela series_temporais_bacen
ALTER TABLE public.series_temporais_bacen
ADD CONSTRAINT series_temporais_bacen_modalidade_data_unique 
UNIQUE (modalidade_id, data_referencia);

-- Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_series_temporais_modalidade_data 
ON public.series_temporais_bacen(modalidade_id, data_referencia);