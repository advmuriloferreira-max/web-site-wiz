-- ====================================================================
-- MIGRAÇÃO DE CLIENTES
-- ====================================================================

-- Migrar clientes de juros
INSERT INTO public.clientes (
  id,
  escritorio_id,
  nome,
  cpf_cnpj,
  email,
  telefone,
  created_at,
  updated_at
)
SELECT 
  id,
  escritorio_id,
  nome,
  cpf_cnpj,
  email,
  telefone,
  created_at,
  updated_at
FROM public.clientes_juros
WHERE NOT EXISTS (
  SELECT 1 FROM public.clientes WHERE clientes.cpf_cnpj = clientes_juros.cpf_cnpj
)
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Migrar clientes de superendividamento
INSERT INTO public.clientes (
  id,
  escritorio_id,
  nome,
  cpf_cnpj,
  observacoes,
  created_at,
  updated_at
)
SELECT 
  id,
  escritorio_id,
  nome,
  cpf AS cpf_cnpj,
  observacoes,
  created_at,
  updated_at
FROM public.clientes_superendividamento
WHERE cpf IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.clientes WHERE clientes.cpf_cnpj = clientes_superendividamento.cpf
  )
ON CONFLICT (cpf_cnpj) DO NOTHING;

-- Migrar clientes de provisão (se existir)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clientes_provisao') THEN
    INSERT INTO public.clientes (
      id,
      escritorio_id,
      nome,
      cpf_cnpj,
      email,
      telefone,
      created_at,
      updated_at
    )
    SELECT 
      id,
      escritorio_id,
      nome,
      cpf_cnpj,
      email,
      telefone,
      created_at,
      updated_at
    FROM public.clientes_provisao
    WHERE NOT EXISTS (
      SELECT 1 FROM public.clientes WHERE clientes.cpf_cnpj = clientes_provisao.cpf_cnpj
    )
    ON CONFLICT (cpf_cnpj) DO NOTHING;
  END IF;
END $$;

-- Validar migração de clientes
SELECT 
  'CLIENTES MIGRADOS' as status,
  COUNT(*) as total
FROM public.clientes;