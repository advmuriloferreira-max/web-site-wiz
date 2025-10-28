import { supabase } from '@/integrations/supabase/client';
import { determinarMarcoProvisionamento } from './calculoGestaoPassivo';

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
  escritorio_id: string;
}

export async function verificarAlertasProvisao() {
  try {
    console.log('🔍 Iniciando verificação de alertas de provisão...');

    // 1. Buscar todas as análises ativas
    const { data: analises, error: analisesError } = await supabase
      .from('analises_gestao_passivo')
      .select('id, numero_contrato, percentual_provisao_bcb352, escritorio_id');

    if (analisesError) {
      console.error('❌ Erro ao buscar análises:', analisesError);
      throw analisesError;
    }

    if (!analises || analises.length === 0) {
      console.log('ℹ️ Nenhuma análise encontrada');
      return { alertasGerados: 0, historicoAtualizado: 0 };
    }

    console.log(`📊 Encontradas ${analises.length} análises para verificar`);

    let alertasGerados = 0;
    let historicoAtualizado = 0;

    // 2. Para cada análise, verificar se houve mudança
    for (const analise of analises as AnaliseAtual[]) {
      // Buscar histórico mais recente (ontem)
      const { data: historicoAnterior, error: historicoError } = await supabase
        .from('historico_provisao')
        .select('*')
        .eq('analise_id', analise.id)
        .order('data_snapshot', { ascending: false })
        .limit(1)
        .single();

      // Se não houver erro ou se for "not found", continuar
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
            valor_provisao: 0, // Será calculado pelo backend
            marco_provisionamento: marcoAtual,
            meses_atraso: 0,
            escritorio_id: analise.escritorio_id
          });

        if (!insertError) {
          historicoAtualizado++;
        } else {
          console.error(`❌ Erro ao criar snapshot para ${analise.numero_contrato}:`, insertError);
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
      if (marcoAtual !== marcoAnterior && marcoAtual !== '') {
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
          .single();

        // Só criar se não existir alerta duplicado
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
            console.log(`✅ Alerta criado com sucesso para ${analise.numero_contrato}`);
          } else {
            console.error(`❌ Erro ao criar alerta para ${analise.numero_contrato}:`, alertaError);
          }
        } else {
          console.log(`ℹ️ Alerta já existe para ${analise.numero_contrato}`);
        }
      }

      // 5. Atualizar histórico com snapshot de hoje
      const hoje = new Date().toISOString().split('T')[0];
      const { error: upsertError } = await supabase
        .from('historico_provisao')
        .upsert({
          analise_id: analise.id,
          percentual_provisao: percentualAtual,
          valor_provisao: 0,
          marco_provisionamento: marcoAtual,
          meses_atraso: 0,
          data_snapshot: hoje,
          escritorio_id: analise.escritorio_id
        }, {
          onConflict: 'analise_id,data_snapshot'
        });

      if (!upsertError) {
        historicoAtualizado++;
      } else {
        console.error(`❌ Erro ao atualizar histórico para ${analise.numero_contrato}:`, upsertError);
      }
    }

    console.log(`✅ Verificação concluída: ${alertasGerados} alertas gerados, ${historicoAtualizado} históricos atualizados`);

    return {
      sucesso: true,
      alertasGerados,
      historicoAtualizado,
      analisesVerificadas: analises.length
    };

  } catch (error) {
    console.error('❌ Erro geral na verificação de alertas:', error);
    throw error;
  }
}

// Função para marcar alerta como lido
export async function marcarAlertaComoLido(alertaId: string) {
  const { error } = await supabase
    .from('alertas_provisionamento')
    .update({
      lido: true,
      lido_em: new Date().toISOString()
    })
    .eq('id', alertaId);

  if (error) {
    console.error('Erro ao marcar alerta como lido:', error);
    throw error;
  }

  return true;
}

// Função para marcar todos os alertas como lidos
export async function marcarTodosAlertasComoLidos() {
  const { error } = await supabase
    .from('alertas_provisionamento')
    .update({
      lido: true,
      lido_em: new Date().toISOString()
    })
    .eq('lido', false);

  if (error) {
    console.error('Erro ao marcar todos alertas como lidos:', error);
    throw error;
  }

  return true;
}
