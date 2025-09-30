-- Corrigir TODOS os códigos SGS das 48 modalidades conforme os arquivos CSV do BACEN

-- ARQUIVO 1: bacen-series-1.csv (códigos 25436-25443)
UPDATE modalidades_bacen_juros SET codigo_sgs = '25436' WHERE nome = 'Total - Recursos Livres' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25437' WHERE nome = 'Total - Pessoa Jurídica' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25438' WHERE nome = 'Desconto de Duplicatas - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25439' WHERE nome = 'Desconto de Cheques - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25440' WHERE nome = 'Antecipação de Faturas Cartão - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25441' WHERE nome = 'Capital de Giro com Prazo até 365 dias' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25442' WHERE nome = 'Capital de Giro com Prazo superior a 365 dias' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25443' WHERE nome = 'Capital de Giro com Prazo superior a 730 dias' AND tipo_pessoa = 'PJ';

-- ARQUIVO 2: bacen-series-2.csv (códigos 25444-25453)
UPDATE modalidades_bacen_juros SET codigo_sgs = '25444' WHERE nome = 'Capital de Giro Total' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25445' WHERE nome = 'Conta Garantida' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25446' WHERE nome = 'Cheque Especial - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25447' WHERE nome = 'Aquisição de Veículos - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25448' WHERE nome = 'Aquisição de Outros Bens - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25449' WHERE nome = 'Aquisição de Bens - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25450' WHERE nome = 'Vendor' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25451' WHERE nome = 'Compror' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25452' WHERE nome = 'Leasing de Veículos - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25453' WHERE nome = 'Total - Pessoa Física' AND tipo_pessoa = 'PF';

-- ARQUIVO 3: bacen-series-3.csv (códigos 25454-25462)
UPDATE modalidades_bacen_juros SET codigo_sgs = '25454' WHERE nome = 'Compror' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25455' WHERE nome = 'Cartão de Crédito Rotativo - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25456' WHERE nome = 'Cartão de Crédito Parcelado - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25457' WHERE nome = 'Cartão de Crédito Total - PJ' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25458' WHERE nome = 'ACC - Adiantamento sobre Contratos de Câmbio' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25459' WHERE nome = 'Financiamento a Importações' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25460' WHERE nome = 'Financiamento a Exportações' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25461' WHERE nome = 'Hot Money' AND tipo_pessoa = 'PJ';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25462' WHERE nome = 'Desconto de Recebíveis' AND tipo_pessoa = 'PJ';

-- ARQUIVO 4: bacen-series-4.csv (códigos 25463-25485)
UPDATE modalidades_bacen_juros SET codigo_sgs = '25463' WHERE nome = 'Cheque Especial' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25464' WHERE nome = 'Crédito Pessoal Não Consignado' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25465' WHERE nome = 'Crédito Pessoal Não Consignado - Composição' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25466' WHERE nome = 'Crédito Consignado Privado' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25467' WHERE nome = 'Crédito Consignado Público' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25468' WHERE nome = 'Crédito Consignado INSS' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25469' WHERE nome = 'Crédito Consignado Total' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25470' WHERE nome = 'Crédito Pessoal Total' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25471' WHERE nome = 'Aquisição de Veículos' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25472' WHERE nome = 'Aquisição de Outros Bens' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25473' WHERE nome = 'Aquisição de Bens Total' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25474' WHERE nome = 'Leasing de Veículos' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25475' WHERE nome = 'Leasing de Outros Bens' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25476' WHERE nome = 'Leasing Total' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25477' WHERE nome = 'Cartão de Crédito Rotativo' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25478' WHERE nome = 'Cartão de Crédito Parcelado' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25479' WHERE nome = 'Cartão de Crédito Total' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25480' WHERE nome = 'Desconto de Cheques' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25481' WHERE nome = 'Desconto de Duplicatas' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25482' WHERE nome = 'Antecipação de Faturas Cartão' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25483' WHERE nome = 'Total não rotativo - Pessoa Física' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25484' WHERE nome = 'Crédito Rural - PF' AND tipo_pessoa = 'PF';
UPDATE modalidades_bacen_juros SET codigo_sgs = '25485' WHERE nome = 'Financiamento Imobiliário - PF' AND tipo_pessoa = 'PF';