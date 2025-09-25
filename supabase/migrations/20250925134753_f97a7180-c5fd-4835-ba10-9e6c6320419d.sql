-- Sincronizar role na tabela profiles para o usuário admin
UPDATE public.profiles 
SET role = 'admin'
WHERE email = 'advmuriloferreira@gmail.com';