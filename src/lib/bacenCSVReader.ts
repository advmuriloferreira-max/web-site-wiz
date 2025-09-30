// Biblioteca para ler e processar os CSVs do BACEN diretamente

interface ModalidadeCSV {
  codigo_sgs: string;
  nome: string;
  tipo_pessoa: 'PF' | 'PJ';
  categoria: string;
}

interface TaxaBacen {
  taxa_mensal: number;
  taxa_anual: number;
  periodo: {
    mes: number;
    ano: number;
  };
}

// Mapeamento dos códigos SGS para as modalidades
const modalidadesMap: Record<string, ModalidadeCSV> = {
  '25436': { codigo_sgs: '25436', nome: 'Total', tipo_pessoa: 'PJ', categoria: 'Total Geral' },
  '25437': { codigo_sgs: '25437', nome: 'Pessoas Jurídicas - Total', tipo_pessoa: 'PJ', categoria: 'Total' },
  '25438': { codigo_sgs: '25438', nome: 'Desconto de duplicatas e recebíveis', tipo_pessoa: 'PJ', categoria: 'Desconto' },
  '25439': { codigo_sgs: '25439', nome: 'Desconto de cheques', tipo_pessoa: 'PJ', categoria: 'Desconto' },
  '25440': { codigo_sgs: '25440', nome: 'Antecipação de faturas de cartão de crédito', tipo_pessoa: 'PJ', categoria: 'Antecipação' },
  '25441': { codigo_sgs: '25441', nome: 'Capital de giro com prazo de até 365 dias', tipo_pessoa: 'PJ', categoria: 'Capital de Giro' },
  '25442': { codigo_sgs: '25442', nome: 'Capital de giro com prazo superior a 365 dias', tipo_pessoa: 'PJ', categoria: 'Capital de Giro' },
  '25443': { codigo_sgs: '25443', nome: 'Capital de giro com teto BNDES', tipo_pessoa: 'PJ', categoria: 'Capital de Giro' },
  '25444': { codigo_sgs: '25444', nome: 'Capital de giro total', tipo_pessoa: 'PJ', categoria: 'Capital de Giro' },
  '25445': { codigo_sgs: '25445', nome: 'Conta garantida', tipo_pessoa: 'PJ', categoria: 'Conta Garantida' },
  '25446': { codigo_sgs: '25446', nome: 'Cheque especial', tipo_pessoa: 'PJ', categoria: 'Cheque Especial' },
  '25447': { codigo_sgs: '25447', nome: 'Aquisição de veículos', tipo_pessoa: 'PJ', categoria: 'Aquisição de Bens' },
  '25448': { codigo_sgs: '25448', nome: 'Aquisição de outros bens', tipo_pessoa: 'PJ', categoria: 'Aquisição de Bens' },
  '25449': { codigo_sgs: '25449', nome: 'Aquisição de bens total', tipo_pessoa: 'PJ', categoria: 'Aquisição de Bens' },
  '25450': { codigo_sgs: '25450', nome: 'Vendor', tipo_pessoa: 'PJ', categoria: 'Vendor' },
  '25451': { codigo_sgs: '25451', nome: 'Hot money', tipo_pessoa: 'PJ', categoria: 'Hot Money' },
  '25452': { codigo_sgs: '25452', nome: 'Financiamento imobiliário', tipo_pessoa: 'PJ', categoria: 'Financiamento Imobiliário' },
  '25453': { codigo_sgs: '25453', nome: 'Outros', tipo_pessoa: 'PJ', categoria: 'Outros' },
  '25454': { codigo_sgs: '25454', nome: 'Compror', tipo_pessoa: 'PJ', categoria: 'Compror' },
  '25455': { codigo_sgs: '25455', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PJ', categoria: 'Cartão de Crédito' },
  '25456': { codigo_sgs: '25456', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PJ', categoria: 'Cartão de Crédito' },
  '25457': { codigo_sgs: '25457', nome: 'Cartão de crédito total', tipo_pessoa: 'PJ', categoria: 'Cartão de Crédito' },
  '25458': { codigo_sgs: '25458', nome: 'Adiantamento sobre contratos de câmbio (ACC)', tipo_pessoa: 'PJ', categoria: 'Comércio Exterior' },
  '25459': { codigo_sgs: '25459', nome: 'Financiamento a importações', tipo_pessoa: 'PJ', categoria: 'Comércio Exterior' },
  '25460': { codigo_sgs: '25460', nome: 'Financiamento a exportações', tipo_pessoa: 'PJ', categoria: 'Comércio Exterior' },
  '25461': { codigo_sgs: '25461', nome: 'Comércio exterior total', tipo_pessoa: 'PJ', categoria: 'Comércio Exterior' },
  '25462': { codigo_sgs: '25462', nome: 'Pessoas Físicas - Total', tipo_pessoa: 'PF', categoria: 'Total' },
  '25463': { codigo_sgs: '25463', nome: 'Cheque especial', tipo_pessoa: 'PF', categoria: 'Cheque Especial' },
  '25464': { codigo_sgs: '25464', nome: 'Crédito pessoal não consignado', tipo_pessoa: 'PF', categoria: 'Crédito Pessoal' },
  '25465': { codigo_sgs: '25465', nome: 'Crédito pessoal não consignado vinculado à composição de dívidas', tipo_pessoa: 'PF', categoria: 'Crédito Pessoal' },
  '25466': { codigo_sgs: '25466', nome: 'Crédito pessoal consignado para trabalhadores do setor privado', tipo_pessoa: 'PF', categoria: 'Crédito Consignado' },
  '25467': { codigo_sgs: '25467', nome: 'Crédito pessoal consignado para trabalhadores do setor público', tipo_pessoa: 'PF', categoria: 'Crédito Consignado' },
  '25468': { codigo_sgs: '25468', nome: 'Crédito pessoal consignado para aposentados e pensionistas do INSS', tipo_pessoa: 'PF', categoria: 'Crédito Consignado' },
  '25469': { codigo_sgs: '25469', nome: 'Crédito pessoal consignado total', tipo_pessoa: 'PF', categoria: 'Crédito Consignado' },
  '25470': { codigo_sgs: '25470', nome: 'Crédito pessoal total', tipo_pessoa: 'PF', categoria: 'Crédito Pessoal' },
  '25471': { codigo_sgs: '25471', nome: 'Aquisição de veículos', tipo_pessoa: 'PF', categoria: 'Aquisição de Veículos' },
  '25472': { codigo_sgs: '25472', nome: 'Aquisição de outros bens', tipo_pessoa: 'PF', categoria: 'Aquisição de Bens' },
  '25473': { codigo_sgs: '25473', nome: 'Aquisição de bens total', tipo_pessoa: 'PF', categoria: 'Aquisição de Bens' },
  '25474': { codigo_sgs: '25474', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PF', categoria: 'Cartão de Crédito' },
  '25475': { codigo_sgs: '25475', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PF', categoria: 'Cartão de Crédito' },
  '25476': { codigo_sgs: '25476', nome: 'Cartão de crédito total', tipo_pessoa: 'PF', categoria: 'Cartão de Crédito' },
  '25477': { codigo_sgs: '25477', nome: 'Financiamento imobiliário com taxas de mercado', tipo_pessoa: 'PF', categoria: 'Financiamento Imobiliário' },
  '25478': { codigo_sgs: '25478', nome: 'Financiamento imobiliário com taxas reguladas', tipo_pessoa: 'PF', categoria: 'Financiamento Imobiliário' },
  '25479': { codigo_sgs: '25479', nome: 'Financiamento imobiliário total', tipo_pessoa: 'PF', categoria: 'Financiamento Imobiliário' },
  '25480': { codigo_sgs: '25480', nome: 'Outros', tipo_pessoa: 'PF', categoria: 'Outros' },
};

// Mapeamento de qual arquivo CSV contém cada código SGS
const arquivoPorCodigo: Record<string, number> = {
  '25436': 1, '25437': 1, '25438': 1, '25439': 1, '25440': 1, '25441': 1, 
  '25442': 1, '25443': 1, '25444': 1, '25445': 1, '25446': 1,
  '25447': 2, '25448': 2, '25449': 2, '25450': 2, '25451': 2, '25452': 2, '25453': 2,
  '25454': 3, '25455': 3, '25456': 3, '25457': 3, '25458': 3, '25459': 3, 
  '25460': 3, '25461': 3,
  '25462': 4, '25463': 4, '25464': 4, '25465': 4, '25466': 4, '25467': 4, 
  '25468': 4, '25469': 4, '25470': 4, '25471': 4, '25472': 4, '25473': 4,
  '25474': 4, '25475': 4, '25476': 4, '25477': 4, '25478': 4, '25479': 4, '25480': 4,
};

// Cache dos CSVs carregados
const csvCache: Record<number, string> = {};
let cacheCarregado = false;

async function carregarCSV(numeroArquivo: number): Promise<string> {
  if (csvCache[numeroArquivo]) {
    return csvCache[numeroArquivo];
  }

  console.log(`Carregando CSV ${numeroArquivo}...`);
  const response = await fetch(`/data/bacen-series-${numeroArquivo}.csv`);
  if (!response.ok) {
    throw new Error(`Erro ao carregar CSV ${numeroArquivo}: ${response.statusText}`);
  }

  const text = await response.text();
  csvCache[numeroArquivo] = text;
  console.log(`✓ CSV ${numeroArquivo} carregado (${text.length} caracteres)`);
  return text;
}

// Pré-carregar todos os CSVs
export async function precarregarTodosCSVs(): Promise<void> {
  if (cacheCarregado) {
    console.log('CSVs já estão em cache');
    return;
  }

  console.log('🚀 Iniciando pré-carregamento de todos os CSVs do BACEN...');
  const inicio = Date.now();

  try {
    await Promise.all([
      carregarCSV(1),
      carregarCSV(2),
      carregarCSV(3),
      carregarCSV(4),
    ]);

    cacheCarregado = true;
    const tempo = Date.now() - inicio;
    console.log(`✅ Todos os 4 CSVs carregados em ${tempo}ms`);
  } catch (error) {
    console.error('❌ Erro ao pré-carregar CSVs:', error);
    throw error;
  }
}

export async function consultarTaxaBacenCSV(
  codigoSGS: string, 
  mes: number, 
  ano: number
): Promise<TaxaBacen | null> {
  try {
    console.log('=== INÍCIO CONSULTA BACEN CSV ===');
    console.log('Código SGS:', codigoSGS);
    console.log('Mês:', mes, 'Ano:', ano);

    const numeroArquivo = arquivoPorCodigo[codigoSGS];
    if (!numeroArquivo) {
      console.error(`Código SGS não encontrado no mapeamento: ${codigoSGS}`);
      return null;
    }

    console.log('Arquivo a ser lido:', numeroArquivo);

    const csv = await carregarCSV(numeroArquivo);
    const linhas = csv.split('\n');
    console.log('Total de linhas no CSV:', linhas.length);

    // Primeira linha: cabeçalhos
    const cabecalho = linhas[0];
    const colunas = cabecalho.split(';');
    console.log('Total de colunas:', colunas.length);
    
    // Encontrar a coluna do código SGS
    let indiceColunaAlvo = -1;
    for (let i = 1; i < colunas.length; i++) {
      const match = colunas[i].match(/^(\d+)\s-/);
      if (match && match[1] === codigoSGS) {
        indiceColunaAlvo = i;
        console.log(`Código ${codigoSGS} encontrado na coluna ${i}`);
        break;
      }
    }

    if (indiceColunaAlvo === -1) {
      console.error(`Coluna não encontrada para código ${codigoSGS}`);
      console.log('Primeiras 3 colunas do cabeçalho:');
      for (let i = 0; i < Math.min(3, colunas.length); i++) {
        console.log(`  Coluna ${i}:`, colunas[i].substring(0, 50));
      }
      return null;
    }

    // Procurar a linha do mês/ano
    const dataProc = `${String(mes).padStart(2, '0')}/${ano}`;
    console.log('Procurando por data:', dataProc);
    
    let encontrouAlgumaData = false;
    for (let i = 1; i < linhas.length - 1; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      const valores = linha.split(';');
      const dataStr = valores[0];

      // Log das primeiras 5 datas para debug
      if (i <= 5) {
        console.log(`Linha ${i} - Data no CSV:`, dataStr);
      }

      if (dataStr === dataProc) {
        encontrouAlgumaData = true;
        console.log('✓ Data encontrada na linha:', i);
        
        const valorStr = valores[indiceColunaAlvo]?.trim();
        console.log('Valor bruto encontrado:', valorStr);
        
        if (!valorStr || valorStr === '-') {
          console.log('Valor é vazio ou "-", retornando null');
          return null;
        }

        // Converter valor brasileiro (vírgula) para número
        const taxaMensal = parseFloat(valorStr.replace(',', '.').replace(/\s/g, ''));
        if (isNaN(taxaMensal)) {
          console.log('Valor não é um número válido:', valorStr);
          return null;
        }

        // Calcular taxa anual: ((1 + taxa_mensal/100)^12 - 1) * 100
        const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

        console.log('✓ Taxa encontrada!');
        console.log('  Taxa Mensal:', taxaMensal);
        console.log('  Taxa Anual:', taxaAnual);
        console.log('=== FIM CONSULTA BACEN CSV ===');

        return {
          taxa_mensal: taxaMensal,
          taxa_anual: taxaAnual,
          periodo: { mes, ano }
        };
      }
    }

    if (!encontrouAlgumaData) {
      console.error('Data não encontrada no CSV');
      console.log('Últimas 3 datas do arquivo:');
      for (let i = Math.max(1, linhas.length - 4); i < linhas.length - 1; i++) {
        const linha = linhas[i].trim();
        if (linha) {
          const valores = linha.split(';');
          console.log(`  ${valores[0]}`);
        }
      }
    }

    console.log('=== FIM CONSULTA BACEN CSV (não encontrado) ===');
    return null;
  } catch (error) {
    console.error('ERRO ao consultar taxa BACEN do CSV:', error);
    return null;
  }
}

export function getModalidadeInfo(codigoSGS: string): ModalidadeCSV | null {
  return modalidadesMap[codigoSGS] || null;
}

export function getAllModalidades(): ModalidadeCSV[] {
  return Object.values(modalidadesMap);
}
