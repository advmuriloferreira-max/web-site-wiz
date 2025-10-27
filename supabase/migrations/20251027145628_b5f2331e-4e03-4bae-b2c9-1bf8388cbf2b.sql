-- Remover apenas a policy antiga problemática
DROP POLICY IF EXISTS "Usuários veem apenas colegas do escritório" ON usuarios_escritorio;

-- Verificar se não há conflitos - as policies corretas já existem:
-- ✅ usuarios_select_own (user_id = auth.uid())
-- ✅ usuarios_update_own
-- ✅ admins_select_all_escritorio
-- ✅ admins_insert_escritorio
-- ✅ admins_update_escritorio
-- ✅ admins_delete_escritorio