-- ====================================================================
-- MIGRAÇÃO DE CONTRATOS (VERSÃO CORRIGIDA)
-- ====================================================================

-- Migrar contratos de provisionamento
INSERT INTO public.contratos (
  id,
  escritorio_id,
  cliente_id,
  banco_id,
  numero_contrato,
  tipo_operacao,
  valor_contrato,
  valor_financiado,
  valor_parcela,
  numero_parcelas,
  data_assinatura,
  data_primeiro_vencimento,
  data_ultimo_pagamento,
  status,
  observacoes,
  created_at,
  updated_at
)
SELECT 
  cp.id,
  cp.escritorio_id,
  cp.cliente_id,
  cp.banco_id,
  cp.numero_contrato,
  cp.tipo_operacao,
  cp.valor_divida as valor_contrato,
  cp.saldo_contabil as valor_financiado,
  cp.valor_parcela,
  cp.numero_parcelas,
  cp.data_entrada as data_assinatura,
  cp.data_vencimento as data_primeiro_vencimento,
  cp.data_ultimo_pagamento,
  COALESCE(cp.situacao, 'ativo') as status,
  cp.observacoes,
  cp.created_at,
  cp.updated_at
FROM public.contratos_provisao cp
WHERE NOT EXISTS (
  SELECT 1 FROM public.contratos WHERE contratos.id = cp.id
)
ON CONFLICT (id) DO NOTHING;

-- Migrar contratos de juros (CAMPOS CORRIGIDOS)
INSERT INTO public.contratos (
  id,
  escritorio_id,
  cliente_id,
  banco_id,
  numero_contrato,
  tipo_operacao,
  modalidade_bacen_id,
  valor_financiado,
  valor_parcela,
  numero_parcelas,
  taxa_juros_contratual,
  data_assinatura,
  status,
  observacoes,
  created_at,
  updated_at
)
SELECT 
  cj.id,
  cj.escritorio_id,
  cj.cliente_id,
  cj.instituicao_id as banco_id,  -- CORRIGIDO: usar instituicao_id
  cj.numero_contrato,
  cj.tipo_operacao,
  cj.modalidade_bacen_id,
  cj.valor_financiado,
  cj.valor_parcela,
  cj.numero_parcelas,
  cj.taxa_juros_contratual,
  cj.data_contratacao as data_assinatura,  -- CORRIGIDO: usar data_contratacao
  COALESCE(cj.status_analise, 'ativo') as status,
  cj.observacoes,
  cj.created_at,
  cj.updated_at
FROM public.contratos_juros cj
WHERE NOT EXISTS (
  SELECT 1 FROM public.contratos WHERE contratos.id = cj.id
)
ON CONFLICT (id) DO NOTHING;

-- Validar migração de contratos
SELECT 
  'CONTRATOS MIGRADOS' as status,
  COUNT(*) as total,
  COUNT(CASE WHEN banco_id IS NOT NULL THEN 1 END) as com_banco,
  COUNT(CASE WHEN modalidade_bacen_id IS NOT NULL THEN 1 END) as com_modalidade
FROM public.contratos;