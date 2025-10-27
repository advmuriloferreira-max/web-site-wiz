/**
 * Biblioteca de Cálculos para Análise de Juros Abusivos
 * Sistema INTELLBANK - Ações Revisionais
 */

export interface DadosContratoJuros {
  valorFinanciado?: number;
  taxaMensal?: number;
  valorParcela?: number;
  numeroParcelas?: number;
}

export interface ResultadoCalculo {
  valorFinanciado: number;
  taxaMensal: number;
  taxaAnual: number;
  valorParcela: number;
  numeroParcelas: number;
  totalPago: number;
  totalJuros: number;
  custoEfetivoTotal: number;
}

/**
 * Calcula a taxa de juros usando método de Newton-Raphson
 */
export function calcularTaxaJuros(
  valorFinanciado: number,
  parcela: number,
  prazo: number
): number {
  let taxa = 0.01; // chute inicial de 1% a.m.
  const epsilon = 0.0000001;
  const maxIteracoes = 100;

  for (let i = 0; i < maxIteracoes; i++) {
    const potencia = Math.pow(1 + taxa, prazo);
    const f = parcela - (valorFinanciado * taxa * potencia) / (potencia - 1);
    const df =
      valorFinanciado *
      ((potencia - 1 - taxa * prazo * potencia) / Math.pow(potencia - 1, 2));

    const novaTaxa = taxa - f / df;

    if (Math.abs(novaTaxa - taxa) < epsilon) {
      return novaTaxa * 100; // retorna em percentual
    }

    taxa = novaTaxa;
  }

  return taxa * 100;
}

/**
 * Calcula o valor da parcela pela Tabela Price
 */
export function calcularValorParcela(
  valorFinanciado: number,
  taxaMensal: number,
  prazo: number
): number {
  const taxa = taxaMensal / 100;
  const potencia = Math.pow(1 + taxa, prazo);
  return (valorFinanciado * taxa * potencia) / (potencia - 1);
}

/**
 * Calcula o valor financiado
 */
export function calcularValorFinanciado(
  parcela: number,
  taxaMensal: number,
  prazo: number
): number {
  const taxa = taxaMensal / 100;
  const potencia = Math.pow(1 + taxa, prazo);
  return (parcela * (potencia - 1)) / (taxa * potencia);
}

/**
 * Calcula o número de parcelas
 */
export function calcularNumeroParcelas(
  valorFinanciado: number,
  parcela: number,
  taxaMensal: number
): number {
  const taxa = taxaMensal / 100;
  return Math.log(parcela / (parcela - valorFinanciado * taxa)) / Math.log(1 + taxa);
}

/**
 * Calcula taxa anual a partir da mensal
 */
export function calcularTaxaAnual(taxaMensal: number): number {
  return (Math.pow(1 + taxaMensal / 100, 12) - 1) * 100;
}

/**
 * Calcula taxa mensal a partir da anual
 */
export function calcularTaxaMensal(taxaAnual: number): number {
  return (Math.pow(1 + taxaAnual / 100, 1 / 12) - 1) * 100;
}

/**
 * Completa os dados do contrato calculando o campo faltante
 */
export function completarDadosContrato(dados: DadosContratoJuros): ResultadoCalculo | null {
  const camposPreenchidos = [
    dados.valorFinanciado,
    dados.taxaMensal,
    dados.valorParcela,
    dados.numeroParcelas,
  ].filter((v) => v !== undefined && v !== null && v > 0).length;

  if (camposPreenchidos !== 3) {
    return null; // Precisa de exatamente 3 campos
  }

  let valorFinanciado = dados.valorFinanciado || 0;
  let taxaMensal = dados.taxaMensal || 0;
  let valorParcela = dados.valorParcela || 0;
  let numeroParcelas = dados.numeroParcelas || 0;

  // Calcula o campo faltante
  if (!valorFinanciado || valorFinanciado === 0) {
    valorFinanciado = calcularValorFinanciado(valorParcela, taxaMensal, numeroParcelas);
  } else if (!taxaMensal || taxaMensal === 0) {
    taxaMensal = calcularTaxaJuros(valorFinanciado, valorParcela, numeroParcelas);
  } else if (!valorParcela || valorParcela === 0) {
    valorParcela = calcularValorParcela(valorFinanciado, taxaMensal, numeroParcelas);
  } else if (!numeroParcelas || numeroParcelas === 0) {
    numeroParcelas = calcularNumeroParcelas(valorFinanciado, valorParcela, taxaMensal);
  }

  const taxaAnual = calcularTaxaAnual(taxaMensal);
  const totalPago = valorParcela * numeroParcelas;
  const totalJuros = totalPago - valorFinanciado;
  const custoEfetivoTotal = (totalJuros / valorFinanciado) * 100;

  return {
    valorFinanciado,
    taxaMensal,
    taxaAnual,
    valorParcela,
    numeroParcelas,
    totalPago,
    totalJuros,
    custoEfetivoTotal,
  };
}

/**
 * Gera tabela Price completa
 */
export interface ParcelaTabela {
  numero: number;
  valorParcela: number;
  juros: number;
  amortizacao: number;
  saldoDevedor: number;
}

export function gerarTabelaPrice(
  valorFinanciado: number,
  taxaMensal: number,
  numeroParcelas: number
): ParcelaTabela[] {
  const taxa = taxaMensal / 100;
  const valorParcela = calcularValorParcela(valorFinanciado, taxaMensal, numeroParcelas);
  const tabela: ParcelaTabela[] = [];
  let saldoDevedor = valorFinanciado;

  for (let i = 1; i <= numeroParcelas; i++) {
    const juros = saldoDevedor * taxa;
    const amortizacao = valorParcela - juros;
    saldoDevedor -= amortizacao;

    tabela.push({
      numero: i,
      valorParcela,
      juros,
      amortizacao,
      saldoDevedor: Math.max(0, saldoDevedor),
    });
  }

  return tabela;
}

/**
 * Calcula o prejuízo do cliente
 */
export interface CalculoPrejuizo {
  valorPagoIndevido: number;
  diferencaSaldoDevedor: number;
  valorTotalPrejuizo: number;
  parcelasComTaxaCorreta: number;
  diferencaMensal: number;
}

export function calcularPrejuizo(
  valorFinanciado: number,
  numeroParcelas: number,
  parcelasJaPagas: number,
  taxaAbusiva: number,
  taxaCorreta: number
): CalculoPrejuizo {
  // Calcula com taxa abusiva
  const parcelaAbusiva = calcularValorParcela(valorFinanciado, taxaAbusiva, numeroParcelas);
  const tabelaAbusiva = gerarTabelaPrice(valorFinanciado, taxaAbusiva, numeroParcelas);

  // Calcula com taxa correta
  const parcelaCorreta = calcularValorParcela(valorFinanciado, taxaCorreta, numeroParcelas);
  const tabelaCorreta = gerarTabelaPrice(valorFinanciado, taxaCorreta, numeroParcelas);

  // Valor pago a mais em cada parcela
  const valorPagoIndevido = (parcelaAbusiva - parcelaCorreta) * parcelasJaPagas;

  // Diferença no saldo devedor
  const saldoAbusivo =
    parcelasJaPagas > 0 && parcelasJaPagas <= tabelaAbusiva.length
      ? tabelaAbusiva[parcelasJaPagas - 1].saldoDevedor
      : 0;
  const saldoCorreto =
    parcelasJaPagas > 0 && parcelasJaPagas <= tabelaCorreta.length
      ? tabelaCorreta[parcelasJaPagas - 1].saldoDevedor
      : 0;
  const diferencaSaldoDevedor = saldoAbusivo - saldoCorreto;

  return {
    valorPagoIndevido,
    diferencaSaldoDevedor,
    valorTotalPrejuizo: valorPagoIndevido + diferencaSaldoDevedor,
    parcelasComTaxaCorreta: parcelaCorreta,
    diferencaMensal: parcelaAbusiva - parcelaCorreta,
  };
}

/**
 * Análise de abusividade comparada ao BACEN
 */
export interface AnaliseAbusividade {
  diferencaAbsoluta: number;
  percentualAbusividade: number;
  abusividadeDetectada: boolean;
  grauAbusividade: string;
  taxaLimiteAceitavel: number;
  excedeLimite: boolean;
}

export function analisarAbusividade(
  taxaContrato: number,
  taxaBacen: number
): AnaliseAbusividade {
  const diferencaAbsoluta = taxaContrato - taxaBacen;
  const percentualAbusividade = ((taxaContrato / taxaBacen - 1) * 100);
  const taxaLimiteAceitavel = taxaBacen * 1.5; // 150% da taxa BACEN
  const excedeLimite = taxaContrato > taxaLimiteAceitavel;
  const abusividadeDetectada = excedeLimite; // Taxa > 1,5x BACEN (critério STJ)

  let grauAbusividade = "Dentro do Mercado";
  if (percentualAbusividade > 100) grauAbusividade = "Gravíssimo";
  else if (percentualAbusividade > 50) grauAbusividade = "Muito Grave";
  else if (percentualAbusividade > 35) grauAbusividade = "Grave";
  else if (percentualAbusividade > 20) grauAbusividade = "Moderado";
  else if (percentualAbusividade > 10) grauAbusividade = "Leve";

  return {
    diferencaAbsoluta,
    percentualAbusividade,
    abusividadeDetectada,
    grauAbusividade,
    taxaLimiteAceitavel,
    excedeLimite,
  };
}

/**
 * Análise comparativa entre taxa real e contratual
 */
export interface AnaliseDiscrepancia {
  taxaReal: number;
  taxaContratual: number;
  diferencaTaxas: number;
  percentualDiferenca: number;
  temDiscrepancia: boolean;
}

export function analisarDiscrepanciaTaxas(
  taxaReal: number,
  taxaContratual: number
): AnaliseDiscrepancia {
  const diferencaTaxas = taxaReal - taxaContratual;
  const percentualDiferenca = ((taxaReal / taxaContratual - 1) * 100);
  const temDiscrepancia = Math.abs(diferencaTaxas) > 0.1; // diferença > 0,1%

  return {
    taxaReal,
    taxaContratual,
    diferencaTaxas,
    percentualDiferenca,
    temDiscrepancia,
  };
}

/**
 * Projeções recalculadas com taxa BACEN
 */
export interface ProjecoesTaxaBacen {
  parcelaCorreta: number;
  valorFinanciadoCorreto: number;
  totalCorreto: number;
  diferencaParcela: number;
  diferencaValorFinanciado: number;
  diferencaTotalFinanciamento: number;
  percentualDiferencaParcela: number;
  percentualDiferencaFinanciado: number;
}

export function calcularProjecoesBacen(
  valorFinanciado: number,
  parcela: number,
  prazo: number,
  taxaReal: number,
  taxaBacen: number
): ProjecoesTaxaBacen {
  // Recalcular com taxa BACEN
  const parcelaCorreta = calcularValorParcela(valorFinanciado, taxaBacen, prazo);
  const valorFinanciadoCorreto = calcularValorFinanciado(parcela, taxaBacen, prazo);
  
  // Totais
  const totalContratual = parcela * prazo;
  const totalCorreto = parcelaCorreta * prazo;
  
  // Diferenças
  const diferencaParcela = parcela - parcelaCorreta;
  const diferencaValorFinanciado = valorFinanciado - valorFinanciadoCorreto;
  const diferencaTotalFinanciamento = totalContratual - totalCorreto;
  
  const percentualDiferencaParcela = (diferencaParcela / parcelaCorreta) * 100;
  const percentualDiferencaFinanciado = (diferencaValorFinanciado / valorFinanciadoCorreto) * 100;

  return {
    parcelaCorreta,
    valorFinanciadoCorreto,
    totalCorreto,
    diferencaParcela,
    diferencaValorFinanciado,
    diferencaTotalFinanciamento,
    percentualDiferencaParcela,
    percentualDiferencaFinanciado,
  };
}

/**
 * Cálculo detalhado de prejuízo do cliente
 */
export interface PrejuizoDetalhado {
  totalPagoIndevido: number;
  economiaFutura: number;
  economiaTotal: number;
  devolucaoDobro: number; // CDC Art. 42
  percentualPrejuizo: number;
}

export function calcularPrejuizoDetalhado(
  diferencaParcela: number,
  parcelasPagas: number,
  parcelasRestantes: number,
  totalContratual: number
): PrejuizoDetalhado {
  const totalPagoIndevido = diferencaParcela * parcelasPagas;
  const economiaFutura = diferencaParcela * parcelasRestantes;
  const economiaTotal = totalPagoIndevido + economiaFutura;
  const devolucaoDobro = totalPagoIndevido * 2; // CDC Art. 42, parágrafo único
  const percentualPrejuizo = (economiaTotal / totalContratual) * 100;

  return {
    totalPagoIndevido,
    economiaFutura,
    economiaTotal,
    devolucaoDobro,
    percentualPrejuizo,
  };
}

/**
 * Análise de saldo devedor
 */
export interface AnaliseSaldoDevedor {
  saldoDevedorAtual: number;
  saldoDevedorCorreto: number;
  diferencaSaldo: number;
  percentualDiferencaSaldo: number;
  economiaPotencial: number;
}

export function analisarSaldoDevedor(
  valorFinanciado: number,
  taxaMensal: number,
  taxaBacen: number,
  numeroParcelas: number,
  parcelasPagas: number,
  saldoDevedorAtual: number
): AnaliseSaldoDevedor {
  // Calcular saldo devedor correto com taxa BACEN
  const parcelaCorreta = calcularValorParcela(valorFinanciado, taxaBacen, numeroParcelas);
  const tabelaCorreta = gerarTabelaPrice(valorFinanciado, taxaBacen, numeroParcelas);
  
  const saldoDevedorCorreto = parcelasPagas > 0 && parcelasPagas <= tabelaCorreta.length
    ? tabelaCorreta[parcelasPagas - 1].saldoDevedor
    : valorFinanciado;
  
  const diferencaSaldo = saldoDevedorAtual - saldoDevedorCorreto;
  const percentualDiferencaSaldo = saldoDevedorCorreto > 0 
    ? (diferencaSaldo / saldoDevedorCorreto) * 100 
    : 0;
  const economiaPotencial = diferencaSaldo > 0 ? diferencaSaldo : 0;

  return {
    saldoDevedorAtual,
    saldoDevedorCorreto,
    diferencaSaldo,
    percentualDiferencaSaldo,
    economiaPotencial,
  };
}
