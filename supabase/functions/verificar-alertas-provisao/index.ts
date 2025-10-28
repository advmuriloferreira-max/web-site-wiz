import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HistoricoProvisao {
  id: string;
  analise_id: string;
  percentual_provisao: number;
  marco_provisionamento: string;
  data_snapshot: string;
}

interface AnaliseAtual {
  id: string;
  numero_contrato: string;
  percentual_provisao_bcb352: number;
  valor_provisao_bcb352: number;
  meses_atraso: number;
  escritorio_id: string;
}

function determinarMarcoProvisionamento(percentual: number): string {
  if (percentual >= 100) return '100';
  if (percentual >= 90) return '90';
  if (percentual >= 80) return '80';
  if (percentual >= 70) return '70';
  if (percentual >= 60) return '60';
  if (percentual >= 50) return '50';
  return '';
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔍 Iniciando verificação automática de alertas de provisão...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Buscar todas as análises ativas
    const { data: analises, error: analisesError } = await supabase
      .from('analises_gestao_passivo')
      .select('id, numero_contrato, percentual_provisao_bcb352, valor_provisao_bcb352, meses_atraso, escritorio_id');

    if (analisesError) {
      console.error('❌ Erro ao buscar análises:', analisesError);
      throw analisesError;
    }

    if (!analises || analises.length === 0) {
      console.log('ℹ️ Nenhuma análise encontrada');
      return new Response(
        JSON.stringify({ 
          sucesso: true, 
          mensagem: 'Nenhuma análise encontrada',
          alertasGerados: 0,
          historicoAtualizado: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Encontradas ${analises.length} análises para verificar`);

    let alertasGerados = 0;
    let historicoAtualizado = 0;
    const alertasDetalhes = [];

    // 2. Para cada análise, verificar se houve mudança
    for (const analise of analises as AnaliseAtual[]) {
      // Buscar histórico mais recente
      const { data: historicoAnterior, error: historicoError } = await supabase
        .from('historico_provisao')
        .select('*')
        .eq('analise_id', analise.id)
        .order('data_snapshot', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (historicoError && historicoError.code !== 'PGRST116') {
        console.error(`❌ Erro ao buscar histórico para ${analise.numero_contrato}:`, historicoError);
        continue;
      }

      const marcoAtual = determinarMarcoProvisionamento(analise.percentual_provisao_bcb352);
      const percentualAtual = analise.percentual_provisao_bcb352;

      // Se não há histórico anterior, apenas criar o snapshot atual
      if (!historicoAnterior) {
        console.log(`📝 Criando primeiro snapshot para ${analise.numero_contrato}`);
        
        const { error: insertError } = await supabase
          .from('historico_provisao')
          .insert({
            analise_id: analise.id,
            percentual_provisao: percentualAtual,
            valor_provisao: analise.valor_provisao_bcb352,
            marco_provisionamento: marcoAtual,
            meses_atraso: analise.meses_atraso,
            escritorio_id: analise.escritorio_id
          });

        if (!insertError) {
          historicoAtualizado++;
        }
        continue;
      }

      const marcoAnterior = (historicoAnterior as HistoricoProvisao).marco_provisionamento;
      const percentualAnterior = (historicoAnterior as HistoricoProvisao).percentual_provisao;

      // 3. Verificar se houve mudança significativa
      let deveGerarAlerta = false;
      let tipoAlerta = '';
      let mensagem = '';

      // Caso 1: Mudança de marco
      if (marcoAtual !== marcoAnterior && marcoAtual !== '' && marcoAnterior !== '') {
        deveGerarAlerta = true;
        tipoAlerta = 'mudanca_marco';
        mensagem = `🎯 Contrato ${analise.numero_contrato} mudou de ${marcoAnterior}% para ${marcoAtual}% de provisão. Momento ideal para revisar estratégia de negociação!`;
      }

      // Caso 2: Atingiu 90% (momento premium)
      if (percentualAtual >= 90 && percentualAnterior < 90) {
        deveGerarAlerta = true;
        tipoAlerta = 'momento_premium';
        mensagem = `💎 MOMENTO PREMIUM! Contrato ${analise.numero_contrato} atingiu ${percentualAtual.toFixed(0)}% de provisão. Banco aceitará acordo de 10% do saldo. Negocie agora!`;
      }

      // Caso 3: Atingiu 100% (momento total)
      if (percentualAtual >= 100 && percentualAnterior < 100) {
        deveGerarAlerta = true;
        tipoAlerta = 'momento_total';
        mensagem = `🔥 PROVISÃO TOTAL! Contrato ${analise.numero_contrato} atingiu 100% de provisão. Banco considerou irrecuperável. Proposta de 5-10% será aceita!`;
      }

      // 4. Gerar alerta se necessário
      if (deveGerarAlerta) {
        console.log(`🚨 Gerando alerta para ${analise.numero_contrato}: ${tipoAlerta}`);

        // Verificar se já existe alerta similar não lido nas últimas 24h
        const { data: alertaExistente } = await supabase
          .from('alertas_provisionamento')
          .select('id')
          .eq('analise_id', analise.id)
          .eq('tipo_alerta', tipoAlerta)
          .eq('lido', false)
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
          .maybeSingle();

        if (!alertaExistente) {
          const { error: alertaError } = await supabase
            .from('alertas_provisionamento')
            .insert({
              analise_id: analise.id,
              numero_contrato: analise.numero_contrato,
              tipo_alerta: tipoAlerta,
              marco_anterior: marcoAnterior || null,
              marco_atual: marcoAtual,
              percentual_provisao_anterior: percentualAnterior,
              percentual_provisao_atual: percentualAtual,
              mensagem: mensagem,
              escritorio_id: analise.escritorio_id
            });

          if (!alertaError) {
            alertasGerados++;
            alertasDetalhes.push({
              contrato: analise.numero_contrato,
              tipo: tipoAlerta,
              mensagem
            });
            console.log(`✅ Alerta criado: ${analise.numero_contrato}`);
          }
        }
      }

      // 5. Atualizar histórico com snapshot de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { error: upsertError } = await supabase
        .from('historico_provisao')
        .upsert({
          analise_id: analise.id,
          percentual_provisao: percentualAtual,
          valor_provisao: analise.valor_provisao_bcb352,
          marco_provisionamento: marcoAtual,
          meses_atraso: analise.meses_atraso,
          data_snapshot: hoje,
          escritorio_id: analise.escritorio_id
        }, {
          onConflict: 'analise_id,data_snapshot'
        });

      if (!upsertError) {
        historicoAtualizado++;
      }
    }

    console.log(`✅ Verificação concluída: ${alertasGerados} alertas gerados`);

    return new Response(
      JSON.stringify({
        sucesso: true,
        mensagem: 'Verificação de alertas concluída',
        alertasGerados,
        historicoAtualizado,
        analisesVerificadas: analises.length,
        alertas: alertasDetalhes,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('❌ Erro na verificação de alertas:', error);
    
    return new Response(
      JSON.stringify({
        sucesso: false,
        erro: error.message,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
