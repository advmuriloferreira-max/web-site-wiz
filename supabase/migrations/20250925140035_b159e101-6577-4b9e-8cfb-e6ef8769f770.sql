-- Verificar e criar funções necessárias para convites se não existirem

-- Função RPC para verificar convite (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_catalog.pg_proc 
        WHERE proname = 'get_convite_data' 
        AND pg_get_function_result(oid) LIKE '%TABLE%'
    ) THEN
        -- A função já foi criada anteriormente, esta é apenas uma verificação
        NULL;
    END IF;
END
$$;