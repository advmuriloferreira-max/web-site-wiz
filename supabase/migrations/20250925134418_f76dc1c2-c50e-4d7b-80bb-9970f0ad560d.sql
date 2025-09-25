-- Criar sistema de roles para controle de acesso
-- Criar enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'advogado', 'assistente');

-- Criar tabela de roles de usuários
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'assistente',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE (user_id, role)
);

-- Habilitar RLS na tabela user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função segura para verificar roles (evita recursão RLS)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.user_roles WHERE user_id = user_uuid ORDER BY created_at DESC LIMIT 1;
$$;

-- Função para verificar se usuário tem role específica
CREATE OR REPLACE FUNCTION public.has_role(user_uuid UUID, check_role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = user_uuid AND role = check_role
  );
$$;

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(user_uuid, 'admin');
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Admins podem ver todos os roles"
ON public.user_roles FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem inserir roles"
ON public.user_roles FOR INSERT
TO authenticated
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem atualizar roles"
ON public.user_roles FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins podem deletar roles"
ON public.user_roles FOR DELETE
TO authenticated
USING (public.is_admin(auth.uid()));

-- Adicionar coluna role na tabela profiles para facilitar consultas
ALTER TABLE public.profiles ADD COLUMN role app_role DEFAULT 'assistente';

-- Função para sincronizar role na tabela profiles
CREATE OR REPLACE FUNCTION public.sync_profile_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Atualizar role na tabela profiles
  UPDATE public.profiles 
  SET role = NEW.role 
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

-- Trigger para sincronizar roles
CREATE TRIGGER sync_role_to_profile
AFTER INSERT OR UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.sync_profile_role();

-- Definir o usuário atual (advmuriloferreira@gmail.com) como ADMIN
INSERT INTO public.user_roles (user_id, role, created_by)
SELECT 
  au.id,
  'admin'::app_role,
  au.id
FROM auth.users au
WHERE au.email = 'advmuriloferreira@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;