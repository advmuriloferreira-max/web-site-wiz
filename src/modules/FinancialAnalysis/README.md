# Bacen Loan Wizard - Módulo de Análise Financeira

Este módulo contém toda a lógica de análise financeira e consulta de taxas do Banco Central, funcionando de forma completamente independente do módulo de Provisionamento Bancário Inteligente.

## Estrutura

```
FinancialAnalysis/
├── components/          # Componentes React
│   ├── AnalysisDashboard.tsx       # Componente principal
│   ├── FinancialMetricsCard.tsx    # Card de métricas
│   ├── BacenComparisonCard.tsx     # Comparação com Bacen
│   └── AnalysisHistoryTable.tsx    # Histórico de análises
├── hooks/              # React Hooks
│   └── useBacenRates.ts           # Hook para consulta Bacen
├── lib/                # Lógica de negócio
│   ├── financialCalculations.ts   # Cálculos financeiros
│   └── analysisReportGenerator.ts # Geração de PDFs
├── index.ts            # Ponto de entrada do módulo
└── README.md           # Documentação
```

## Uso

Para usar o módulo de análise financeira:

```typescript
import { AnalysisDashboard } from '@/modules/FinancialAnalysis';

function MinhaPage() {
  return <AnalysisDashboard contratoId="uuid-do-contrato" />;
}
```

## Funcionalidades

- **Métricas Financeiras**: TEA, TEM, CET, VPL, TIR, Índice de Cobertura
- **Comparação Bacen**: Compara taxas do contrato com referência Bacen
- **Histórico**: Registro de todas as consultas realizadas
- **Relatórios PDF**: Geração automática de relatórios completos

## Independência

Este módulo **não depende** do módulo de Provisionamento Bancário. Ele pode ser usado de forma standalone em qualquer parte da aplicação.

## Edge Functions

O módulo utiliza a edge function `get-bacen-rate` para consultar taxas do Banco Central.