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
  percentualProvisao: number;
  valorProvisao: number;
  estagio: EstagioRisco;
  regra: string;
  detalhes: string;
}

/**
 * Marcos regulamentares conforme Anexo I da Resolução BCB 352/2023
 */
export function getMarcoRegulamentar352(diasAtraso: number, classificacao: ClassificacaoRisco): {
  aplica100Porcento: boolean;
  detalhes: string;
} {
  const meses = diasAtraso / 30;

  // Anexo I da Resolução 352/2023 - Marcos exatos por classificação
  if (classificacao === 'C3' || classificacao === 'C4' || classificacao === 'C5') {
    if (meses >= 15) { // "Igual ou maior que 15 e menor que 16 meses" = 100%
      return {
        aplica100Porcento: true,
        detalhes: "15+ meses - Provisão 100% obrigatória (Anexo I BCB 352/2023)"
      };
    }
  }

  if (classificacao === 'C1' || classificacao === 'C2') {
    if (meses >= 21) { // "Igual ou maior que 21 meses" = 100%
      return {
        aplica100Porcento: true,
        detalhes: "21+ meses - Provisão 100% obrigatória (Anexo I BCB 352/2023)"
      };
    }
  }

  return {
    aplica100Porcento: false,
    detalhes: `Provisão gradual - ${meses.toFixed(1)} meses de atraso`
  };
}

/**
 * Calcula a provisão baseada nas regulamentações BCB 352/2023 com marco de 90 dias
 */
export const calcularProvisao = (params: CalculoProvisaoParams): ResultadoCalculo => {
  const { diasAtraso, valorDivida, classificacao, tabelaPerda, tabelaIncorrida } = params;
  
  // MARCO DE 90 DIAS: Determina qual metodologia usar
  const inadimplido = diasAtraso > 90;
  
  // Verifica se deve aplicar 100% de provisão (Marco Regulamentar BCB 352/2023)
  const marco100Porcento = getMarcoRegulamentar352(diasAtraso, classificacao);
  if (marco100Porcento.aplica100Porcento) {
    return {
      percentualProvisao: 100,
      valorProvisao: valorDivida,
      estagio: determinarEstagio(diasAtraso),
      regra: "100% - Marco Regulamentar BCB 352/2023",
      detalhes: marco100Porcento.detalhes
    };
  }

  let regraAplicada: any = null;
  let percentual = 0;
  let metodologia = "";

  if (inadimplido) {
    // ACIMA DE 90 DIAS: Usa tabela de perdas incorridas (Anexo I)
    metodologia = "Perdas Incorridas (Anexo I)";
    if (tabelaIncorrida && tabelaIncorrida.length > 0) {
      const mesesAtraso = diasAtraso / 30;
      regraAplicada = tabelaIncorrida.find(regra => 
        mesesAtraso >= regra.prazo_inicial && mesesAtraso <= regra.prazo_final
      );
      
      if (regraAplicada) {
        percentual = getPercentualPorClassificacao(regraAplicada, classificacao);
      }
    }
  } else {
    // ATÉ 90 DIAS: Usa tabela de perda esperada (Anexo II)
    metodologia = "Perdas Esperadas (Anexo II)";
    if (tabelaPerda && tabelaPerda.length > 0) {
      regraAplicada = tabelaPerda.find(regra => 
        diasAtraso >= regra.prazo_inicial && diasAtraso <= regra.prazo_final
      );
      
      if (regraAplicada) {
        percentual = getPercentualPorClassificacao(regraAplicada, classificacao);
      }
    }
  }

  // Aplica percentual mínimo da Resolução 352/2023 Anexo I se aplicável
  const percentualAnexoI = calcularPercentualAnexoI352(diasAtraso, classificacao);
  percentual = Math.max(percentual, percentualAnexoI);

  const valorProvisao = (valorDivida * percentual) / 100;

  return {
    percentualProvisao: percentual,
    valorProvisao,
    estagio: determinarEstagio(diasAtraso),
    regra: `${metodologia} - ${regraAplicada ? (regraAplicada.periodo_atraso || regraAplicada.criterio) : "Regra padrão"}`,
    detalhes: `Marco: ${inadimplido ? '>90 dias (inadimplido)' : '≤90 dias (em dia)'} | Metodologia: ${metodologia} | Percentual: ${percentual}%`
  };
};

/**
 * Calcula percentual exato conforme Anexo I da Resolução BCB 352/2023
 * "Provisão para perdas incorridas aplicável aos ativos financeiros inadimplidos"
 */
function calcularPercentualAnexoI352(diasAtraso: number, classificacao: ClassificacaoRisco): number {
  const meses = diasAtraso / 30;
  
  // Tabela EXATA do Anexo I da Resolução BCB 352/2023
  const tabelaAnexoI: Record<string, Record<ClassificacaoRisco, number>> = {
    // "Menor que um mês"
    '0': { C1: 5.5, C2: 30.0, C3: 45.0, C4: 35.0, C5: 50.0 },
    // "Igual ou maior que 1 e menor que 2 meses"
    '1': { C1: 10.0, C2: 33.4, C3: 48.7, C4: 39.5, C5: 53.4 },
    // "Igual ou maior que 2 e menor que 3 meses"  
    '2': { C1: 14.5, C2: 36.8, C3: 52.4, C4: 44.0, C5: 56.8 },
    // "Igual ou maior que 3 e menor que 4 meses"
    '3': { C1: 19.0, C2: 40.2, C3: 56.1, C4: 48.5, C5: 60.2 },
    // "Igual ou maior que 4 e menor que 5 meses"
    '4': { C1: 23.5, C2: 43.6, C3: 59.8, C4: 53.0, C5: 63.6 },
    // "Igual ou maior que 5 e menor que 6 meses"
    '5': { C1: 28.0, C2: 47.0, C3: 63.5, C4: 57.5, C5: 67.0 },
    // "Igual ou maior que 6 e menor que 7 meses"
    '6': { C1: 32.5, C2: 50.4, C3: 67.2, C4: 62.0, C5: 70.4 },
    // "Igual ou maior que 7 e menor que 8 meses"
    '7': { C1: 37.0, C2: 53.8, C3: 70.9, C4: 66.5, C5: 73.8 },
    // "Igual ou maior que 8 e menor que 9 meses"
    '8': { C1: 41.5, C2: 57.2, C3: 74.6, C4: 71.0, C5: 77.2 },
    // "Igual ou maior que 9 e menor que 10 meses"
    '9': { C1: 46.0, C2: 60.6, C3: 78.3, C4: 75.5, C5: 80.6 },
    // "Igual ou maior que 10 e menor que 11 meses"
    '10': { C1: 50.5, C2: 64.0, C3: 82.0, C4: 80.0, C5: 84.0 },
    // "Igual ou maior que 11 e menor que 12 meses"
    '11': { C1: 55.0, C2: 67.4, C3: 85.7, C4: 84.5, C5: 87.4 },
    // "Igual ou maior que 12 e menor que 13 meses"
    '12': { C1: 59.5, C2: 70.8, C3: 89.4, C4: 89.0, C5: 90.8 },
    // "Igual ou maior que 13 e menor que 14 meses"
    '13': { C1: 64.0, C2: 74.2, C3: 93.1, C4: 93.5, C5: 94.2 },
    // "Igual ou maior que 14 e menor que 15 meses"
    '14': { C1: 68.5, C2: 77.6, C3: 96.8, C4: 98.0, C5: 97.6 },
    // "Igual ou maior que 15 e menor que 16 meses" - C3/C4/C5 = 100%
    '15': { C1: 73.0, C2: 81.0, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 16 e menor que 17 meses"
    '16': { C1: 77.5, C2: 84.4, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 17 e menor que 18 meses"
    '17': { C1: 82.0, C2: 87.8, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 18 e menor que 19 meses"
    '18': { C1: 86.5, C2: 91.2, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 19 e menor que 20 meses"  
    '19': { C1: 91.0, C2: 94.6, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 20 e menor que 21 meses"
    '20': { C1: 95.5, C2: 98.0, C3: 100.0, C4: 100.0, C5: 100.0 },
    // "Igual ou maior que 21 meses" - TODOS = 100%
    '21': { C1: 100.0, C2: 100.0, C3: 100.0, C4: 100.0, C5: 100.0 }
  };

  // Para 21+ meses, todos chegam a 100%
  if (meses >= 21) return 100.0;

  // Buscar na tabela exata
  const mesInteiro = Math.floor(meses);
  const chave = mesInteiro.toString();
  
  if (tabelaAnexoI[chave]) {
    return tabelaAnexoI[chave][classificacao];
  }

  // Interpolação linear para valores fracionários de mês
  const mesAnterior = Math.floor(meses);
  const mesProximo = mesAnterior + 1;
  
  if (tabelaAnexoI[mesAnterior.toString()] && tabelaAnexoI[mesProximo.toString()]) {
    const valorAnterior = tabelaAnexoI[mesAnterior.toString()][classificacao];
    const valorProximo = tabelaAnexoI[mesProximo.toString()][classificacao];
    const fator = meses - mesAnterior;
    return valorAnterior + (valorProximo - valorAnterior) * fator;
  }

  // Se for menor que 1 mês, usar a primeira faixa
  if (meses < 1) {
    return tabelaAnexoI['0'][classificacao];
  }

  return 0;
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

// ATENÇÃO: A classificação C1-C5 deve ser baseada no TIPO DE OPERAÇÃO, não em dias de atraso
// Conforme Art. 81 da Resolução BCB 352/2023
export const classificarRiscoPorTipoOperacao = (tipoOperacao: string): ClassificacaoRisco => {
  // Esta função deve ser usada apenas como fallback
  // A classificação correta deve vir do tipo de operação selecionado pelo usuário
  console.warn('ATENÇÃO: Usando classificação de risco por dias de atraso. Deve ser baseada no tipo de operação conforme BCB 352/2023');
  return 'C5'; // Retorna o mais conservador como fallback
};

// DEPRECATED: Mantido apenas para compatibilidade
export const classificarRisco = (diasAtraso: number): ClassificacaoRisco => {
  console.warn('DEPRECATED: classificarRisco por dias de atraso. Use classificação baseada em tipo de operação.');
  return classificarRiscoPorTipoOperacao('');
};

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
  
  // Ajuste por marco regulamentar 352/2023
  const marco = getMarcoRegulamentar352(diasAtraso, classificacao);
  if (marco.provisao100) {
    pd = 100;
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

  const marco = getMarcoRegulamentar352(diasAtraso, classificacao);
  
  // REGRA CRÍTICA: Conforme Anexo I da BCB 352/2023
  if (marco.aplica100Porcento) {
    return {
      percentualProvisao: 100,
      valorProvisao: valorDivida,
      estagio: 3,
      regra: "100% - Marco Regulamentar BCB 352/2023",
      detalhes: marco.detalhes
    };
  }

  const estagio = determinarEstagio(diasAtraso);
  const probabilidadeDefault = calcularProbabilidadeDefault(estagio, classificacao, diasAtraso);
  const taxaRecuperacao = calcularTaxaRecuperacao(classificacao, false, 0, valorDivida);
  const perdaGivenDefault = 100 - taxaRecuperacao;

  // Cálculo da perda esperada = PD × LGD × EAD
  const perdaEsperadaPercentual = (probabilidadeDefault / 100) * (perdaGivenDefault / 100) * 100;
  
  // Aplicar regras das tabelas existentes como base mínima
  const inadimplido = diasAtraso > 90;
  let percentualTabela = 0;
  
  if (inadimplido && tabelaIncorrida) {
    const mesesAtraso = diasAtraso / 30;
    const regraIncorrida = tabelaIncorrida.find(regra => 
      mesesAtraso >= regra.prazo_inicial && mesesAtraso <= regra.prazo_final
    );
    if (regraIncorrida) {
      percentualTabela = getPercentualPorClassificacao(regraIncorrida, classificacao);
    }
  } else if (!inadimplido && tabelaPerda) {
    const regraPerda = tabelaPerda.find(regra => 
      diasAtraso >= regra.prazo_inicial && diasAtraso <= regra.prazo_final
    );
    if (regraPerda) {
      percentualTabela = getPercentualPorClassificacao(regraPerda, classificacao);
    }
  }
  
  // Aplicar percentual obrigatório do Anexo I da Resolução 352/2023
  const percentualRegulamentar = calcularPercentualAnexoI352(diasAtraso, classificacao);

  // Usar o maior entre todos os cálculos
  const percentual = Math.max(perdaEsperadaPercentual, percentualTabela, percentualRegulamentar);
  const valorProvisao = (valorDivida * percentual) / 100;

  return {
    percentualProvisao: percentual,
    valorProvisao,
    estagio: estagio,
    regra: inadimplido ? "Perdas Incorridas (Anexo I)" : "Perdas Esperadas (Anexo II)",
    detalhes: `Metodologia avançada: PD=${probabilidadeDefault.toFixed(1)}% | LGD=${perdaGivenDefault.toFixed(1)}% | Percentual final: ${percentual.toFixed(2)}%`
  };
}

/**
 * Verifica se o contrato deve ter baixa obrigatória
 */
export function deveSerBaixado(diasAtraso: number, classificacao: ClassificacaoRisco): {
  deveBaixar: boolean;
  motivo: string;
} {
  const marco = getMarcoRegulamentar352(diasAtraso, classificacao);
  
  if (marco.provisao100) {
    const meses = Math.floor(diasAtraso / 30);
    return {
      deveBaixar: true,
      motivo: `Baixa conforme Art. 49 da Res. 4966 - ${meses} meses de atraso (${marco.marcoAtingido})`
    };
  }

  return {
    deveBaixar: false,
    motivo: ""
  };
}

/**
 * Calcula os marcos temporais regulamentares da 4966
 */
export function getMarcosTemporal(diasAtraso: number, classificacao: ClassificacaoRisco) {
  const meses = diasAtraso / 30;
  const marco = getMarcoRegulamentar352(diasAtraso, classificacao);
  
  return {
    estagio1: diasAtraso <= 30,
    estagio2: diasAtraso > 30 && diasAtraso <= 90,
    estagio3: diasAtraso > 90,
    stopAccrual: diasAtraso > 90,
    provisao100: marco.aplica100Porcento,
    baixaObrigatoria: marco.aplica100Porcento,
    marcoAtual: marco.aplica100Porcento ? marco.detalhes : null,
    proximoMarco: marco.aplica100Porcento ? null : `Provisão gradual - ${meses.toFixed(1)} meses`,
    mesesAtraso: Math.floor(meses)
  };
}