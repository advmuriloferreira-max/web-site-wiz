-- Criar tabela para logs do assistente virtual
CREATE TABLE public.assistente_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  pergunta TEXT NOT NULL,
  resposta TEXT NOT NULL,
  contexto_contrato TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.assistente_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuários podem ver seus próprios logs"
  ON public.assistente_logs
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios logs"
  ON public.assistente_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Admins podem ver todos os logs
CREATE POLICY "Admins podem ver todos os logs"
  ON public.assistente_logs
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Índices para performance
CREATE INDEX idx_assistente_logs_user_id ON public.assistente_logs(user_id);
CREATE INDEX idx_assistente_logs_created_at ON public.assistente_logs(created_at);
CREATE INDEX idx_assistente_logs_contexto ON public.assistente_logs(contexto_contrato) WHERE contexto_contrato IS NOT NULL;