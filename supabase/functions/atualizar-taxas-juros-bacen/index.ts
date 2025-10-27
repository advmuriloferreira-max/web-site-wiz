import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento completo das 48 séries oficiais do BACEN
const SERIES_BACEN = [
  // PESSOAS FÍSICAS (20 Séries)
  { codigo: 25463, nome: "Cheque especial", categoria: "Pessoas Físicas", sub_categoria: "Cheque Especial e Dívidas" },
  { codigo: 25464, nome: "Crédito pessoal não consignado", categoria: "Pessoas Físicas", sub_categoria: "Crédito Pessoal" },
  { codigo: 25465, nome: "Crédito pessoal não consignado vinculado à composição de dívidas", categoria: "Pessoas Físicas", sub_categoria: "Crédito Pessoal" },
  { codigo: 25466, nome: "Crédito pessoal consignado para trabalhadores do setor privado", categoria: "Pessoas Físicas", sub_categoria: "Crédito Consignado" },
  { codigo: 25467, nome: "Crédito pessoal consignado para trabalhadores do setor público", categoria: "Pessoas Físicas", sub_categoria: "Crédito Consignado" },
  { codigo: 25468, nome: "Crédito pessoal consignado para aposentados e pensionistas do INSS", categoria: "Pessoas Físicas", sub_categoria: "Crédito Consignado" },
  { codigo: 25469, nome: "Crédito pessoal consignado total", categoria: "Pessoas Físicas", sub_categoria: "Crédito Consignado" },
  { codigo: 25470, nome: "Crédito pessoal total", categoria: "Pessoas Físicas", sub_categoria: "Crédito Pessoal" },
  { codigo: 25471, nome: "Aquisição de veículos", categoria: "Pessoas Físicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25472, nome: "Aquisição de outros bens", categoria: "Pessoas Físicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25473, nome: "Aquisição de bens total", categoria: "Pessoas Físicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25474, nome: "Arrendamento mercantil de veículos", categoria: "Pessoas Físicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25475, nome: "Arrendamento mercantil de outros bens", categoria: "Pessoas Físicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25476, nome: "Arrendamento mercantil total", categoria: "Pessoas Físicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25477, nome: "Cartão de crédito rotativo", categoria: "Pessoas Físicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25478, nome: "Cartão de crédito parcelado", categoria: "Pessoas Físicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25479, nome: "Cartão de crédito total", categoria: "Pessoas Físicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25480, nome: "Desconto de cheques", categoria: "Pessoas Físicas", sub_categoria: "Cheque Especial e Dívidas" },

  // PESSOAS JURÍDICAS (26 Séries)
  { codigo: 25438, nome: "Desconto de duplicatas e recebíveis", categoria: "Pessoas Jurídicas", sub_categoria: "Descontos e Recebíveis" },
  { codigo: 25439, nome: "Desconto de cheques", categoria: "Pessoas Jurídicas", sub_categoria: "Descontos e Recebíveis" },
  { codigo: 25440, nome: "Antecipação de faturas de cartão de crédito", categoria: "Pessoas Jurídicas", sub_categoria: "Descontos e Recebíveis" },
  { codigo: 25441, nome: "Capital de giro com prazo de até 365 dias", categoria: "Pessoas Jurídicas", sub_categoria: "Capital de Giro" },
  { codigo: 25442, nome: "Capital de giro com prazo superior a 365 dias", categoria: "Pessoas Jurídicas", sub_categoria: "Capital de Giro" },
  { codigo: 25443, nome: "Capital de giro rotativo", categoria: "Pessoas Jurídicas", sub_categoria: "Capital de Giro" },
  { codigo: 25444, nome: "Capital de giro total", categoria: "Pessoas Jurídicas", sub_categoria: "Capital de Giro" },
  { codigo: 25445, nome: "Conta garantida", categoria: "Pessoas Jurídicas", sub_categoria: "Contas e Cheques" },
  { codigo: 25446, nome: "Cheque especial", categoria: "Pessoas Jurídicas", sub_categoria: "Contas e Cheques" },
  { codigo: 25447, nome: "Aquisição de veículos", categoria: "Pessoas Jurídicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25448, nome: "Aquisição de outros bens", categoria: "Pessoas Jurídicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25449, nome: "Aquisição de bens total", categoria: "Pessoas Jurídicas", sub_categoria: "Aquisição de Bens" },
  { codigo: 25450, nome: "Arrendamento mercantil de veículos", categoria: "Pessoas Jurídicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25451, nome: "Arrendamento mercantil de outros bens", categoria: "Pessoas Jurídicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25452, nome: "Arrendamento mercantil total", categoria: "Pessoas Jurídicas", sub_categoria: "Arrendamento Mercantil" },
  { codigo: 25453, nome: "Vendor", categoria: "Pessoas Jurídicas", sub_categoria: "Financiamento à Produção" },
  { codigo: 25454, nome: "Compror", categoria: "Pessoas Jurídicas", sub_categoria: "Financiamento à Produção" },
  { codigo: 25455, nome: "Cartão de crédito rotativo", categoria: "Pessoas Jurídicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25456, nome: "Cartão de crédito parcelado", categoria: "Pessoas Jurídicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25457, nome: "Cartão de crédito total", categoria: "Pessoas Jurídicas", sub_categoria: "Cartão de Crédito" },
  { codigo: 25458, nome: "Adiantamento sobre contratos de câmbio (ACC)", categoria: "Pessoas Jurídicas", sub_categoria: "Comércio Exterior" },
  { codigo: 25459, nome: "Financiamento a importações", categoria: "Pessoas Jurídicas", sub_categoria: "Comércio Exterior" },
  { codigo: 25460, nome: "Financiamento a exportações", categoria: "Pessoas Jurídicas", sub_categoria: "Comércio Exterior" },
  { codigo: 25461, nome: "Repasse externo", categoria: "Pessoas Jurídicas", sub_categoria: "Comércio Exterior" },
  
  // SÉRIES TOTAIS (2 Séries)
  { codigo: 25436, nome: "Taxa média mensal de juros - Total", categoria: "Total", sub_categoria: "Geral" },
  { codigo: 27641, nome: "Taxa média mensal de juros não rotativo - Total", categoria: "Total", sub_categoria: "Geral" }
];

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando atualização das 48 séries do BACEN...');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let sucessos = 0;
    let erros = 0;
    let totalRegistros = 0;

    for (const serie of SERIES_BACEN) {
      try {
        console.log(`📊 Processando série ${serie.codigo}: ${serie.nome}...`);

        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie.codigo}/dados?formato=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`❌ Erro ao buscar série ${serie.codigo}: HTTP ${response.status}`);
          erros++;
          continue;
        }

        const dados = await response.json();
        
        if (!dados || dados.length === 0) {
          console.warn(`⚠️ Série ${serie.codigo} sem dados`);
          continue;
        }

        // Processar dados em lotes para evitar timeout
        const BATCH_SIZE = 500;
        const dadosProcessados = dados.map((item: any) => {
          const [dia, mes, ano] = item.data.split('/');
          return {
            codigo_serie: serie.codigo,
            nome_modalidade: serie.nome,
            categoria: serie.categoria,
            sub_categoria: serie.sub_categoria,
            data_referencia: `${ano}-${mes}-${dia}`,
            taxa_mensal: parseFloat(item.valor),
          };
        });

        // Inserir em lotes
        for (let i = 0; i < dadosProcessados.length; i += BATCH_SIZE) {
          const lote = dadosProcessados.slice(i, i + BATCH_SIZE);
          
          const { error } = await supabase
            .from("taxas_juros_bacen")
            .upsert(lote, {
              onConflict: 'codigo_serie,data_referencia',
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`❌ Erro ao inserir lote da série ${serie.codigo}:`, error);
            throw error;
          }

          totalRegistros += lote.length;
        }

        console.log(`✅ Série ${serie.codigo} processada: ${dadosProcessados.length} registros`);
        sucessos++;

      } catch (serieError) {
        console.error(`❌ Erro ao processar série ${serie.codigo}:`, serieError);
        erros++;
      }
    }

    console.log(`
    📊 RESUMO DA ATUALIZAÇÃO:
    ✅ Séries processadas com sucesso: ${sucessos}/${SERIES_BACEN.length}
    ❌ Séries com erro: ${erros}
    📝 Total de registros inseridos/atualizados: ${totalRegistros}
    `);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Atualização concluída com sucesso!",
        stats: {
          total_series: SERIES_BACEN.length,
          sucessos,
          erros,
          total_registros: totalRegistros
        }
      }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error('❌ Erro geral na atualização:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
