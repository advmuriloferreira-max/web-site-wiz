-- Remover policies problemáticas que causam recursão
DROP POLICY IF EXISTS "usuarios_select_own" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_update_own" ON usuarios_escritorio;
DROP POLICY IF EXISTS "admins_select_all_escritorio" ON usuarios_escritorio;
DROP POLICY IF EXISTS "admins_insert_escritorio" ON usuarios_escritorio;
DROP POLICY IF EXISTS "admins_update_escritorio" ON usuarios_escritorio;
DROP POLICY IF EXISTS "admins_delete_escritorio" ON usuarios_escritorio;

-- Criar policies SIMPLES sem recursão
-- Policy 1: Usuários podem ver sua própria vinculação
CREATE POLICY "usuarios_escritorio_select_own"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Usuários podem atualizar dados da sua vinculação
CREATE POLICY "usuarios_escritorio_update_own"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 3: Admins podem ver todos do mesmo escritório
CREATE POLICY "usuarios_escritorio_admin_select"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (
  escritorio_id = get_user_escritorio_id()
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 4: Admins podem inserir novos usuários no mesmo escritório
CREATE POLICY "usuarios_escritorio_admin_insert"
ON usuarios_escritorio
FOR INSERT
TO authenticated
WITH CHECK (
  escritorio_id = get_user_escritorio_id()
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 5: Admins podem atualizar usuários do mesmo escritório
CREATE POLICY "usuarios_escritorio_admin_update"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (
  escritorio_id = get_user_escritorio_id()
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 6: Admins podem remover usuários (exceto eles mesmos)
CREATE POLICY "usuarios_escritorio_admin_delete"
ON usuarios_escritorio
FOR DELETE
TO authenticated
USING (
  user_id != auth.uid()
  AND escritorio_id = get_user_escritorio_id()
  AND has_role(auth.uid(), 'admin'::app_role)
);