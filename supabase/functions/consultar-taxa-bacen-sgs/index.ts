import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { modalidadeId, dataConsulta } = await req.json();

    // Buscar modalidade
    const { data: modalidade, error: modalidadeError } = await supabaseClient
      .from('modalidades_bacen_juros')
      .select('*')
      .eq('id', modalidadeId)
      .single();

    if (modalidadeError) throw new Error(`Modalidade não encontrada`);

    const dataRef = dataConsulta ? new Date(dataConsulta) : new Date();
    const mes = dataRef.getMonth() + 1;
    const ano = dataRef.getFullYear();
    const dataFormatada = `${String(mes).padStart(2, '0')}/${ano}`;

    console.log(`🔍 Buscando: ${modalidade.nome} (SGS: ${modalidade.codigo_sgs}) para ${dataFormatada}`);

    // Buscar em todos os 4 arquivos CSV
    let resultado = null;
    
    for (let arquivo = 1; arquivo <= 4; arquivo++) {
      try {
        const csvUrl = `https://f236da44-380e-48a7-993c-b7f24806630f.lovableproject.com/data/bacen-series-${arquivo}.csv`;
        const response = await fetch(csvUrl);
        
        if (!response.ok) continue;

        const csvText = await response.text();
        const linhas = csvText.split('\n');

        // Processar cabeçalho
        const cabecalho = linhas[0];
        const colunas = cabecalho.split(';');
        
        // Buscar coluna com o código SGS
        let indiceColuna = -1;
        for (let i = 0; i < colunas.length; i++) {
          const coluna = colunas[i];
          // Verificar se a coluna contém o código SGS no início
          if (coluna.trim().startsWith(modalidade.codigo_sgs + ' ')) {
            indiceColuna = i;
            console.log(`✓ Código ${modalidade.codigo_sgs} encontrado no arquivo ${arquivo}, coluna ${i}`);
            break;
          }
        }

        if (indiceColuna === -1) {
          console.log(`Arquivo ${arquivo}: código ${modalidade.codigo_sgs} não encontrado`);
          continue;
        }

        // Buscar linha com a data
        for (let i = 1; i < linhas.length; i++) {
          const linha = linhas[i].trim();
          if (!linha || linha.startsWith('Fonte')) continue;

          const valores = linha.split(';');
          const dataDaLinha = valores[0].trim();

          if (dataDaLinha === dataFormatada) {
            const valorStr = valores[indiceColuna]?.trim();
            
            console.log(`✓ Data encontrada! Valor bruto: "${valorStr}"`);

            if (!valorStr || valorStr === '-' || valorStr === '') {
              console.log('Valor vazio');
              break;
            }

            // Converter (formato BR: vírgula = decimal, espaço = separador de milhar)
            const taxaMensal = parseFloat(valorStr.replace(/\s/g, '').replace(',', '.'));
            
            if (isNaN(taxaMensal)) {
              console.log(`Valor inválido: ${valorStr}`);
              break;
            }

            const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

            resultado = {
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
              origem: 'sgs_bacen',
              arquivo_csv: arquivo,
              data_consulta: new Date().toISOString(),
            };

            console.log(`✅ Taxa encontrada: ${taxaMensal}% ao mês`);
            break;
          }
        }

        if (resultado) break;
        
      } catch (err: any) {
        console.error(`Erro no arquivo ${arquivo}:`, err.message);
      }
    }

    if (!resultado) {
      throw new Error(`Taxa não encontrada para ${modalidade.nome} (SGS: ${modalidade.codigo_sgs}) no período ${dataFormatada}. Verifique se o código SGS e o período estão corretos nos arquivos CSV.`);
    }

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('❌', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
