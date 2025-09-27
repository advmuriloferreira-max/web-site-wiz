-- Criar enum para tipo de proposta
CREATE TYPE public.tipo_proposta AS ENUM ('enviada', 'recebida');

-- Criar enum para status da proposta
CREATE TYPE public.status_proposta AS ENUM ('pendente', 'aceita', 'recusada');

-- Criar tabela de propostas de acordo
CREATE TABLE public.propostas_acordo (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  data_proposta TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valor_proposta NUMERIC(15,2) NOT NULL,
  tipo_proposta public.tipo_proposta NOT NULL,
  status public.status_proposta NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.propostas_acordo ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Usuários autenticados podem ver propostas" 
ON public.propostas_acordo 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir propostas" 
ON public.propostas_acordo 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar propostas" 
ON public.propostas_acordo 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar propostas" 
ON public.propostas_acordo 
FOR DELETE 
USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_propostas_acordo_updated_at
BEFORE UPDATE ON public.propostas_acordo
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Criar índices para melhor performance
CREATE INDEX idx_propostas_acordo_contrato_id ON public.propostas_acordo(contrato_id);
CREATE INDEX idx_propostas_acordo_data_proposta ON public.propostas_acordo(data_proposta);