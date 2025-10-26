-- ====================================================================
-- CRIAR ANÁLISES DE PROVISIONAMENTO A PARTIR DOS CONTRATOS MIGRADOS
-- ====================================================================

INSERT INTO public.analises_provisionamento (
  escritorio_id,
  contrato_id,
  valor_divida,
  data_ultimo_pagamento,
  dias_atraso,
  meses_atraso,
  classificacao_risco,
  percentual_provisao,
  valor_provisao,
  metodologia,
  base_calculo,
  data_calculo,
  observacoes,
  created_at,
  updated_at
)
SELECT 
  cp.escritorio_id,
  cp.id as contrato_id,
  cp.valor_divida,
  cp.data_ultimo_pagamento,
  cp.dias_atraso,
  cp.meses_atraso,
  cp.classificacao as classificacao_risco,
  cp.percentual_provisao,
  cp.valor_provisao,
  'Resolução 4966 BACEN e 352 CMN' as metodologia,
  CASE 
    WHEN cp.classificacao = 'C1' THEN 'Classificação C1: Risco Normal'
    WHEN cp.classificacao = 'C2' THEN 'Classificação C2: Risco Reduzido'
    WHEN cp.classificacao = 'C3' THEN 'Classificação C3: Risco Médio'
    WHEN cp.classificacao = 'C4' THEN 'Classificação C4: Risco Alto'
    WHEN cp.classificacao = 'C5' THEN 'Classificação C5: Risco Elevado'
    ELSE 'Sem classificação'
  END as base_calculo,
  NOW() as data_calculo,
  cp.observacoes,
  cp.created_at,
  cp.updated_at
FROM public.contratos_provisao cp
WHERE cp.valor_divida IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.contratos WHERE contratos.id = cp.id)
ON CONFLICT DO NOTHING;

-- Validar criação de análises
SELECT 
  'ANÁLISES DE PROVISIONAMENTO CRIADAS' as status,
  COUNT(*) as total
FROM public.analises_provisionamento;