import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CadastroData {
  nome: string;
  cnpj?: string;
  email: string;
  telefone?: string;
  endereco?: string;
  plano: 'essencial' | 'premium';
  nomeResponsavel: string;
  emailResponsavel: string;
  senha: string;
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    const data: CadastroData = await req.json();

    // 1. Verificar se email já existe
    const { data: existingUser } = await supabaseClient.auth.admin.listUsers();
    const userExists = existingUser?.users?.some(u => u.email === data.emailResponsavel);
    
    if (userExists) {
      return new Response(
        JSON.stringify({ error: 'Este email já está cadastrado. Tente fazer login.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Criar usuário no Auth
    const redirectUrl = `${req.headers.get('origin') || 'http://localhost:5173'}/`;
    
    const { data: authData, error: authError } = await supabaseClient.auth.admin.createUser({
      email: data.emailResponsavel,
      password: data.senha,
      email_confirm: false, // Não requer confirmação de email
      user_metadata: {
        nome: data.nomeResponsavel,
        escritorio: data.nome
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Erro ao criar usuário');
    }

    // 3. Criar escritório
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 30); // 30 dias trial

    const { data: escritorio, error: escritorioError } = await supabaseClient
      .from('escritorios')
      .insert({
        nome: data.nome,
        cnpj: data.cnpj || null,
        email: data.email,
        telefone: data.telefone || null,
        endereco: data.endereco || null,
        plano: data.plano,
        data_vencimento: dataVencimento.toISOString().split('T')[0]
      })
      .select()
      .single();

    if (escritorioError || !escritorio) {
      // Rollback: deletar usuário
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(escritorioError?.message || 'Erro ao criar escritório');
    }

    // 4. Criar vínculo usuário-escritório
    const { error: vinculoError } = await supabaseClient
      .from('usuarios_escritorio')
      .insert({
        escritorio_id: escritorio.id,
        user_id: authData.user.id,
        nome: data.nomeResponsavel,
        email: data.emailResponsavel,
        cargo: 'Administrador',
        permissoes: { read: true, write: true, admin: true },
        status: 'ativo'
      });

    if (vinculoError) {
      // Rollback: deletar escritório e usuário
      await supabaseClient.from('escritorios').delete().eq('id', escritorio.id);
      await supabaseClient.auth.admin.deleteUser(authData.user.id);
      throw new Error(vinculoError.message || 'Erro ao criar vínculo');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Escritório cadastrado com sucesso!',
        user_id: authData.user.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Erro no cadastro:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Erro ao cadastrar escritório' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
