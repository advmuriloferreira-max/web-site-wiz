-- =====================================================
-- INTELLIBANK - LIMPEZA FORÇADA E COMPLETA
-- Remove ABSOLUTAMENTE TUDO de gestão de passivo
-- =====================================================

-- Drop todas as policies RLS primeiro
DROP POLICY IF EXISTS "Leitura pública bancos" ON public.bancos_brasil;
DROP POLICY IF EXISTS "Leitura pública tipos operação" ON public.tipos_operacao_carteira;
DROP POLICY IF EXISTS "Leitura pública provisão anexo 1" ON public.provisao_bcb352_anexo1;
DROP POLICY IF EXISTS "Leitura pública provisão anexo 2" ON public.provisao_bcb352_anexo2;
DROP POLICY IF EXISTS "Usuário vê suas análises" ON public.analises_gestao_passivo;
DROP POLICY IF EXISTS "Usuário cria suas análises" ON public.analises_gestao_passivo;
DROP POLICY IF EXISTS "Usuário atualiza suas análises" ON public.analises_gestao_passivo;
DROP POLICY IF EXISTS "Usuário deleta suas análises" ON public.analises_gestao_passivo;
DROP POLICY IF EXISTS "Acesso público leitura bancos" ON public.bancos_brasil;
DROP POLICY IF EXISTS "Admins podem gerenciar bancos" ON public.bancos_brasil;
DROP POLICY IF EXISTS "Análises gestão passivo isoladas por escritório" ON public.analises_gestao_passivo;

-- Drop todos os índices
DROP INDEX IF EXISTS public.idx_analises_usuario;
DROP INDEX IF EXISTS public.idx_analises_banco;
DROP INDEX IF EXISTS public.idx_analises_carteira;
DROP INDEX IF EXISTS public.idx_analises_estagio;
DROP INDEX IF EXISTS public.idx_analises_marco;
DROP INDEX IF EXISTS public.idx_bancos_compe;
DROP INDEX IF EXISTS public.idx_bancos_segmento;
DROP INDEX IF EXISTS public.idx_tipos_carteira;

-- Remover tabelas antigas (CASCADE para remover dependências)
DROP TABLE IF EXISTS public.provisao_bcb352_anexo1 CASCADE;
DROP TABLE IF EXISTS public.provisao_bcb352_anexo2 CASCADE;
DROP TABLE IF EXISTS public.analises_gestao_passivo CASCADE;
DROP TABLE IF EXISTS public.tipos_operacao_carteira CASCADE;
DROP TABLE IF EXISTS public.bancos_brasil CASCADE;
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