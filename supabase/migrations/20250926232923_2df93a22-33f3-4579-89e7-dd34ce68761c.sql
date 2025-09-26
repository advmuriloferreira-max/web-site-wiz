-- Adicionar campo estagio_risco na tabela contratos
ALTER TABLE public.contratos 
ADD COLUMN estagio_risco integer DEFAULT 1;