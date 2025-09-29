import { ProvisaoPerda, ProvisaoPerdaIncorrida } from "@/hooks/useProvisao";
import { supabase } from "@/integrations/supabase/client";

export type ClassificacaoRisco = 'C1' | 'C2' | 'C3' | 'C4' | 'C5';
export type EstagioRisco = 1 | 2 | 3;

export interface CalculoProvisaoParams {
  valorDivida: number;
  diasAtraso: number;
  classificacao: ClassificacaoRisco;
  tabelaPerda: any[];
  tabelaIncorrida: any[];
  criterioIncorrida?: string;
  valorPresente?: number;
  taxaJurosEfetiva?: number;
  // Novos parâmetros para reestruturação
  isReestruturado?: boolean;
  dataReestruturacao?: string | null;
  // Parâmetros para garantias
  contratoId?: string | null;
  fatorRecuperacaoGarantia?: number;
}

export interface GarantiaInfo {
  id: string;
  tipo_garantia: string;
  valor_avaliacao: number;
  percentual_cobertura: number;
  descricao?: string;
}

export interface ResultadoCalculo {
  percentualProvisao: number;
  valorProvisao: number;
  estagio: EstagioRisco;
  regra: string;
  detalhes?: string;
  // Novos campos para reestruturação
  emPeriodoObservacao?: boolean;
  diasRestantesObservacao?: number;
  // Campos para garantias
  lgdBase?: number;
  lgdAjustado?: number;
  valorGarantiaTotal?: number;
  impactoGarantia?: number;
  garantias?: GarantiaInfo[];
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
 * Verifica se um contrato reestruturado está no período de observação de 6 meses
 */
export function verificarPeriodoObservacaoReestruturacao(dataReestruturacao: string): {
  emPeriodo: boolean;
  diasRestantes: number;
} {
  const hoje = new Date();
  const dataReest = new Date(dataReestruturacao);
  const diffTime = hoje.getTime() - dataReest.getTime();
  const diasDecorridos = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const PERIODO_OBSERVACAO_DIAS = 180; // 6 meses
  const emPeriodo = diasDecorridos <= PERIODO_OBSERVACAO_DIAS;
  const diasRestantes = Math.max(0, PERIODO_OBSERVACAO_DIAS - diasDecorridos);
  
  return {
    emPeriodo,
    diasRestantes
  };
}

/**
 * Calcula a provisão baseada nas regulamentações BCB 352/2023 com marco de 90 dias
 */
export const calcularProvisao = (params: CalculoProvisaoParams): ResultadoCalculo => {
  const { diasAtraso, valorDivida, classificacao, tabelaPerda, tabelaIncorrida, isReestruturado, dataReestruturacao } = params;
  
  // Verificar período de observação para reestruturados
  let emPeriodoObservacao = false;
  let diasRestantesObservacao = 0;
  
  if (isReestruturado && dataReestruturacao) {
    const observacao = verificarPeriodoObservacaoReestruturacao(dataReestruturacao);
    emPeriodoObservacao = observacao.emPeriodo;
    diasRestantesObservacao = observacao.diasRestantes;
  }
  
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
      detalhes: marco100Porcento.detalhes,
      emPeriodoObservacao,
      diasRestantesObservacao
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
    // ATÉ 90 DIAS: Usa tabela de perdas esperadas (Anexo II)
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

  // Para contratos reestruturados em período de observação, aplicar mínimo de provisão
  if (emPeriodoObservacao) {
    // Garantir que o percentual seja pelo menos equivalente ao Estágio 2
    const percentualMinimoEstagio2 = 3; // Valor típico para estágio 2
    percentual = Math.max(percentual, percentualMinimoEstagio2);
    metodologia += " (Reestruturado - Observação 6 meses)";
  }

  const valorProvisao = (valorDivida * percentual) / 100;
  const estagio = determinarEstagio(diasAtraso);

  return {
    percentualProvisao: percentual,
    valorProvisao,
    estagio,
    regra: `${percentual.toFixed(2)}% - ${metodologia}`,
    detalhes: regraAplicada ? `Regra: ${regraAplicada.periodo_atraso || regraAplicada.criterio}` : undefined,
    emPeriodoObservacao,
    diasRestantesObservacao
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
    '0': { C1: 5.5, C2: 30.0, C3: 45.0, C4: 35.0, C5: 50.0 },
    '1': { C1: 10.0, C2: 33.4, C3: 48.7, C4: 39.5, C5: 53.4 },
    '2': { C1: 14.5, C2: 36.8, C3: 52.4, C4: 44.0, C5: 56.8 },
    '3': { C1: 19.0, C2: 40.2, C3: 56.1, C4: 48.5, C5: 60.2 },
    '4': { C1: 23.5, C2: 43.6, C3: 59.8, C4: 53.0, C5: 63.6 },
    '5': { C1: 28.0, C2: 47.0, C3: 63.5, C4: 57.5, C5: 67.0 },
    '6': { C1: 32.5, C2: 50.4, C3: 67.2, C4: 62.0, C5: 70.4 },
    '7': { C1: 37.0, C2: 53.8, C3: 70.9, C4: 66.5, C5: 73.8 },
    '8': { C1: 41.5, C2: 57.2, C3: 74.6, C4: 71.0, C5: 77.2 },
    '9': { C1: 46.0, C2: 60.6, C3: 78.3, C4: 75.5, C5: 80.6 },
    '10': { C1: 50.5, C2: 64.0, C3: 82.0, C4: 80.0, C5: 84.0 },
    '11': { C1: 55.0, C2: 67.4, C3: 85.7, C4: 84.5, C5: 87.4 },
    '12': { C1: 59.5, C2: 70.8, C3: 89.4, C4: 89.0, C5: 90.8 },
    '13': { C1: 64.0, C2: 74.2, C3: 93.1, C4: 93.5, C5: 94.2 },
    '14': { C1: 68.5, C2: 77.6, C3: 96.8, C4: 98.0, C5: 97.6 },
    '15': { C1: 73.0, C2: 81.0, C3: 100.0, C4: 100.0, C5: 100.0 },
    '16': { C1: 77.5, C2: 84.4, C3: 100.0, C4: 100.0, C5: 100.0 },
    '17': { C1: 82.0, C2: 87.8, C3: 100.0, C4: 100.0, C5: 100.0 },
    '18': { C1: 86.5, C2: 91.2, C3: 100.0, C4: 100.0, C5: 100.0 },
    '19': { C1: 91.0, C2: 94.6, C3: 100.0, C4: 100.0, C5: 100.0 },
    '20': { C1: 95.5, C2: 98.0, C3: 100.0, C4: 100.0, C5: 100.0 },
    '21': { C1: 100.0, C2: 100.0, C3: 100.0, C4: 100.0, C5: 100.0 }
  };

  if (meses >= 21) return 100.0;
  
  const mesInteiro = Math.floor(meses);
  const chave = mesInteiro.toString();
  
  if (tabelaAnexoI[chave]) {
    return tabelaAnexoI[chave][classificacao];
  }

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
 * Determina o estágio de risco baseado nos dias de atraso
 * @param diasAtraso - Número de dias em atraso
 * @param isReestruturado - Se a operação foi reestruturada
 * @param dataReestruturacao - Data da reestruturação
 * @returns 1 se <= 30 dias, 2 se > 30 e <= 90 dias, 3 se > 90 dias (mínimo 2 para reestruturados em observação)
 */
export function determinarEstagioRisco(
  diasAtraso: number, 
  isReestruturado?: boolean, 
  dataReestruturacao?: string | null
): number {
  // Se for reestruturado, verificar período de observação
  if (isReestruturado && dataReestruturacao) {
    const observacao = verificarPeriodoObservacaoReestruturacao(dataReestruturacao);
    if (observacao.emPeriodo) {
      // Durante o período de observação, mínimo Estágio 2
      const estagioNormal = diasAtraso <= 30 ? 1 : diasAtraso <= 90 ? 2 : 3;
      return Math.max(estagioNormal, 2);
    }
  }

  // Lógica normal
  if (diasAtraso <= 30) {
    return 1;
  } else if (diasAtraso <= 90) {
    return 2;
  } else {
    return 3;
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
  if (marco.aplica100Porcento) {
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
 * Busca garantias associadas ao contrato
 */
async function buscarGarantias(contratoId: string): Promise<GarantiaInfo[]> {
  try {
    console.log('🔍 Buscando garantias para contrato:', contratoId);
    
    const { data, error } = await supabase
      .from('garantias')
      .select('id, tipo_garantia, valor_avaliacao, percentual_cobertura, descricao')
      .eq('contrato_id', contratoId);

    if (error) {
      console.error('❌ Erro ao buscar garantias:', error);
      return [];
    }

    console.log('✅ Garantias encontradas:', data?.length || 0, data);
    return data || [];
  } catch (error) {
    console.error('❌ Erro ao buscar garantias:', error);
    return [];
  }
}

/**
 * Calcula o valor total das garantias ajustado pelo percentual de cobertura
 */
function calcularValorGarantiaTotal(garantias: GarantiaInfo[]): number {
  return garantias.reduce((total, garantia) => {
    const valorAjustado = (garantia.valor_avaliacao || 0) * (garantia.percentual_cobertura || 0) / 100;
    return total + valorAjustado;
  }, 0);
}

/**
 * Calcula o LGD (Loss Given Default) ajustado com base nas garantias
 */
function calcularLGDAjustado(
  lgdBase: number,
  valorGarantiaTotal: number,
  valorDivida: number,
  fatorRecuperacaoGarantia: number = 0.5
): number {
  if (valorDivida <= 0 || valorGarantiaTotal <= 0) {
    return lgdBase;
  }

  const ratioCobertura = Math.min(1, valorGarantiaTotal / valorDivida);
  const ajusteGarantia = ratioCobertura * fatorRecuperacaoGarantia;
  const lgdAjustado = lgdBase * (1 - ajusteGarantia);
  
  // LGD não pode ser negativo ou menor que 5%
  return Math.max(5, lgdAjustado);
}

/**
 * Cálculo avançado de provisão conforme metodologia completa BCB com ajuste por garantias
 */
export async function calcularProvisaoAvancada(params: CalculoProvisaoParams): Promise<ResultadoCalculo> {
  const {
    valorDivida,
    diasAtraso,
    classificacao,
    tabelaPerda,
    tabelaIncorrida,
    criterioIncorrida = "Dias de Atraso",
    contratoId,
    fatorRecuperacaoGarantia = 0.5
  } = params;

  const marco = getMarcoRegulamentar352(diasAtraso, classificacao);
  
  // Buscar garantias se contratoId for fornecido
  let garantias: GarantiaInfo[] = [];
  let valorGarantiaTotal = 0;
  
  if (contratoId) {
    console.log('📊 Iniciando busca de garantias para contrato:', contratoId);
    garantias = await buscarGarantias(contratoId);
    valorGarantiaTotal = calcularValorGarantiaTotal(garantias);
    console.log('💰 Valor total das garantias:', valorGarantiaTotal);
  }

  // REGRA CRÍTICA: Conforme Anexo I da BCB 352/2023
  if (marco.aplica100Porcento) {
    return {
      percentualProvisao: 100,
      valorProvisao: valorDivida,
      estagio: 3,
      regra: "100% - Marco Regulamentar BCB 352/2023",
      detalhes: marco.detalhes,
      garantias,
      valorGarantiaTotal,
      lgdBase: 100,
      lgdAjustado: 100,
      impactoGarantia: 0
    };
  }

  const estagio = determinarEstagio(diasAtraso);
  const probabilidadeDefault = calcularProbabilidadeDefault(estagio, classificacao, diasAtraso);
  const taxaRecuperacao = calcularTaxaRecuperacao(classificacao, false, 0, valorDivida);
  const lgdBase = 100 - taxaRecuperacao;

  // Calcular LGD ajustado com base nas garantias
  const lgdAjustado = calcularLGDAjustado(lgdBase, valorGarantiaTotal, valorDivida, fatorRecuperacaoGarantia);

  // Cálculo da perda esperada = PD × LGD_ajustado × EAD
  const perdaEsperadaPercentual = (probabilidadeDefault / 100) * (lgdAjustado / 100) * 100;
  
  // Aplicar regras das tabelas existentes como base mínima
  const resultadoSimples = calcularProvisao(params);
  const percentualFinal = Math.max(perdaEsperadaPercentual, resultadoSimples.percentualProvisao);

  // Calcular impacto da garantia
  const perdaSemGarantia = (probabilidadeDefault / 100) * (lgdBase / 100) * 100;
  const impactoGarantia = perdaSemGarantia - perdaEsperadaPercentual;

  return {
    percentualProvisao: percentualFinal,
    valorProvisao: (valorDivida * percentualFinal) / 100,
    estagio,
    regra: `Metodologia Avançada - PD: ${probabilidadeDefault.toFixed(1)}% | LGD: ${lgdAjustado.toFixed(1)}%`,
    detalhes: `Perda Esperada: ${perdaEsperadaPercentual.toFixed(2)}% | Base Tabela: ${resultadoSimples.percentualProvisao.toFixed(2)}%${valorGarantiaTotal > 0 ? ` | Garantias: R$ ${valorGarantiaTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : ''}`,
    garantias,
    valorGarantiaTotal,
    lgdBase,
    lgdAjustado,
    impactoGarantia
  };
}

// Funções auxiliares para verificação de baixa e marcos temporais
export function deveSerBaixado(diasAtraso: number, classificacao: ClassificacaoRisco): boolean {
  const meses = diasAtraso / 30;
  
  if (classificacao === 'C5' && meses >= 18) return true;
  if ((classificacao === 'C3' || classificacao === 'C4') && meses >= 24) return true;
  if ((classificacao === 'C1' || classificacao === 'C2') && meses >= 36) return true;
  
  return false;
}

export function getMarcosTemporal(diasAtraso: number, classificacao: ClassificacaoRisco) {
  const meses = diasAtraso / 30;
  const estagio = determinarEstagio(diasAtraso);
  
  return {
    estagio,
    mesesAtraso: meses,
    paraAcumuloJuros: diasAtraso > 90,
    para100Porcento: getMarcoRegulamentar352(diasAtraso, classificacao).aplica100Porcento,
    paraBaixa: deveSerBaixado(diasAtraso, classificacao),
    observacoes: `Estágio ${estagio} | ${meses.toFixed(1)} meses de atraso`
  };
}