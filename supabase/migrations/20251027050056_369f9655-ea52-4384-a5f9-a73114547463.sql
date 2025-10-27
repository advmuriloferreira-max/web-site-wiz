-- Remover CHECK CONSTRAINTs que impedem valores "Todos"
ALTER TABLE public.modalidades_bacen_juros
DROP CONSTRAINT IF EXISTS modalidades_bacen_juros_tipo_pessoa_check,
DROP CONSTRAINT IF EXISTS modalidades_bacen_juros_tipo_recurso_check;

-- Adicionar constraint UNIQUE para codigo_sgs
ALTER TABLE public.modalidades_bacen_juros
ADD CONSTRAINT modalidades_bacen_juros_codigo_sgs_unique 
UNIQUE (codigo_sgs);

-- Cadastrar as 2 modalidades faltantes
INSERT INTO public.modalidades_bacen_juros (
  nome,
  codigo_sgs,
  categoria,
  tipo_pessoa,
  tipo_recurso,
  ativo
) VALUES 
  ('Taxa média mensal - Total', '25436', 'Total', 'Todos', 'Todos', true),
  ('Taxa média mensal não rotativo - Total', '27641', 'Total', 'Todos', 'Todos', true)
ON CONFLICT (codigo_sgs) DO NOTHING;