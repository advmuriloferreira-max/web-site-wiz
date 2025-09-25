import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

// Use fetch API for Resend
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Criar cliente Supabase com service role
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface InviteRequest {
  email: string;
  nome: string;
  role: "admin" | "advogado" | "assistente";
  created_by: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, nome, role, created_by }: InviteRequest = await req.json();

    console.log("Creating invite for:", { email, nome, role });

    // Gerar token único
    const token = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Expira em 7 dias

    // Inserir convite no banco de dados
    const { data: convite, error: insertError } = await supabase
      .from('convites')
      .insert([{
        email,
        nome,
        role,
        token,
        expires_at: expiresAt.toISOString(),
        created_by
      }])
      .select()
      .single();

    if (insertError) {
      console.error("Error creating invite:", insertError);
      throw new Error("Erro ao criar convite: " + insertError.message);
    }

    console.log("Invite created successfully:", convite);

    // URL do convite
    const inviteUrl = `${req.headers.get('origin') || 'https://uemxacekhtyvmmcuzhef.supabase.co'}/convite?token=${token}`;

    // Traduzir role para português
    const roleLabels = {
      'admin': 'Administrador',
      'advogado': 'Advogado',
      'assistente': 'Assistente'
    };

    // Enviar email usando fetch API
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: "Sistema Jurídico <onboarding@resend.dev>",
        to: [email],
        subject: "Convite para acessar o Sistema Jurídico",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              Convite para o Sistema Jurídico
            </h1>
            
            <p>Olá <strong>${nome}</strong>,</p>
            
            <p>Você foi convidado(a) para acessar o Sistema Jurídico com o perfil de <strong>${roleLabels[role]}</strong>.</p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Dados do convite:</h3>
              <ul style="list-style: none; padding: 0;">
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Nome:</strong> ${nome}</li>
                <li><strong>Perfil:</strong> ${roleLabels[role]}</li>
                <li><strong>Expira em:</strong> ${expiresAt.toLocaleDateString('pt-BR')}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${inviteUrl}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Aceitar Convite
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Ou copie e cole este link no seu navegador:<br>
              <a href="${inviteUrl}" style="color: #2563eb; word-break: break-all;">${inviteUrl}</a>
            </p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="color: #6b7280; font-size: 12px; text-align: center;">
              Este convite expira em 7 dias. Se você não solicitou este convite, pode ignorar este email com segurança.
            </p>
          </div>
        `,
      })
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      throw new Error(`Erro ao enviar email: ${errorData.message || emailResponse.statusText}`);
    }

    const emailData = await emailResponse.json();

    console.log("Email sent successfully:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Convite criado e email enviado com sucesso",
        convite: {
          id: convite.id,
          email: convite.email,
          nome: convite.nome,
          role: convite.role,
          expires_at: convite.expires_at
        }
      }), 
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-invite function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Erro interno do servidor",
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);