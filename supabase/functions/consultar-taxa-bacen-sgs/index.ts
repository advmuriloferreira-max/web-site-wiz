import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Parser robusto de CSV
function parseCSV(csvText: string): { headers: string[], rows: string[][] } {
  const lines = csvText.split('\n').filter(line => {
    const trimmed = line.trim();
    return trimmed && !trimmed.startsWith('Fonte');
  });
  
  if (lines.length === 0) return { headers: [], rows: [] };
  
  const headers = lines[0].split(';').map(h => h.trim());
  const rows = lines.slice(1).map(line => 
    line.split(';').map(cell => cell.trim())
  );
  
  return { headers, rows };
}

// Encontrar índice da coluna pelo código SGS
function findColumnIndex(headers: string[], codigoSGS: string): number {
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    // Procura padrão: "25456 - Taxa..." ou "25456 -"
    if (header.startsWith(`${codigoSGS} -`) || header.startsWith(`${codigoSGS}-`)) {
      return i;
    }
  }
  return -1;
}

// Parser de número no formato brasileiro
function parseNumberBR(value: string): number | null {
  if (!value || value === '-' || value === '') return null;
  
  // Remove espaços e converte vírgula para ponto
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  
  return isNaN(parsed) ? null : parsed;
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

    const { modalidadeId, dataConsulta } = await req.json();

    // 1. Buscar modalidade no banco
    const { data: modalidade, error: modalidadeError } = await supabaseClient
      .from('modalidades_bacen_juros')
      .select('*')
      .eq('id', modalidadeId)
      .single();

    if (modalidadeError) throw new Error(`Modalidade não encontrada: ${modalidadeError.message}`);

    // 2. Preparar data de busca
    const dataRef = dataConsulta ? new Date(dataConsulta) : new Date();
    const mes = dataRef.getMonth() + 1;
    const ano = dataRef.getFullYear();
    const dataFormatada = `${String(mes).padStart(2, '0')}/${ano}`;

    console.log(`\n🔍 === INÍCIO DA BUSCA ===`);
    console.log(`📋 Modalidade: ${modalidade.nome}`);
    console.log(`🔢 Código SGS: ${modalidade.codigo_sgs}`);
    console.log(`📅 Período: ${dataFormatada}`);

    // 3. Buscar em todos os 4 arquivos CSV
    let resultado = null;
    
    for (let arquivo = 1; arquivo <= 4; arquivo++) {
      try {
        console.log(`\n📂 Processando arquivo ${arquivo}...`);
        
        const csvUrl = `https://f236da44-380e-48a7-993c-b7f24806630f.lovableproject.com/data/bacen-series-${arquivo}.csv`;
        const response = await fetch(csvUrl);
        
        if (!response.ok) {
          console.log(`❌ Erro ao buscar arquivo ${arquivo}: ${response.status}`);
          continue;
        }

        const csvText = await response.text();
        const { headers, rows } = parseCSV(csvText);
        
        console.log(`📊 ${headers.length} colunas, ${rows.length} linhas de dados`);
        
        // Buscar coluna com o código SGS
        const indiceColuna = findColumnIndex(headers, modalidade.codigo_sgs);
        
        if (indiceColuna === -1) {
          console.log(`⚠️ Código ${modalidade.codigo_sgs} não encontrado nas ${headers.length} colunas`);
          continue;
        }
        
        console.log(`✅ Código ${modalidade.codigo_sgs} encontrado na coluna ${indiceColuna}`);
        console.log(`📝 Cabeçalho: ${headers[indiceColuna].substring(0, 80)}...`);

        // Buscar linha com a data
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const dataDaLinha = row[0];

          if (dataDaLinha === dataFormatada) {
            const valorStr = row[indiceColuna];
            
            console.log(`📅 Data ${dataFormatada} encontrada na linha ${i + 2}`);
            console.log(`💰 Valor bruto: "${valorStr}"`);

            const taxaMensal = parseNumberBR(valorStr);
            
            if (taxaMensal === null) {
              console.log(`⚠️ Valor inválido ou vazio`);
              break;
            }

            // Calcular taxa anual usando juros compostos
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
              origem: 'csv_bacen',
              arquivo_csv: arquivo,
              nome_arquivo: `bacen-series-${arquivo}.csv`,
              data_consulta: new Date().toISOString(),
            };

            console.log(`\n✅ === TAXA ENCONTRADA ===`);
            console.log(`📊 Taxa mensal: ${taxaMensal}% a.m.`);
            console.log(`📊 Taxa anual: ${taxaAnual.toFixed(2)}% a.a.`);
            console.log(`📁 Arquivo: bacen-series-${arquivo}.csv`);
            break;
          }
        }

        if (resultado) break;
        
      } catch (err: any) {
        console.error(`❌ Erro ao processar arquivo ${arquivo}:`, err.message);
      }
    }

    if (!resultado) {
      console.log(`\n❌ === TAXA NÃO ENCONTRADA ===`);
      throw new Error(
        `Taxa não encontrada para ${modalidade.nome} (SGS: ${modalidade.codigo_sgs}) ` +
        `no período ${dataFormatada}. Verifique se o período existe nos arquivos CSV.`
      );
    }

    return new Response(JSON.stringify(resultado), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('\n❌ ERRO GERAL:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
