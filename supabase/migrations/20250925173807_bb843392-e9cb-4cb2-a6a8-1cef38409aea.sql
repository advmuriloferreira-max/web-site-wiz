-- Adicionar coluna de status na tabela profiles se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN status text DEFAULT 'ativo';
  END IF;
END $$;

-- Atualizar usuários existentes para status ativo se estiver null
UPDATE public.profiles SET status = 'ativo' WHERE status IS NULL;