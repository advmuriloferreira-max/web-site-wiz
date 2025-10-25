-- ============================================
-- CORREÇÃO 1: Adicionar trigger automático para escritorio_id
-- ============================================

-- Criar trigger para clientes_provisao
DROP TRIGGER IF EXISTS set_escritorio_id_clientes_provisao ON public.clientes_provisao;
CREATE TRIGGER set_escritorio_id_clientes_provisao
BEFORE INSERT ON public.clientes_provisao
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para contratos_provisao
DROP TRIGGER IF EXISTS set_escritorio_id_contratos_provisao ON public.contratos_provisao;
CREATE TRIGGER set_escritorio_id_contratos_provisao
BEFORE INSERT ON public.contratos_provisao
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para clientes_juros
DROP TRIGGER IF EXISTS set_escritorio_id_clientes_juros ON public.clientes_juros;
CREATE TRIGGER set_escritorio_id_clientes_juros
BEFORE INSERT ON public.clientes_juros
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para contratos_juros
DROP TRIGGER IF EXISTS set_escritorio_id_contratos_juros ON public.contratos_juros;
CREATE TRIGGER set_escritorio_id_contratos_juros
BEFORE INSERT ON public.contratos_juros
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para clientes_superendividamento
DROP TRIGGER IF EXISTS set_escritorio_id_clientes_super ON public.clientes_superendividamento;
CREATE TRIGGER set_escritorio_id_clientes_super
BEFORE INSERT ON public.clientes_superendividamento
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para dividas_superendividamento
DROP TRIGGER IF EXISTS set_escritorio_id_dividas ON public.dividas_superendividamento;
CREATE TRIGGER set_escritorio_id_dividas
BEFORE INSERT ON public.dividas_superendividamento
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para planos_pagamento
DROP TRIGGER IF EXISTS set_escritorio_id_planos ON public.planos_pagamento;
CREATE TRIGGER set_escritorio_id_planos
BEFORE INSERT ON public.planos_pagamento
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para analises_socioeconomicas
DROP TRIGGER IF EXISTS set_escritorio_id_analises_socio ON public.analises_socioeconomicas;
CREATE TRIGGER set_escritorio_id_analises_socio
BEFORE INSERT ON public.analises_socioeconomicas
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para processos_provisao
DROP TRIGGER IF EXISTS set_escritorio_id_processos ON public.processos_provisao;
CREATE TRIGGER set_escritorio_id_processos
BEFORE INSERT ON public.processos_provisao
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para propostas_acordo_provisao
DROP TRIGGER IF EXISTS set_escritorio_id_propostas ON public.propostas_acordo_provisao;
CREATE TRIGGER set_escritorio_id_propostas
BEFORE INSERT ON public.propostas_acordo_provisao
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para garantias_provisao
DROP TRIGGER IF EXISTS set_escritorio_id_garantias ON public.garantias_provisao;
CREATE TRIGGER set_escritorio_id_garantias
BEFORE INSERT ON public.garantias_provisao
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para parcelas_contrato
DROP TRIGGER IF EXISTS set_escritorio_id_parcelas ON public.parcelas_contrato;
CREATE TRIGGER set_escritorio_id_parcelas
BEFORE INSERT ON public.parcelas_contrato
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- Criar trigger para analises_juros
DROP TRIGGER IF EXISTS set_escritorio_id_analises_juros ON public.analises_juros;
CREATE TRIGGER set_escritorio_id_analises_juros
BEFORE INSERT ON public.analises_juros
FOR EACH ROW
EXECUTE FUNCTION public.set_escritorio_id();

-- ============================================
-- CORREÇÃO 2: Remover UNIQUE do email do escritório
-- (permitir que diferentes escritórios usem mesmo email)
-- ============================================
ALTER TABLE public.escritorios 
DROP CONSTRAINT IF EXISTS escritorios_email_key;

-- ============================================
-- CORREÇÃO 3: Tornar escritorio_id NOT NULL onde apropriado
-- (após corrigir dados órfãos em próxima migração)
-- ============================================
-- Será feito após limpar dados órfãos

COMMENT ON TRIGGER set_escritorio_id_clientes_provisao ON public.clientes_provisao 
IS 'Automaticamente preenche escritorio_id com base no usuário logado';