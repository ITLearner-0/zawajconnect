import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { sendEmail } from "../_shared/smtp.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log("🔑 Password reset email function called");
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: PasswordResetRequest = await req.json();
    
    console.log("📧 Processing password reset for:", email);

    // Créer un client Supabase avec les permissions admin
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase configuration");
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // Générer un lien de réinitialisation sans envoyer d'email
    const { data, error: generateError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (generateError) {
      console.error("❌ Error generating reset link:", generateError);
      throw new Error(`Failed to generate reset link: ${generateError.message}`);
    }

    if (!data?.properties?.action_link) {
      throw new Error("No reset link generated");
    }

    const resetLink = data.properties.action_link;
    console.log("✅ Reset link generated, sending email via SMTP...");

    // Créer le contenu HTML de l'email
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: #ffffff;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #059669;
              margin-bottom: 10px;
            }
            .button {
              display: inline-block;
              background: #059669;
              color: #ffffff !important;
              padding: 14px 30px;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: 600;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              color: #666;
              font-size: 14px;
            }
            .note {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 6px;
              margin: 20px 0;
              font-size: 14px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">💚 Zawaj Connect</div>
              <h2>Réinitialisation de votre mot de passe</h2>
            </div>
            
            <p>Salam alaykoum,</p>
            
            <p>Vous avez demandé à réinitialiser votre mot de passe sur Zawaj Connect. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <div style="text-align: center;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </div>
            
            <div class="note">
              <strong>⏰ Ce lien est valide pendant 1 heure.</strong><br>
              Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
            </div>
            
            <p>Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; color: #059669; font-size: 12px;">${resetLink}</p>
            
            <div class="footer">
              <p>Zawaj Connect - Votre plateforme de rencontres islamiques</p>
              <p>Cet email a été envoyé à ${email}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Envoyer l'email via SMTP
    await sendEmail({
      to: email,
      subject: "Réinitialisation de votre mot de passe - Zawaj Connect",
      html: emailHtml,
    });

    console.log("✅ Password reset email sent successfully to:", email);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Email de réinitialisation envoyé avec succès"
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
    console.error("❌ Error in send-password-reset-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message || "Une erreur est survenue lors de l'envoi de l'email"
      }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json", 
          ...corsHeaders 
        },
      }
    );
  }
};

serve(handler);
