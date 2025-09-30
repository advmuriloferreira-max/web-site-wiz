-- Criar tabela analyses para armazenar análises de contratos
CREATE TABLE IF NOT EXISTS public.analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contrato_id uuid NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  taxa_bacen numeric,
  taxa_referencia text,
  data_consulta timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Adicionar campo para taxa do Bacen na tabela contratos se não existir
ALTER TABLE public.contratos 
ADD COLUMN IF NOT EXISTS taxa_bacen numeric,
ADD COLUMN IF NOT EXISTS taxa_referencia text;

-- Habilitar RLS na tabela analyses
ALTER TABLE public.analyses ENABLE ROW LEVEL SECURITY;

-- Política: Usuários autenticados podem ver analyses de seus próprios contratos
CREATE POLICY "Usuários podem ver analyses de seus contratos"
ON public.analyses
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = analyses.contrato_id
  )
);

-- Política: Usuários autenticados podem inserir analyses
CREATE POLICY "Usuários podem criar analyses"
ON public.analyses
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = analyses.contrato_id
  )
);

-- Política: Usuários autenticados podem atualizar analyses de seus contratos
CREATE POLICY "Usuários podem atualizar analyses de seus contratos"
ON public.analyses
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = analyses.contrato_id
  )
);

-- Política: Usuários autenticados podem deletar analyses de seus contratos
CREATE POLICY "Usuários podem deletar analyses de seus contratos"
ON public.analyses
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.contratos
    WHERE contratos.id = analyses.contrato_id
  )
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_analyses_contrato_id ON public.analyses(contrato_id);
CREATE INDEX IF NOT EXISTS idx_analyses_data_consulta ON public.analyses(data_consulta DESC);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_analyses_updated_at
  BEFORE UPDATE ON public.analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();