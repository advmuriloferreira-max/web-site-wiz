-- Adicionar campos de reestruturação na tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN is_reestruturado boolean DEFAULT false,
ADD COLUMN data_reestruturacao timestamp with time zone;