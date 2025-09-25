-- Criar sistema de convites com links temporários
CREATE TABLE public.convites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    nome TEXT NOT NULL,
    role app_role NOT NULL DEFAULT 'assistente',
    token TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    usado BOOLEAN DEFAULT FALSE,
    usado_em TIMESTAMP WITH TIME ZONE NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.convites ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para convites
CREATE POLICY "Admins podem gerenciar convites"
ON public.convites FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()));

-- Função para criar token único
CREATE OR REPLACE FUNCTION public.generate_invite_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;

-- Função para verificar se convite é válido
CREATE OR REPLACE FUNCTION public.convite_valido(invite_token TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.convites 
        WHERE token = invite_token 
        AND expires_at > now() 
        AND usado = FALSE
    );
$$;

-- Função para obter dados do convite
CREATE OR REPLACE FUNCTION public.get_convite_data(invite_token TEXT)
RETURNS TABLE(email TEXT, nome TEXT, role app_role)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT c.email, c.nome, c.role 
    FROM public.convites c
    WHERE c.token = invite_token 
    AND c.expires_at > now() 
    AND c.usado = FALSE;
$$;

-- Trigger para atualizar updated_at
CREATE TRIGGER update_convites_updated_at
BEFORE UPDATE ON public.convites
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();