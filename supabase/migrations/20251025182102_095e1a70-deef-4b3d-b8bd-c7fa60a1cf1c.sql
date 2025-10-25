-- Remover política restritiva atual
DROP POLICY IF EXISTS "Escritórios podem ver apenas seus dados" ON public.escritorios;

-- Criar política para permitir usuários autenticados criarem escritórios
CREATE POLICY "Usuários autenticados podem criar escritórios"
ON public.escritorios
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Criar política para visualização - só pode ver escritório que está vinculado
CREATE POLICY "Usuários podem ver apenas seu escritório"
ON public.escritorios
FOR SELECT
TO authenticated
USING (id = get_user_escritorio_id());

-- Criar política para atualização - só pode atualizar escritório que está vinculado
CREATE POLICY "Usuários podem atualizar apenas seu escritório"
ON public.escritorios
FOR UPDATE
TO authenticated
USING (id = get_user_escritorio_id())
WITH CHECK (id = get_user_escritorio_id());

-- Criar política para deleção - só pode deletar escritório que está vinculado
CREATE POLICY "Usuários podem deletar apenas seu escritório"
ON public.escritorios
FOR DELETE
TO authenticated
USING (id = get_user_escritorio_id());