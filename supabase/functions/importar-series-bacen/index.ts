import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModalidadeData {
  codigo_sgs: string;
  nome: string;
  tipo_pessoa: 'PF' | 'PJ';
  tipo_recurso: 'Livre' | 'Direcionado';
  categoria: string;
}

// Mapeamento de códigos SGS para categorias e tipos
const modalidadesMap: Record<string, ModalidadeData> = {
  // Arquivo 1 - PJ Principal
  '25436': { codigo_sgs: '25436', nome: 'Total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Total Geral' },
  '25437': { codigo_sgs: '25437', nome: 'Pessoas Jurídicas - Total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Total' },
  '25438': { codigo_sgs: '25438', nome: 'Desconto de duplicatas e recebíveis', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Desconto' },
  '25439': { codigo_sgs: '25439', nome: 'Desconto de cheques', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Desconto' },
  '25440': { codigo_sgs: '25440', nome: 'Antecipação de faturas de cartão de crédito', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Antecipação' },
  '25441': { codigo_sgs: '25441', nome: 'Capital de giro com prazo de até 365 dias', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25442': { codigo_sgs: '25442', nome: 'Capital de giro com prazo superior a 365 dias', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25443': { codigo_sgs: '25443', nome: 'Capital de giro com teto BNDES', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25444': { codigo_sgs: '25444', nome: 'Capital de giro total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Capital de Giro' },
  '25445': { codigo_sgs: '25445', nome: 'Conta garantida', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Conta Garantida' },
  '25446': { codigo_sgs: '25446', nome: 'Cheque especial', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cheque Especial' },
  
  // Arquivo 2 - PJ Continuação
  '25447': { codigo_sgs: '25447', nome: 'Aquisição de veículos', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25448': { codigo_sgs: '25448', nome: 'Aquisição de outros bens', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25449': { codigo_sgs: '25449', nome: 'Aquisição de bens total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25450': { codigo_sgs: '25450', nome: 'Vendor', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Vendor' },
  '25451': { codigo_sgs: '25451', nome: 'Hot money', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Hot Money' },
  '25452': { codigo_sgs: '25452', nome: 'Financiamento imobiliário', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25453': { codigo_sgs: '25453', nome: 'Outros', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Outros' },
  
  // Arquivo 3 - PJ Cartão e Comércio Exterior
  '25454': { codigo_sgs: '25454', nome: 'Compror', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Compror' },
  '25455': { codigo_sgs: '25455', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25456': { codigo_sgs: '25456', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25457': { codigo_sgs: '25457', nome: 'Cartão de crédito total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25458': { codigo_sgs: '25458', nome: 'Adiantamento sobre contratos de câmbio (ACC)', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25459': { codigo_sgs: '25459', nome: 'Financiamento a importações', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25460': { codigo_sgs: '25460', nome: 'Financiamento a exportações', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  '25461': { codigo_sgs: '25461', nome: 'Comércio exterior total', tipo_pessoa: 'PJ', tipo_recurso: 'Livre', categoria: 'Comércio Exterior' },
  
  // Arquivo 4 - PF (Pessoas Físicas)
  '25462': { codigo_sgs: '25462', nome: 'Pessoas Físicas - Total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Total' },
  '25463': { codigo_sgs: '25463', nome: 'Cheque especial', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cheque Especial' },
  '25464': { codigo_sgs: '25464', nome: 'Crédito pessoal não consignado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25465': { codigo_sgs: '25465', nome: 'Crédito pessoal não consignado vinculado à composição de dívidas', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25466': { codigo_sgs: '25466', nome: 'Crédito pessoal consignado para trabalhadores do setor privado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25467': { codigo_sgs: '25467', nome: 'Crédito pessoal consignado para trabalhadores do setor público', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25468': { codigo_sgs: '25468', nome: 'Crédito pessoal consignado para aposentados e pensionistas do INSS', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25469': { codigo_sgs: '25469', nome: 'Crédito pessoal consignado total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Consignado' },
  '25470': { codigo_sgs: '25470', nome: 'Crédito pessoal total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Crédito Pessoal' },
  '25471': { codigo_sgs: '25471', nome: 'Aquisição de veículos', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Veículos' },
  '25472': { codigo_sgs: '25472', nome: 'Aquisição de outros bens', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25473': { codigo_sgs: '25473', nome: 'Aquisição de bens total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Aquisição de Bens' },
  '25474': { codigo_sgs: '25474', nome: 'Cartão de crédito rotativo', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25475': { codigo_sgs: '25475', nome: 'Cartão de crédito parcelado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25476': { codigo_sgs: '25476', nome: 'Cartão de crédito total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Cartão de Crédito' },
  '25477': { codigo_sgs: '25477', nome: 'Financiamento imobiliário com taxas de mercado', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25478': { codigo_sgs: '25478', nome: 'Financiamento imobiliário com taxas reguladas', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25479': { codigo_sgs: '25479', nome: 'Financiamento imobiliário total', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Financiamento Imobiliário' },
  '25480': { codigo_sgs: '25480', nome: 'Outros', tipo_pessoa: 'PF', tipo_recurso: 'Livre', categoria: 'Outros' },
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          persistSession: false,
        },
      }
    );

    console.log('Iniciando importação das séries do BACEN...');

    // 1. Primeiro, inserir ou atualizar as modalidades
    console.log('Processando modalidades...');
    
    for (const [codigo_sgs, modalidade] of Object.entries(modalidadesMap)) {
      const { error } = await supabase
        .from('modalidades_bacen_juros')
        .upsert({
          codigo_sgs: modalidade.codigo_sgs,
          nome: modalidade.nome,
          tipo_pessoa: modalidade.tipo_pessoa,
          tipo_recurso: modalidade.tipo_recurso,
          categoria: modalidade.categoria,
          ativo: true,
        }, {
          onConflict: 'codigo_sgs'
        });

      if (error) {
        console.error(`Erro ao inserir modalidade ${codigo_sgs}:`, error);
      } else {
        console.log(`Modalidade ${codigo_sgs} processada com sucesso`);
      }
    }

    console.log('Importação concluída com sucesso!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Séries do BACEN importadas com sucesso',
        modalidades_processadas: Object.keys(modalidadesMap).length,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Erro na importação:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Erro desconhecido',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
