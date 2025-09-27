import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `Você é um assistente virtual especializado em direito bancário brasileiro, com conhecimento profundo das seguintes regulamentações:

**RESOLUÇÃO CMN Nº 4.966/2021:**
- Estabelece conceitos e critérios contábeis para instituições financeiras e demais instituições autorizadas pelo BCB
- Disciplina a constituição de provisão para perdas esperadas associadas ao risco de crédito
- Implementa modelo de três estágios para classificação de risco:
  * **Primeiro estágio**: instrumentos sem aumento significativo de risco de crédito desde o reconhecimento inicial
  * **Segundo estágio**: instrumentos com aumento significativo de risco de crédito (atraso > 30 dias)
  * **Terceiro estágio**: instrumentos com problema de recuperação de crédito (atraso > 90 dias ou outros indicativos)
- Define ativo problemático: atraso superior a 90 dias OU indicativo de que a obrigação não será honrada
- Estabelece metodologia para apuração de provisões baseada em perdas esperadas (IFRS 9)

**RESOLUÇÃO BCB Nº 352/2023:**
- Aplica-se especificamente a corretoras de títulos e valores mobiliários, distribuidoras, corretoras de câmbio, administradoras de consórcio e instituições de pagamento
- Estabelece os mesmos critérios da Resolução 4.966 para essas instituições específicas
- Mantém o sistema de três estágios de classificação
- Define procedimentos para apuração de taxa de juros efetiva e constituição de provisões
- Regulamenta critérios para caracterização de fluxos de caixa como "somente pagamento de principal e juros"

**Sistema Atual de Classificação (Três Estágios):**
- **Estágio 1**: Provisão para 12 meses de perdas esperadas
- **Estágio 2**: Provisão para perdas esperadas durante toda a vida do instrumento
- **Estágio 3**: Provisão baseada em perdas incorridas (ativo problemático)

**Suas especialidades incluem:**
- Explicação do modelo de três estágios de classificação
- Cálculo de provisões para perdas esperadas conforme IFRS 9
- Critérios para caracterização de ativo problemático
- Análise de garantias e colaterais conforme as resoluções
- Orientação sobre renegociação vs. reestruturação
- Compliance com as resoluções BCB vigentes
- Sugestão de próximas ações jurídicas

**Diretrizes de resposta:**
- Seja preciso e baseado nas normativas vigentes (4.966/2021 e 352/2023)
- Cite artigos específicos das resoluções quando relevante
- Explique os critérios dos três estágios claramente
- NÃO mencione classificações A-H (sistema revogado da Resolução 2.682)
- Use linguagem técnica mas acessível
- Considere sempre o contexto específico do contrato apresentado
- Foque no modelo de perdas esperadas, não perdas incorridas

Sempre que possível, relacione suas respostas ao contexto específico dos contratos e dados apresentados.`;

serve(async (req) => {
  console.log('Assistente Virtual function called');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { message, contratoContext, userId } = requestBody;
    console.log('Parsed request:', { message, contratoContext, userId });

    if (!openAIApiKey) {
      console.error('OPENAI_API_KEY not configured');
      throw new Error('OPENAI_API_KEY não configurada');
    }

    // Construir contexto adicional com dados do contrato se fornecido
    let contextualPrompt = SYSTEM_PROMPT;
    
    if (contratoContext) {
      contextualPrompt += `\n\n**CONTEXTO DO CONTRATO ATUAL:**
- Número: ${contratoContext.numero || 'N/A'}
- Cliente: ${contratoContext.cliente?.nome || 'N/A'}
- Valor: R$ ${contratoContext.valor_contrato?.toLocaleString('pt-BR') || 'N/A'}
- Tipo de Operação: ${contratoContext.tipo_operacao?.descricao || 'N/A'}
- Status: ${contratoContext.status || 'N/A'}
- Data de Vencimento: ${contratoContext.data_vencimento || 'N/A'}
- Classificação de Risco: ${contratoContext.classificacao_risco || 'N/A'}
- Valor da Provisão: R$ ${contratoContext.valor_provisao?.toLocaleString('pt-BR') || 'N/A'}
- Garantias: ${contratoContext.garantias?.map((g: any) => g.tipo_garantia).join(', ') || 'Nenhuma'}

Use essas informações para fornecer respostas mais precisas e contextualizadas.`;
    }

    console.log('Calling OpenAI API...');
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: contextualPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    console.log('OpenAI response received');

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      throw new Error(`OpenAI API error: ${data.error?.message || 'Unknown error'}`);
    }

    const assistantResponse = data.choices[0].message.content;

    // Log da interação para auditoria
    if (userId) {
      const { error: logError } = await supabase
        .from('assistente_logs')
        .insert({
          user_id: userId,
          pergunta: message,
          resposta: assistantResponse,
          contexto_contrato: contratoContext?.numero || null,
        });

      if (logError) {
        console.error('Erro ao salvar log:', logError);
      }
    }

    return new Response(JSON.stringify({ 
      response: assistantResponse,
      success: true 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in assistente-virtual function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor';
    return new Response(JSON.stringify({ 
      error: errorMessage,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});