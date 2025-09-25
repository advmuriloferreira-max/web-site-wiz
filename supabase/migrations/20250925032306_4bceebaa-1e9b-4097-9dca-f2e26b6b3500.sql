-- Criação das tabelas de referência para cálculo de provisão (ANEXOS I e II)

-- ANEXO I: Provisão para perdas incorridas por tempo (meses)
CREATE TABLE public.provisao_perdas_incorridas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  criterio TEXT NOT NULL,
  prazo_inicial DECIMAL NOT NULL,
  prazo_final DECIMAL NOT NULL,
  c1_percentual DECIMAL NOT NULL,
  c2_percentual DECIMAL NOT NULL,
  c3_percentual DECIMAL NOT NULL,
  c4_percentual DECIMAL NOT NULL,
  c5_percentual DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ANEXO II: Provisão adicional para perda esperada por dias de atraso
CREATE TABLE public.provisao_perda_esperada (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  periodo_atraso TEXT NOT NULL,
  prazo_inicial INTEGER NOT NULL,
  prazo_final INTEGER NOT NULL,
  c1_percentual DECIMAL NOT NULL,
  c2_percentual DECIMAL NOT NULL,
  c3_percentual DECIMAL NOT NULL,
  c4_percentual DECIMAL NOT NULL,
  c5_percentual DECIMAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de clientes
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  responsavel TEXT,
  data_cadastro DATE NOT NULL DEFAULT CURRENT_DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de bancos/instituições financeiras
CREATE TABLE public.bancos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  codigo_banco TEXT,
  contato TEXT,
  telefone TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela principal de dívidas/contratos
CREATE TABLE public.contratos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  banco_id UUID NOT NULL REFERENCES public.bancos(id) ON DELETE RESTRICT,
  numero_contrato TEXT,
  tipo_operacao TEXT NOT NULL,
  valor_divida DECIMAL NOT NULL,
  saldo_contabil DECIMAL,
  data_ultimo_pagamento DATE,
  data_vencimento DATE,
  dias_atraso INTEGER DEFAULT 0,
  meses_atraso DECIMAL DEFAULT 0,
  classificacao TEXT CHECK (classificacao IN ('C1', 'C2', 'C3', 'C4', 'C5')),
  percentual_provisao DECIMAL DEFAULT 0,
  valor_provisao DECIMAL DEFAULT 0,
  proposta_acordo DECIMAL,
  acordo_final DECIMAL,
  quantidade_planos INTEGER DEFAULT 0,
  situacao TEXT DEFAULT 'Em análise',
  data_entrada DATE NOT NULL DEFAULT CURRENT_DATE,
  data_conclusao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de processos/acompanhamento jurídico
CREATE TABLE public.processos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  contrato_id UUID NOT NULL REFERENCES public.contratos(id) ON DELETE CASCADE,
  numero_processo TEXT,
  acao TEXT,
  prazo DATE,
  protocolo TEXT,
  diligencias TEXT,
  liminar BOOLEAN DEFAULT false,
  justica_gratuita BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Em andamento',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir dados de referência do ANEXO I (Provisão por tempo)
INSERT INTO public.provisao_perdas_incorridas (criterio, prazo_inicial, prazo_final, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('Menor que um mês', 0, 0.99, 5.5, 30.0, 45.0, 35.0, 50.0),
('Igual ou maior que 1 e menor que 2 meses', 1, 1.99, 10.0, 33.4, 48.7, 39.5, 53.4),
('Igual ou maior que 2 e menor que 3 meses', 2, 2.99, 14.5, 36.8, 52.4, 44.0, 56.8),
('Igual ou maior que 3 e menor que 4 meses', 3, 3.99, 19.0, 40.2, 56.1, 48.5, 60.2),
('Igual ou maior que 4 e menor que 5 meses', 4, 4.99, 23.5, 43.6, 59.8, 53.0, 63.6),
('Igual ou maior que 5 e menor que 6 meses', 5, 5.99, 28.0, 47.0, 63.5, 57.5, 67.0),
('Igual ou maior que 6 e menor que 7 meses', 6, 6.99, 32.5, 50.4, 67.2, 62.0, 70.4),
('Igual ou maior que 7 e menor que 8 meses', 7, 7.99, 37.0, 53.8, 70.9, 66.5, 73.8),
('Igual ou maior que 8 e menor que 9 meses', 8, 8.99, 41.5, 57.2, 74.6, 71.0, 77.2),
('Igual ou maior que 9 e menor que 10 meses', 9, 9.99, 46.0, 60.6, 78.3, 75.5, 80.6),
('Igual ou maior que 10 e menor que 11 meses', 10, 10.99, 50.5, 64.0, 82.0, 80.0, 84.0),
('Igual ou maior que 11 e menor que 12 meses', 11, 11.99, 55.0, 67.4, 85.7, 84.5, 87.4),
('Igual ou maior que 12 e menor que 13 meses', 12, 12.99, 59.5, 70.8, 89.4, 89.0, 90.8),
('Igual ou maior que 13 e menor que 14 meses', 13, 13.99, 64.0, 74.2, 93.1, 93.5, 94.2),
('Igual ou maior que 14 e menor que 15 meses', 14, 14.99, 68.5, 77.6, 96.8, 98.0, 97.6),
('Igual ou maior que 15 e menor que 16 meses', 15, 15.99, 73.0, 81.0, 100.0, 100.0, 100.0),
('Igual ou maior que 16 e menor que 17 meses', 16, 16.99, 77.5, 84.4, 100.0, 100.0, 100.0),
('Igual ou maior que 17 e menor que 18 meses', 17, 17.99, 82.0, 87.8, 100.0, 100.0, 100.0),
('Igual ou maior que 18 e menor que 19 meses', 18, 18.99, 86.5, 91.2, 100.0, 100.0, 100.0),
('Igual ou maior que 19 e menor que 20 meses', 19, 19.99, 91.0, 94.6, 100.0, 100.0, 100.0),
('Igual ou maior que 21 meses', 21, 9999999, 100.0, 100.0, 100.0, 100.0, 100.0);

-- Inserir dados de referência do ANEXO II (Provisão por dias de atraso)
INSERT INTO public.provisao_perda_esperada (periodo_atraso, prazo_inicial, prazo_final, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('De zero a 14 dias', 0, 14, 1.4, 1.4, 1.9, 1.9, 1.9),
('De 15 a 30 dias', 15, 30, 3.5, 3.5, 3.5, 3.5, 7.5),
('De 31 a 60 dias', 31, 60, 4.5, 6.0, 13.0, 13.0, 15.0),
('De 61 a 90 dias', 61, 90, 5.0, 17.0, 32.0, 32.0, 38.0),
('De 91 a 119 dias', 91, 119, 5.5, 30.0, 45.0, 35.0, 50.0),
('De 120 a 149 dias', 120, 149, 19.0, 40.2, 56.1, 48.5, 60.2),
('De 150 a 179 dias', 150, 179, 23.5, 43.6, 59.8, 53.0, 63.6),
('De 180 a 209 dias', 180, 209, 28.0, 47.0, 63.5, 57.5, 67.0),
('De 210 a 239 dias', 210, 239, 32.5, 50.4, 67.2, 62.0, 70.4),
('De 240 a 269 dias', 240, 269, 37.0, 53.8, 70.9, 66.5, 73.8),
('De 270 a 299 dias', 270, 299, 41.5, 57.2, 74.6, 71.0, 77.2),
('De 300 a 329 dias', 300, 329, 46.0, 60.6, 78.3, 75.5, 80.6),
('De 330 a 359 dias', 330, 359, 50.5, 64.0, 82.0, 80.0, 84.0),
('De 360 a 389 dias', 360, 389, 55.0, 67.4, 85.7, 84.5, 87.4),
('De 390 a 419 dias', 390, 419, 59.5, 70.8, 89.4, 89.0, 90.8),
('De 420 a 449 dias', 420, 449, 64.0, 74.2, 93.1, 93.5, 94.2),
('De 450 a 479 dias', 450, 479, 68.5, 77.6, 96.8, 98.0, 97.6),
('De 480 a 509 dias', 480, 509, 73.0, 81.0, 100.0, 100.0, 100.0),
('De 510 a 539 dias', 510, 539, 77.5, 84.4, 100.0, 100.0, 100.0),
('De 540 a 569 dias', 540, 569, 82.0, 87.8, 100.0, 100.0, 100.0),
('De 600 a 629 dias', 600, 629, 91.0, 94.6, 100.0, 100.0, 100.0),
('De 630 a 659 dias', 630, 659, 95.5, 98.0, 100.0, 100.0, 100.0),
('De 660 a 689 dias', 660, 689, 100.0, 100.0, 100.0, 100.0, 100.0),
('De 690 a 719 dias', 690, 719, 100.0, 100.0, 100.0, 100.0, 100.0),
('De 720 a 749 dias', 720, 749, 100.0, 100.0, 100.0, 100.0, 100.0);

-- Inserir alguns bancos padrão baseados na planilha
INSERT INTO public.bancos (nome) VALUES
('Banco do Brasil'),
('Bradesco'),
('Itaú'),
('Caixa Econômica Federal'),
('Santander'),
('Safra'),
('Banco Votorantim S.A.'),
('Banco Toyota do Brasil S.A'),
('Banco GMAC S/A'),
('SICOOB'),
('SICRED'),
('UNICRED'),
('BRB'),
('Mercado Pago'),
('Banco do Nordeste'),
('Crédito Pessoal'),
('Renegociação');

-- Habilitar RLS nas tabelas
ALTER TABLE public.provisao_perdas_incorridas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provisao_perda_esperada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bancos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contratos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para acesso público (enquanto não há autenticação)
CREATE POLICY "Acesso público às tabelas de referência" ON public.provisao_perdas_incorridas FOR ALL USING (true);
CREATE POLICY "Acesso público às tabelas de referência" ON public.provisao_perda_esperada FOR ALL USING (true);
CREATE POLICY "Acesso público aos bancos" ON public.bancos FOR ALL USING (true);
CREATE POLICY "Acesso público aos clientes" ON public.clientes FOR ALL USING (true);
CREATE POLICY "Acesso público aos contratos" ON public.contratos FOR ALL USING (true);
CREATE POLICY "Acesso público aos processos" ON public.processos FOR ALL USING (true);

-- Função para atualizar timestamps automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Triggers para atualizar timestamps
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON public.clientes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bancos_updated_at BEFORE UPDATE ON public.bancos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contratos_updated_at BEFORE UPDATE ON public.contratos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_processos_updated_at BEFORE UPDATE ON public.processos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();