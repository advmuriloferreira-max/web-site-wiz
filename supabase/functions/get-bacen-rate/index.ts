import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface BacenRateRequest {
  contratoId: string;
  tipoOperacao?: string;
  dataConsulta?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { contratoId, tipoOperacao, dataConsulta } = await req.json() as BacenRateRequest;

    if (!contratoId) {
      return new Response(
        JSON.stringify({ error: 'contratoId é obrigatório' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Consultando taxa Bacen para contrato ${contratoId}`);

    // Buscar dados do contrato
    const { data: contrato, error: contratoError } = await supabase
      .from('contratos')
      .select('tipo_operacao_bcb, tipo_operacao')
      .eq('id', contratoId)
      .single();

    if (contratoError) {
      console.error('Erro ao buscar contrato:', contratoError);
      return new Response(
        JSON.stringify({ error: 'Contrato não encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determinar tipo de operação para consulta
    const tipoOperacaoConsulta = tipoOperacao || contrato.tipo_operacao_bcb || contrato.tipo_operacao;

    // Simular consulta à API do Bacen
    // Em produção, aqui seria feita a consulta real à API do Bacen
    // Por exemplo: https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/
    
    const taxaBacen = await consultarTaxaBacen(tipoOperacaoConsulta, dataConsulta);

    // Salvar análise no banco
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .insert({
        contrato_id: contratoId,
        taxa_bacen: taxaBacen.taxa,
        taxa_referencia: taxaBacen.referencia,
        data_consulta: new Date().toISOString(),
        metadata: {
          tipo_operacao: tipoOperacaoConsulta,
          fonte: 'Banco Central do Brasil',
        },
      })
      .select()
      .single();

    if (analysisError) {
      console.error('Erro ao salvar análise:', analysisError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar análise' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Atualizar contrato com a taxa
    await supabase
      .from('contratos')
      .update({
        taxa_bacen: taxaBacen.taxa,
        taxa_referencia: taxaBacen.referencia,
      })
      .eq('id', contratoId);

    console.log(`Taxa Bacen consultada com sucesso: ${taxaBacen.taxa}% (${taxaBacen.referencia})`);

    return new Response(
      JSON.stringify({
        success: true,
        taxa: taxaBacen.taxa,
        referencia: taxaBacen.referencia,
        analysis,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro na função get-bacen-rate:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

/**
 * Consulta a taxa de juros do Bacen
 * Em produção, esta função faria uma chamada real à API do Bacen
 */
async function consultarTaxaBacen(tipoOperacao: string, dataConsulta?: string): Promise<{ taxa: number; referencia: string }> {
  // Esta é uma implementação simulada
  // Em produção, você deve integrar com a API oficial do Bacen:
  // https://olinda.bcb.gov.br/olinda/servico/taxaJuros/versao/v2/odata/
  
  console.log(`Consultando taxa para tipo de operação: ${tipoOperacao}`);
  
  // Taxas simuladas baseadas em tipos comuns de operação
  const taxasSimuladas: Record<string, { taxa: number; referencia: string }> = {
    'Empréstimo Pessoal': { taxa: 4.85, referencia: 'Selic' },
    'Financiamento Imobiliário': { taxa: 10.20, referencia: 'TR + Taxa Fixa' },
    'Crédito Consignado': { taxa: 2.14, referencia: 'Selic' },
    'Cartão de Crédito': { taxa: 13.75, referencia: 'Taxa de Mercado' },
    'Cheque Especial': { taxa: 7.90, referencia: 'CDI' },
    'Capital de Giro': { taxa: 3.50, referencia: 'Selic' },
    'default': { taxa: 4.85, referencia: 'Selic' },
  };

  return taxasSimuladas[tipoOperacao] || taxasSimuladas['default'];
}
