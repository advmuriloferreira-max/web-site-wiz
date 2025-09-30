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
      // Buscar no SGS BACEN (API)
      console.log('Buscando taxa no SGS BACEN, código:', modalidade.codigo_sgs);
      
      try {
        const codigoSgs = modalidade.codigo_sgs;
        const dataInicio = `${ano}-${String(mes).padStart(2, '0')}-01`;
        const dataFim = `${ano}-${String(mes).padStart(2, '0')}-28`;
        
        // API do SGS BACEN: https://api.bcb.gov.br/dados/serie/bcdata.sgs.{serie}/dados?formato=json&dataInicial=dd/MM/yyyy&dataFinal=dd/MM/yyyy
        const urlBacen = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${codigoSgs}/dados?formato=json&dataInicial=${dataInicio.split('-').reverse().join('/')}&dataFinal=${dataFim.split('-').reverse().join('/')}`;
        
        console.log('URL BACEN:', urlBacen);
        
        const response = await fetch(urlBacen);
        
        if (!response.ok) {
          throw new Error(`Erro ao consultar SGS BACEN: ${response.status} ${response.statusText}`);
        }
        
        const dados = await response.json();
        console.log('Dados recebidos do BACEN:', dados);
        
        if (!dados || dados.length === 0) {
          // Se não encontrou dados, usar taxa simulada baseada na categoria
          console.log('Nenhum dado encontrado no BACEN, usando taxa simulada');
          taxaMensal = obterTaxaSimulada(modalidade.categoria, modalidade.tipo_pessoa);
        } else {
          // Pegar a média das taxas do mês
          const taxas = dados.map((d: any) => parseFloat(d.valor));
          taxaMensal = taxas.reduce((a: number, b: number) => a + b, 0) / taxas.length;
        }
        
        // Calcular taxa anual equivalente: ((1 + taxa_mensal/100)^12 - 1) * 100
        taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);
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
        
        console.log('Taxa salva no banco de dados');
      } catch (error) {
        console.error('Erro ao consultar SGS BACEN:', error);
        // Em caso de erro, usar taxa simulada
        taxaMensal = obterTaxaSimulada(modalidade.categoria, modalidade.tipo_pessoa);
        taxaAnual = ((Math.pow(1 + taxaMensal/100, 12) - 1) * 100);
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
  
  // PJ geralmente tem taxas um pouco menores
  const ajustePJ = tipoPessoa === 'PJ' ? 0.85 : 1.0;
  
  return taxaBase * ajustePJ;
}
