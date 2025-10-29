/**
 * Biblioteca de Cálculo de Provisão conforme BCB 352/2023
 * e Classificação por Estágio conforme CMN 4.966/2021
 */

import { CarteiraBCB352 } from "@/types/gestaoPassivo";

// ============= INTERFACES =============

export interface ResultadoEstagio {
  estagio: 1 | 2 | 3;
  descricao: string;
  fundamentacao: string;
  indicadores: string[];
  recomendacao: string;
}

export interface ParametrosEstagio {
  diasAtraso: number;
  foiReestruturado: boolean;
  emFalencia: boolean;
  medidaJudicial: boolean;
  descumprimentoClausulas: boolean;
  aumentoSignificativoRisco: boolean;
  indicadoresRisco: string[];
}

export interface ParametrosIndicadores {
  diasAtraso: number;
  mesesAtraso: number;
  percentualProvisao: number;
  foiReestruturado: boolean;
  possuiGarantias: boolean;
  valorGarantias: number;
  saldoDevedor: number;
}

export interface ResultadoPerdaEsperada {
  pd: number; // Probability of Default
  lgd: number; // Loss Given Default
  ead: number; // Exposure at Default
  perdaEsperada: number;
  explicacao: string;
}

// ============= FUNÇÕES PRINCIPAIS =============

/**
 * Determina o estágio CMN 4.966 baseado nos critérios oficiais
 * 
 * ESTÁGIO 1: Risco normal
 * - Sem aumento significativo de risco desde a originação
 * - Dias de atraso < 30
 * - Sem indicadores de deterioração
 * 
 * ESTÁGIO 2: Risco aumentado
 * - Aumento significativo de risco, mas não em default
 * - Dias de atraso entre 30 e 90
 * - OU indicadores de deterioração presentes
 * 
 * ESTÁGIO 3: Default
 * - Ativo problemático (Art. 3º CMN 4.966)
 * - Dias de atraso > 90
 * - OU outros critérios de default
 */
export function determinarEstagioCMN4966(params: ParametrosEstagio): ResultadoEstagio {
  // ESTÁGIO 3: Default (Art. 3º CMN 4.966)
  if (
    params.diasAtraso > 90 ||
    params.foiReestruturado ||
    params.emFalencia ||
    params.medidaJudicial ||
    params.descumprimentoClausulas
  ) {
    return {
      estagio: 3,
      descricao: 'Estágio 3 - Default (Ativo Problemático)',
      fundamentacao: 'Artigo 3º da Resolução CMN 4.966/2021: O ativo se caracteriza como ativo financeiro com problema de recuperação de crédito quando ocorre atraso superior a 90 dias no pagamento de principal ou encargos, ou indicativo de que a respectiva obrigação não será integralmente honrada nas condições pactuadas.',
      indicadores: [
        params.diasAtraso > 90 ? 'Atraso superior a 90 dias' : null,
        params.foiReestruturado ? 'Reestruturação do ativo' : null,
        params.emFalencia ? 'Falência decretada' : null,
        params.medidaJudicial ? 'Medida judicial' : null,
        params.descumprimentoClausulas ? 'Descumprimento de cláusulas' : null,
      ].filter(Boolean) as string[],
      recomendacao: '🔴 ESTÁGIO 3 (DEFAULT): Provisão para toda a vida do ativo. Negociação urgente recomendada.'
    };
  }
  
  // ESTÁGIO 2: Aumento significativo de risco
  if (
    params.diasAtraso >= 30 ||
    params.aumentoSignificativoRisco ||
    params.indicadoresRisco.length > 0
  ) {
    return {
      estagio: 2,
      descricao: 'Estágio 2 - Risco Aumentado Significativamente',
      fundamentacao: 'Artigo 5º da Resolução CMN 4.966/2021: Considera-se que houve aumento significativo no risco de crédito quando há atraso igual ou superior a 30 dias no pagamento de principal ou encargos, ou outros indicadores de deterioração da qualidade creditícia.',
      indicadores: [
        params.diasAtraso >= 30 ? `Atraso de ${params.diasAtraso} dias (≥30 dias)` : null,
        ...params.indicadoresRisco
      ].filter(Boolean) as string[],
      recomendacao: '🟡 ESTÁGIO 2 (RISCO AUMENTADO): Provisão para toda a vida do ativo. Monitoramento intensivo necessário.'
    };
  }
  
  // ESTÁGIO 1: Risco normal
  return {
    estagio: 1,
    descricao: 'Estágio 1 - Risco Normal',
    fundamentacao: 'Resolução CMN 4.966/2021: Instrumento financeiro sem aumento significativo de risco de crédito desde a originação.',
    indicadores: ['Sem atraso significativo', 'Sem indicadores de deterioração'],
    recomendacao: '🟢 ESTÁGIO 1 (RISCO NORMAL): Provisão para 12 meses de perda esperada. Situação controlada.'
  };
}

/**
 * Identifica indicadores de aumento significativo de risco
 * Conforme Art. 5º da CMN 4.966
 */
export function identificarIndicadoresRisco(params: ParametrosIndicadores): string[] {
  const indicadores: string[] = [];
  
  // Atraso entre 30 e 90 dias
  if (params.diasAtraso >= 30 && params.diasAtraso <= 90) {
    indicadores.push(`Atraso de ${params.diasAtraso} dias (faixa de atenção)`);
  }
  
  // Provisão elevada (acima de 30%)
  if (params.percentualProvisao >= 0.30) {
    indicadores.push(`Provisão elevada: ${(params.percentualProvisao * 100).toFixed(1)}%`);
  }
  
  // Reestruturação prévia
  if (params.foiReestruturado) {
    indicadores.push('Histórico de reestruturação');
  }
  
  // Garantias insuficientes
  if (params.possuiGarantias && params.valorGarantias < params.saldoDevedor * 0.5) {
    const cobertura = (params.valorGarantias / params.saldoDevedor * 100).toFixed(1);
    indicadores.push(`Garantias insuficientes (${cobertura}% de cobertura)`);
  }
  
  // Atraso prolongado (mais de 6 meses)
  if (params.mesesAtraso >= 6) {
    indicadores.push(`Atraso prolongado: ${params.mesesAtraso} meses`);
  }
  
  return indicadores;
}

/**
 * Calcula a perda esperada teórica (EL = PD × LGD × EAD)
 * NOTA: Valores de PD e LGD são estimativas configuráveis
 */
export function calcularPerdaEsperada(params: {
  estagio: 1 | 2 | 3;
  saldoDevedor: number;
  valorGarantias: number;
  probabilidadeDefault?: number; // PD (opcional, padrão baseado no estágio)
  perdaDadoDefault?: number; // LGD (opcional, padrão 45%)
}): ResultadoPerdaEsperada {
  // EAD (Exposure at Default) = Saldo Devedor
  const ead = params.saldoDevedor;
  
  // LGD (Loss Given Default) - Padrão 45% ou configurável
  const lgdBase = params.perdaDadoDefault || 0.45;
  
  // PD (Probability of Default) - Baseado no estágio
  let pd: number;
  let explicacaoPD: string;
  
  if (params.probabilidadeDefault) {
    pd = params.probabilidadeDefault;
    explicacaoPD = `PD configurada: ${(pd * 100).toFixed(2)}%`;
  } else {
    // Estimativas padrão por estágio (NOTA: São estimativas, não valores oficiais)
    switch (params.estagio) {
      case 1:
        pd = 0.05; // 5% (risco normal)
        explicacaoPD = 'PD estimada para Estágio 1 (risco normal): 5%';
        break;
      case 2:
        pd = 0.20; // 20% (risco aumentado)
        explicacaoPD = 'PD estimada para Estágio 2 (risco aumentado): 20%';
        break;
      case 3:
        pd = 0.80; // 80% (default)
        explicacaoPD = 'PD estimada para Estágio 3 (default): 80%';
        break;
    }
  }
  
  // Ajustar LGD considerando garantias
  let lgd = lgdBase;
  if (params.valorGarantias > 0) {
    const coberturaGarantias = Math.min(params.valorGarantias / params.saldoDevedor, 1);
    lgd = lgdBase * (1 - coberturaGarantias * 0.7); // Garantias reduzem LGD em até 70%
  }
  
  // Calcular EL = PD × LGD × EAD
  const perdaEsperada = pd * lgd * ead;
  
  return {
    pd,
    lgd,
    ead,
    perdaEsperada,
    explicacao: `${explicacaoPD}. LGD ajustado: ${(lgd * 100).toFixed(2)}% (base ${(lgdBase * 100).toFixed(0)}% ajustado por garantias). EAD: ${formatCurrency(ead)}. Perda Esperada: ${formatCurrency(perdaEsperada)}`
  };
}

/**
 * Busca percentual de provisão para contratos com atraso > 90 dias (Anexo I)
 */
export async function buscarPercentualAnexo1(
  carteira: CarteiraBCB352,
  mesesAtraso: number
): Promise<number> {
  const { supabase } = await import("@/integrations/supabase/client");
  
  const colunaCarteira = `${carteira.toLowerCase()}_percentual`;
  
  const { data, error } = await supabase
    .from("provisao_bcb352_anexo1")
    .select(colunaCarteira)
    .lte("meses_min", mesesAtraso)
    .or(`meses_max.gte.${mesesAtraso},meses_max.is.null`)
    .single();

  if (error) {
    console.error("Erro ao buscar percentual de provisão Anexo I:", error);
    return 1.0; // Retorna 100% em caso de erro por segurança
  }

  return (data?.[colunaCarteira] || 100) / 100;
}

/**
 * Busca percentual de provisão para contratos com atraso 0-90 dias (Anexo II)
 */
export async function buscarPercentualAnexo2(
  carteira: CarteiraBCB352,
  diasAtraso: number
): Promise<number> {
  const { supabase } = await import("@/integrations/supabase/client");
  
  const colunaCarteira = `${carteira.toLowerCase()}_percentual`;
  
  const { data, error } = await supabase
    .from("provisao_bcb352_anexo2")
    .select(colunaCarteira)
    .gte("dias_max", diasAtraso)
    .lte("dias_min", diasAtraso)
    .single();

  if (error) {
    console.error("Erro ao buscar percentual de provisão Anexo II:", error);
    return 0.10; // Retorna 10% em caso de erro por segurança
  }

  return (data?.[colunaCarteira] || 10) / 100;
}

/**
 * Busca o percentual de provisão correto (Anexo I ou II)
 */
export async function buscarPercentualProvisaoBCB352(
  carteira: CarteiraBCB352,
  diasAtraso: number,
  mesesAtraso: number
): Promise<{ percentual: number; tipo: 'ANEXO_I' | 'ANEXO_II' }> {
  if (diasAtraso > 90) {
    const percentual = await buscarPercentualAnexo1(carteira, mesesAtraso);
    return { percentual, tipo: 'ANEXO_I' };
  } else {
    const percentual = await buscarPercentualAnexo2(carteira, diasAtraso);
    return { percentual, tipo: 'ANEXO_II' };
  }
}

// ============= FUNÇÕES AUXILIARES =============

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}
