/**
 * Módulo de cálculos financeiros para análise de contratos
 * Migrado do Bacen Loan Wizard
 */

export interface FinancialMetrics {
  taxaEfetivaAnual: number;
  taxaEfetivaMensal: number;
  custoEfetivoTotal: number;
  valorPresenteLiquido: number;
  taxaInternaRetorno: number;
  indiceCoberturaDivida: number;
  relacaoGarantias: number;
}

export interface ContractFinancialData {
  valorDivida: number;
  saldoContabil?: number;
  taxaBacen?: number;
  taxaJuros?: number;
  prazoMeses?: number;
  valorParcela?: number;
  valorGarantias?: number;
  diasAtraso?: number;
  percentualProvisao?: number;
}

/**
 * Calcula a taxa efetiva anual (TEA) a partir da taxa mensal
 */
export function calcularTaxaEfetivaAnual(taxaMensal: number): number {
  return (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100;
}

/**
 * Calcula a taxa efetiva mensal (TEM) a partir da taxa anual
 */
export function calcularTaxaEfetivaMensal(taxaAnual: number): number {
  return (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
}

/**
 * Calcula o Custo Efetivo Total (CET) do contrato
 */
export function calcularCustoEfetivoTotal(
  valorDivida: number,
  totalPago: number,
  prazoMeses: number
): number {
  if (prazoMeses === 0) return 0;
  
  const custoTotal = totalPago - valorDivida;
  const percentualCusto = (custoTotal / valorDivida) * 100;
  const cetAnual = (percentualCusto / prazoMeses) * 12;
  
  return cetAnual;
}

/**
 * Calcula o Valor Presente Líquido (VPL) do contrato
 */
export function calcularVPL(
  fluxosCaixa: number[],
  taxaDesconto: number
): number {
  let vpl = 0;
  
  for (let periodo = 0; periodo < fluxosCaixa.length; periodo++) {
    const valorPresente = fluxosCaixa[periodo] / Math.pow(1 + taxaDesconto / 100, periodo);
    vpl += valorPresente;
  }
  
  return vpl;
}

/**
 * Calcula a Taxa Interna de Retorno (TIR) usando método iterativo
 */
export function calcularTIR(
  fluxosCaixa: number[],
  tentativaInicial: number = 0.1
): number {
  const maxIteracoes = 100;
  const precisao = 0.000001;
  let tir = tentativaInicial;
  
  for (let i = 0; i < maxIteracoes; i++) {
    let vpl = 0;
    let derivada = 0;
    
    for (let t = 0; t < fluxosCaixa.length; t++) {
      const fator = Math.pow(1 + tir, t);
      vpl += fluxosCaixa[t] / fator;
      derivada -= t * fluxosCaixa[t] / (fator * (1 + tir));
    }
    
    const novaTir = tir - vpl / derivada;
    
    if (Math.abs(novaTir - tir) < precisao) {
      return novaTir * 100;
    }
    
    tir = novaTir;
  }
  
  return tir * 100;
}

/**
 * Calcula o Índice de Cobertura da Dívida
 */
export function calcularIndiceCoberturaDivida(
  fluxoCaixaOperacional: number,
  servicoDivida: number
): number {
  if (servicoDivida === 0) return 0;
  return fluxoCaixaOperacional / servicoDivida;
}

/**
 * Calcula a relação entre garantias e dívida
 */
export function calcularRelacaoGarantias(
  valorGarantias: number,
  valorDivida: number
): number {
  if (valorDivida === 0) return 0;
  return (valorGarantias / valorDivida) * 100;
}

/**
 * Calcula todas as métricas financeiras de um contrato
 */
export function calcularMetricasFinanceiras(
  data: ContractFinancialData
): FinancialMetrics {
  const {
    valorDivida,
    saldoContabil = valorDivida,
    taxaBacen = 0,
    taxaJuros = taxaBacen,
    prazoMeses = 12,
    valorParcela = 0,
    valorGarantias = 0,
    diasAtraso = 0,
  } = data;

  // Calcula taxa efetiva anual e mensal
  const taxaMensal = taxaJuros || taxaBacen || 0;
  const taxaAnual = calcularTaxaEfetivaAnual(taxaMensal);

  // Calcula CET
  const totalPago = valorParcela * prazoMeses;
  const custoEfetivoTotal = calcularCustoEfetivoTotal(valorDivida, totalPago, prazoMeses);

  // Calcula VPL - fluxo de caixa simplificado
  const fluxosCaixa = [-valorDivida];
  for (let i = 0; i < prazoMeses; i++) {
    fluxosCaixa.push(valorParcela);
  }
  const vpl = calcularVPL(fluxosCaixa, taxaMensal);

  // Calcula TIR
  const tir = calcularTIR(fluxosCaixa);

  // Calcula índice de cobertura
  const servicoDivida = valorParcela;
  const fluxoCaixaOperacional = valorParcela * 1.2; // Estimativa
  const indiceCoberturaDivida = calcularIndiceCoberturaDivida(
    fluxoCaixaOperacional,
    servicoDivida
  );

  // Calcula relação de garantias
  const relacaoGarantias = calcularRelacaoGarantias(valorGarantias, valorDivida);

  return {
    taxaEfetivaAnual: taxaAnual,
    taxaEfetivaMensal: taxaMensal,
    custoEfetivoTotal,
    valorPresenteLiquido: vpl,
    taxaInternaRetorno: tir,
    indiceCoberturaDivida,
    relacaoGarantias,
  };
}

/**
 * Compara taxa do contrato com taxa de referência do Bacen
 */
export function compararTaxaBacen(
  taxaContrato: number,
  taxaBacen: number
): {
  diferenca: number;
  percentualDiferenca: number;
  acimaMercado: boolean;
} {
  const diferenca = taxaContrato - taxaBacen;
  const percentualDiferenca = taxaBacen > 0 ? (diferenca / taxaBacen) * 100 : 0;
  
  return {
    diferenca,
    percentualDiferenca,
    acimaMercado: diferenca > 0,
  };
}

/**
 * Calcula o impacto de renegociação
 */
export function calcularImpactoRenegociacao(
  valorOriginal: number,
  valorNegociado: number,
  taxaOriginal: number,
  taxaNegociada: number,
  prazoOriginal: number,
  prazoNegociado: number
): {
  economiaValor: number;
  economiaTaxa: number;
  diferencaPrazo: number;
  percentualEconomiaTotal: number;
} {
  const parcelaOriginal = valorOriginal / prazoOriginal;
  const parcelaNegociada = valorNegociado / prazoNegociado;
  
  const totalOriginal = parcelaOriginal * prazoOriginal * (1 + taxaOriginal / 100);
  const totalNegociado = parcelaNegociada * prazoNegociado * (1 + taxaNegociada / 100);
  
  const economiaValor = totalOriginal - totalNegociado;
  const economiaTaxa = taxaOriginal - taxaNegociada;
  const diferencaPrazo = prazoNegociado - prazoOriginal;
  const percentualEconomiaTotal = (economiaValor / totalOriginal) * 100;
  
  return {
    economiaValor,
    economiaTaxa,
    diferencaPrazo,
    percentualEconomiaTotal,
  };
}
