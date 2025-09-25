-- Adicionar novos campos para acordos e controle de escritório (excluindo acordo_final que já existe)
ALTER TABLE public.contratos 
ADD COLUMN data_entrada_escritorio date,
ADD COLUMN tempo_escritorio integer, -- tempo em dias no escritório
ADD COLUMN forma_pagamento text CHECK (forma_pagamento IN ('a_vista', 'parcelado')),
ADD COLUMN numero_parcelas integer CHECK (numero_parcelas >= 1 AND numero_parcelas <= 24),
ADD COLUMN valor_parcela numeric,
ADD COLUMN escritorio_banco_acordo text,
ADD COLUMN contato_acordo_nome text,
ADD COLUMN contato_acordo_telefone text,
ADD COLUMN reducao_divida numeric,
ADD COLUMN percentual_honorarios numeric CHECK (percentual_honorarios IN (10, 15, 20)),
ADD COLUMN valor_honorarios numeric;