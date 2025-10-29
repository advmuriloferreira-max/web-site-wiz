import { differenceInDays, differenceInMonths } from 'date-fns';

/**
 * Tipos de Garantia conforme BCB 352
 */
export const TIPOS_GARANTIA = {
  // C1 - Garantias de Máxima Liquidez
  C1: [
    'Alienação Fiduciária de Imóvel Residencial',
    'Alienação Fiduciária de Imóvel Comercial',
    'Títulos Públicos Federais',
    'Depósitos em Dinheiro',
    'Garantia da União',
    'Garantia de Organismo Multilateral',
  ],
  // C2 - Garantias de Alta Liquidez
  C2: [
    'Alienação Fiduciária de Veículo',
    'Hipoteca de Imóvel (1º Grau)',
    'Fiança Bancária',
    'Carta de Fiança Bancária',
    'Seguro de Crédito',
    'Títulos de Alta Liquidez',
  ],
  // C3 - Garantias de Liquidez Moderada
  C3: [
    'Cessão Fiduciária de Recebíveis',
    'Desconto de Recebíveis',
    'Penhor Mercantil',
    'Caução de Direitos Creditórios',
    'Aval',
    'Fiança Pessoal',
  ],
  // C4 - Sem Garantia (Pessoa Jurídica)
  C4: [
    'Sem Garantia - Pessoa Jurídica',
  ],
  // C5 - Sem Garantia (Pessoa Física)
  C5: [
    'Sem Garantia - Pessoa Física',
  ],
};

/**
 * Determina a carteira BCB 352 baseado no tipo de garantia e tipo de pessoa
 */
export function determinarCarteiraBCB352(
  possuiGarantia: boolean,
  tipoGarantia: string | null,
  tipoPessoa: 'PF' | 'PJ'
): 'C1' | 'C2' | 'C3' | 'C4' | 'C5' {
  if (!possuiGarantia || !tipoGarantia) {
    // Sem garantia
    return tipoPessoa === 'PJ' ? 'C4' : 'C5';
  }

  // Com garantia - verificar tipo
  if (TIPOS_GARANTIA.C1.includes(tipoGarantia)) return 'C1';
  if (TIPOS_GARANTIA.C2.includes(tipoGarantia)) return 'C2';
  if (TIPOS_GARANTIA.C3.includes(tipoGarantia)) return 'C3';

  // Padrão: sem garantia
  return tipoPessoa === 'PJ' ? 'C4' : 'C5';
}

/**
 * Determina o estágio CMN 4.966 baseado em dias de atraso
 */
export function determinarEstagioCMN4966(diasAtraso: number): 1 | 2 | 3 {
  if (diasAtraso <= 30) return 1; // Estágio 1: Risco Normal
  if (diasAtraso <= 90) return 2; // Estágio 2: Risco Aumentado
  return 3; // Estágio 3: Default
}

/**
 * Calcula percentual de provisão conforme BCB 352
 */
export async function calcularPercentualProvisao(
  diasAtraso: number,
  carteira: 'C1' | 'C2' | 'C3' | 'C4' | 'C5',
  supabase: any
): Promise<{
  percentual: number;
  tipoProvisao: 'ANEXO_I' | 'ANEXO_II';
  faixa: string;
}> {
  if (diasAtraso <= 90) {
    // ANEXO II - Perda Esperada (0-90 dias)
    const { data, error } = await supabase
      .from('provisao_bcb352_anexo2')
      .select('*')
      .lte('dias_min', diasAtraso)
      .gte('dias_max', diasAtraso)
      .single();

    if (error || !data) {
      throw new Error('Erro ao buscar provisão do Anexo II');
    }

    return {
      percentual: data[`${carteira.toLowerCase()}_percentual`],
      tipoProvisao: 'ANEXO_II',
      faixa: data.faixa_dias,
    };
  } else {
    // ANEXO I - Perda Incorrida (90+ dias)
    const mesesAtraso = Math.floor(diasAtraso / 30);

    const { data, error } = await supabase
      .from('provisao_bcb352_anexo1')
      .select('*')
      .lte('meses_min', mesesAtraso)
      .or(`meses_max.gte.${mesesAtraso},meses_max.is.null`)
      .single();

    if (error || !data) {
      throw new Error('Erro ao buscar provisão do Anexo I');
    }

    return {
      percentual: data[`${carteira.toLowerCase()}_percentual`],
      tipoProvisao: 'ANEXO_I',
      faixa: data.faixa_meses,
    };
  }
}

/**
 * Calcula proposta de acordo conforme lógica premium
 */
export function calcularPropostaAcordo(
  saldoDevedor: number,
  percentualProvisao: number
): {
  valorProposta: number;
  percentualDesconto: number;
} {
  let valorProposta: number;

  if (percentualProvisao >= 90) {
    // REGRA ESPECIAL: 90%+ de provisão = 10% fixo
    valorProposta = saldoDevedor * 0.10;
  } else {
    // REGRA NORMAL: Saldo - Provisão
    const valorProvisao = saldoDevedor * (percentualProvisao / 100);
    valorProposta = saldoDevedor - valorProvisao;
  }

  const percentualDesconto = ((saldoDevedor - valorProposta) / saldoDevedor) * 100;

  return {
    valorProposta,
    percentualDesconto,
  };
}

/**
 * Análise completa de contrato
 */
export async function analisarContrato(params: {
  dataInadimplencia: Date;
  saldoDevedor: number;
  possuiGarantia: boolean;
  tipoGarantia: string | null;
  tipoPessoa: 'PF' | 'PJ';
  supabase: any;
}) {
  const { dataInadimplencia, saldoDevedor, possuiGarantia, tipoGarantia, tipoPessoa, supabase } = params;

  // 1. Calcular dias e meses de atraso
  const hoje = new Date();
  const diasAtraso = differenceInDays(hoje, dataInadimplencia);
  const mesesAtraso = differenceInMonths(hoje, dataInadimplencia);

  // 2. Determinar carteira BCB 352
  const carteira = determinarCarteiraBCB352(possuiGarantia, tipoGarantia, tipoPessoa);

  // 3. Determinar estágio CMN 4.966
  const estagio = determinarEstagioCMN4966(diasAtraso);

  // 4. Verificar default (> 90 dias)
  const emDefault = diasAtraso > 90;

  // 5. Calcular percentual de provisão
  const { percentual, tipoProvisao, faixa } = await calcularPercentualProvisao(
    diasAtraso,
    carteira,
    supabase
  );

  // 6. Calcular valor da provisão
  const valorProvisao = saldoDevedor * (percentual / 100);

  // 7. Calcular proposta de acordo
  const { valorProposta, percentualDesconto } = calcularPropostaAcordo(saldoDevedor, percentual);

  return {
    diasAtraso,
    mesesAtraso,
    carteira,
    estagio,
    emDefault,
    percentualProvisao: percentual,
    valorProvisao,
    tipoProvisao,
    faixaProvisao: faixa,
    valorPropostaAcordo: valorProposta,
    percentualDesconto,
  };
}
