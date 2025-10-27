import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Mapeamento completo das 48 séries oficiais do BACEN
const SERIES_BACEN = [
  // PESSOAS FÍSICAS
  { codigo: "25463", nome: "Cheque especial", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25464", nome: "Crédito pessoal não consignado", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25465", nome: "Crédito pessoal não consignado - composição de dívidas", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25466", nome: "Consignado privado", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Direcionado" },
  { codigo: "25467", nome: "Consignado público", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Direcionado" },
  { codigo: "25468", nome: "Consignado INSS", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Direcionado" },
  { codigo: "25469", nome: "Consignado total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Direcionado" },
  { codigo: "25470", nome: "Crédito pessoal total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25471", nome: "Aquisição de veículos", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25472", nome: "Aquisição de outros bens", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25473", nome: "Aquisição de bens total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25474", nome: "Leasing de veículos", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25475", nome: "Leasing de outros bens", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25476", nome: "Leasing total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25477", nome: "Cartão de crédito rotativo", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25478", nome: "Cartão de crédito parcelado", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25479", nome: "Cartão de crédito total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "25480", nome: "Desconto de cheques PF", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },

  // PESSOAS JURÍDICAS
  { codigo: "25438", nome: "Desconto de duplicatas", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25439", nome: "Desconto de cheques PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25440", nome: "Antecipação de faturas de cartão", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25441", nome: "Capital de giro até 365 dias", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25442", nome: "Capital de giro acima de 365 dias", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25443", nome: "Capital de giro rotativo", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25444", nome: "Capital de giro total", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25445", nome: "Conta garantida", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25446", nome: "Cheque especial PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25447", nome: "Aquisição de veículos PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25448", nome: "Aquisição de outros bens PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25449", nome: "Aquisição de bens total PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25450", nome: "Leasing de veículos PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25451", nome: "Leasing de outros bens PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25452", nome: "Leasing total PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25453", nome: "Vendor", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25454", nome: "Compror", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25455", nome: "Cartão de crédito rotativo PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25456", nome: "Cartão de crédito parcelado PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25457", nome: "Cartão de crédito total PJ", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25458", nome: "ACC - Adiantamento sobre contratos de câmbio", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25459", nome: "Financiamento a importações", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25460", nome: "Financiamento a exportações", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25461", nome: "Repasse externo", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  
  // TOTAIS
  { codigo: "25436", nome: "Taxa média mensal - Total", categoria: "Total", tipo_pessoa: "Todos", tipo_recurso: "Todos" },
  { codigo: "27641", nome: "Taxa média mensal não rotativo - Total", categoria: "Total", tipo_pessoa: "Todos", tipo_recurso: "Todos" },
  
  // TOTAIS POR TIPO DE PESSOA
  { codigo: "25437", nome: "Taxa média mensal - Pessoas Jurídicas Total", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "27642", nome: "Taxa média mensal não rotativo - Pessoas Jurídicas Total", categoria: "Pessoa Jurídica", tipo_pessoa: "PJ", tipo_recurso: "Livre" },
  { codigo: "25462", nome: "Taxa média mensal - Pessoas Físicas Total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" },
  { codigo: "27643", nome: "Taxa média mensal não rotativo - Pessoas Físicas Total", categoria: "Pessoa Física", tipo_pessoa: "PF", tipo_recurso: "Livre" }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🚀 Iniciando atualização das taxas BACEN - Nova Estrutura...');

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let sucessos = 0;
    let erros = 0;
    let totalRegistros = 0;

    // ETAPA 1: Cadastrar/Atualizar Modalidades
    console.log('📋 ETAPA 1: Cadastrando modalidades...');
    
    for (const serie of SERIES_BACEN) {
      try {
        const { data: modalidadeExistente } = await supabase
          .from("modalidades_bacen_juros")
          .select("id")
          .eq("codigo_sgs", serie.codigo)
          .maybeSingle();

        if (!modalidadeExistente) {
          await supabase
            .from("modalidades_bacen_juros")
            .insert({
              nome: serie.nome,
              codigo_sgs: serie.codigo,
              categoria: serie.categoria,
              tipo_pessoa: serie.tipo_pessoa,
              tipo_recurso: serie.tipo_recurso,
              ativo: true
            });
          console.log(`  ✅ Modalidade cadastrada: ${serie.codigo} - ${serie.nome}`);
        }
      } catch (error) {
        console.error(`  ❌ Erro ao cadastrar modalidade ${serie.codigo}:`, error);
      }
    }

    // ETAPA 2: Importar Séries Temporais
    console.log('📊 ETAPA 2: Importando séries temporais...');

    for (const serie of SERIES_BACEN) {
      try {
        console.log(`  Processando série ${serie.codigo}: ${serie.nome}...`);

        // Buscar ID da modalidade
        const { data: modalidade } = await supabase
          .from("modalidades_bacen_juros")
          .select("id")
          .eq("codigo_sgs", serie.codigo)
          .single();

        if (!modalidade) {
          console.warn(`  ⚠️ Modalidade não encontrada: ${serie.codigo}`);
          continue;
        }

        // Buscar dados da API do BACEN
        const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${serie.codigo}/dados?formato=json`;
        const response = await fetch(url);
        
        if (!response.ok) {
          console.error(`  ❌ Erro HTTP ${response.status} ao buscar série ${serie.codigo}`);
          erros++;
          continue;
        }

        const dados = await response.json();
        
        if (!dados || dados.length === 0) {
          console.warn(`  ⚠️ Série ${serie.codigo} sem dados`);
          continue;
        }

        // Processar e inserir em lotes
        const BATCH_SIZE = 500;
        const dadosProcessados = dados.map((item: any) => {
          const [dia, mes, ano] = item.data.split('/');
          return {
            modalidade_id: modalidade.id,
            data_referencia: `${ano}-${mes.padStart(2, '0')}-${dia.padStart(2, '0')}`,
            ano: parseInt(ano),
            mes: parseInt(mes),
            taxa_mensal: parseFloat(item.valor),
            taxa_anual: parseFloat(item.valor) * 12 // Aproximação simples
          };
        });

        // Inserir em lotes
        for (let i = 0; i < dadosProcessados.length; i += BATCH_SIZE) {
          const lote = dadosProcessados.slice(i, i + BATCH_SIZE);
          
          const { error } = await supabase
            .from("series_temporais_bacen")
            .upsert(lote, {
              onConflict: 'modalidade_id,data_referencia',
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`  ❌ Erro ao inserir lote:`, error);
            throw error;
          }

          totalRegistros += lote.length;
        }

        console.log(`  ✅ Série ${serie.codigo} processada: ${dadosProcessados.length} registros`);
        sucessos++;

      } catch (serieError) {
        console.error(`  ❌ Erro ao processar série ${serie.codigo}:`, serieError);
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
        message: "Atualização concluída!",
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
    console.error('❌ Erro geral:', error);
    
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
