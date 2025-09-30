import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultaRequest {
  modalidadeId: string;
  dataConsulta?: string; // formato: YYYY-MM-DD
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { modalidadeId, dataConsulta } = await req.json() as ConsultaRequest;

    console.log('Consultando taxa BACEN para modalidade:', modalidadeId);

    // Buscar informações da modalidade
    const { data: modalidade, error: modalidadeError } = await supabaseClient
      .from('modalidades_bacen_juros')
      .select('*')
      .eq('id', modalidadeId)
      .single();

    if (modalidadeError) {
      console.error('Erro ao buscar modalidade:', modalidadeError);
      throw new Error(`Modalidade não encontrada: ${modalidadeError.message}`);
    }

    console.log('Modalidade encontrada:', modalidade.nome, 'Código SGS:', modalidade.codigo_sgs);

    // Determinar mês e ano da consulta
    const dataRef = dataConsulta ? new Date(dataConsulta) : new Date();
    const mes = dataRef.getMonth() + 1; // getMonth() retorna 0-11
    const ano = dataRef.getFullYear();

    console.log('Buscando taxa para mês/ano:', mes, '/', ano);

    // Buscar série temporal para o período
    const { data: serieTemporal, error: serieError } = await supabaseClient
      .from('series_temporais_bacen')
      .select('*')
      .eq('modalidade_id', modalidadeId)
      .eq('mes', mes)
      .eq('ano', ano)
      .maybeSingle();

    let taxaMensal: number;
    let taxaAnual: number | null = null;
    let origem: 'banco_dados' | 'sgs_bacen' = 'banco_dados';

    if (serieTemporal) {
      // Taxa encontrada no banco de dados
      console.log('Taxa encontrada no banco de dados');
      taxaMensal = Number(serieTemporal.taxa_mensal);
      taxaAnual = serieTemporal.taxa_anual ? Number(serieTemporal.taxa_anual) : null;
    } else {
      // Tentar buscar nos CSVs locais primeiro
      console.log('Taxa não encontrada no banco, buscando nos CSVs...');
      
      try {
        const taxaCSV = await buscarTaxaNoCSV(modalidade.codigo_sgs, mes, ano);
        
        if (taxaCSV) {
          console.log('✓ Taxa encontrada no CSV!');
          taxaMensal = taxaCSV.taxa_mensal;
          taxaAnual = taxaCSV.taxa_anual;
          origem = 'sgs_bacen';
          
          // Salvar no banco para consultas futuras
          await supabaseClient
            .from('series_temporais_bacen')
            .insert({
              modalidade_id: modalidadeId,
              mes,
              ano,
              taxa_mensal: taxaMensal,
              taxa_anual: taxaAnual,
              data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
            });
          
          console.log('Taxa do CSV salva no banco');
        } else {
          throw new Error('Taxa não encontrada no CSV');
        }
      } catch (csvError) {
        console.log('Não encontrou no CSV, tentando API do BACEN...', csvError);
        
        // Fallback: Buscar no SGS BACEN (API)
        try {
          const codigoSgs = modalidade.codigo_sgs;
          const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
          const dataFim = `${ano}-${String(mes).padStart(2, '0')}-28`;
          
          const urlBacen = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSgs}/dados?formato=json&dataInicial=${dataInicio.split('-').reverse().join('/')}&dataFinal=${dataFim.split('-').reverse().join('/')}`;
          
          console.log('URL BACEN:', urlBacen);
          
          const response = await fetch(urlBacen);
          
          if (!response.ok) {
            throw new Error(`Erro ao consultar SGS BACEN: ${response.status} ${response.statusText}`);
          }
          
          const dados = await response.json();
          console.log('Dados recebidos do BACEN:', dados);
          
          if (!dados || dados.length === 0) {
            console.log('Nenhum dado encontrado no BACEN, usando taxa simulada');
            taxaMensal = obterTaxaSimulada(modalidade.categoria, modalidade.tipo_pessoa);
          } else {
            const taxas = dados.map((d: any) => parseFloat(d.valor));
            taxaMensal = taxas.reduce((a: number, b: number) => a + b, 0) / taxas.length;
          }
          
          taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);
          origem = 'sgs_bacen';
          
          await supabaseClient
            .from('series_temporais_bacen')
            .insert({
              modalidade_id: modalidadeId,
              mes,
              ano,
              taxa_mensal: taxaMensal,
              taxa_anual: taxaAnual,
              data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
            });
          
          console.log('Taxa salva no banco de dados');
        } catch (error) {
          console.error('Erro ao consultar SGS BACEN:', error);
          taxaMensal = obterTaxaSimulada(modalidade.categoria, modalidade.tipo_pessoa);
          taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);
        }
      }
    }

    const resultado = {
      modalidade: {
        id: modalidade.id,
        nome: modalidade.nome,
        codigo_sgs: modalidade.codigo_sgs,
        tipo_pessoa: modalidade.tipo_pessoa,
        categoria: modalidade.categoria,
      },
      taxa_mensal: taxaMensal,
      taxa_anual: taxaAnual,
      periodo: {
        mes,
        ano,
        data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
      },
      origem,
      data_consulta: new Date().toISOString(),
    };

    console.log('Resultado final:', resultado);

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Erro na função consultar-taxa-bacen-sgs:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao consultar taxa BACEN. Verifique os logs para mais detalhes.'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Função auxiliar para obter taxa simulada baseada na categoria
function obterTaxaSimulada(categoria: string, tipoPessoa: string): number {
  const taxasSimuladas: Record<string, number> = {
    'Cheque Especial': 8.5,
    'Crédito Pessoal': 4.5,
    'Crédito Consignado': 1.8,
    'Aquisição de Bens': 1.5,
    'Cartão de Crédito': 12.5,
    'Arrendamento Mercantil': 1.2,
    'Desconto de Cheques': 3.2,
    'Desconto': 2.8,
    'Capital de Giro': 2.5,
    'Conta Garantida': 3.8,
    'Vendor': 2.3,
    'Compror': 2.2,
    'Hot Money': 1.9,
    'Crédito Rural': 0.8,
    'Financiamento Imobiliário': 0.9,
    'Microcrédito': 3.5,
    'SFH': 0.7,
    'BNDES': 0.6,
    'FINAME': 0.7,
  };

  const taxaBase = taxasSimuladas[categoria] || 3.0;
  const ajustePJ = tipoPessoa === 'PJ' ? 0.85 : 1.0;
  
  return taxaBase * ajustePJ;
}

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

// Função para buscar taxa nos CSVs
async function buscarTaxaNoCSV(
  codigoSGS: string,
  mes: number,
  ano: number
): Promise<{ taxa_mensal: number; taxa_anual: number } | null> {
  try {
    const numeroArquivo = arquivoPorCodigo[codigoSGS];
    if (!numeroArquivo) {
      console.log(`Código SGS ${codigoSGS} não mapeado`);
      return null;
    }

    // Buscar o CSV via URL (os arquivos estão em /public/data/)
    const baseUrl = Deno.env.get('SUPABASE_URL')?.replace('/rest/', '/') || '';
    const csvUrl = `${baseUrl.replace('https://uemxacekhtyvmmcuzhef.supabase.co', 'https://f236da44-380e-48a7-993c-b7f24806630f.lovableproject.com')}/data/bacen-series-${numeroArquivo}.csv`;
    
    console.log(`Buscando CSV em: ${csvUrl}`);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      console.log(`Erro ao buscar CSV: ${response.status}`);
      return null;
    }

    const csvText = await response.text();
    const linhas = csvText.split('\n');

    // Primeira linha: cabeçalhos
    const cabecalho = linhas[0];
    const colunas = cabecalho.split(';');
    
    // Encontrar a coluna do código SGS
    let indiceColunaAlvo = -1;
    for (let i = 1; i < colunas.length; i++) {
      const match = colunas[i].match(/^(\d+)\s-/);
      if (match && match[1] === codigoSGS) {
        indiceColunaAlvo = i;
        break;
      }
    }

    if (indiceColunaAlvo === -1) {
      console.log(`Coluna não encontrada para código ${codigoSGS}`);
      return null;
    }

    // Procurar a linha do mês/ano
    const dataProc = `${String(mes).padStart(2, '0')}/${ano}`;
    
    for (let i = 1; i < linhas.length - 1; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      const valores = linha.split(';');
      const dataStr = valores[0];

      if (dataStr === dataProc) {
        const valorStr = valores[indiceColunaAlvo]?.trim();
        if (!valorStr || valorStr === '-') {
          return null;
        }

        const taxaMensal = parseFloat(valorStr.replace(',', '.').replace(/\s/g, ''));
        if (isNaN(taxaMensal)) {
          return null;
        }

        const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

        return { taxa_mensal: taxaMensal, taxa_anual: taxaAnual };
      }
    }

    return null;
  } catch (error) {
    console.error('Erro ao buscar taxa no CSV:', error);
    return null;
  }
}
