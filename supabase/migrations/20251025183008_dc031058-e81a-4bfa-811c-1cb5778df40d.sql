-- ============================================
-- CRIAR ESCRITÓRIO E TRANSFERIR REGISTROS ÓRFÃOS
-- ============================================

-- Criar o escritório Murilo Ferreira Advocacia
INSERT INTO public.escritorios (
  id,
  nome,
  email,
  plano,
  status,
  data_cadastro,
  data_vencimento
) VALUES (
  gen_random_uuid(),
  'Murilo Ferreira Advocacia',
  'contato@muriloferreira.adv.br',
  'essencial',
  'ativo',
  NOW(),
  NOW() + INTERVAL '30 days'
) ON CONFLICT DO NOTHING;

-- Transferir registros órfãos para o escritório criado
DO $$
DECLARE
  escritorio_id_novo UUID;
BEGIN
  -- Obter o ID do escritório recém-criado
  SELECT id INTO escritorio_id_novo 
  FROM public.escritorios 
  WHERE nome = 'Murilo Ferreira Advocacia' 
  LIMIT 1;

  -- Atualizar clientes_provisao
  UPDATE public.clientes_provisao
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar contratos_provisao
  UPDATE public.contratos_provisao
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar clientes_juros
  UPDATE public.clientes_juros
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar contratos_juros
  UPDATE public.contratos_juros
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar clientes_superendividamento
  UPDATE public.clientes_superendividamento
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar dividas_superendividamento
  UPDATE public.dividas_superendividamento
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar planos_pagamento
  UPDATE public.planos_pagamento
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar analises_socioeconomicas
  UPDATE public.analises_socioeconomicas
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar processos_provisao
  UPDATE public.processos_provisao
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar propostas_acordo_provisao
  UPDATE public.propostas_acordo_provisao
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar garantias_provisao
  UPDATE public.garantias_provisao
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar parcelas_contrato
  UPDATE public.parcelas_contrato
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;

  -- Atualizar analises_juros
  UPDATE public.analises_juros
  SET escritorio_id = escritorio_id_novo
  WHERE escritorio_id IS NULL;
END $$;

-- ============================================
-- TORNAR escritorio_id NOT NULL em todas as tabelas
-- ============================================

ALTER TABLE public.clientes_provisao 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.contratos_provisao 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.clientes_juros 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.contratos_juros 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.clientes_superendividamento 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.dividas_superendividamento 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.planos_pagamento 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.analises_socioeconomicas 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.processos_provisao 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.propostas_acordo_provisao 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.garantias_provisao 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.parcelas_contrato 
ALTER COLUMN escritorio_id SET NOT NULL;

ALTER TABLE public.analises_juros 
ALTER COLUMN escritorio_id SET NOT NULL;