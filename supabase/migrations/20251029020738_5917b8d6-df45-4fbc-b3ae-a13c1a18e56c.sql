-- =====================================================
-- INTELLIBANK - LIMPEZA TOTAL GESTÃO DE PASSIVO
-- Remove TODAS as implementações antigas
-- =====================================================

-- Remover tabelas antigas (todas as variações possíveis)
DROP TABLE IF EXISTS public.provisao_bcb352_anexo1 CASCADE;
DROP TABLE IF EXISTS public.provisao_bcb352_anexo2 CASCADE;
DROP TABLE IF EXISTS public.analises_gestao_passivo CASCADE;
DROP TABLE IF EXISTS public.bancos_brasil CASCADE;
DROP TABLE IF EXISTS public.tipos_operacao_carteira CASCADE;
DROP TABLE IF EXISTS public.gestao_passivo CASCADE;
DROP TABLE IF EXISTS public.analise_passivo CASCADE;
DROP TABLE IF EXISTS public.provisao_bancaria CASCADE;
DROP TABLE IF EXISTS public.calculo_provisao CASCADE;

-- Remover views antigas (se existirem)
DROP VIEW IF EXISTS public.view_gestao_passivo CASCADE;
DROP VIEW IF EXISTS public.view_provisao CASCADE;

-- Remover functions antigas (se existirem)
DROP FUNCTION IF EXISTS public.calcular_provisao CASCADE;
DROP FUNCTION IF EXISTS public.analisar_contrato CASCADE;