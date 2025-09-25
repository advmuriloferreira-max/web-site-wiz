-- Deletar convites existentes que não estão funcionando
DELETE FROM convites WHERE usado = false;