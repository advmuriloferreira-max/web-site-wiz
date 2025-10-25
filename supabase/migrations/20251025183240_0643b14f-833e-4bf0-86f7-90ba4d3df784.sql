-- ============================================
-- VINCULAR USUÁRIOS AO ESCRITÓRIO
-- ============================================

DO $$
DECLARE
  escritorio_id_atual UUID;
BEGIN
  -- Obter o ID do escritório Murilo Ferreira Advocacia
  SELECT id INTO escritorio_id_atual 
  FROM public.escritorios 
  WHERE nome = 'Murilo Ferreira Advocacia' 
  LIMIT 1;

  -- Vincular os 3 usuários existentes ao escritório
  INSERT INTO public.usuarios_escritorio (
    escritorio_id,
    user_id,
    nome,
    email,
    cargo,
    permissoes,
    status
  ) VALUES
  (
    escritorio_id_atual,
    'b77c2c17-07e5-4a0e-9631-5a0eff366d1f',
    'Murilo Ferreira',
    'advmuriloferreira@gmail.com',
    'Advogado Responsável',
    '{"read": true, "write": true, "admin": true}'::jsonb,
    'ativo'
  ),
  (
    escritorio_id_atual,
    '72019951-ba5d-4073-9ace-e33d5e5e82c0',
    'Morganna Araújo',
    'morgannaaraujo@muriloferreiraadvocacia.com.br',
    'Advogada',
    '{"read": true, "write": true, "admin": false}'::jsonb,
    'ativo'
  ),
  (
    escritorio_id_atual,
    '6390616a-b661-4d4f-b412-6f0ba70c4a78',
    'Murilo de Minas',
    'murilodeminas@yahoo.com',
    'Advogado',
    '{"read": true, "write": true, "admin": false}'::jsonb,
    'ativo'
  )
  ON CONFLICT DO NOTHING;
END $$;