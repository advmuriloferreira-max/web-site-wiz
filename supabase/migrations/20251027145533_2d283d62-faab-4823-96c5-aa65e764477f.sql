-- Remover TODAS as policies antigas da tabela usuarios_escritorio
DROP POLICY IF EXISTS "Usuários podem ver apenas seu escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seu escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem ver suas vinculações" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem atualizar suas vinculações" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Admins podem ver vinculações do escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Admins podem gerenciar vinculações" ON usuarios_escritorio;

-- Criar policies corretas para usuarios_escritorio
-- Policy 1: Usuários podem ver sua própria vinculação
CREATE POLICY "usuarios_select_own"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Usuários podem atualizar sua própria vinculação
CREATE POLICY "usuarios_update_own"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 3: Admins podem ver todas as vinculações do mesmo escritório
CREATE POLICY "admins_select_all_escritorio"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM usuarios_escritorio WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 4: Admins podem inserir novas vinculações no mesmo escritório
CREATE POLICY "admins_insert_escritorio"
ON usuarios_escritorio
FOR INSERT
TO authenticated
WITH CHECK (
  escritorio_id IN (
    SELECT escritorio_id FROM usuarios_escritorio WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 5: Admins podem atualizar vinculações do mesmo escritório
CREATE POLICY "admins_update_escritorio"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (
  escritorio_id IN (
    SELECT escritorio_id FROM usuarios_escritorio WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Policy 6: Admins podem deletar vinculações do mesmo escritório (exceto a própria)
CREATE POLICY "admins_delete_escritorio"
ON usuarios_escritorio
FOR DELETE
TO authenticated
USING (
  user_id != auth.uid()
  AND escritorio_id IN (
    SELECT escritorio_id FROM usuarios_escritorio WHERE user_id = auth.uid()
  )
  AND has_role(auth.uid(), 'admin'::app_role)
);