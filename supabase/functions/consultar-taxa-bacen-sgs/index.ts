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

    const { data: modalidade, error: modalidadeError } = await supabaseClient
      .from('modalidades_bacen_juros')
      .select('*')
      .eq('id', modalidadeId)
      .single();

    if (modalidadeError) {
      throw new Error(`Modalidade não encontrada: ${modalidadeError.message}`);
    }

    console.log('📋', modalidade.nome, '| SGS:', modalidade.codigo_sgs);

    const dataRef = dataConsulta ? new Date(dataConsulta) : new Date();
    const mes = dataRef.getMonth() + 1;
    const ano = dataRef.getFullYear();
    const dataFormatada = `${String(mes).padStart(2, '0')}/${ano}`;

    console.log('📅 Período:', dataFormatada);

    // Buscar nos 4 arquivos CSV
    let taxaEncontrada: { taxa_mensal: number; taxa_anual: number; arquivo: number } | null = null;

    for (let arquivo = 1; arquivo <= 4; arquivo++) {
      const taxa = await buscarTaxaNoCSV(modalidade.codigo_sgs, dataFormatada, arquivo);
      if (taxa) {
        taxaEncontrada = { ...taxa, arquivo };
        break;
      }
    }

    if (!taxaEncontrada) {
      throw new Error(`Taxa não encontrada para ${modalidade.nome} no período ${dataFormatada}. Verifique se o período e código SGS ${modalidade.codigo_sgs} estão corretos nos arquivos CSV.`);
    }

    console.log(`✅ Taxa encontrada no arquivo ${taxaEncontrada.arquivo}:`, taxaEncontrada.taxa_mensal, '%');

    const resultado = {
      modalidade: {
        id: modalidade.id,
        nome: modalidade.nome,
        codigo_sgs: modalidade.codigo_sgs,
        tipo_pessoa: modalidade.tipo_pessoa,
        categoria: modalidade.categoria,
      },
      taxa_mensal: taxaEncontrada.taxa_mensal,
      taxa_anual: taxaEncontrada.taxa_anual,
      periodo: {
        mes,
        ano,
        data_referencia: `${ano}-${String(mes).padStart(2, '0')}-01`,
      },
      origem: 'sgs_bacen',
      arquivo_csv: taxaEncontrada.arquivo,
      data_consulta: new Date().toISOString(),
    };

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function buscarTaxaNoCSV(
  codigoSGS: string,
  dataFormatada: string,
  numeroArquivo: number
): Promise<{ taxa_mensal: number; taxa_anual: number } | null> {
  try {
    const csvUrl = `https://f236da44-380e-48a7-993c-b7f24806630f.lovableproject.com/data/bacen-series-${numeroArquivo}.csv`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) return null;

    const csvText = await response.text();
    const linhas = csvText.split('\n');
    
    if (linhas.length < 2) return null;

    // Cabeçalho
    const cabecalho = linhas[0];
    const colunas = cabecalho.split(';');
    
    // Encontrar coluna do código SGS
    let indiceColuna = -1;
    for (let i = 1; i < colunas.length; i++) {
      if (colunas[i].includes(codigoSGS)) {
        indiceColuna = i;
        break;
      }
    }

    if (indiceColuna === -1) return null;

    // Procurar data
    for (let i = 1; i < linhas.length; i++) {
      const linha = linhas[i].trim();
      if (!linha) continue;

      const valores = linha.split(';');
      if (valores[0] === dataFormatada) {
        const valorStr = valores[indiceColuna]?.trim();
        
        if (!valorStr || valorStr === '-' || valorStr === '') return null;

        const taxaMensal = parseFloat(valorStr.replace(',', '.').replace(/\s/g, ''));
        if (isNaN(taxaMensal)) return null;

        const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

        return { taxa_mensal: taxaMensal, taxa_anual: taxaAnual };
      }
    }

    return null;
  } catch (error: any) {
    console.error(`Erro no arquivo ${numeroArquivo}:`, error.message);
    return null;
  }
}
