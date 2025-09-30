/**
 * Biblioteca de Cálculo de Taxa Efetiva de Juros
 * Sistema de Análise de Abusividade em Taxas de Juros
 * 
 * Implementa a regra de 3 financeira com 4 variáveis:
 * - Taxa de juros (i)
 * - Valor da prestação (PMT)
 * - Quantidade de prestações (n)
 * - Valor total do empréstimo/financiamento (PV)
 */

export interface DadosContrato {
  valorFinanciado: number;
  valorParcela?: number;
  numeroParcelas?: number;
  taxaJurosContratual?: number; // Taxa declarada no contrato (% mensal)
}

export interface ResultadoCalculoTaxa {
  taxaEfetivaMensal: number;
  taxaEfetivaAnual: number;
  taxaContratual?: number;
  diferencaTaxa: number;
  percentualDiferenca: number;
  totalPago: number;
  totalJuros: number;
  custoEfetivoTotal: number;
}

/**
 * Calcula a taxa efetiva de juros usando o método de Newton-Raphson
 * Resolve a equação: PV = PMT * [(1 - (1 + i)^-n) / i]
 */
export function calcularTaxaEfetiva(dados: DadosContrato): ResultadoCalculoTaxa {
  const { valorFinanciado, valorParcela, numeroParcelas, taxaJurosContratual } = dados;

  if (!valorParcela || !numeroParcelas) {
    throw new Error('Valor da parcela e número de parcelas são obrigatórios');
  }

  // Método de Newton-Raphson para encontrar a taxa
  const taxaMensal = calcularTaxaPeloNewtonRaphson(
    valorFinanciado,
    valorParcela,
    numeroParcelas
  );

  const taxaAnual = Math.pow(1 + taxaMensal / 100, 12) - 1;
  const totalPago = valorParcela * numeroParcelas;
  const totalJuros = totalPago - valorFinanciado;
  const custoEfetivoTotal = (totalJuros / valorFinanciado) * 100;

  let diferencaTaxa = 0;
  let percentualDiferenca = 0;

  if (taxaJurosContratual !== undefined && taxaJurosContratual > 0) {
    diferencaTaxa = taxaMensal - taxaJurosContratual;
    percentualDiferenca = (diferencaTaxa / taxaJurosContratual) * 100;
  }

  return {
    taxaEfetivaMensal: taxaMensal,
    taxaEfetivaAnual: taxaAnual * 100,
    taxaContratual: taxaJurosContratual,
    diferencaTaxa,
    percentualDiferenca,
    totalPago,
    totalJuros,
    custoEfetivoTotal,
  };
}

/**
 * Implementação do método de Newton-Raphson para cálculo da taxa
 */
function calcularTaxaPeloNewtonRaphson(
  pv: number,
  pmt: number,
  n: number
): number {
  const maxIteracoes = 100;
  const precisao = 0.000001;
  let taxa = 0.01; // Chute inicial: 1% ao mês

  for (let i = 0; i < maxIteracoes; i++) {
    // f(taxa) = PV - PMT * [(1 - (1 + taxa)^-n) / taxa]
    const fatorDesconto = Math.pow(1 + taxa, -n);
    const f = pv - pmt * ((1 - fatorDesconto) / taxa);

    // f'(taxa) = derivada de f
    const denominador = taxa * taxa * Math.pow(1 + taxa, n);
    const numerador = n * pmt * Math.pow(1 + taxa, -n - 1) * taxa - pmt * (1 - fatorDesconto);
    const fDerivada = numerador / denominador;

    const novaTaxa = taxa - f / fDerivada;

    if (Math.abs(novaTaxa - taxa) < precisao) {
      return novaTaxa * 100; // Retorna em percentual
    }

    taxa = novaTaxa;

    // Evita valores negativos
    if (taxa < 0) taxa = 0.001;
  }

  return taxa * 100;
}

/**
 * Calcula o valor da parcela dado PV, taxa e n
 * PMT = PV * [i * (1 + i)^n] / [(1 + i)^n - 1]
 */
export function calcularValorParcela(
  valorFinanciado: number,
  taxaMensal: number,
  numeroParcelas: number
): number {
  const i = taxaMensal / 100;
  const fator = Math.pow(1 + i, numeroParcelas);
  return valorFinanciado * (i * fator) / (fator - 1);
}

/**
 * Calcula o número de parcelas dado PV, PMT e taxa
 * n = log(PMT / (PMT - PV * i)) / log(1 + i)
 */
export function calcularNumeroParcelas(
  valorFinanciado: number,
  valorParcela: number,
  taxaMensal: number
): number {
  const i = taxaMensal / 100;
  const numerador = Math.log(valorParcela / (valorParcela - valorFinanciado * i));
  const denominador = Math.log(1 + i);
  return Math.ceil(numerador / denominador);
}

/**
 * Calcula o valor financiado dado PMT, taxa e n
 * PV = PMT * [(1 - (1 + i)^-n) / i]
 */
export function calcularValorFinanciado(
  valorParcela: number,
  taxaMensal: number,
  numeroParcelas: number
): number {
  const i = taxaMensal / 100;
  const fatorDesconto = Math.pow(1 + i, -numeroParcelas);
  return valorParcela * ((1 - fatorDesconto) / i);
}

/**
 * Gera tabela Price de amortização
 */
export interface ParcelaAmortizacao {
  numero: number;
  valorParcela: number;
  valorJuros: number;
  valorPrincipal: number;
  saldoDevedor: number;
}

export function gerarTabelaPrice(
  valorFinanciado: number,
  taxaMensal: number,
  numeroParcelas: number
): ParcelaAmortizacao[] {
  const i = taxaMensal / 100;
  const pmt = calcularValorParcela(valorFinanciado, taxaMensal, numeroParcelas);
  
  const tabela: ParcelaAmortizacao[] = [];
  let saldoDevedor = valorFinanciado;

  for (let n = 1; n <= numeroParcelas; n++) {
    const juros = saldoDevedor * i;
    const principal = pmt - juros;
    saldoDevedor -= principal;

    tabela.push({
      numero: n,
      valorParcela: pmt,
      valorJuros: juros,
      valorPrincipal: principal,
      saldoDevedor: Math.max(0, saldoDevedor), // Evita valores negativos por arredondamento
    });
  }

  return tabela;
}

/**
 * Compara taxa contratual com taxa de mercado (BACEN)
 */
export interface ComparacaoTaxas {
  taxaContrato: number;
  taxaMercado: number;
  diferenca: number;
  percentualDiferenca: number;
  acimaMercado: boolean;
  grauAbusividade: 'Nenhum' | 'Leve' | 'Moderado' | 'Grave' | 'Muito Grave';
}

export function compararComTaxaBacen(
  taxaContrato: number,
  taxaBacen: number
): ComparacaoTaxas {
  const diferenca = taxaContrato - taxaBacen;
  const percentualDiferenca = taxaBacen > 0 ? (diferenca / taxaBacen) * 100 : 0;
  const acimaMercado = diferenca > 0;

  // Classificação do grau de abusividade
  let grauAbusividade: ComparacaoTaxas['grauAbusividade'] = 'Nenhum';
  
  if (acimaMercado) {
    if (percentualDiferenca > 200) {
      grauAbusividade = 'Muito Grave';
    } else if (percentualDiferenca > 100) {
      grauAbusividade = 'Grave';
    } else if (percentualDiferenca > 50) {
      grauAbusividade = 'Moderado';
    } else if (percentualDiferenca > 20) {
      grauAbusividade = 'Leve';
    }
  }

  return {
    taxaContrato,
    taxaMercado: taxaBacen,
    diferenca,
    percentualDiferenca,
    acimaMercado,
    grauAbusividade,
  };
}

/**
 * Calcula o valor cobrado indevidamente (se houver abusividade)
 */
export function calcularValorIndevido(
  valorFinanciado: number,
  taxaContrato: number,
  taxaCorreta: number,
  numeroParcelas: number
): number {
  const totalPagoContrato = calcularValorParcela(valorFinanciado, taxaContrato, numeroParcelas) * numeroParcelas;
  const totalPagoCorreto = calcularValorParcela(valorFinanciado, taxaCorreta, numeroParcelas) * numeroParcelas;
  
  return Math.max(0, totalPagoContrato - totalPagoCorreto);
}
