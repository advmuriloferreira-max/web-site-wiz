import { CarteiraBCB352, MomentoNegociacao } from "@/types/gestaoPassivo";

export interface CalculoProvisaoResult {
  percentualProvisao: number;
  valorProvisao: number;
  marcoProvisionamento: string;
  momentoNegociacao: MomentoNegociacao;
  valorPropostaAcordo: number;
  percentualPropostaAcordo: number;
  recomendacaoEstrategica: string;
}

/**
 * Busca o percentual de provisão BCB 352 baseado na carteira e meses de atraso
 */
export async function buscarPercentualProvisaoBCB352(
  carteira: CarteiraBCB352,
  mesesAtraso: number
): Promise<number> {
  const { supabase } = await import("@/integrations/supabase/client");
  
  const { data, error } = await supabase
    .from("tabela_provisao_bcb352")
    .select("percentual_provisao")
    .eq("carteira", carteira)
    .lte("meses_atraso_min", mesesAtraso)
    .or(`meses_atraso_max.gte.${mesesAtraso},meses_atraso_max.is.null`)
    .single();

  if (error) {
    console.error("Erro ao buscar percentual de provisão:", error);
    return 0;
  }

  return data?.percentual_provisao || 0;
}

/**
 * Calcula todos os valores relacionados à provisão e proposta de acordo
 */
export async function calcularGestaoPassivo(
  carteira: CarteiraBCB352,
  saldoDevedor: number,
  mesesAtraso: number
): Promise<CalculoProvisaoResult> {
  // Buscar percentual de provisão na tabela BCB 352
  const percentualProvisao = await buscarPercentualProvisaoBCB352(carteira, mesesAtraso);
  
  // Calcular valor da provisão
  const valorProvisao = saldoDevedor * percentualProvisao;
  
  // Determinar marco de provisionamento
  const marcoProvisionamento = determinarMarcoProvisionamento(percentualProvisao);
  
  // Determinar momento de negociação
  const momentoNegociacao = determinarMomentoNegociacao(percentualProvisao);
  
  // Calcular proposta de acordo
  let valorPropostaAcordo: number;
  if (percentualProvisao < 0.90) {
    // Se provisão < 90%: saldo - provisão
    valorPropostaAcordo = saldoDevedor - valorProvisao;
  } else {
    // Se provisão >= 90%: 10% do saldo
    valorPropostaAcordo = saldoDevedor * 0.10;
  }
  
  const percentualPropostaAcordo = (valorPropostaAcordo / saldoDevedor) * 100;
  
  // Gerar recomendação estratégica
  const recomendacaoEstrategica = gerarRecomendacaoEstrategica(
    percentualProvisao,
    momentoNegociacao,
    valorPropostaAcordo,
    saldoDevedor
  );
  
  return {
    percentualProvisao,
    valorProvisao,
    marcoProvisionamento,
    momentoNegociacao,
    valorPropostaAcordo,
    percentualPropostaAcordo,
    recomendacaoEstrategica
  };
}

/**
 * Determina o marco de provisionamento (50%, 60%, 70%, 80%, 90%, 100%)
 */
export function determinarMarcoProvisionamento(percentual: number): string {
  if (percentual >= 1.0) return "100";
  if (percentual >= 0.90) return "90";
  if (percentual >= 0.80) return "80";
  if (percentual >= 0.70) return "70";
  if (percentual >= 0.60) return "60";
  if (percentual >= 0.50) return "50";
  return "";
}

/**
 * Determina o momento ideal de negociação
 */
export function determinarMomentoNegociacao(percentual: number): MomentoNegociacao {
  if (percentual >= 1.0) return "total";
  if (percentual >= 0.90) return "premium";
  if (percentual >= 0.70) return "otimo";
  if (percentual >= 0.50) return "muito_favoravel";
  if (percentual >= 0.30) return "favoravel";
  return "inicial";
}

/**
 * Gera recomendação estratégica baseada nos cálculos
 */
function gerarRecomendacaoEstrategica(
  percentualProvisao: number,
  momento: MomentoNegociacao,
  valorProposta: number,
  saldoDevedor: number
): string {
  const percentualDesconto = ((saldoDevedor - valorProposta) / saldoDevedor) * 100;
  
  const recomendacoes: Record<MomentoNegociacao, string> = {
    inicial: `💡 **MOMENTO INICIAL** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco ainda não provisionou quantias significativas. A margem de negociação é limitada. Recomenda-se:\n- Negociar desconto de até ${percentualDesconto.toFixed(0)}%\n- Focar em renegociação de prazos\n- Apresentar garantias adicionais se possível\n- Evitar litígio neste momento`,
    
    favoravel: `⚠️ **MOMENTO FAVORÁVEL** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco começou a provisionar valores relevantes. Há espaço para negociação. Estratégia recomendada:\n- Propor desconto de ${percentualDesconto.toFixed(0)}%\n- Negociar redução de juros e encargos\n- Apresentar plano de pagamento estruturado\n- Considerar acordo extrajudicial`,
    
    muito_favoravel: `✅ **MOMENTO MUITO FAVORÁVEL** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco provisionou entre 50-70% do saldo. Momento ideal para negociação agressiva:\n- Propor desconto de ${percentualDesconto.toFixed(0)}%\n- Solicitar isenção de juros e multas\n- Negociar entrada + parcelas reduzidas\n- Banco está motivado a recuperar algo antes da perda total`,
    
    otimo: `🎯 **MOMENTO ÓTIMO** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco provisionou 70-90% do valor. Alta probabilidade de acordo vantajoso:\n- Propor desconto de ${percentualDesconto.toFixed(0)}%\n- Banco prefere recuperar 10-30% a perder 100%\n- Negociar pagamento à vista com desconto máximo\n- Considerar quitação em até 3 parcelas`,
    
    premium: `💎 **MOMENTO PREMIUM** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco provisionou 90-100%. Situação extremamente favorável:\n- Propor quitação por ${percentualDesconto.toFixed(0)}% de desconto\n- Banco aceitará até 90% de desconto para evitar prejuízo contábil\n- Negociar pagamento à vista ou em até 2 parcelas\n- Momento ideal para acordo definitivo`,
    
    total: `🔥 **PROVISÃO TOTAL** (Provisão: ${(percentualProvisao * 100).toFixed(2)}%)\n\nO banco provisionou 100% do valor. Dívida considerada irrecuperável:\n- Propor quitação simbólica (5-10% do saldo)\n- Banco pode aceitar qualquer valor para limpar balanço\n- Negociar pagamento à vista com desconto máximo\n- Excelente oportunidade para acordo histórico`
  };
  
  return recomendacoes[momento];
}

/**
 * Calcula dias de atraso entre duas datas
 */
export function calcularDiasAtraso(dataInadimplencia: Date): number {
  const hoje = new Date();
  const diffTime = Math.abs(hoje.getTime() - dataInadimplencia.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calcula meses de atraso baseado em dias
 */
export function calcularMesesAtraso(diasAtraso: number): number {
  return Math.floor(diasAtraso / 30);
}

/**
 * Verifica se o contrato está em default (> 90 dias)
 */
export function verificarDefault(diasAtraso: number): boolean {
  return diasAtraso > 90;
}
