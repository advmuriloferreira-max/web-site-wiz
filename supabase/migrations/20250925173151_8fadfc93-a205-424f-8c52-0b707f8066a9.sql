-- Habilitar realtime para as tabelas principais
ALTER TABLE public.clientes REPLICA IDENTITY FULL;
ALTER TABLE public.contratos REPLICA IDENTITY FULL;
ALTER TABLE public.processos REPLICA IDENTITY FULL;
ALTER TABLE public.bancos REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Adicionar as tabelas à publicação realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.clientes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contratos; 
ALTER PUBLICATION supabase_realtime ADD TABLE public.processos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.bancos;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;