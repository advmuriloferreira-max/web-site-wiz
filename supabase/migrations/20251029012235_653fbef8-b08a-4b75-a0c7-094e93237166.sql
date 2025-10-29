-- Popular bancos_brasil com principais bancos por segmento prudencial BCB

-- Limpar dados anteriores
DELETE FROM public.bancos_brasil;

-- SEGMENTO S1 (Bancos Sistêmicos - ≥ 10% do PIB)
INSERT INTO public.bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, ativo) VALUES
('001', 'Banco do Brasil S.A.', 'BB', 'S1', true),
('237', 'Banco Bradesco S.A.', 'Bradesco', 'S1', true),
('208', 'Banco BTG Pactual S.A.', 'BTG Pactual', 'S1', true),
('104', 'Caixa Econômica Federal', 'CEF', 'S1', true),
('341', 'Banco Itaú Unibanco S.A.', 'Itaú', 'S1', true),
('033', 'Banco Santander (Brasil) S.A.', 'Santander', 'S1', true);

-- SEGMENTO S2 (Grandes Bancos)
INSERT INTO public.bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, ativo) VALUES
('422', 'Banco Safra S.A.', 'Safra', 'S2', true),
('655', 'Banco Votorantim S.A.', 'Votorantim', 'S2', true),
('041', 'Banco do Estado do Rio Grande do Sul S.A.', 'Banrisul', 'S2', true),
('756', 'Banco Cooperativo do Brasil S.A.', 'Bancoob', 'S2', true),
('748', 'Banco Cooperativo Sicredi S.A.', 'Sicredi', 'S2', true),
('077', 'Banco Inter S.A.', 'Inter', 'S2', true),
('212', 'Banco Original S.A.', 'Original', 'S2', true),
('623', 'Banco Pan S.A.', 'Pan', 'S2', true),
('318', 'Banco BMG S.A.', 'BMG', 'S2', true);

-- SEGMENTO S3 (Bancos Médios)
INSERT INTO public.bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, ativo) VALUES
('260', 'Nu Pagamentos S.A. (Nubank)', 'Nubank', 'S3', true),
('290', 'Pagseguro Internet S.A.', 'PagBank', 'S3', true),
('323', 'Mercado Pago', 'Mercado Pago', 'S3', true),
('336', 'Banco C6 S.A.', 'C6 Bank', 'S3', true),
('739', 'Banco Cetelem S.A.', 'Cetelem', 'S3', true),
('626', 'Banco Ficsa S.A.', 'Ficsa', 'S3', true),
('074', 'Banco J. Safra S.A.', 'J. Safra', 'S3', true),
('389', 'Banco Mercantil do Brasil S.A.', 'Mercantil', 'S3', true),
('070', 'BRB - Banco de Brasília S.A.', 'BRB', 'S3', true);

-- SEGMENTO S4 (Bancos Pequenos)
INSERT INTO public.bancos_brasil (codigo_compe, nome_completo, nome_curto, segmento_bcb, ativo) VALUES
('707', 'Banco Daycoval S.A.', 'Daycoval', 'S4', true),
('643', 'Banco Pine S.A.', 'Pine', 'S4', true),
('633', 'Banco Rendimento S.A.', 'Rendimento', 'S4', true),
('654', 'Banco A.J. Renner S.A.', 'Renner', 'S4', true),
('479', 'Banco ItauBank S.A.', 'ItauBank', 'S4', true),
('753', 'Novo Banco Continental S.A.', 'NBC', 'S4', true),
('630', 'Banco Smartbank S.A.', 'Smartbank', 'S4', true),
('746', 'Banco Modal S.A.', 'Modal', 'S4', true),
('755', 'Bank of America Merrill Lynch', 'BofA', 'S4', true);

-- Comentário de validação
COMMENT ON TABLE public.bancos_brasil IS 'Principais bancos brasileiros por segmento prudencial BCB. S1: 6 bancos sistêmicos. S2: 9 grandes bancos. S3: 9 bancos médios. S4: 9 bancos pequenos. Total: 33 bancos.';