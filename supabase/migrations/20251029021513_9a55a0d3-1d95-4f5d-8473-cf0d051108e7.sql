-- =====================================================
-- INTELLIBANK - REPOPULAÇÃO DAS TABELAS EXISTENTES
-- Limpa e repopula as tabelas sem dropá-las
-- =====================================================

-- Limpar todas as tabelas (ordem importa devido a foreign keys)
TRUNCATE TABLE public.analises_gestao_passivo CASCADE;
TRUNCATE TABLE public.provisao_bcb352_anexo1 CASCADE;
TRUNCATE TABLE public.provisao_bcb352_anexo2 CASCADE;
TRUNCATE TABLE public.tipos_operacao_carteira CASCADE;
TRUNCATE TABLE public.bancos_brasil CASCADE;

-- =====================================================
-- REPOPULAR BANCOS BRASILEIROS (33 bancos)
-- =====================================================

INSERT INTO public.bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb) VALUES
-- S1 - Sistêmicos (6 bancos)
('001', 'Banco do Brasil S.A.', 'BB', 'S1'),
('237', 'Banco Bradesco S.A.', 'Bradesco', 'S1'),
('208', 'Banco BTG Pactual S.A.', 'BTG Pactual', 'S1'),
('104', 'Caixa Econômica Federal', 'CEF', 'S1'),
('341', 'Banco Itaú Unibanco S.A.', 'Itaú', 'S1'),
('033', 'Banco Santander (Brasil) S.A.', 'Santander', 'S1'),
-- S2 - Grandes (9 bancos)
('422', 'Banco Safra S.A.', 'Safra', 'S2'),
('655', 'Banco Votorantim S.A.', 'Votorantim', 'S2'),
('041', 'Banco do Estado do Rio Grande do Sul S.A.', 'Banrisul', 'S2'),
('756', 'Banco Cooperativo do Brasil S.A.', 'Bancoob', 'S2'),
('748', 'Banco Cooperativo Sicredi S.A.', 'Sicredi', 'S2'),
('077', 'Banco Inter S.A.', 'Inter', 'S2'),
('212', 'Banco Original S.A.', 'Original', 'S2'),
('623', 'Banco Pan S.A.', 'Pan', 'S2'),
('318', 'Banco BMG S.A.', 'BMG', 'S2'),
-- S3 - Médios (9 bancos)
('260', 'Nu Pagamentos S.A.', 'Nubank', 'S3'),
('290', 'Pagseguro Internet S.A.', 'PagBank', 'S3'),
('323', 'Mercado Pago', 'Mercado Pago', 'S3'),
('336', 'Banco C6 S.A.', 'C6 Bank', 'S3'),
('739', 'Banco Cetelem S.A.', 'Cetelem', 'S3'),
('626', 'Banco Ficsa S.A.', 'Ficsa', 'S3'),
('074', 'Banco J. Safra S.A.', 'J. Safra', 'S3'),
('389', 'Banco Mercantil do Brasil S.A.', 'Mercantil', 'S3'),
('070', 'BRB - Banco de Brasília S.A.', 'BRB', 'S3'),
-- S4 - Pequenos (9 bancos)
('707', 'Banco Daycoval S.A.', 'Daycoval', 'S4'),
('643', 'Banco Pine S.A.', 'Pine', 'S4'),
('633', 'Banco Rendimento S.A.', 'Rendimento', 'S4'),
('654', 'Banco A.J. Renner S.A.', 'Renner', 'S4'),
('479', 'Banco ItauBank S.A.', 'ItauBank', 'S4'),
('753', 'Novo Banco Continental S.A.', 'NBC', 'S4'),
('630', 'Banco Smartbank S.A.', 'Smartbank', 'S4'),
('746', 'Banco Modal S.A.', 'Modal', 'S4'),
('755', 'Bank of America Merrill Lynch', 'BofA', 'S4');

-- =====================================================
-- REPOPULAR TIPOS DE OPERAÇÃO (37 tipos)
-- =====================================================

INSERT INTO public.tipos_operacao_carteira (carteira, tipo_operacao, descricao) VALUES
-- C1 - Máxima Liquidez (7 tipos)
('C1', 'Depósitos em dinheiro', 'Garantia de máxima liquidez'),
('C1', 'Títulos públicos federais', 'Garantia de máxima liquidez'),
('C1', 'Aplicações em ouro', 'Garantia de máxima liquidez'),
('C1', 'Garantias fidejussórias da União', 'Garantia de máxima liquidez'),
('C1', 'Garantias fidejussórias de governos centrais', 'Garantia de máxima liquidez'),
('C1', 'Alienação fiduciária de imóveis residenciais', 'Garantia de máxima liquidez'),
('C1', 'Alienação fiduciária de imóveis comerciais', 'Garantia de máxima liquidez'),
-- C2 - Alta Liquidez (6 tipos)
('C2', 'Fiança bancária', 'Garantia de alta liquidez'),
('C2', 'Carta de fiança bancária', 'Garantia de alta liquidez'),
('C2', 'Alienação fiduciária de veículos', 'Garantia de alta liquidez'),
('C2', 'Hipoteca de imóveis (primeiro grau)', 'Garantia de alta liquidez'),
('C2', 'Títulos e valores mobiliários de alta liquidez', 'Garantia de alta liquidez'),
('C2', 'Seguro de crédito de instituições autorizadas', 'Garantia de alta liquidez'),
-- C3 - Liquidez Moderada (9 tipos)
('C3', 'Operações de desconto de recebíveis', 'Garantia de liquidez moderada'),
('C3', 'Cessão fiduciária de direitos creditórios', 'Garantia de liquidez moderada'),
('C3', 'Caução de direitos creditórios', 'Garantia de liquidez moderada'),
('C3', 'Penhor mercantil', 'Garantia de liquidez moderada'),
('C3', 'Penhor de direitos', 'Garantia de liquidez moderada'),
('C3', 'Garantias reais de menor liquidez', 'Garantia de liquidez moderada'),
('C3', 'Garantias fidejussórias (exceto C1)', 'Garantia de liquidez moderada'),
('C3', 'Aval', 'Garantia de liquidez moderada'),
('C3', 'Fiança pessoal', 'Garantia de liquidez moderada'),
-- C4 - SEM Garantia PJ (8 tipos)
('C4', 'Capital de giro sem garantia', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Conta garantida', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Cheque especial empresarial', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Adiantamento sobre contratos de câmbio (ACC)', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Adiantamento sobre cambiais entregues (ACE)', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Debêntures sem garantia', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Notas promissórias comerciais', 'Operação sem garantia - Pessoa Jurídica'),
('C4', 'Crédito rural para investimento sem garantia', 'Operação sem garantia - Pessoa Jurídica'),
-- C5 - SEM Garantia PF (7 tipos)
('C5', 'Crédito pessoal sem garantia', 'Operação sem garantia - Pessoa Física'),
('C5', 'Crédito direto ao consumidor (CDC)', 'Operação sem garantia - Pessoa Física'),
('C5', 'Cartão de crédito rotativo', 'Operação sem garantia - Pessoa Física'),
('C5', 'Cheque especial pessoa física', 'Operação sem garantia - Pessoa Física'),
('C5', 'Crédito consignado sem garantia adicional', 'Operação sem garantia - Pessoa Física'),
('C5', 'Crédito rural de custeio sem garantia', 'Operação sem garantia - Pessoa Física'),
('C5', 'Microcrédito sem garantia', 'Operação sem garantia - Pessoa Física');

-- =====================================================
-- REPOPULAR ANEXO I (22 faixas)
-- =====================================================

INSERT INTO public.provisao_bcb352_anexo1 (faixa_meses, meses_min, meses_max, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('Menor que 1 mês', 0, 1, 5.50, 30.00, 45.00, 35.00, 50.00),
('1-2 meses', 1, 2, 10.00, 33.40, 48.70, 39.50, 53.40),
('2-3 meses', 2, 3, 14.50, 36.80, 52.40, 44.00, 56.80),
('3-4 meses', 3, 4, 19.00, 40.20, 56.10, 48.50, 60.20),
('4-5 meses', 4, 5, 23.50, 43.60, 59.80, 53.00, 63.60),
('5-6 meses', 5, 6, 28.00, 47.00, 63.50, 57.50, 67.00),
('6-7 meses', 6, 7, 32.50, 50.40, 67.20, 62.00, 70.40),
('7-8 meses', 7, 8, 37.00, 53.80, 70.90, 66.50, 73.80),
('8-9 meses', 8, 9, 41.50, 57.20, 74.60, 71.00, 77.20),
('9-10 meses', 9, 10, 46.00, 60.60, 78.30, 75.50, 80.60),
('10-11 meses', 10, 11, 50.50, 64.00, 82.00, 80.00, 84.00),
('11-12 meses', 11, 12, 55.00, 67.40, 85.70, 84.50, 87.40),
('12-13 meses', 12, 13, 59.50, 70.80, 89.40, 89.00, 90.80),
('13-14 meses', 13, 14, 64.00, 74.20, 93.10, 93.50, 94.20),
('14-15 meses', 14, 15, 68.50, 77.60, 96.80, 98.00, 97.60),
('15-16 meses', 15, 16, 73.00, 81.00, 100.00, 100.00, 100.00),
('16-17 meses', 16, 17, 77.50, 84.40, 100.00, 100.00, 100.00),
('17-18 meses', 17, 18, 82.00, 87.80, 100.00, 100.00, 100.00),
('18-19 meses', 18, 19, 86.50, 91.20, 100.00, 100.00, 100.00),
('19-20 meses', 19, 20, 91.00, 94.60, 100.00, 100.00, 100.00),
('20-21 meses', 20, 21, 95.50, 98.00, 100.00, 100.00, 100.00),
('21+ meses', 21, NULL, 100.00, 100.00, 100.00, 100.00, 100.00);

-- =====================================================
-- REPOPULAR ANEXO II (4 faixas)
-- =====================================================

INSERT INTO public.provisao_bcb352_anexo2 (faixa_dias, dias_min, dias_max, c1_percentual, c2_percentual, c3_percentual, c4_percentual, c5_percentual) VALUES
('0-14 dias', 0, 14, 1.40, 1.40, 1.90, 1.90, 1.90),
('15-30 dias', 15, 30, 3.50, 3.50, 3.50, 3.50, 7.50),
('31-60 dias', 31, 60, 4.50, 6.00, 13.00, 13.00, 15.00),
('61-90 dias', 61, 90, 5.00, 17.00, 32.00, 32.00, 38.00);