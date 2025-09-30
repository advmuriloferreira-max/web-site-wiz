import { supabase } from "@/integrations/supabase/client";

export interface TaxaBacenResultado {
  modalidade: {
    id: string;
    nome: string;
    codigo_sgs: string;
    tipo_pessoa: string;
    categoria: string;
  };
  taxa_mensal: number;
  taxa_anual: number;
  periodo: {
    mes: number;
    ano: number;
    data_referencia: string;
  };
  origem: string;
  arquivo_csv: number;
  data_consulta: string;
}

// Parser de CSV robusto
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
    const header = headers[i].trim();
    
    const patterns = [
      `${codigoSGS} -`,
      `${codigoSGS}-`,
      `${codigoSGS} `,
    ];
    
    for (const pattern of patterns) {
      if (header.startsWith(pattern)) {
        return i;
      }
    }
  }
  return -1;
}

// Parser de número no formato brasileiro
function parseNumberBR(value: string): number | null {
  if (!value || value === '-' || value === '') return null;
  const normalized = value.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
}

export async function consultarTaxaBacenCSV(
  modalidadeId: string,
  dataConsulta: string
): Promise<TaxaBacenResultado> {
  console.log('🔍 Iniciando consulta de taxa BACEN...');
  
  // 1. Buscar modalidade no banco
  const { data: modalidade, error: modalidadeError } = await supabase
    .from('modalidades_bacen_juros')
    .select('*')
    .eq('id', modalidadeId)
    .maybeSingle();

  if (modalidadeError || !modalidade) {
    throw new Error(`Modalidade não encontrada: ${modalidadeError?.message}`);
  }

  // 2. Preparar data de busca
  const dataRef = new Date(dataConsulta);
  const mes = dataRef.getMonth() + 1;
  const ano = dataRef.getFullYear();
  const dataFormatada = `${String(mes).padStart(2, '0')}/${ano}`;

  console.log(`📋 Modalidade: ${modalidade.nome}`);
  console.log(`🔢 Código SGS: ${modalidade.codigo_sgs}`);
  console.log(`📅 Período: ${dataFormatada}`);

  // 3. Buscar em todos os 4 arquivos CSV
  for (let arquivo = 1; arquivo <= 4; arquivo++) {
    try {
      console.log(`\n📂 Processando arquivo ${arquivo}...`);
      
      const csvUrl = `/data/bacen-series-${arquivo}.csv`;
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        console.log(`❌ Erro ao buscar arquivo ${arquivo}: ${response.status}`);
        continue;
      }

      const csvText = await response.text();
      
      // Verificar se é realmente CSV
      if (!csvText.startsWith('Data;')) {
        console.log(`⚠️ Arquivo ${arquivo} não é CSV válido`);
        continue;
      }
      
      const { headers, rows } = parseCSV(csvText);
      console.log(`📊 ${headers.length} colunas, ${rows.length} linhas`);
      
      // Buscar coluna com o código SGS
      const indiceColuna = findColumnIndex(headers, modalidade.codigo_sgs);
      
      if (indiceColuna === -1) {
        console.log(`⚠️ Código ${modalidade.codigo_sgs} não encontrado no arquivo ${arquivo}`);
        continue;
      }
      
      console.log(`✅ Código ${modalidade.codigo_sgs} encontrado na coluna ${indiceColuna}`);

      // Buscar linha com a data
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const dataDaLinha = row[0]?.trim() || '';

        if (dataDaLinha === dataFormatada) {
          const valorStr = row[indiceColuna]?.trim() || '';
          console.log(`📅 Data ${dataFormatada} encontrada!`);
          console.log(`💰 Valor: ${valorStr}`);

          const taxaMensal = parseNumberBR(valorStr);
          
          if (taxaMensal === null) {
            console.log(`⚠️ Valor inválido ou vazio`);
            continue;
          }

          const taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);

          const resultado: TaxaBacenResultado = {
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
            origem: 'csv_local',
            arquivo_csv: arquivo,
            data_consulta: new Date().toISOString(),
          };

          console.log(`✅ Taxa encontrada: ${taxaMensal}% a.m.`);
          return resultado;
        }
      }
    } catch (err: any) {
      console.error(`❌ Erro ao processar arquivo ${arquivo}:`, err.message);
    }
  }

  throw new Error(
    `Taxa não encontrada para ${modalidade.nome} (SGS: ${modalidade.codigo_sgs}) ` +
    `no período ${dataFormatada}. Verifique se o período existe nos arquivos CSV.`
  );
}
