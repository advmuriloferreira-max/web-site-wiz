-- PASSO 1: Remover TODAS as policies da tabela usuarios_escritorio
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'usuarios_escritorio') 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON usuarios_escritorio', r.policyname);
    END LOOP;
END $$;

-- PASSO 2: Criar policies simples SEM recursão

-- Policy básica: Usuários veem sua própria vinculação
CREATE POLICY "usr_see_own"
ON usuarios_escritorio
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy básica: Usuários atualizam sua própria vinculação  
CREATE POLICY "usr_update_own"
ON usuarios_escritorio
FOR UPDATE
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());