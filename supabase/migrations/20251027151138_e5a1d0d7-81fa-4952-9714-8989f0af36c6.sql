-- SOLUÇÃO DEFINITIVA: Policies SEM recursão para usuarios_escritorio
-- Estratégia: Usuários só veem sua própria linha, admins precisam de outra abordagem

-- Remover TODAS as policies atuais
DROP POLICY IF EXISTS "usuarios_escritorio_unified_select" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_unified_insert" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_unified_update" ON usuarios_escritorio;
DROP POLICY IF EXISTS "usuarios_escritorio_unified_delete" ON usuarios_escritorio;

-- POLICY 1: Usuários podem ver APENAS sua própria vinculação
-- Esta é a policy MAIS IMPORTANTE e não tem recursão
CREATE POLICY "usuarios_escritorio_own_select"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- POLICY 2: Admins podem ver TODOS (sem filtro de escritório)
-- Usamos has_role que consulta user_roles, NÃO usuarios_escritorio
CREATE POLICY "usuarios_escritorio_admin_select_all"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- POLICY 3: Admins podem inserir (sem filtro de escritório por ora)
CREATE POLICY "usuarios_escritorio_admin_insert"
ON usuarios_escritorio
FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- POLICY 4: Admins podem atualizar
CREATE POLICY "usuarios_escritorio_admin_update"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- POLICY 5: Admins podem deletar (exceto sua própria vinculação)
CREATE POLICY "usuarios_escritorio_admin_delete"
ON usuarios_escritorio
FOR DELETE
TO authenticated
USING (
  user_id != auth.uid() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Comentários
COMMENT ON POLICY "usuarios_escritorio_own_select" ON usuarios_escritorio 
IS 'Política principal: usuários veem apenas sua própria vinculação sem recursão';

COMMENT ON POLICY "usuarios_escritorio_admin_select_all" ON usuarios_escritorio 
IS 'Admins veem todos os usuários usando has_role (consulta user_roles, não usuarios_escritorio)';