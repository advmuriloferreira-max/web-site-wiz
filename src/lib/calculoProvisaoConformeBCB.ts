/**
 * CÁLCULO DE PROVISÃO CONFORME RESOLUÇÕES BCB 4.966/2021 e 352/2023
 * Sistema de três estágios baseado em perdas esperadas (IFRS 9)
 * 
 * IMPORTANTE: Este arquivo substitui o sistema incorreto C1-C5 
 * por metodologia conforme às regulamentações vigentes.
 */

import { supabase } from "@/integrations/supabase/client";

export type EstagioRisco = 1 | 2 | 3;

export interface TipoOperacaoInfo {
  id: string;
  nome: string;
  descricao: string;
  carteira: string; // Usado para determinar LGD base
}

export interface GarantiaInfo {
  id: string;
  tipo_garantia: string;
  valor_avaliacao: number;
  percentual_cobertura: number;
  descricao?: string;
}

export interface ParametrosCalculo {
  valorDivida: number;
  diasAtraso: number;
  estagio: EstagioRisco;
  tipoOperacao?: TipoOperacaoInfo;
  garantias?: GarantiaInfo[];
  isReestruturado?: boolean;
  dataReestruturacao?: string;
  contratoId?: string;
}

export interface ResultadoCalculoBCB {
  percentualProvisao: number;
  valorProvisao: number;
  estagio: EstagioRisco;
  probabilidadeDefault: number; // PD (%)
  perdaDadoDefault: number; // LGD (%)
  exposicaoDefault: number; // EAD
  perdaEsperada: number; // EL = PD × LGD × EAD
  metodologia: string;
  detalhes: string;
  // Campos para reestruturação
  emPeriodoObservacao?: boolean;
  diasRestantesObservacao?: number;
  // Campos para garantias
  valorGarantiaTotal?: number;
  fatorMitigacao?: number;
  garantias?: GarantiaInfo[];
}

/**
 * Determina o estágio de risco conforme BCB 4.966/2021 Art. 37
 */
export function determinarEstagioRisco(
  diasAtraso: number,
  isReestruturado: boolean = false,
  dataReestruturacao?: string
): EstagioRisco {
  // Verificar período de observação para reestruturados
  if (isReestruturado && dataReestruturacao) {
    const observacao = calcularPeriodoObservacao(dataReestruturacao);
    if (observacao.emPeriodo) {
      // Durante período de observação, mínimo Estágio 2
      const estagioNormal = calcularEstagioBase(diasAtraso);
      return Math.max(estagioNormal, 2) as EstagioRisco;
    }
  }

  return calcularEstagioBase(diasAtraso);
}

function calcularEstagioBase(diasAtraso: number): EstagioRisco {
  if (diasAtraso <= 30) {
    return 1; // Primeiro estágio: sem aumento significativo de risco
  } else if (diasAtraso <= 90) {
    return 2; // Segundo estágio: aumento significativo de risco
  } else {
    return 3; // Terceiro estágio: ativo problemático (> 90 dias)
  }
}

/**
 * Calcula período de observação para contratos reestruturados (6 meses)
 */
function calcularPeriodoObservacao(dataReestruturacao: string): {
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
  
  return { emPeriodo, diasRestantes };
}

/**
 * Calcula Probabilidade de Default (PD) baseada no estágio e características da operação
 */
function calcularProbabilidadeDefault(
  estagio: EstagioRisco,
  diasAtraso: number,
  tipoOperacao?: TipoOperacaoInfo
): number {
  const mesesAtraso = diasAtraso / 30;
  
  // REGRA BCB: Provisão de 100% para atrasos muito longos
  // Conforme Res. 4966/2021 e critérios de baixa patrimonial
  const limitesBaixa = {
    'C1': 36, // 36 meses para garantias sólidas
    'C2': 24, // 24 meses para garantias médias
    'C3': 18, // 18 meses para sem garantia
    'C4': 18, // 18 meses para alto risco
    'C5': 18  // 18 meses para muito alto risco
  };
  
  const limiteProvisaoTotal = tipoOperacao?.carteira 
    ? limitesBaixa[tipoOperacao.carteira as keyof typeof limitesBaixa] || 18
    : 18; // Default: 18 meses

  // Se ultrapassou o limite para provisão total, PD = 100%
  if (mesesAtraso >= limiteProvisaoTotal) {
    return 100.0;
  }

  // Tabela base de PD por estágio (valores de referência BCB)
  const basePD = {
    1: 2.0,   // Estágio 1: baixo risco (12 meses)
    2: 15.0,  // Estágio 2: risco aumentado (lifetime)
    3: 90.0   // Estágio 3: ativo problemático
  };

  let pd = basePD[estagio];

  // Ajustes baseados no tipo de garantia (se disponível)
  if (tipoOperacao?.carteira) {
    const ajustePorCarteira = {
      'C1': 0.7, // Garantias sólidas (União, alienação fiduciária imóveis)
      'C2': 0.8, // Garantias médias (IF, penhor, hipoteca)
      'C3': 1.0, // Garantias fracas ou sem garantia
      'C4': 1.2, // Alto risco
      'C5': 1.5  // Muito alto risco
    };
    
    const fator = ajustePorCarteira[tipoOperacao.carteira as keyof typeof ajustePorCarteira] || 1.0;
    pd *= fator;
  }

  // Ajuste progressivo por tempo de atraso dentro do estágio 3
  if (estagio === 3 && diasAtraso > 90) {
    // Progressão linear de 90% até 100% entre 3 meses e o limite de baixa
    const progressao = (mesesAtraso - 3) / (limiteProvisaoTotal - 3);
    const incrementoPD = progressao * (100 - pd);
    pd = Math.min(100, pd + incrementoPD);
  }

  return Math.min(100, Math.max(0.1, pd));
}

/**
 * Calcula Loss Given Default (LGD) baseada no tipo de operação e garantias
 */
function calcularLossGivenDefault(
  tipoOperacao?: TipoOperacaoInfo,
  garantias: GarantiaInfo[] = [],
  diasAtraso: number = 0
): number {
  const mesesAtraso = diasAtraso / 30;
  
  // REGRA BCB: LGD de 100% para atrasos muito longos
  const limitesBaixa = {
    'C1': 36, // 36 meses para garantias sólidas
    'C2': 24, // 24 meses para garantias médias
    'C3': 18, // 18 meses para sem garantia
    'C4': 18, // 18 meses para alto risco
    'C5': 18  // 18 meses para muito alto risco
  };
  
  const limiteProvisaoTotal = tipoOperacao?.carteira 
    ? limitesBaixa[tipoOperacao.carteira as keyof typeof limitesBaixa] || 18
    : 18; // Default: 18 meses

  // Se ultrapassou o limite para provisão total, LGD = 100%
  if (mesesAtraso >= limiteProvisaoTotal) {
    return 100.0;
  }

  // LGD base por tipo de carteira conforme regulamentação
  const baseLGD = {
    'C1': 25, // Garantias sólidas
    'C2': 45, // Garantias médias  
    'C3': 65, // Sem garantia forte
    'C4': 75, // Alto risco
    'C5': 85  // Muito alto risco
  };

  let lgd = tipoOperacao?.carteira 
    ? baseLGD[tipoOperacao.carteira as keyof typeof baseLGD] || 65
    : 65; // Default para operações sem classificação

  // Ajuste por garantias adicionais
  if (garantias.length > 0) {
    const valorTotalGarantias = garantias.reduce((total, garantia) => {
      return total + (garantia.valor_avaliacao * garantia.percentual_cobertura / 100);
    }, 0);

    if (valorTotalGarantias > 0) {
      // Fator de mitigação baseado no valor das garantias
      const fatorMitigacao = Math.min(0.4, valorTotalGarantias / 1000000); // Máximo 40% redução
      lgd = lgd * (1 - fatorMitigacao);
    }
  }

  return Math.min(100, Math.max(5, lgd));
}

/**
 * Calcula Exposure at Default (EAD) - normalmente o valor da dívida
 */
function calcularExposureAtDefault(valorDivida: number): number {
  // Para operações normais, EAD = valor da dívida
  // Para linhas de crédito, seria valor atual + utilização esperada da linha
  return valorDivida;
}

/**
 * FUNÇÃO PRINCIPAL: Calcula provisão conforme metodologia BCB
 */
export async function calcularProvisaoConformeBCB(
  params: ParametrosCalculo
): Promise<ResultadoCalculoBCB> {
  const {
    valorDivida,
    diasAtraso,
    tipoOperacao,
    garantias = [],
    isReestruturado = false,
    dataReestruturacao,
    contratoId
  } = params;

  // 1. Determinar estágio de risco
  const estagio = determinarEstagioRisco(diasAtraso, isReestruturado, dataReestruturacao);

  // 2. Buscar garantias se contratoId fornecido
  let garantiasCompletas = garantias;
  if (contratoId && garantias.length === 0) {
    garantiasCompletas = await buscarGarantias(contratoId);
  }

  // 3. Calcular componentes da provisão
  const probabilidadeDefault = calcularProbabilidadeDefault(estagio, diasAtraso, tipoOperacao);
  const perdaDadoDefault = calcularLossGivenDefault(tipoOperacao, garantiasCompletas, diasAtraso);
  const exposicaoDefault = calcularExposureAtDefault(valorDivida);

  // 4. Calcular perda esperada: EL = PD × LGD × EAD
  const perdaEsperada = (probabilidadeDefault / 100) * (perdaDadoDefault / 100) * exposicaoDefault;
  const percentualProvisao = (perdaEsperada / valorDivida) * 100;

  // 5. Verificar período de observação
  let emPeriodoObservacao = false;
  let diasRestantesObservacao = 0;
  if (isReestruturado && dataReestruturacao) {
    const observacao = calcularPeriodoObservacao(dataReestruturacao);
    emPeriodoObservacao = observacao.emPeriodo;
    diasRestantesObservacao = observacao.diasRestantes;
  }

  // 6. Calcular valor total das garantias
  const valorGarantiaTotal = garantiasCompletas.reduce((total, garantia) => {
    return total + (garantia.valor_avaliacao * garantia.percentual_cobertura / 100);
  }, 0);

  // 7. Determinar metodologia aplicada
  const metodologia = `Estágio ${estagio} - ${
    estagio === 1 ? 'Perdas Esperadas (12 meses)' :
    estagio === 2 ? 'Perdas Esperadas (Lifetime)' :
    'Perdas Esperadas (Ativo Problemático)'
  }`;

  const detalhes = [
    `PD: ${probabilidadeDefault.toFixed(2)}%`,
    `LGD: ${perdaDadoDefault.toFixed(2)}%`,
    `EAD: R$ ${exposicaoDefault.toLocaleString('pt-BR')}`,
    garantiasCompletas.length > 0 ? `Garantias: R$ ${valorGarantiaTotal.toLocaleString('pt-BR')}` : null,
    emPeriodoObservacao ? `Observação: ${diasRestantesObservacao} dias` : null
  ].filter(Boolean).join(' | ');

  return {
    percentualProvisao,
    valorProvisao: perdaEsperada,
    estagio,
    probabilidadeDefault,
    perdaDadoDefault,
    exposicaoDefault,
    perdaEsperada,
    metodologia,
    detalhes,
    emPeriodoObservacao,
    diasRestantesObservacao,
    valorGarantiaTotal,
    fatorMitigacao: valorGarantiaTotal > 0 ? valorGarantiaTotal / valorDivida : 0,
    garantias: garantiasCompletas
  };
}

/**
 * Busca garantias do contrato no banco
 */
async function buscarGarantias(contratoId: string): Promise<GarantiaInfo[]> {
  try {
    const { data, error } = await supabase
      .from('garantias_provisao')
      .select('id, tipo_garantia, valor_avaliacao, percentual_cobertura, descricao')
      .eq('contrato_id', contratoId);

    if (error) {
      console.error('Erro ao buscar garantias:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Erro ao buscar garantias:', error);
    return [];
  }
}

/**
 * Verifica se ativo deve ser baixado conforme marco temporal
 */
export function deveSerBaixado(diasAtraso: number, tipoOperacao?: TipoOperacaoInfo): boolean {
  const meses = diasAtraso / 30;
  
  // Regras de baixa baseadas no tipo de garantia
  if (tipoOperacao?.carteira === 'C1') return meses >= 36; // Garantias sólidas
  if (tipoOperacao?.carteira === 'C2') return meses >= 24; // Garantias médias
  if (tipoOperacao?.carteira === 'C3') return meses >= 18; // Sem garantia
  
  return meses >= 18; // Default
}

/**
 * Calcula marcos temporais do contrato
 */
export function getMarcosTemporal(
  diasAtraso: number, 
  tipoOperacao?: TipoOperacaoInfo
) {
  const meses = diasAtraso / 30;
  const estagio = determinarEstagioRisco(diasAtraso);
  
  return {
    estagio,
    mesesAtraso: meses,
    ativoProblematico: diasAtraso > 90,
    paraBaixa: deveSerBaixado(diasAtraso, tipoOperacao),
    observacoes: `Estágio ${estagio} | ${meses.toFixed(1)} meses | ${
      diasAtraso > 90 ? 'Problemático' : 'Normal'
    }`
  };
}

/**
 * Utilitário para converter dados antigos C1-C5 para novos estágios
 * TEMPORÁRIO: apenas para migração
 */
export function migrarClassificacaoParaEstagio(
  classificacaoAntiga: string,
  diasAtraso: number
): EstagioRisco {
  console.warn('MIGRAÇÃO: Convertendo classificação antiga para estágio. Revisar lógica de negócio.');
  return determinarEstagioRisco(diasAtraso);
}