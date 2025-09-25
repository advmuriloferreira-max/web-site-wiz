-- CORREÇÃO CRÍTICA DE SEGURANÇA: Proteger dados pessoais sensíveis
-- Remover políticas RLS perigosas que permitem acesso público

-- 1. Remover políticas públicas da tabela clientes (dados pessoais sensíveis)
DROP POLICY IF EXISTS "Clientes são visíveis para todos" ON public.clientes;
DROP POLICY IF EXISTS "Qualquer um pode inserir clientes" ON public.clientes;
DROP POLICY IF EXISTS "Qualquer um pode atualizar clientes" ON public.clientes;
DROP POLICY IF EXISTS "Qualquer um pode deletar clientes" ON public.clientes;

-- 2. Remover políticas públicas da tabela contratos (dados financeiros sensíveis)
DROP POLICY IF EXISTS "Contratos são visíveis para todos" ON public.contratos;
DROP POLICY IF EXISTS "Qualquer um pode inserir contratos" ON public.contratos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar contratos" ON public.contratos;
DROP POLICY IF EXISTS "Qualquer um pode deletar contratos" ON public.contratos;

-- 3. Remover políticas públicas da tabela bancos
DROP POLICY IF EXISTS "Bancos são visíveis para todos" ON public.bancos;
DROP POLICY IF EXISTS "Qualquer um pode inserir bancos" ON public.bancos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar bancos" ON public.bancos;
DROP POLICY IF EXISTS "Qualquer um pode deletar bancos" ON public.bancos;

-- 4. Remover políticas públicas da tabela processos
DROP POLICY IF EXISTS "Processos são visíveis para todos" ON public.processos;
DROP POLICY IF EXISTS "Qualquer um pode inserir processos" ON public.processos;
DROP POLICY IF EXISTS "Qualquer um pode atualizar processos" ON public.processos;
DROP POLICY IF EXISTS "Qualquer um pode deletar processos" ON public.processos;

-- CRIAR POLÍTICAS SEGURAS: Apenas usuários autenticados

-- Políticas seguras para CLIENTES (dados pessoais protegidos)
CREATE POLICY "Usuários autenticados podem ver clientes"
ON public.clientes FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes"
ON public.clientes FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes"
ON public.clientes FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar clientes"
ON public.clientes FOR DELETE
TO authenticated
USING (true);

-- Políticas seguras para CONTRATOS (dados financeiros protegidos)
CREATE POLICY "Usuários autenticados podem ver contratos"
ON public.contratos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir contratos"
ON public.contratos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar contratos"
ON public.contratos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar contratos"
ON public.contratos FOR DELETE
TO authenticated
USING (true);

-- Políticas seguras para BANCOS
CREATE POLICY "Usuários autenticados podem ver bancos"
ON public.bancos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir bancos"
ON public.bancos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar bancos"
ON public.bancos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar bancos"
ON public.bancos FOR DELETE
TO authenticated
USING (true);

-- Políticas seguras para PROCESSOS
CREATE POLICY "Usuários autenticados podem ver processos"
ON public.processos FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem inserir processos"
ON public.processos FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar processos"
ON public.processos FOR UPDATE
TO authenticated
USING (true);

CREATE POLICY "Usuários autenticados podem deletar processos"
ON public.processos FOR DELETE
TO authenticated
USING (true);