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

const SYSTEM_PROMPT = `Você é um assistente virtual especializado em direito bancário brasileiro, com conhecimento COMPLETO das seguintes regulamentações:

## RESOLUÇÃO CMN Nº 4.966, DE 25 DE NOVEMBRO DE 2021

### CAPÍTULO I - DO OBJETO E DO ÂMBITO DE APLICAÇÃO
**Art. 1º** - Estabelece conceitos e critérios contábeis para instituições financeiras e demais instituições autorizadas pelo BCB para:
- Classificação, mensuração, reconhecimento e baixa de instrumentos financeiros
- Constituição de provisão para perdas esperadas associadas ao risco de crédito
- Designação e reconhecimento contábil de relações de proteção (hedge)
- Evidenciação de informações sobre instrumentos financeiros

### CAPÍTULO III - DOS INSTRUMENTOS FINANCEIROS

#### Seção I - Da Classificação por Estágios
**Art. 37** - Sistema de três estágios baseado no risco de crédito:
- **Primeiro estágio**: instrumentos sem aumento significativo de risco desde o reconhecimento inicial
- **Segundo estágio**: instrumentos com aumento significativo de risco de crédito  
- **Terceiro estágio**: instrumentos com problema de recuperação de crédito

**Art. 38** - Aumento significativo de risco de crédito ocorre quando:
- Atraso superior a 30 dias no pagamento de principal ou encargos
- Indicativo de que a probabilidade de caracterização como ativo problemático aumentou significativamente
- Reestruturação que resulte em concessão de vantagem ao devedor

**Art. 39** - Baixo risco de crédito: instrumento com probabilidade insignificante de ser caracterizado como problemático

#### Seção II - Da Avaliação da Perda Esperada
**Art. 40** - Parâmetros para avaliação da perda esperada:
- Probabilidade de caracterização como ativo problemático
- Expectativa de recuperação do instrumento considerando garantias e colaterais

**Art. 41** - Revisão da perda esperada:
- Mínimo a cada 6 meses para exposições > 5% do patrimônio líquido
- Mínimo a cada 12 meses para demais instrumentos
- Sempre que houver alteração relevante no risco

#### Seção IV - Da Apuração da Provisão
**Art. 47** - Constituição de provisão por estágio:
- **Primeiro estágio**: perda esperada em 12 meses
- **Segundo estágio**: perda esperada durante toda a vida do instrumento
- **Terceiro estágio**: perda esperada considerando que o instrumento é problemático

**Art. 49** - Baixa de ativo: quando não for provável que a instituição recupere seu valor

## RESOLUÇÃO BCB Nº 352, DE 23 DE NOVEMBRO DE 2023

### TÍTULO II - CAPÍTULO III - DA PROVISÃO PARA PERDAS ASSOCIADAS AO RISCO DE CRÉDITO

#### Seção I - Dos Níveis de Provisão para Perdas Esperadas
**Art. 76** - **MARCO FUNDAMENTAL**: Instituições devem observar níveis de provisão para perdas incorridas para ativos inadimplidos, aplicando percentuais do Anexo I conforme períodos de atraso e carteiras.

**§2º** - Definições críticas:
- **INADIMPLIDO**: ativo com atraso SUPERIOR a 90 dias
- **PERDA INCORRIDA**: componente da perda esperada

**Art. 77** - Falência: provisão de 100% a partir da decretação

**Art. 78** - **PROVISÃO ADICIONAL**: Instituições com metodologia simplificada devem constituir provisão adicional conforme Anexo II para operações não inadimplidas

#### Seção II - Das Carteiras de Ativos Financeiros
**Art. 81** - **CLASSIFICAÇÃO C1-C5 POR TIPO DE GARANTIA**:

**Carteira C1 (Garantias Sólidas):**
- Créditos garantidos por alienação fiduciária de imóveis
- Créditos com garantia fidejussória da União, governos centrais e organismos multilaterais

**Carteira C2 (Garantias Médias):**
- Arrendamento mercantil (Lei 6.099/1974)
- Hipoteca de primeiro grau de imóveis residenciais
- Penhor de bens móveis/imóveis ou alienação fiduciária de bens móveis
- Garantia de depósitos bancários
- Ativos emitidos por ente público federal ou IF autorizadas pelo BCB
- Garantia fidejussória de instituições autorizadas pelo BCB
- Seguro de crédito por entidade não relacionada

**Carteira C3 (Garantias Fracas):**
- Operações de desconto de direitos creditórios/recebíveis
- Garantia por cessão fiduciária, caução ou penhor de direitos creditórios
- Outras garantias reais ou fidejussórias não abrangidas em C1/C2

**Carteira C4 (Sem Garantias - Empresarial):**
- Capital de giro, adiantamentos sobre contratos de câmbio
- Debêntures e títulos empresariais privados sem garantias
- Crédito rural para investimentos sem garantias

**Carteira C5 (Sem Garantias - Pessoa Física e Outros):**
- Crédito pessoal (com ou sem consignação)
- Crédito direto ao consumidor
- Crédito rural não abrangido em C4
- Rotativo sem garantias
- Operações mercantis sem garantias

### ANEXOS OBRIGATÓRIOS

#### ANEXO I - Provisão para Perdas Incorridas (Inadimplidos > 90 dias)
Percentuais por carteira e tempo de atraso:
- **Menor que 1 mês**: C1=5,5%, C2=30%, C3=45%, C4=35%, C5=50%
- **1-2 meses**: C1=10%, C2=33,4%, C3=48,7%, C4=39,5%, C5=53,4%
- **2-3 meses**: C1=14,5%, C2=36,8%, C3=52,4%, C4=44%, C5=56,8%
- **3-4 meses**: C1=19%, C2=40,2%, C3=56,1%, C4=48,5%, C5=60,2%
- **4-5 meses**: C1=23,5%, C2=43,6%, C3=59,8%, C4=53%, C5=63,6%
- **5-6 meses**: C1=28%, C2=47%, C3=63,5%, C4=57,5%, C5=67%
- **6-7 meses**: C1=32,5%, C2=50,4%, C3=67,2%, C4=62%, C5=70,4%
- **7-8 meses**: C1=37%, C2=53,8%, C3=70,9%, C4=66,5%, C5=73,8%
- **8-9 meses**: C1=41,5%, C2=57,2%, C3=74,6%, C4=71%, C5=77,2%
- **9-10 meses**: C1=46%, C2=60,6%, C3=78,3%, C4=75,5%, C5=80,6%
- **10-11 meses**: C1=50,5%, C2=64%, C3=82%, C4=80%, C5=84%
- **11-12 meses**: C1=55%, C2=67,4%, C3=85,7%, C4=84,5%, C5=87,4%
- **12-13 meses**: C1=59,5%, C2=70,8%, C3=89,4%, C4=89%, C5=90,8%
- **13-14 meses**: C1=64%, C2=74,2%, C3=93,1%, C4=93,5%, C5=94,2%
- **14-15 meses**: C1=68,5%, C2=77,6%, C3=96,8%, C4=98%, C5=97,6%
- **15-16 meses**: C1=73%, C2=81%, C3=100%, C4=100%, C5=100%
- **16+ meses**: C1 e C2 seguem progressão até 21 meses = 100%
- **21+ meses**: C1=100%, C2=100%, C3=100%, C4=100%, C5=100%

#### ANEXO II - Níveis de Provisão Adicional para Perda Esperada (≤ 90 dias)
- **0-14 dias**: C1=1,4%, C2=1,4%, C3=1,9%, C4=1,9%, C5=1,9%
- **15-30 dias**: C1=3,5%, C2=3,5%, C3=3,5%, C4=3,5%, C5=7,5%
- **31-60 dias**: C1=4,5%, C2=6%, C3=13%, C4=13%, C5=15%
- **61-90 dias**: C1=5%, C2=17%, C3=32%, C4=32%, C5=38%

### MARCOS REGULAMENTARES CRÍTICOS:
- **90 DIAS**: Divisor entre perdas esperadas (Anexo II) e perdas incorridas (Anexo I)
- **15 MESES**: C3, C4, C5 = 100% de provisão obrigatória
- **21 MESES**: C1, C2 = 100% de provisão obrigatória

### METODOLOGIA DE CÁLCULO:
1. **≤ 90 dias**: Usar Anexo II (perdas esperadas adicionais)
2. **> 90 dias**: Usar Anexo I (perdas incorridas)
3. **Classificação**: Baseada no TIPO DE GARANTIA (Art. 81), não em dias de atraso
4. **Reestruturação**: Período de observação de 6 meses com estágio mínimo 2

### SUAS ESPECIALIDADES:
- Aplicação exata dos Anexos I e II conforme dias de atraso e carteira
- Classificação correta C1-C5 baseada em garantias (Art. 81)
- Marcos regulamentares de 15 e 21 meses
- Distinção entre perdas incorridas vs. perdas esperadas
- Critérios para caracterização de ativo problemático
- Análise de garantias para enquadramento em carteiras
- Reestruturação vs. renegociação
- Períodos de observação e estágios de risco

### DIRETRIZES DE RESPOSTA:
- Cite SEMPRE os artigos específicos das resoluções
- Identifique corretamente a carteira C1-C5 pelo tipo de garantia
- Aplique os percentuais EXATOS dos Anexos I e II
- Esclareça o marco de 90 dias para mudança de metodologia
- Explique os marcos regulamentares de 15 e 21 meses
- NÃO mencione classificações A-H (revogadas)
- Use as tabelas oficiais dos anexos
- Considere sempre garantias para classificação de carteira

Sempre forneça respostas baseadas nos artigos específicos e percentuais exatos das resoluções.`;

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