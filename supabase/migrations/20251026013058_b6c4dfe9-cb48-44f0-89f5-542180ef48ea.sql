-- ====================================================================
-- MIGRAÇÃO DE CONTRATOS E CRIAÇÃO DE ANÁLISES DE PROVISIONAMENTO
-- ====================================================================

-- PASSO 1: Migrar contratos de contratos_provisao para contratos
-- ====================================================================
INSERT INTO public.contratos (
  id,
  escritorio_id,
  cliente_id,
  banco_id,
  numero_contrato,
  tipo_operacao,
  modalidade_bacen_id,
  valor_contrato,
  valor_financiado,
  valor_parcela,
  numero_parcelas,
  taxa_juros_contratual,
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
  NULL as modalidade_bacen_id, -- não existe na tabela antiga
  cp.valor_divida as valor_contrato,
  cp.saldo_contabil as valor_financiado,
  cp.valor_parcela,
  cp.numero_parcelas,
  NULL as taxa_juros_contratual, -- não existe na tabela antiga
  cp.data_entrada as data_assinatura,
  cp.data_vencimento as data_primeiro_vencimento,
  cp.data_ultimo_pagamento,
  COALESCE(cp.situacao, 'ativo') as status,
  cp.observacoes,
  cp.created_at,
  cp.updated_at
FROM public.contratos_provisao cp
ON CONFLICT (id) DO NOTHING;

-- PASSO 2: Criar análises de provisionamento para cada contrato migrado
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
ON CONFLICT DO NOTHING;

-- PASSO 3: Validar migração
-- ====================================================================
DO $$
DECLARE
  count_contratos_provisao INTEGER;
  count_contratos_novos INTEGER;
  count_analises INTEGER;
BEGIN
  SELECT COUNT(*) INTO count_contratos_provisao FROM public.contratos_provisao;
  SELECT COUNT(*) INTO count_contratos_novos FROM public.contratos;
  SELECT COUNT(*) INTO count_analises FROM public.analises_provisionamento;
  
  RAISE NOTICE '=== RESULTADO DA MIGRAÇÃO ===';
  RAISE NOTICE 'Contratos na tabela antiga: %', count_contratos_provisao;
  RAISE NOTICE 'Contratos migrados: %', count_contratos_novos;
  RAISE NOTICE 'Análises de provisionamento criadas: %', count_analises;
  
  IF count_contratos_novos < count_contratos_provisao THEN
    RAISE WARNING 'ATENÇÃO: Nem todos os contratos foram migrados!';
  END IF;
END $$;