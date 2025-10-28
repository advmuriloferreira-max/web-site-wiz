# Simulador de Cenários - Gestão de Passivo Bancário

## Visão Geral

O Simulador de Cenários é uma ferramenta premium que permite ao advogado visualizar e comparar diferentes momentos de negociação, respondendo à pergunta: **"E se eu esperar mais X meses para negociar?"**

## Funcionalidades

### 1. Seleção de Contrato

- Dropdown com autocomplete de todos os contratos em análise
- Exibe informações resumidas: número, banco e percentual de provisão atual

### 2. Controle de Tempo

- Slider interativo para selecionar período de espera (0 a 24 meses)
- Visualização em tempo real das mudanças
- Atualização dinâmica de todos os cálculos

### 3. Comparação Lado a Lado

Exibe duas colunas comparativas:

**Cenário Atual (Hoje)**:
- Meses de atraso
- Provisão BCB 352 (%)
- Valor da provisão
- Valor da proposta
- % da proposta sobre o saldo
- Marco de provisionamento (50%, 60%, 70%, etc.)
- Momento de negociação (inicial, favorável, ótimo, premium, total)

**Cenário Futuro (Daqui a X meses)**:
- Mesmos campos do cenário atual
- Badges destacando mudanças significativas
- Destaque visual para o card futuro (borda primária)

### 4. Cálculo de Economia

Card destacado mostrando:
- Economia adicional em R$ ao aguardar
- Economia adicional em % do saldo devedor
- Gradiente visual atrativo

### 5. Recomendação Inteligente

Sistema de recomendação automática que analisa:

**Não Recomendado Aguardar** (⚠️ Alerta Laranja):
- Quando provisão já está em 90%+
- Sugere negociar imediatamente
- Explica que já está no momento premium

**Recomendado Aguardar** (✅ Sucesso Verde):
- Quando aguardar levará a 90%+ de provisão
- Destaca economia adicional significativa
- Menciona atingimento de momento premium (proposta fixa 10%)

**Aguardar Pode Ser Vantajoso** (ℹ️ Info Azul):
- Quando haverá mudança de marco significativa
- Mostra economia percentual adicional
- Não é tão crítico quanto premium, mas vale considerar

**Análise Neutra** (➖ Neutro Cinza):
- Quando economia é marginal
- Sugere considerar outros fatores (urgência, relacionamento)
- Não há vantagem clara em aguardar

### 6. Gráficos Interativos

**Gráfico de Evolução da Proposta** (Area Chart):
- Eixo X: Meses a aguardar (0-24)
- Eixo Y: Valor da proposta em R$
- Área preenchida com gradiente azul
- Linha de referência vertical no período selecionado
- Tooltip com valores formatados

**Gráfico de Evolução da Provisão** (Line Chart):
- Eixo X: Meses a aguardar (0-24)
- Eixo Y: Percentual de provisão (0-100%)
- Linhas de referência nos marcos (50%, 70%, 90%, 100%)
- Formato step-after (degraus) para mostrar saltos
- Marcador no período selecionado

## Lógica de Cálculo

### Projeção de Provisão

A provisão é calculada baseada nos meses de atraso projetados:

```typescript
const calcularProvisao = (meses: number): number => {
  if (meses >= 24) return 100;  // 2+ anos = 100%
  if (meses >= 18) return 90;   // 18-24 meses = 90%
  if (meses >= 15) return 80;   // 15-18 meses = 80%
  if (meses >= 12) return 70;   // 12-15 meses = 70%
  if (meses >= 9) return 60;    // 9-12 meses = 60%
  if (meses >= 6) return 50;    // 6-9 meses = 50%
  if (meses >= 3) return 30;    // 3-6 meses = 30%
  return 10;                     // 0-3 meses = 10%
};
```

### Cálculo da Proposta

Baseado no percentual de provisão:

```typescript
const calcularProposta = (provisao: number): number => {
  if (provisao >= 90) {
    // Provisão >= 90%: Proposta fixa de 10% do saldo
    return saldoDevedor * 0.10;
  } else {
    // Provisão < 90%: Saldo - Valor Provisionado
    return saldoDevedor - (saldoDevedor * (provisao / 100));
  }
};
```

### Economia Adicional

```typescript
const economiaAdicional = propostaAtual - propostaFutura;
const percentualEconomia = (economiaAdicional / saldoDevedor) * 100;
```

## Casos de Uso

### Caso 1: Contrato em 70% de Provisão

**Situação**: Cliente com contrato 12 meses em atraso (70% provisão)

**Simulação**: Aguardar 6 meses

**Resultado**:
- Provisão subirá de 70% para 90%
- Proposta cairá de R$ 300.000 para R$ 100.000 (fixa em 10%)
- Economia adicional: R$ 200.000 (20% do saldo)
- **Recomendação**: ✅ Aguardar - atingirá momento premium

### Caso 2: Contrato em 90% de Provisão

**Situação**: Cliente com contrato 18 meses em atraso (90% provisão)

**Simulação**: Aguardar 3 meses

**Resultado**:
- Provisão subirá de 90% para 90% (já no teto antes de 100%)
- Proposta permanece em 10% fixo
- Economia adicional: R$ 0
- **Recomendação**: ⚠️ Não aguardar - já está no momento ideal

### Caso 3: Contrato em 50% de Provisão

**Situação**: Cliente com contrato 6 meses em atraso (50% provisão)

**Simulação**: Aguardar 6 meses

**Resultado**:
- Provisão subirá de 50% para 70%
- Proposta cairá de R$ 500.000 para R$ 300.000
- Economia adicional: R$ 200.000 (20% do saldo)
- **Recomendação**: ℹ️ Considerar aguardar - melhora significativa

## Navegação

### Acesso ao Simulador

1. **Menu Lateral**: Gestão de Passivo Bancário → Simulador de Cenários
2. **Dashboard de Oportunidades**: Botão "Simulador" no header
3. **Lista de Análises**: Botão "Simulador" no header
4. **URL Direta**: `/app/gestao-passivo/simulador`

## Design e UX

### Cores e Badges

**Momentos de Negociação**:
- Inicial: Cinza (`bg-gray-500/10 text-gray-600`)
- Favorável: Amarelo (`bg-yellow-500/10 text-yellow-600`)
- Muito Favorável: Verde Limão (`bg-lime-500/10 text-lime-600`)
- Ótimo: Verde (`bg-green-500/10 text-green-600`)
- Premium: Roxo (`bg-purple-500/10 text-purple-600`)
- Total: Vermelho (`bg-red-500/10 text-red-600`)

### Responsividade

- Grid adaptativo (1 coluna em mobile, 2 em desktop)
- Gráficos responsivos com `ResponsiveContainer`
- Botões empilhados em telas pequenas
- Cards com scroll horizontal se necessário

## Melhorias Futuras

- [ ] Integrar com tabela real de provisão BCB 352 (não simplificada)
- [ ] Adicionar consideração de garantias na projeção
- [ ] Incluir análise de risco de prescrição
- [ ] Permitir ajuste manual de parâmetros
- [ ] Exportar simulação em PDF
- [ ] Comparar múltiplos cenários simultaneamente
- [ ] Considerar histórico de negociações com o banco
- [ ] Adicionar alertas automáticos quando momento mudar
- [ ] Machine learning para prever aceitação de propostas
- [ ] Integração com calendário para lembrar de revisitar

## Tecnologias Utilizadas

- **React**: Framework principal
- **Recharts**: Gráficos interativos (LineChart, AreaChart)
- **Shadcn/ui**: Componentes UI (Card, Button, Slider, Select, Badge)
- **Lucide React**: Ícones
- **TailwindCSS**: Estilização
- **React Router**: Navegação
- **TanStack Query**: Gerenciamento de estado e cache

## Fórmulas e Referências

### Resolução BCB 352/2023

A provisão é calculada conforme Anexo I da BCB 352/2023:

| Carteira | Atraso | Provisão |
|----------|--------|----------|
| C1, C2 | 0-3 meses | 0-30% |
| C1, C2 | 3-6 meses | 30-50% |
| C1, C2 | 6-12 meses | 50-70% |
| C1, C2 | 12-18 meses | 70-90% |
| C1, C2 | 18-24 meses | 90-100% |
| C1, C2 | 24+ meses | 100% |

### Momento Premium (90%)

Quando a provisão atinge 90%:
- Banco já reconheceu perda de 90% do valor
- Proposta fixa em 10% é altamente vantajosa
- Banco prefere recuperar 10% a perder 100%
- Momento ideal para negociação agressiva

## Suporte e Documentação

Para mais informações sobre o módulo de Gestão de Passivo Bancário:
- Ver `MODULO_GESTAO_PASSIVO.md`
- Ver `SISTEMA_ALERTAS_PROVISAO.md`
- Ver documentação BCB 352/2023
