-- Remover TODAS as policies de usuarios_escritorio
DROP POLICY IF EXISTS "usuarios_escritorio_select_own" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_update_own" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_admin_select" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_admin_insert" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_admin_update" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_admin_delete" ON usuarios_escritorio;

-- POLICY UNIFICADA: usuários veem sua própria vinculação OU são admin do mesmo escritório
-- Esta é a única policy de SELECT, evitando conflitos e recursão
CREATE POLICY "usuarios_escritorio_unified_select"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()  -- Vê sua própria vinculação
  OR (
    -- OU é admin e está vendo alguém do mesmo escritório
    -- Aqui usamos uma comparação direta sem função para evitar recursão
    escritorio_id IN (
      SELECT ue.escritorio_id 
      FROM usuarios_escritorio ue
      JOIN user_roles ur ON ur.user_id = ue.user_id
      WHERE ue.user_id = auth.uid() 
      AND ur.role = 'admin'::app_role
      LIMIT 1
    )
  )
);

-- Policy de INSERT para admins
CREATE POLICY "usuarios_escritorio_unified_insert"
ON usuarios_escritorio
FOR INSERT
TO authenticated
WITH CHECK (
  escritorio_id IN (
    SELECT ue.escritorio_id 
    FROM usuarios_escritorio ue
    JOIN user_roles ur ON ur.user_id = ue.user_id
    WHERE ue.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    LIMIT 1
  )
);

-- Policy de UPDATE para admins
CREATE POLICY "usuarios_escritorio_unified_update"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (
  escritorio_id IN (
    SELECT ue.escritorio_id 
    FROM usuarios_escritorio ue
    JOIN user_roles ur ON ur.user_id = ue.user_id
    WHERE ue.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    LIMIT 1
  )
);

-- Policy de DELETE para admins (não pode deletar a si mesmo)
CREATE POLICY "usuarios_escritorio_unified_delete"
ON usuarios_escritorio
FOR DELETE
TO authenticated
USING (
  user_id != auth.uid()
  AND escritorio_id IN (
    SELECT ue.escritorio_id 
    FROM usuarios_escritorio ue
    JOIN user_roles ur ON ur.user_id = ue.user_id
    WHERE ue.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
    LIMIT 1
  )
);