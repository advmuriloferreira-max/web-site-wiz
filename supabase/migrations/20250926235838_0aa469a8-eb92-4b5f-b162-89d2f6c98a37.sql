-- Criar tabela garantias
CREATE TABLE public.garantias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  tipo_garantia TEXT NOT NULL CHECK (tipo_garantia IN ('Real', 'Fidejussória')),
  descricao TEXT,
  valor_avaliacao NUMERIC(15,2),
  percentual_cobertura NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.garantias ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários autenticados podem ver garantias" 
ON public.garantias 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir garantias" 
ON public.garantias 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar garantias" 
ON public.garantias 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar garantias" 
ON public.garantias 
FOR DELETE 
USING (true);

-- Criar trigger para atualização de timestamps
CREATE TRIGGER update_garantias_updated_at
  BEFORE UPDATE ON public.garantias
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índice para melhor performance
CREATE INDEX idx_garantias_contrato_id ON public.garantias(contrato_id);