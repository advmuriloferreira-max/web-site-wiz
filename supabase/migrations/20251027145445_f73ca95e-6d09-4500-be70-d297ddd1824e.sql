-- Corrigir RLS policy da tabela usuarios_escritorio
-- A policy atual está comparando id com escritorio_id (incorreto)
-- Deve comparar user_id com auth.uid() (correto)

-- Remover policy antiga incorreta
DROP POLICY IF EXISTS "Usuários podem ver apenas seu escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem atualizar apenas seu escritório" ON usuarios_escritorio;
DROP POLICY IF EXISTS "Usuários podem deletar apenas seu escritório" ON usuarios_escritorio;

-- Criar policies corretas para usuarios_escritorio
-- Usuários podem ver apenas suas próprias vinculações
CREATE POLICY "Usuários podem ver suas vinculações"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Usuários podem atualizar apenas suas próprias vinculações
CREATE POLICY "Usuários podem atualizar suas vinculações"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Admins podem ver todas as vinculações do escritório
CREATE POLICY "Admins podem ver vinculações do escritório"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (
  escritorio_id = get_user_escritorio_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Admins podem gerenciar vinculações do escritório
CREATE POLICY "Admins podem gerenciar vinculações"
ON usuarios_escritorio
FOR ALL
TO authenticated
USING (
  escritorio_id = get_user_escritorio_id() 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Comentários explicativos
COMMENT ON POLICY "Usuários podem ver suas vinculações" ON usuarios_escritorio 
IS 'Permite que usuários vejam apenas sua própria vinculação com o escritório';

COMMENT ON POLICY "Admins podem ver vinculações do escritório" ON usuarios_escritorio 
IS 'Permite que admins vejam todas as vinculações do escritório deles';

COMMENT ON POLICY "Admins podem gerenciar vinculações" ON usuarios_escritorio 
IS 'Permite que admins gerenciem (insert/update/delete) vinculações do escritório';