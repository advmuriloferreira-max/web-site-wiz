-- ====================================================================
-- CORREÇÃO DE SEGURANÇA: View com SECURITY INVOKER
-- ====================================================================

-- Recriar view com SECURITY INVOKER para usar permissões do usuário
CREATE OR REPLACE VIEW public.v_dividas_superendividamento 
WITH (security_invoker = true) AS
SELECT 
  ds.id,
  ds.escritorio_id,
  NULL::uuid as analise_superendividamento_id,
  NULL::uuid as contrato_id,
  ds.credor,
  ds.tipo_divida,
  ds.valor_atual as valor_total_divida,
  ds.parcela_mensal_atual,
  NULL::integer as numero_parcelas_restantes,
  ds.created_at,
  ds.escritorio_id as escritorio_id_original,
  'antiga'::text as fonte
FROM public.dividas_superendividamento ds

UNION ALL

SELECT 
  da.id,
  da.escritorio_id,
  da.analise_superendividamento_id,
  da.contrato_id,
  da.credor,
  da.tipo_divida,
  da.valor_total_divida,
  da.parcela_mensal_atual,
  da.numero_parcelas_restantes,
  da.created_at,
  da.escritorio_id,
  'nova'::text as fonte
FROM public.dividas_analise_super da;