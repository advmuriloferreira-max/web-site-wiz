import { ProvisaoPerda, ProvisaoPerdaIncorrida } from "@/hooks/useProvisao";

export type ClassificacaoRisco = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
export type EstagioRisco = 1 | 2 | 3;

export interface CalculoProvisaoParams {
  valorDivida: number;
  diasAtraso: number;
  classificacao: ClassificacaoRisco;
  tabelaPerda: ProvisaoPerda[];
  tabelaIncorrida: ProvisaoPerdaIncorrida[];
  criterioIncorrida?: string;
  valorPresente?: number;
  taxaJurosEfetiva?: number;
}

export interface ResultadoCalculo {
  percentualPerda: number;
  percentualIncorrida: number;
  valorProvisaoPerda: number;
  valorProvisaoIncorrida: number;
  valorProvisaoTotal: number;
  estagioRisco: EstagioRisco;
  regraAplicadaPerda?: ProvisaoPerda;
  regraAplicadaIncorrida?: ProvisaoPerdaIncorrida;
  metodologia: 'completa' | 'simplificada';
}

/**
 * Calcula a provisão baseada nas regulamentações do BCB (Res. 4966/2021 e BCB 352/2023)
 */
export function calcularProvisao(params: CalculoProvisaoParams): ResultadoCalculo {
  const {
    valorDivida,
    diasAtraso,
    classificacao,
    tabelaPerda,
    tabelaIncorrida,
    criterioIncorrida = "Dias de Atraso"
  } = params;

  // Determinar estágio de risco conforme Res. 4966/2021
  const estagioRisco = determinarEstagio(diasAtraso);

  // Encontrar regra aplicável para perda esperada
  const regraPerda = tabelaPerda.find(regra => 
    diasAtraso >= regra.prazo_inicial && diasAtraso <= regra.prazo_final
  );

  // Encontrar regra aplicável para perdas incorridas
  const regraIncorrida = tabelaIncorrida.find(regra => 
    regra.criterio === criterioIncorrida &&
    diasAtraso >= regra.prazo_inicial && 
    diasAtraso <= regra.prazo_final
  );

  // Obter percentuais baseados na classificação
  const percentualPerda = regraPerda ? getPercentualPorClassificacao(regraPerda, classificacao) : 0;
  const percentualIncorrida = regraIncorrida ? getPercentualPorClassificacao(regraIncorrida, classificacao) : 0;

  // Calcular valores de provisão
  const valorProvisaoPerda = (valorDivida * percentualPerda) / 100;
  const valorProvisaoIncorrida = (valorDivida * percentualIncorrida) / 100;
  const valorProvisaoTotal = Math.max(valorProvisaoPerda, valorProvisaoIncorrida);

  return {
    percentualPerda,
    percentualIncorrida,
    valorProvisaoPerda,
    valorProvisaoIncorrida,
    valorProvisaoTotal,
    estagioRisco,
    metodologia: 'completa',
    regraAplicadaPerda: regraPerda,
    regraAplicadaIncorrida: regraIncorrida,
  };
}

/**
 * Helper para obter percentual baseado na classificação
 */
function getPercentualPorClassificacao(
  regra: ProvisaoPerda | ProvisaoPerdaIncorrida, 
  classificacao: ClassificacaoRisco
): number {
  switch (classificacao) {
    case 'C1': return regra.c1_percentual;
    case 'C2': return regra.c2_percentual;
    case 'C3': return regra.c3_percentual;
    case 'C4': return regra.c4_percentual;
    case 'C5': return regra.c5_percentual;
    default: return 0;
  }
}

/**
 * Classifica automaticamente o risco baseado nos dias de atraso
 * Mantida para compatibilidade - usar determinarEstagio para regulamentação BCB
 */
export function classificarRisco(diasAtraso: number): ClassificacaoRisco {
  if (diasAtraso <= 30) return 'C1';
  if (diasAtraso <= 60) return 'C2';
  if (diasAtraso <= 90) return 'C3';
  if (diasAtraso <= 180) return 'C4';
  return 'C5';
}

/**
 * Determina o estágio de risco conforme Resolução 4966/2021
 */
export function determinarEstagio(diasAtraso: number): EstagioRisco {
  if (diasAtraso <= 30) return 1;  // Estágio 1
  if (diasAtraso <= 90) return 2;  // Estágio 2 
  return 3;                        // Estágio 3 (>90 dias = problema de recuperação)
}

/**
 * Classificação de risco conforme regulamentação BCB baseada em estágios
 */
export function classificarRiscoPorEstagio(estagio: EstagioRisco, diasAtraso: number): ClassificacaoRisco {
  switch (estagio) {
    case 1:
      if (diasAtraso <= 15) return 'C1';
      if (diasAtraso <= 30) return 'C2';
      return 'C1';
    case 2:
      if (diasAtraso <= 60) return 'C3';
      return 'C4';
    case 3:
      return 'C5'; // Ativo problemático sempre C5
    default:
      return 'C1';
  }
}

/**
 * Calcula dias de atraso baseado na data de vencimento
 */
export function calcularDiasAtraso(dataVencimento: string): number {
  const hoje = new Date();
  const vencimento = new Date(dataVencimento);
  const diffTime = hoje.getTime() - vencimento.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Converte dias de atraso para meses
 */
export function diasParaMeses(dias: number): number {
  return Math.round((dias / 30) * 10) / 10; // Arredonda para 1 casa decimal
}

/**
 * Calcula probabilidade de default baseada no estágio e histórico
 */
export function calcularProbabilidadeDefault(
  estagio: EstagioRisco, 
  classificacao: ClassificacaoRisco,
  diasAtraso: number
): number {
  const basePD = {
    1: { C1: 0.5, C2: 1.2, C3: 2.1, C4: 3.8, C5: 6.5 },
    2: { C1: 8.5, C2: 15.2, C3: 22.8, C4: 35.4, C5: 48.9 },
    3: { C1: 85.0, C2: 90.0, C3: 95.0, C4: 98.0, C5: 100.0 }
  };

  let pd = basePD[estagio][classificacao];
  
  // Ajuste por dias de atraso adicional
  if (estagio === 2 && diasAtraso > 60) {
    pd += (diasAtraso - 60) * 0.5;
  }
  if (estagio === 3 && diasAtraso > 180) {
    pd = Math.min(100, pd + (diasAtraso - 180) * 0.1);
  }
  
  return Math.min(100, pd);
}

/**
 * Calcula taxa de recuperação (Loss Given Default) baseada em garantias
 */
export function calcularTaxaRecuperacao(
  classificacao: ClassificacaoRisco,
  temGarantiaReal: boolean = false,
  valorGarantia: number = 0,
  valorDivida: number
): number {
  // Taxa base de recuperação por classificação
  const baseRecuperacao = {
    C1: 65, C2: 55, C3: 45, C4: 35, C5: 25
  };

  let taxaRecuperacao = baseRecuperacao[classificacao];

  // Ajuste por garantia real
  if (temGarantiaReal && valorGarantia > 0) {
    const coberturaGarantia = Math.min(100, (valorGarantia / valorDivida) * 100);
    taxaRecuperacao += coberturaGarantia * 0.3; // Melhora de até 30%
  }

  return Math.min(95, Math.max(10, taxaRecuperacao));
}

/**
 * Calcula valor presente usando taxa de juros efetiva
 */
export function calcularValorPresente(
  valorFuturo: number,
  taxaJurosAnual: number,
  prazoMeses: number
): number {
  const taxaMensal = taxaJurosAnual / 12 / 100;
  return valorFuturo / Math.pow(1 + taxaMensal, prazoMeses);
}

/**
 * Cálculo avançado de provisão conforme metodologia completa BCB
 */
export function calcularProvisaoAvancada(params: CalculoProvisaoParams): ResultadoCalculo {
  const {
    valorDivida,
    diasAtraso,
    classificacao,
    tabelaPerda,
    tabelaIncorrida,
    criterioIncorrida = "Dias de Atraso",
    taxaJurosEfetiva = 2.5
  } = params;

  const estagio = determinarEstagio(diasAtraso);
  const probabilidadeDefault = calcularProbabilidadeDefault(estagio, classificacao, diasAtraso);
  const taxaRecuperacao = calcularTaxaRecuperacao(classificacao, false, 0, valorDivida);
  const perdaGivenDefault = 100 - taxaRecuperacao;

  // Cálculo da perda esperada = PD × LGD × EAD
  const perdaEsperadaPercentual = (probabilidadeDefault / 100) * (perdaGivenDefault / 100) * 100;
  
  // Aplicar regras das tabelas existentes como base mínima
  const regraPerda = tabelaPerda.find(regra => 
    diasAtraso >= regra.prazo_inicial && diasAtraso <= regra.prazo_final
  );
  const regraIncorrida = tabelaIncorrida.find(regra => 
    regra.criterio === criterioIncorrida &&
    diasAtraso >= regra.prazo_inicial && 
    diasAtraso <= regra.prazo_final
  );

  const percentualTabelaPerda = regraPerda ? getPercentualPorClassificacao(regraPerda, classificacao) : 0;
  const percentualTabelaIncorrida = regraIncorrida ? getPercentualPorClassificacao(regraIncorrida, classificacao) : 0;

  // Usar o maior entre cálculo avançado e tabela regulamentar
  const percentualPerda = Math.max(perdaEsperadaPercentual, percentualTabelaPerda);
  const percentualIncorrida = Math.max(perdaEsperadaPercentual, percentualTabelaIncorrida);

  const valorProvisaoPerda = (valorDivida * percentualPerda) / 100;
  const valorProvisaoIncorrida = (valorDivida * percentualIncorrida) / 100;
  const valorProvisaoTotal = Math.max(valorProvisaoPerda, valorProvisaoIncorrida);

  return {
    percentualPerda,
    percentualIncorrida,
    valorProvisaoPerda,
    valorProvisaoIncorrida,
    valorProvisaoTotal,
    estagioRisco: estagio,
    metodologia: 'completa',
    regraAplicadaPerda: regraPerda,
    regraAplicadaIncorrida: regraIncorrida,
  };
}