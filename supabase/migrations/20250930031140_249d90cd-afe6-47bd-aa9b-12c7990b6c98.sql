-- Criar tabela de modalidades BACEN para análise de juros (sistema separado do provisionamento)
CREATE TABLE IF NOT EXISTS public.modalidades_bacen_juros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo_sgs TEXT NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo_pessoa TEXT NOT NULL CHECK (tipo_pessoa IN ('PF', 'PJ')),
  tipo_recurso TEXT NOT NULL CHECK (tipo_recurso IN ('Livre', 'Direcionado')),
  categoria TEXT NOT NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_modalidades_bacen_tipo_pessoa ON public.modalidades_bacen_juros(tipo_pessoa);
CREATE INDEX IF NOT EXISTS idx_modalidades_bacen_codigo_sgs ON public.modalidades_bacen_juros(codigo_sgs);
CREATE INDEX IF NOT EXISTS idx_modalidades_bacen_ativo ON public.modalidades_bacen_juros(ativo);

-- Criar tabela de séries temporais (taxas históricas do BACEN)
CREATE TABLE IF NOT EXISTS public.series_temporais_bacen (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  modalidade_id UUID NOT NULL REFERENCES public.modalidades_bacen_juros(id) ON DELETE CASCADE,
  mes INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  ano INTEGER NOT NULL CHECK (ano >= 2010 AND ano <= 2100),
  taxa_mensal NUMERIC(10, 4) NOT NULL,
  taxa_anual NUMERIC(10, 4),
  data_referencia DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(modalidade_id, mes, ano)
);

-- Criar índices para melhor performance nas consultas de séries temporais
CREATE INDEX IF NOT EXISTS idx_series_temporais_modalidade ON public.series_temporais_bacen(modalidade_id);
CREATE INDEX IF NOT EXISTS idx_series_temporais_data ON public.series_temporais_bacen(data_referencia DESC);
CREATE INDEX IF NOT EXISTS idx_series_temporais_mes_ano ON public.series_temporais_bacen(mes, ano);

-- Habilitar RLS
ALTER TABLE public.modalidades_bacen_juros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_temporais_bacen ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso público para leitura (todos podem consultar)
CREATE POLICY "Acesso público leitura modalidades" ON public.modalidades_bacen_juros FOR SELECT USING (true);
CREATE POLICY "Acesso público leitura séries temporais" ON public.series_temporais_bacen FOR SELECT USING (true);

-- Apenas admins podem inserir/atualizar/deletar
CREATE POLICY "Admins podem gerenciar modalidades" ON public.modalidades_bacen_juros FOR ALL USING (is_admin(auth.uid()));
CREATE POLICY "Admins podem gerenciar séries temporais" ON public.series_temporais_bacen FOR ALL USING (is_admin(auth.uid()));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_modalidades_bacen_juros_updated_at
  BEFORE UPDATE ON public.modalidades_bacen_juros
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_series_temporais_bacen_updated_at
  BEFORE UPDATE ON public.series_temporais_bacen
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Popular com as 48 modalidades BACEN (códigos SGS reais)
-- PESSOA FÍSICA - Recursos Livres
INSERT INTO public.modalidades_bacen_juros (codigo_sgs, nome, descricao, tipo_pessoa, tipo_recurso, categoria) VALUES
('25453', 'Total - Pessoa Física', 'Taxa média mensal de juros - Pessoas físicas - Total', 'PF', 'Livre', 'Total'),
('25454', 'Total não rotativo - Pessoa Física', 'Taxa média mensal de juros não rotativo - Pessoas físicas - Total', 'PF', 'Livre', 'Total'),
('25455', 'Cheque Especial', 'Taxa média mensal de juros - Pessoas físicas - Cheque especial', 'PF', 'Livre', 'Cheque Especial'),
('25456', 'Crédito Pessoal Não Consignado', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal não consignado', 'PF', 'Livre', 'Crédito Pessoal'),
('25457', 'Crédito Pessoal Não Consignado - Composição', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal não consignado vinculado à composição de dívidas', 'PF', 'Livre', 'Crédito Pessoal'),
('25458', 'Crédito Consignado Privado', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal consignado para trabalhadores do setor privado', 'PF', 'Livre', 'Crédito Consignado'),
('25459', 'Crédito Consignado Público', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal consignado para trabalhadores do setor público', 'PF', 'Livre', 'Crédito Consignado'),
('25460', 'Crédito Consignado INSS', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal consignado para aposentados e pensionistas do INSS', 'PF', 'Livre', 'Crédito Consignado'),
('25461', 'Crédito Consignado Total', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal consignado total', 'PF', 'Livre', 'Crédito Consignado'),
('25462', 'Crédito Pessoal Total', 'Taxa média mensal de juros - Pessoas físicas - Crédito pessoal total', 'PF', 'Livre', 'Crédito Pessoal'),
('25463', 'Aquisição de Veículos', 'Taxa média mensal de juros - Pessoas físicas - Aquisição de veículos', 'PF', 'Livre', 'Aquisição de Bens'),
('25464', 'Aquisição de Outros Bens', 'Taxa média mensal de juros - Pessoas físicas - Aquisição de outros bens', 'PF', 'Livre', 'Aquisição de Bens'),
('25465', 'Aquisição de Bens Total', 'Taxa média mensal de juros - Pessoas físicas - Aquisição de bens total', 'PF', 'Livre', 'Aquisição de Bens'),
('25466', 'Leasing de Veículos', 'Taxa média mensal de juros - Pessoas físicas - Arrendamento mercantil de veículos', 'PF', 'Livre', 'Arrendamento Mercantil'),
('25467', 'Leasing de Outros Bens', 'Taxa média mensal de juros - Pessoas físicas - Arrendamento mercantil de outros bens', 'PF', 'Livre', 'Arrendamento Mercantil'),
('25468', 'Leasing Total', 'Taxa média mensal de juros - Pessoas físicas - Arrendamento mercantil total', 'PF', 'Livre', 'Arrendamento Mercantil'),
('25469', 'Cartão de Crédito Rotativo', 'Taxa média mensal de juros - Pessoas físicas - Cartão de crédito rotativo', 'PF', 'Livre', 'Cartão de Crédito'),
('25470', 'Cartão de Crédito Parcelado', 'Taxa média mensal de juros - Pessoas físicas - Cartão de crédito parcelado', 'PF', 'Livre', 'Cartão de Crédito'),
('25471', 'Cartão de Crédito Total', 'Taxa média mensal de juros - Pessoas físicas - Cartão de crédito total', 'PF', 'Livre', 'Cartão de Crédito'),
('25472', 'Desconto de Cheques', 'Taxa média mensal de juros - Pessoas físicas - Desconto de cheques', 'PF', 'Livre', 'Desconto de Cheques'),
('25473', 'Desconto de Duplicatas', 'Taxa média mensal de juros - Pessoas físicas - Desconto de duplicatas', 'PF', 'Livre', 'Desconto'),
('25474', 'Antecipação de Faturas Cartão', 'Taxa média mensal de juros - Pessoas físicas - Antecipação de faturas de cartão de crédito', 'PF', 'Livre', 'Cartão de Crédito');

-- PESSOA JURÍDICA - Recursos Livres
INSERT INTO public.modalidades_bacen_juros (codigo_sgs, nome, descricao, tipo_pessoa, tipo_recurso, categoria) VALUES
('25475', 'Total - Pessoa Jurídica', 'Taxa média mensal de juros - Pessoas jurídicas - Total', 'PJ', 'Livre', 'Total'),
('25476', 'Capital de Giro com Prazo até 365 dias', 'Taxa média mensal de juros - Pessoas jurídicas - Capital de giro com prazo até 365 dias', 'PJ', 'Livre', 'Capital de Giro'),
('25477', 'Capital de Giro com Prazo superior a 365 dias', 'Taxa média mensal de juros - Pessoas jurídicas - Capital de giro com prazo superior a 365 dias', 'PJ', 'Livre', 'Capital de Giro'),
('25478', 'Capital de Giro Total', 'Taxa média mensal de juros - Pessoas jurídicas - Capital de giro total', 'PJ', 'Livre', 'Capital de Giro'),
('25479', 'Conta Garantida', 'Taxa média mensal de juros - Pessoas jurídicas - Conta garantida', 'PJ', 'Livre', 'Conta Garantida'),
('25480', 'Cheque Especial - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Cheque especial', 'PJ', 'Livre', 'Cheque Especial'),
('25481', 'Aquisição de Bens - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Aquisição de bens', 'PJ', 'Livre', 'Aquisição de Bens'),
('25482', 'Vendor', 'Taxa média mensal de juros - Pessoas jurídicas - Vendor', 'PJ', 'Livre', 'Vendor'),
('25483', 'Compror', 'Taxa média mensal de juros - Pessoas jurídicas - Compror', 'PJ', 'Livre', 'Compror'),
('25484', 'Cartão de Crédito Rotativo - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Cartão de crédito rotativo', 'PJ', 'Livre', 'Cartão de Crédito'),
('25485', 'Cartão de Crédito Parcelado - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Cartão de crédito parcelado', 'PJ', 'Livre', 'Cartão de Crédito'),
('25486', 'Desconto de Cheques - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Desconto de cheques', 'PJ', 'Livre', 'Desconto de Cheques'),
('25487', 'Desconto de Duplicatas - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Desconto de duplicatas', 'PJ', 'Livre', 'Desconto'),
('25488', 'Antecipação de Faturas Cartão - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Antecipação de faturas de cartão de crédito', 'PJ', 'Livre', 'Cartão de Crédito'),
('25489', 'Hot Money', 'Taxa média mensal de juros - Pessoas jurídicas - Hot money', 'PJ', 'Livre', 'Hot Money'),
('25490', 'Desconto de Recebíveis', 'Taxa média mensal de juros - Pessoas jurídicas - Desconto de recebíveis', 'PJ', 'Livre', 'Desconto');

-- PESSOA FÍSICA - Recursos Direcionados
INSERT INTO public.modalidades_bacen_juros (codigo_sgs, nome, descricao, tipo_pessoa, tipo_recurso, categoria) VALUES
('25491', 'Crédito Rural - PF', 'Taxa média mensal de juros - Pessoas físicas - Crédito rural', 'PF', 'Direcionado', 'Crédito Rural'),
('25492', 'Financiamento Imobiliário - PF', 'Taxa média mensal de juros - Pessoas físicas - Financiamento imobiliário', 'PF', 'Direcionado', 'Financiamento Imobiliário'),
('25493', 'Microcrédit - PF', 'Taxa média mensal de juros - Pessoas físicas - Microcrédito', 'PF', 'Direcionado', 'Microcrédito'),
('25494', 'Crédito Rotativo SFH', 'Taxa média mensal de juros - Pessoas físicas - Crédito rotativo SFH', 'PF', 'Direcionado', 'SFH');

-- PESSOA JURÍDICA - Recursos Direcionados
INSERT INTO public.modalidades_bacen_juros (codigo_sgs, nome, descricao, tipo_pessoa, tipo_recurso, categoria) VALUES
('25495', 'Crédito Rural - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Crédito rural', 'PJ', 'Direcionado', 'Crédito Rural'),
('25496', 'Financiamento Imobiliário - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Financiamento imobiliário', 'PJ', 'Direcionado', 'Financiamento Imobiliário'),
('25497', 'Microcrédito - PJ', 'Taxa média mensal de juros - Pessoas jurídicas - Microcrédito', 'PJ', 'Direcionado', 'Microcrédito'),
('25498', 'BNDES - Repasse', 'Taxa média mensal de juros - Pessoas jurídicas - Repasses do BNDES', 'PJ', 'Direcionado', 'BNDES'),
('25499', 'BNDES - Custo Efetivo', 'Taxa média mensal de juros - Pessoas jurídicas - BNDES custo efetivo', 'PJ', 'Direcionado', 'BNDES'),
('25500', 'FINAME - Repasse', 'Taxa média mensal de juros - Pessoas jurídicas - Repasses do FINAME', 'PJ', 'Direcionado', 'FINAME');

COMMENT ON TABLE public.modalidades_bacen_juros IS 'Modalidades de crédito do BACEN para análise de juros abusivos (sistema independente do provisionamento)';
COMMENT ON TABLE public.series_temporais_bacen IS 'Séries temporais históricas das taxas BACEN por modalidade e período';
COMMENT ON COLUMN public.modalidades_bacen_juros.codigo_sgs IS 'Código da série temporal no Sistema Gerenciador de Séries Temporais do BACEN';
COMMENT ON COLUMN public.modalidades_bacen_juros.tipo_pessoa IS 'PF (Pessoa Física) ou PJ (Pessoa Jurídica)';
COMMENT ON COLUMN public.modalidades_bacen_juros.tipo_recurso IS 'Livre ou Direcionado';
COMMENT ON COLUMN public.series_temporais_bacen.taxa_mensal IS 'Taxa mensal em percentual (ex: 2.5 para 2,5% ao mês)';
COMMENT ON COLUMN public.series_temporais_bacen.taxa_anual IS 'Taxa anual equivalente em percentual';