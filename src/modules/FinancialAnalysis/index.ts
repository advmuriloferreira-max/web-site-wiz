/**
 * Bacen Loan Wizard - Módulo de Análise Financeira
 * Ponto de entrada central do módulo
 */

// Componente principal
export { default as AnalysisDashboard } from './components/AnalysisDashboard';

// Componentes secundários
export { default as FinancialMetricsCard } from './components/FinancialMetricsCard';
export { default as BacenComparisonCard } from './components/BacenComparisonCard';
export { default as AnalysisHistoryTable } from './components/AnalysisHistoryTable';

// Hooks
export * from './hooks/useBacenRates';

// Funções de cálculo
export * from './lib/financialCalculations';

// Geração de relatórios
export * from './lib/analysisReportGenerator';