import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsultaRequest {
  modalidadeId: string;
  dataConsulta?: string;
}

Deno.serve(async (req) => {
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

    console.log('🔎 Consultando taxa BACEN para modalidade:', modalidadeId);

    // Buscar informações da modalidade
    const { data: modalidade, error: modalidadeError } = await supabaseClient
      .from('modalidades_bacen_juros')
      .select('*')
      .eq('id', modalidadeId)
      .single();

    if (modalidadeError) {
      throw new Error(`Modalidade não encontrada: ${modalidadeError.message}`);
    }

    console.log('📋 Modalidade:', modalidade.nome, '| Código SGS:', modalidade.codigo_sgs);

    // Determinar mês e ano da consulta
    const dataRef = dataConsulta ? new Date(dataConsulta) : new Date();
    const mes = dataRef.getMonth() + 1;
    const ano = dataRef.getFullYear();

    console.log('📅 Buscando taxa para:', mes, '/', ano);

    // BUSCAR APENAS NOS CSVs FORNECIDOS
    const taxaCSV = await buscarTaxaNoCSV(modalidade.codigo_sgs, mes, ano);
    
    if (!taxaCSV) {
      throw new Error(`Taxa não encontrada nos arquivos CSV para o período ${mes}/${ano}. Verifique se o período está disponível nos dados fornecidos.`);
    }

    console.log('✅ Taxa encontrada no CSV!');

    const resultado = {
      modalidade: {
        id: modalidade.id,
        nome: modalidade.nome,
        codigo_sgs: modalidade.codigo_sgs,
        tipo_pessoa: modalidade.tipo_pessoa,
        categoria: modalidade.categoria,
      },
      taxa_mensal: taxaCSV.taxa_mensal,
      taxa_anual: taxaCSV.taxa_anual,
      periodo: {
        mes,
        ano,
        data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
      },
      origem: 'sgs_bacen',
      data_consulta: new Date().toISOString(),
    };

    console.log('📊 Resultado:', JSON.stringify(resultado, null, 2));

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌ Erro:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Erro ao consultar taxa BACEN nos arquivos CSV'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Mapeamento de códigos SGS para arquivos CSV
const arquivoPorCodigo: Record<string, number> = {
  // Arquivo 1
  '25436': 1, '25437': 1, '25438': 1, '25439': 1, '25440': 1, '25441': 1, 
  '25442': 1, '25443': 1, '25444': 1, '25445': 1, '25446': 1,
  // Arquivo 2
  '25447': 2, '25448': 2, '25449': 2, '25450': 2, '25451': 2, '25452': 2, '25453': 2,
  // Arquivo 3
  '25454': 3, '25455': 3, '25456': 3, '25457': 3, '25458': 3, '25459': 3, 
  '25460': 3, '25461': 3,
  // Arquivo 4 - Todos os códigos PJ
  '25462': 4, '25463': 4, '25464': 4, '25465': 4, '25466': 4, '25467': 4, 
  '25468': 4, '25469': 4, '25470': 4, '25471': 4, '25472': 4, '25473': 4,
  '25474': 4, '25475': 4, '25476': 4, '25477': 4, '25478': 4, '25479': 4, 
  '25480': 4, '25481': 4, '25482': 4, '25483': 4, '25484': 4, '25485': 4, 
  '25486': 4, '25487': 4, '25488': 4, '25489': 4, '25490': 4, '25491': 4,
  '25492': 4, '25493': 4, '25494': 4,
};

// Função para buscar taxa APENAS nos CSVs
async function buscarTaxaNoCSV(
  codigoSGS: string,
  mes: number,
  ano: number
): Promise<{ taxa_mensal: number; taxa_anual: number } | null> {
  try {
    const numeroArquivo = arquivoPorCodigo[codigoSGS];
    if (!numeroArquivo) {
      console.log(`⚠️ Código SGS ${codigoSGS} não está mapeado para nenhum arquivo`);
      return null;
    }

    const csvUrl = `https://f236da44-380e-48a7-993c-b7f24806630f.lovableproject.com/data/bacen-series-${numeroArquivo}.csv`;
    
    console.log(`📥 Buscando no arquivo CSV ${numeroArquivo}: ${csvUrl}`);
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      console.log(`❌ Erro HTTP ao buscar CSV: ${response.status}`);
      return null;
    }

    const csvText = await response.text();
    const linhas = csvText.split('\n');

    // Primeira linha contém os cabeçalhos
    const cabecalho = linhas[0];
    const colunas = cabecalho.split(';');
    
    console.log(`📋 CSV carregado com ${linhas.length} linhas`);
    
    // Encontrar a coluna correspondente ao código SGS
    let indiceColunaAlvo = -1;
    for (let i = 1; i < colunas.length; i++) {
      const match = colunas[i].match(/^(\d+)\s-/);
      if (match && match[1] === codigoSGS) {
        indiceColunaAlvo = i;
        console.log(`✓ Código SGS ${codigoSGS} encontrado na coluna ${i}`);
        break;
      }
    }

    if (indiceColunaAlvo === -1) {
      console.log(`❌ Código SGS ${codigoSGS} não encontrado no cabeçalho do CSV`);
      return null;
    }

    // Procurar a linha com a data desejada (formato: MM/YYYY)
    const dataProc = `${String(mes).padStart(2, '0')}/${ano}`;
    
    console.log(`🔍 Procurando data: ${dataProc}`);
    
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      const valores = linha.split(';');
      const dataStr = valores[0];

      if (dataStr === dataProc) {
        const valorStr = valores[indiceColunaAlvo]?.trim();
        console.log(`✓ Data encontrada! Valor bruto: "${valorStr}"`);
        
        if (!valorStr || valorStr === '-' || valorStr === '') {
          console.log('⚠️ Valor vazio ou inválido');
          return null;
        }

        // Converter valor (formato brasileiro: vírgula como decimal)
        const taxaMensal = parseFloat(valorStr.replace(',', '.').replace(/\s/g, ''));
        
        if (isNaN(taxaMensal)) {
          console.log(`⚠️ Valor não é um número válido: ${valorStr}`);
          return null;
        }

        // Calcular taxa anual a partir da mensal
        const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

        console.log(`✅ Taxa mensal: ${taxaMensal}% | Taxa anual: ${taxaAnual.toFixed(4)}%`);

        return { taxa_mensal: taxaMensal, taxa_anual: taxaAnual };
      }
    }

    console.log(`❌ Data ${dataProc} não encontrada no CSV`);
    return null;
  } catch (error: any) {
    console.error('❌ Erro ao processar CSV:', error.message);
    return null;
  }
}
