# Módulo de Análise de Abusividade de Juros

## Visão Geral

O Módulo de Análise de Abusividade de Juros é um software independente integrado ao INTELLBANK, focado em identificar e analisar taxas de juros abusivas em contratos financeiros, comparando-as com as taxas de referência do BACEN.

## Estrutura do Módulo

### Páginas

- **`/juros/clientes`** - Gestão de Clientes para Análise de Juros
- **`/juros/contratos`** - Gestão de Contratos de Juros
- **`/juros/contratos/:id/analise`** - Análise Detalhada de Contrato
- **`/juros/calculadora`** - Calculadora de Juros e Taxas Efetivas

### Componentes

#### Forms
- `ClienteJurosForm` - Formulário de cadastro/edição de clientes
- `ContratoJurosForm` - Formulário de cadastro/edição de contratos

### Hooks Customizados

#### `useClientesJuros`
- `useClientesJuros()` - Lista todos os clientes
- `useClienteJurosById(id)` - Busca cliente por ID
- `useCreateClienteJuros()` - Cria novo cliente
- `useUpdateClienteJuros()` - Atualiza cliente existente
- `useDeleteClienteJuros()` - Remove cliente

#### `useContratosJuros`
- `useContratosJuros()` - Lista todos os contratos
- `useContratoJurosById(id)` - Busca contrato por ID
- `useCreateContratoJuros()` - Cria novo contrato
- `useUpdateContratoJuros()` - Atualiza contrato existente
- `useDeleteContratoJuros()` - Remove contrato

#### `useInstituicoesFinanceiras`
- Gerenciamento de instituições financeiras

#### `useModalidadesBacenJuros`
- Gerenciamento de modalidades BACEN para juros

### Bibliotecas de Cálculo

#### `calculoTaxaEfetiva.ts`

Funções principais:
- `calcularTaxaEfetiva(dados)` - Calcula taxa efetiva mensal, anual e CET
- `calcularValorParcela(valorFinanciado, taxa, parcelas)` - Calcula valor da parcela
- `calcularNumeroParcelas(valorFinanciado, valorParcela, taxa)` - Calcula número de parcelas
- `calcularValorFinanciado(valorParcela, taxa, parcelas)` - Calcula valor financiado
- `gerarTabelaPrice(valorFinanciado, taxa, parcelas)` - Gera tabela de amortização

## Tabelas do Banco de Dados

### `clientes_juros`
Armazena informações dos clientes para análise de juros.

**Campos principais:**
- `id` - UUID único
- `nome` - Nome do cliente (obrigatório)
- `cpf_cnpj` - CPF ou CNPJ
- `telefone` - Telefone de contato
- `email` - Email de contato
- `endereco` - Endereço completo
- `responsavel` - Nome do responsável
- `observacoes` - Observações gerais
- `data_cadastro` - Data de cadastro

### `contratos_juros`
Armazena os contratos financeiros para análise de abusividade.

**Campos principais:**
- `id` - UUID único
- `cliente_id` - Referência ao cliente
- `instituicao_id` - Referência à instituição financeira
- `modalidade_bacen_id` - Referência à modalidade BACEN
- `numero_contrato` - Número do contrato
- `data_contratacao` - Data de contratação
- `valor_financiado` - Valor total financiado
- `valor_parcela` - Valor de cada parcela
- `numero_parcelas` - Quantidade de parcelas
- `taxa_juros_contratual` - Taxa informada no contrato
- `taxa_juros_real` - Taxa efetivamente cobrada
- `diferenca_taxa` - Diferença entre taxas
- `percentual_diferenca` - Percentual de diferença
- `taxa_bacen_referencia` - Taxa de referência BACEN
- `diferenca_vs_bacen` - Diferença em relação ao BACEN
- `tem_abusividade` - Indicador de abusividade (boolean)
- `grau_abusividade` - Grau de abusividade (Baixa, Média, Alta, Crítica)
- `status_analise` - Status da análise (Pendente, Em Análise, Concluído)
- `observacoes` - Observações gerais
- `ultima_analise_em` - Data da última análise

### `instituicoes_financeiras`
Cadastro de bancos e instituições financeiras.

### `modalidades_bacen_juros`
Modalidades de crédito segundo o BACEN, com códigos SGS para consulta de taxas.

### `series_temporais_bacen`
Histórico de taxas BACEN por modalidade e período.

## Fluxo de Trabalho

### 1. Cadastro de Cliente
1. Acessar `/juros/clientes`
2. Clicar em "Novo Cliente"
3. Preencher formulário com dados do cliente
4. Salvar

### 2. Cadastro de Contrato
1. Acessar `/juros/contratos`
2. Clicar em "Novo Contrato"
3. Selecionar cliente
4. Preencher dados do contrato:
   - Instituição financeira
   - Modalidade BACEN
   - Valor financiado
   - Número de parcelas
   - Valor da parcela
   - Taxa contratual
5. Sistema calcula automaticamente:
   - Taxa efetiva mensal
   - Taxa efetiva anual
   - CET (Custo Efetivo Total)
   - Comparação com taxa BACEN

### 3. Análise de Contrato
1. Na lista de contratos, clicar no ícone de visualização
2. Sistema exibe:
   - Dados completos do contrato
   - Cálculos de taxas efetivas
   - Tabela de amortização (Price)
   - Comparação com taxas BACEN
   - Indicadores de abusividade

### 4. Calculadora de Juros
1. Acessar `/juros/calculadora`
2. Preencher campos disponíveis
3. Escolher tipo de cálculo:
   - Calcular Taxa
   - Calcular Parcela
   - Calcular Prazo
   - Calcular Valor Financiado
4. Visualizar resultados e tabela de amortização

## Cálculos Realizados

### Taxa Efetiva Mensal (TEM)
Calculada usando a fórmula da Regra de Três Financeira (Sistema Price):
```
VP = PMT × [(1 - (1 + i)^-n) / i]
```

### Taxa Efetiva Anual (TEA)
```
TEA = [(1 + TEM)^12 - 1] × 100
```

### Custo Efetivo Total (CET)
```
CET = TEA
```

### Tabela Price (Amortização)
Para cada parcela:
- Juros = Saldo Anterior × Taxa
- Amortização = Valor da Parcela - Juros
- Saldo Final = Saldo Anterior - Amortização

## Critérios de Abusividade

O sistema identifica abusividade comparando a taxa efetiva do contrato com a taxa BACEN de referência:

- **Conforme**: Taxa ≤ Taxa BACEN
- **Baixa**: Taxa > Taxa BACEN em até 50%
- **Média**: Taxa > Taxa BACEN de 50% a 100%
- **Alta**: Taxa > Taxa BACEN de 100% a 200%
- **Crítica**: Taxa > Taxa BACEN em mais de 200%

## Independência do Módulo

Este módulo é completamente independente do módulo de Provisionamento Bancário:

- **Tabelas próprias**: Utiliza `clientes_juros`, `contratos_juros`, etc.
- **Hooks dedicados**: `useClientesJuros`, `useContratosJuros`, etc.
- **Rotas separadas**: Todas sob o prefixo `/juros/`
- **Componentes exclusivos**: Forms e páginas específicas
- **Navegação isolada**: Seção própria na sidebar

## Tecnologias Utilizadas

- **React** - Framework frontend
- **TypeScript** - Tipagem estática
- **React Query** - Gerenciamento de estado e cache
- **Supabase** - Banco de dados e autenticação
- **Tailwind CSS** - Estilização
- **Shadcn/ui** - Componentes de UI
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas
- **date-fns** - Manipulação de datas

## Próximos Passos

1. ✅ Estrutura básica do módulo
2. ✅ CRUD de clientes
3. ✅ CRUD de contratos
4. ✅ Calculadora de juros
5. ✅ Página de análise detalhada
6. ⏳ Integração com API BACEN SGS
7. ⏳ Geração de relatórios
8. ⏳ Exportação de análises em PDF
9. ⏳ Dashboard analítico
10. ⏳ Comparação de múltiplos contratos

## Suporte

Para dúvidas ou problemas, contate a equipe de desenvolvimento.
