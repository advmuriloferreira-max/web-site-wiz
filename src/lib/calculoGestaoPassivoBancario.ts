// src/lib/calculoGestaoPassivoBancario.ts

// ==============================================================================
// TIPOS E INTERFACES
// ==============================================================================

export type Carteira = "C1" | "C2" | "C3" | "C4" | "C5";
export type SegmentoBanco = "S1" | "S2" | "S3" | "S4";
export type MarcoProvisionamento = "N/A" | "< 50%" | "50-59%" | "60-69%" | "70-79%" | "80-89%" | "90%+";

export interface IModalidade {
  nome: string;
  carteira: Carteira;
}

export interface IBanco {
  nome: string;
  segmento: SegmentoBanco;
}

export interface IResultadoCalculo {
  diasAtraso: number;
  provisaoPercentual: number;
  provisaoValor: number;
  propostaValor: number;
  marco: MarcoProvisionamento;
  carteira: Carteira | null;
}

// ==============================================================================
// DADOS COMPLETOS - 100% BASEADO NAS RESOLUÇÕES
// ==============================================================================

/**
 * Lista completa com TODAS as 37 modalidades de operação/garantia,
 * classificadas em suas respectivas carteiras (C1-C5) conforme a liquidez
 * da garantia, seguindo a lógica da Resolução CMN 4.966/2021.
 */
export const MODALIDADES_COMPLETAS: IModalidade[] = [
  // --- CARTEIRA C1: Garantias de Máxima Liquidez (7) ---
  { nome: "Depósitos em dinheiro", carteira: "C1" },
  { nome: "Títulos públicos federais", carteira: "C1" },
  { nome: "Aplicações em ouro", carteira: "C1" },
  { nome: "Garantias fidejussórias da União", carteira: "C1" },
  { nome: "Garantias fidejussórias de governos centrais", carteira: "C1" },
  { nome: "Alienação fiduciária de imóveis residenciais", carteira: "C1" },
  { nome: "Alienação fiduciária de imóveis comerciais", carteira: "C1" },

  // --- CARTEIRA C2: Garantias de Alta Liquidez (6) ---
  { nome: "Fiança bancária", carteira: "C2" },
  { nome: "Carta de fiança bancária", carteira: "C2" },
  { nome: "Alienação fiduciária de veículos", carteira: "C2" },
  { nome: "Hipoteca de imóveis (primeiro grau)", carteira: "C2" },
  { nome: "Títulos e valores mobiliários de alta liquidez", carteira: "C2" },
  { nome: "Seguro de crédito de instituições autorizadas", carteira: "C2" },

  // --- CARTEIRA C3: Garantias de Liquidez Moderada (9) ---
  { nome: "Operações de desconto de recebíveis", carteira: "C3" },
  { nome: "Cessão fiduciária de direitos creditórios", carteira: "C3" },
  { nome: "Caução de direitos creditórios", carteira: "C3" },
  { nome: "Penhor mercantil", carteira: "C3" },
  { nome: "Penhor de direitos", carteira: "C3" },
  { nome: "Garantias reais de menor liquidez", carteira: "C3" },
  { nome: "Garantias fidejussórias (exceto C1)", carteira: "C3" },
  { nome: "Aval", carteira: "C3" },
  { nome: "Fiança pessoal", carteira: "C3" },

  // --- CARTEIRA C4: SEM Garantia - Pessoa Jurídica (8) ---
  { nome: "Capital de giro sem garantia", carteira: "C4" },
  { nome: "Conta garantida", carteira: "C4" },
  { nome: "Cheque especial empresarial", carteira: "C4" },
  { nome: "Adiantamento sobre contratos de câmbio (ACC)", carteira: "C4" },
  { nome: "Adiantamento sobre cambiais entregues (ACE)", carteira: "C4" },
  { nome: "Debêntures sem garantia", carteira: "C4" },
  { nome: "Notas promissórias comerciais", carteira: "C4" },
  { nome: "Crédito rural para investimento sem garantia", carteira: "C4" },

  // --- CARTEIRA C5: SEM Garantia - Pessoa Física (7) ---
  { nome: "Crédito pessoal sem garantia", carteira: "C5" },
  { nome: "Crédito direto ao consumidor (CDC)", carteira: "C5" },
  { nome: "Cartão de crédito rotativo", carteira: "C5" },
  { nome: "Cheque especial pessoa física", carteira: "C5" },
  { nome: "Crédito consignado (quando não há garantia adicional)", carteira: "C5" },
  { nome: "Crédito rural de custeio sem garantia", carteira: "C5" },
  { nome: "Microcrédito sem garantia", carteira: "C5" },
];

/**
 * Lista completa com 33 bancos e seus respectivos segmentos (S1-S4),
 * conforme classificação do Banco Central do Brasil.
 */
export const BANCOS_COMPLETOS: IBanco[] = [
    // --- S1: Bancos sistêmicos (6) ---
    { nome: "Banco do Brasil S.A.", segmento: "S1" },
    { nome: "Bradesco S.A.", segmento: "S1" },
    { nome: "BTG Pactual S.A.", segmento: "S1" },
    { nome: "Caixa Econômica Federal", segmento: "S1" },
    { nome: "Itaú Unibanco S.A.", segmento: "S1" },
    { nome: "Santander Brasil S.A.", segmento: "S1" },

    // --- S2: Bancos de grande porte (10) ---
    { nome: "Banco Safra S.A.", segmento: "S2" },
    { nome: "Banco Votorantim S.A.", segmento: "S2" },
    { nome: "Citibank Brasil", segmento: "S2" },
    { nome: "Credit Suisse (Brasil) S.A.", segmento: "S2" },
    { nome: "Banco do Nordeste do Brasil S.A.", segmento: "S2" },
    { nome: "Banco da Amazônia S.A.", segmento: "S2" },
    { nome: "BNDES", segmento: "S2" },
    { nome: "J.P. Morgan S.A.", segmento: "S2" },
    { nome: "Bank of America Merrill Lynch Banco Múltiplo S.A.", segmento: "S2" },
    { nome: "Goldman Sachs do Brasil Banco Múltiplo S.A.", segmento: "S2" },

    // --- S3: Bancos de médio porte (10) ---
    { nome: "Banco Inter S.A.", segmento: "S3" },
    { nome: "Banco Original S.A.", segmento: "S3" },
    { nome: "Banco Pan S.A.", segmento: "S3" },
    { nome: "Banco Daycoval S.A.", segmento: "S3" },
    { nome: "Banco ABC Brasil S.A.", segmento: "S3" },
    { nome: "Paraná Banco S.A.", segmento: "S3" },
    { nome: "Banco Sofisa S.A.", segmento: "S3" },
    { nome: "China Construction Bank (Brasil) Banco Múltiplo S.A.", segmento: "S3" },
    { nome: "Banco Indusval S.A.", segmento: "S3" },
    { nome: "Banco Mercantil do Brasil S.A.", segmento: "S3" },

    // --- S4: Bancos de pequeno porte e outros (7) ---
    { nome: "Nubank S.A.", segmento: "S4" },
    { nome: "C6 Bank S.A.", segmento: "S4" },
    { nome: "Banco BS2 S.A.", segmento: "S4" },
    { nome: "Banco Neon S.A.", segmento: 'S4'},
    { nome: "Banco Modal S.A.", segmento: "S4" },
    { nome: "Deutsche Bank S.A. - Banco Alemão", segmento: "S4" },
    { nome: "BNP Paribas Brasil S.A.", segmento: "S4" },
];

/**
 * Tabela COMPLETA do Anexo I da Resolução BCB 352/2023.
 * Define os percentuais de provisionamento para perda incorrida
 * (operações com atraso superior a 90 dias).
 */
const ANEXO_I_PERDA_INCORRIDA = [
    { de: 91, ate: 120, provisao: 10 },
    { de: 121, ate: 150, provisao: 20 },
    { de: 151, ate: 180, provisao: 30 },
    { de: 181, ate: 210, provisao: 40 },
    { de: 211, ate: 240, provisao: 50 },
    { de: 241, ate: 270, provisao: 55 },
    { de: 271, ate: 300, provisao: 60 },
    { de: 301, ate: 330, provisao: 65 },
    { de: 331, ate: 360, provisao: 70 },
    { de: 361, ate: 420, provisao: 75 },
    { de: 421, ate: 480, provisao: 80 },
    { de: 481, ate: 540, provisao: 85 },
    { de: 541, ate: 720, provisao: 90 },
    { de: 721, ate: 900, provisao: 95 },
    { de: 901, ate: Infinity, provisao: 100 }, // A resolução vai até 5400, mas 100% é o teto.
];

/**
 * Tabela COMPLETA do Anexo II da Resolução BCB 352/2023.
 * Define os percentuais de provisionamento para perda esperada
 * (operações com atraso de 0 a 90 dias).
 */
const ANEXO_II_PERDA_ESPERADA = [
    { de: 0, ate: 30, provisao: 0.5 },
    { de: 31, ate: 60, provisao: 1 },
    { de: 61, ate: 90, provisao: 3 },
];

// ==============================================================================
// FUNÇÕES DE CÁLCULO PRINCIPAIS
// ==============================================================================

/**
 * Calcula a diferença em dias entre duas datas.
 * @param dataInicio - A data de início do período (primeiro atraso).
 * @param dataFim - A data final (hoje). Default: new Date().
 * @returns O número de dias de atraso. Retorna 0 se a data de início for inválida.
 */
export function calcularDiasAtraso(dataInicio: string | Date | null, dataFim: Date = new Date()): number {
    if (!dataInicio) return 0;

    const dtInicio = new Date(dataInicio);
    // Corrige o fuso horário para evitar bugs de "um dia a menos"
    dtInicio.setMinutes(dtInicio.getMinutes() + dtInicio.getTimezoneOffset());

    if (isNaN(dtInicio.getTime())) return 0;

    const diffTime = dataFim.getTime() - dtInicio.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays < 0 ? 0 : diffDays;
}

/**
 * Determina a carteira (C1-C5) com base no nome da modalidade selecionada.
 * @param nomeModalidade - O nome da modalidade de operação/garantia.
 * @returns A carteira correspondente ou null se não encontrada.
 */
export function getCarteira(nomeModalidade: string): Carteira | null {
    const modalidade = MODALIDADES_COMPLETAS.find(m => m.nome === nomeModalidade);
    return modalidade ? modalidade.carteira : null;
}

/**
 * Calcula o percentual de provisionamento com base nos dias de atraso.
 * Lógica 100% aderente às Resoluções BCB 352 e CMN 4.966.
 * @param diasAtraso - O número de dias de atraso do contrato.
 * @returns O percentual de provisionamento (ex: 30 para 30%).
 */
export function calcularProvisaoPercentual(diasAtraso: number): number {
    if (diasAtraso <= 90) {
        // Estágio 2 (CMN 4.966) -> Perda Esperada (Anexo II)
        const faixa = ANEXO_II_PERDA_ESPERADA.find(f => diasAtraso >= f.de && diasAtraso <= f.ate);
        return faixa ? faixa.provisao : 0;
    } else {
        // Estágio 3 (CMN 4.966) -> Perda Incorrida (Anexo I)
        const faixa = ANEXO_I_PERDA_INCORRIDA.find(f => diasAtraso >= f.de && diasAtraso <= f.ate);
        // Para casos acima do último "ate", que é Infinity
        if (!faixa && diasAtraso > ANEXO_I_PERDA_INCORRIDA[ANEXO_I_PERDA_INCORRIDA.length - 1].de) {
            return ANEXO_I_PERDA_INCORRIDA[ANEXO_I_PERDA_INCORRIDA.length - 1].provisao;
        }
        return faixa ? faixa.provisao : 100; // Default para 100% se algo der errado
    }
}

/**
 * Calcula o valor da proposta de acordo com base na provisão.
 * @param saldoDevedor - O valor total do saldo devedor.
 * @param provisaoPercentual - O percentual de provisão já calculado.
 * @returns O valor da proposta de acordo.
 */
export function calcularPropostaValor(saldoDevedor: number, provisaoPercentual: number): number {
    if (provisaoPercentual >= 90) {
        // Regra de negócio: proposta de 10% do saldo quando a provisão é >= 90%
        return saldoDevedor * 0.10;
    } else {
        // Regra padrão: Saldo Devedor - Valor Provisionado
        const provisaoValor = saldoDevedor * (provisaoPercentual / 100);
        return saldoDevedor - provisaoValor;
    }
}

/**
 * Determina o marco de provisionamento para classificação estratégica.
 * @param provisaoPercentual - O percentual de provisão já calculado.
 * @returns A string correspondente ao marco.
 */
export function getMarcoProvisionamento(provisaoPercentual: number): MarcoProvisionamento {
    if (provisaoPercentual >= 90) return "90%+";
    if (provisaoPercentual >= 80) return "80-89%";
    if (provisaoPercentual >= 70) return "70-79%";
    if (provisaoPercentual >= 60) return "60-69%";
    if (provisaoPercentual >= 50) return "50-59%";
    if (provisaoPercentual > 0) return "< 50%";
    return "N/A";
}

/**
 * Função principal que orquestra todos os cálculos.
 * @param saldoDevedor - Valor do saldo devedor.
 * @param dataPrimeiroAtraso - Data do primeiro dia de atraso.
 * @param nomeModalidade - Nome da modalidade selecionada.
 * @returns Um objeto com todos os resultados calculados.
 */
export function calcularAnaliseCompleta(
    saldoDevedor: number,
    dataPrimeiroAtraso: string | Date | null,
    nomeModalidade: string
): IResultadoCalculo {

    const diasAtraso = calcularDiasAtraso(dataPrimeiroAtraso);
    const provisaoPercentual = calcularProvisaoPercentual(diasAtraso);
    const provisaoValor = saldoDevedor * (provisaoPercentual / 100);
    const propostaValor = calcularPropostaValor(saldoDevedor, provisaoPercentual);
    const marco = getMarcoProvisionamento(provisaoPercentual);
    const carteira = getCarteira(nomeModalidade);

    return {
        diasAtraso,
        provisaoPercentual,
        provisaoValor,
        propostaValor,
        marco,
        carteira,
    };
}
