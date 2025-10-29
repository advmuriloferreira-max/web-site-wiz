import { SupabaseClient } from "@supabase/supabase-js";
import { differenceInDays, differenceInMonths } from "date-fns";

// =====================================================
// CONSTANTES - TIPOS DE GARANTIA POR CARTEIRA
// =====================================================

export const TIPOS_GARANTIA = {
  C1: [
    "Depósitos em dinheiro",
    "Títulos públicos federais",
    "Aplicações em ouro",
    "Garantias fidejussórias da União",
    "Garantias fidejussórias de governos centrais",
    "Alienação fiduciária de imóveis residenciais",
    "Alienação fiduciária de imóveis comerciais",
  ],
  C2: [
    "Fiança bancária",
    "Carta de fiança bancária",
    "Alienação fiduciária de veículos",
    "Hipoteca de imóveis (primeiro grau)",
    "Títulos e valores mobiliários de alta liquidez",
    "Seguro de crédito de instituições autorizadas",
  ],
  C3: [
    "Operações de desconto de recebíveis",
    "Cessão fiduciária de direitos creditórios",
    "Caução de direitos creditórios",
    "Penhor mercantil",
    "Penhor de direitos",
    "Garantias reais de menor liquidez",
    "Garantias fidejussórias (exceto C1)",
    "Aval",
    "Fiança pessoal",
  ],
};

// =====================================================
// FUNÇÃO 1: DETERMINAR CARTEIRA BCB 352
// =====================================================

export function determinarCarteiraBCB352(
  possuiGarantia: boolean,
  tipoGarantia: string | null,
  tipoPessoa: "PF" | "PJ"
): "C1" | "C2" | "C3" | "C4" | "C5" {
  // Se NÃO possui garantia
  if (!possuiGarantia || !tipoGarantia) {
    return tipoPessoa === "PJ" ? "C4" : "C5";
  }

  // Se possui garantia, verificar tipo
  if (TIPOS_GARANTIA.C1.includes(tipoGarantia)) return "C1";
  if (TIPOS_GARANTIA.C2.includes(tipoGarantia)) return "C2";
  if (TIPOS_GARANTIA.C3.includes(tipoGarantia)) return "C3";

  // Fallback (não deveria chegar aqui)
  return tipoPessoa === "PJ" ? "C4" : "C5";
}

// =====================================================
// FUNÇÃO 2: DETERMINAR ESTÁGIO CMN 4.966
// =====================================================

export function determinarEstagioCMN4966(diasAtraso: number): 1 | 2 | 3 {
  if (diasAtraso >= 90) return 3; // Default
  if (diasAtraso >= 30) return 2; // Risco aumentado
  return 1; // Risco normal
}

// =====================================================
// FUNÇÃO 3: CALCULAR PERCENTUAL DE PROVISÃO
// =====================================================

export async function calcularPercentualProvisao(
  diasAtraso: number,
  mesesAtraso: number,
  carteira: string,
  supabase: SupabaseClient
): Promise<{
  percentual: number;
  tipo: "ANEXO_I" | "ANEXO_II";
}> {
  const colunaCarteira = `${carteira.toLowerCase()}_percentual`;

  // Se >= 90 dias: Usa ANEXO I (Perda Incorrida)
  if (diasAtraso >= 90) {
    const { data, error } = await supabase
      .from("provisao_bcb352_anexo1")
      .select("*")
      .lte("meses_min", mesesAtraso)
      .or(`meses_max.gte.${mesesAtraso},meses_max.is.null`)
      .single();

    if (error || !data) {
      throw new Error("Erro ao buscar provisão Anexo I");
    }

    return {
      percentual: Number(data[colunaCarteira]),
      tipo: "ANEXO_I",
    };
  }

  // Se < 90 dias: Usa ANEXO II (Perda Esperada)
  const { data, error } = await supabase
    .from("provisao_bcb352_anexo2")
    .select("*")
    .lte("dias_min", diasAtraso)
    .gte("dias_max", diasAtraso)
    .single();

  if (error || !data) {
    throw new Error("Erro ao buscar provisão Anexo II");
  }

  return {
    percentual: Number(data[colunaCarteira]),
    tipo: "ANEXO_II",
  };
}

// =====================================================
// FUNÇÃO 4: CALCULAR PROPOSTA DE ACORDO (LÓGICA PREMIUM)
// =====================================================

export function calcularPropostaAcordo(
  saldoDevedor: number,
  percentualProvisao: number,
  valorProvisao: number
): {
  valorProposta: number;
  percentualDesconto: number;
  marco: string;
  momento: string;
} {
  // REGRA ESPECIAL: 90% a 100% de provisão = 10% FIXO
  if (percentualProvisao >= 90) {
    return {
      valorProposta: saldoDevedor * 0.1,
      percentualDesconto: 90,
      marco: "90-100%",
      momento: "premium",
    };
  }

  // REGRA NORMAL: Proposta = Saldo - Provisão
  const valorProposta = saldoDevedor - valorProvisao;
  const percentualDesconto = (valorProvisao / saldoDevedor) * 100;

  // Determinar marco
  let marco = "";
  let momento = "";

  if (percentualProvisao >= 80) {
    marco = "80-89%";
    momento = "otimo";
  } else if (percentualProvisao >= 70) {
    marco = "70-79%";
    momento = "muito_favoravel";
  } else if (percentualProvisao >= 60) {
    marco = "60-69%";
    momento = "favoravel";
  } else if (percentualProvisao >= 50) {
    marco = "50-59%";
    momento = "inicial";
  } else {
    marco = "<50%";
    momento = "prematuro";
  }

  return {
    valorProposta,
    percentualDesconto,
    marco,
    momento,
  };
}

// =====================================================
// FUNÇÃO 5: ANALISAR CONTRATO (ORQUESTRA TUDO)
// =====================================================

export async function analisarContrato(params: {
  dataInadimplencia: Date;
  saldoDevedor: number;
  possuiGarantia: boolean;
  tipoGarantia: string | null;
  tipoPessoa: "PF" | "PJ";
  supabase: SupabaseClient;
}): Promise<{
  carteira: "C1" | "C2" | "C3" | "C4" | "C5";
  diasAtraso: number;
  mesesAtraso: number;
  estagio: 1 | 2 | 3;
  emDefault: boolean;
  percentualProvisao: number;
  valorProvisao: number;
  tipoProvisao: "ANEXO_I" | "ANEXO_II";
  valorPropostaAcordo: number;
  percentualDesconto: number;
  marcoProvisionamento: string;
  momentoNegociacao: string;
}> {
  const {
    dataInadimplencia,
    saldoDevedor,
    possuiGarantia,
    tipoGarantia,
    tipoPessoa,
    supabase,
  } = params;

  // 1. Calcular dias e meses de atraso
  const hoje = new Date();
  const diasAtraso = differenceInDays(hoje, dataInadimplencia);
  const mesesAtraso = Math.floor(diasAtraso / 30);

  // 2. Determinar carteira
  const carteira = determinarCarteiraBCB352(
    possuiGarantia,
    tipoGarantia,
    tipoPessoa
  );

  // 3. Determinar estágio
  const estagio = determinarEstagioCMN4966(diasAtraso);

  // 4. Verificar default
  const emDefault = diasAtraso >= 90;

  // 5. Calcular provisão
  const { percentual, tipo } = await calcularPercentualProvisao(
    diasAtraso,
    mesesAtraso,
    carteira,
    supabase
  );
  const valorProvisao = saldoDevedor * (percentual / 100);

  // 6. Calcular proposta de acordo
  const {
    valorProposta,
    percentualDesconto,
    marco,
    momento,
  } = calcularPropostaAcordo(saldoDevedor, percentual, valorProvisao);

  return {
    carteira,
    diasAtraso,
    mesesAtraso,
    estagio,
    emDefault,
    percentualProvisao: percentual,
    valorProvisao,
    tipoProvisao: tipo,
    valorPropostaAcordo: valorProposta,
    percentualDesconto,
    marcoProvisionamento: marco,
    momentoNegociacao: momento,
  };
}
