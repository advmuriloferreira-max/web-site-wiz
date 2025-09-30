# Módulo de Análise de Abusividade de Juros

## Visão Geral

O Módulo de Análise de Abusividade de Juros é um software independente integrado ao INTELLBANK, focado em identificar e analisar taxas de juros abusivas em contratos financeiros, comparando-as com as taxas de referência do BACEN.

## Estrutura do Módulo

### Páginas

- **`/juros/clientes`** - Gestão de Clientes para Análise de Juros
- **`/juros/contratos`** - Gestão de Contratos de Juros (com cálculos automáticos)
- **`/juros/contratos/:id/analise`** - Análise Detalhada de Contrato

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

### 2. Cadastro de Contrato (Com Cálculos Automáticos)
1. Acessar `/juros/contratos`
2. Clicar em "Novo Contrato"
3. Preencher o formulário:
   - Cliente *
   - Instituição financeira *
   - Data de contratação *
   - Número do contrato
   - Tipo de operação
   - Modalidade BACEN (para comparação)
   - Valor financiado *
   - Número de parcelas *
   - Valor da parcela *
   - Taxa contratual (opcional)

4. **O sistema calcula automaticamente em tempo real:**
   - Taxa efetiva mensal (TEM)
   - Taxa efetiva anual (TEA)
   - CET (Custo Efetivo Total)
   - Total de juros
   - Total a pagar
   - Taxa BACEN de referência (se modalidade selecionada)
   - Diferença vs taxa BACEN
   - Percentual acima do mercado
   - Indicador de abusividade
   - Grau de abusividade (Baixa, Média, Alta, Crítica)

5. Os cálculos são salvos automaticamente com o contrato

### 3. Análise de Contrato
1. Na lista de contratos, clicar no ícone de visualização
2. Sistema exibe:
   - Dados completos do contrato
   - Cálculos de taxas efetivas
   - Tabela de amortização (Price)
   - Comparação com taxas BACEN
   - Indicadores de abusividade


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

## Diferenciais do Sistema

### Cálculos Automáticos em Tempo Real
- O sistema calcula automaticamente todas as taxas conforme o usuário preenche os dados
- Não é necessário usar calculadora separada
- Feedback imediato sobre abusividade
- Comparação automática com taxas BACEN

### Interface Intuitiva
- Formulário único com todos os cálculos
- Visual claro dos resultados
- Indicadores visuais de abusividade
- Organização por cards temáticos

## Próximos Passos

1. ✅ Estrutura básica do módulo
2. ✅ CRUD de clientes
3. ✅ CRUD de contratos com cálculos automáticos
4. ✅ Integração com taxas BACEN
5. ✅ Página de análise detalhada
6. ⏳ Geração de relatórios
7. ⏳ Exportação de análises em PDF
8. ⏳ Dashboard analítico
9. ⏳ Comparação de múltiplos contratos
10. ⏳ Histórico de taxas BACEN

## Suporte

Para dúvidas ou problemas, contate a equipe de desenvolvimento.
