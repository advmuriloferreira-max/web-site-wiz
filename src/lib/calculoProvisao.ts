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
 * Determina o estágio de risco conforme Resolução 4966/2021
 */
export function determinarEstagio(diasAtraso: number): EstagioRisco {
  if (diasAtraso <= 30) return 1;  // Estágio 1
  if (diasAtraso <= 90) return 2;  // Estágio 2 
  return 3;                        // Estágio 3 (>90 dias = problema de recuperação)
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