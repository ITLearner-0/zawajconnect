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

    // Créer le contenu HTML de l'email avec un design professionnel
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              overflow: hidden;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }
            .header {
              background: linear-gradient(135deg, #059669 0%, #047857 100%);
              padding: 40px 30px;
              text-align: center;
              position: relative;
            }
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><defs><pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="2" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23pattern)"/></svg>');
              opacity: 0.3;
            }
            .logo-container {
              position: relative;
              z-index: 1;
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
              display: inline-block;
              animation: float 3s ease-in-out infinite;
            }
            @keyframes float {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .header-title {
              color: #ffffff;
              font-size: 28px;
              font-weight: 700;
              margin: 15px 0 5px 0;
              position: relative;
              z-index: 1;
            }
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              position: relative;
              z-index: 1;
            }
            .content {
              padding: 40px 30px;
            }
            .greeting {
              font-size: 18px;
              color: #059669;
              font-weight: 600;
              margin-bottom: 20px;
            }
            .message {
              color: #4b5563;
              font-size: 15px;
              line-height: 1.8;
              margin-bottom: 25px;
            }
            .cta-container {
              text-align: center;
              margin: 35px 0;
            }
            .cta-button {
              display: inline-block;
              background: linear-gradient(135deg, #059669 0%, #047857 100%);
              color: #ffffff !important;
              padding: 16px 40px;
              text-decoration: none;
              border-radius: 10px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            .cta-button::before {
              content: '🔐';
              margin-right: 8px;
              font-size: 18px;
            }
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
            }
            .info-box {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border-left: 4px solid #f59e0b;
              padding: 20px;
              border-radius: 10px;
              margin: 25px 0;
            }
            .info-box-title {
              display: flex;
              align-items: center;
              font-weight: 700;
              color: #92400e;
              margin-bottom: 8px;
              font-size: 15px;
            }
            .info-box-title::before {
              content: '⏰';
              margin-right: 8px;
              font-size: 20px;
            }
            .info-box-text {
              color: #78350f;
              font-size: 14px;
              line-height: 1.6;
            }
            .security-box {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              border-left: 4px solid #3b82f6;
              padding: 20px;
              border-radius: 10px;
              margin: 25px 0;
            }
            .security-box-title {
              display: flex;
              align-items: center;
              font-weight: 700;
              color: #1e40af;
              margin-bottom: 8px;
              font-size: 15px;
            }
            .security-box-title::before {
              content: '🛡️';
              margin-right: 8px;
              font-size: 20px;
            }
            .security-box-text {
              color: #1e3a8a;
              font-size: 14px;
              line-height: 1.6;
            }
            .link-container {
              background: #f9fafb;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px dashed #d1d5db;
            }
            .link-label {
              font-size: 13px;
              color: #6b7280;
              margin-bottom: 8px;
              font-weight: 600;
            }
            .reset-link {
              word-break: break-all;
              color: #059669;
              font-size: 12px;
              text-decoration: none;
              display: block;
            }
            .divider {
              height: 1px;
              background: linear-gradient(to right, transparent, #e5e7eb, transparent);
              margin: 30px 0;
            }
            .footer {
              background: #f9fafb;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer-brand {
              font-size: 20px;
              font-weight: 700;
              color: #059669;
              margin-bottom: 10px;
            }
            .footer-tagline {
              color: #6b7280;
              font-size: 14px;
              margin-bottom: 15px;
              font-style: italic;
            }
            .footer-text {
              color: #9ca3af;
              font-size: 13px;
              line-height: 1.6;
            }
            .footer-email {
              color: #6b7280;
              font-weight: 600;
              margin-top: 10px;
            }
            .social-links {
              margin-top: 20px;
            }
            .social-link {
              display: inline-block;
              margin: 0 8px;
              font-size: 24px;
              text-decoration: none;
              opacity: 0.7;
              transition: opacity 0.3s ease;
            }
            .social-link:hover {
              opacity: 1;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 20px 10px;
              }
              .content {
                padding: 30px 20px;
              }
              .header-title {
                font-size: 24px;
              }
              .cta-button {
                padding: 14px 30px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header -->
            <div class="header">
              <div class="logo-container">
                <div class="logo">💚</div>
                <h1 class="header-title">Zawaj Connect</h1>
                <p class="header-subtitle">Votre plateforme de rencontres islamiques de confiance</p>
              </div>
            </div>
            
            <!-- Content -->
            <div class="content">
              <div class="greeting">Salam alaykoum cher membre,</div>
              
              <p class="message">
                Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Zawaj Connect. 
                Pas d'inquiétude, c'est un processus simple et sécurisé ! 🔒
              </p>
              
              <p class="message">
                Pour créer votre nouveau mot de passe, il vous suffit de cliquer sur le bouton ci-dessous :
              </p>
              
              <!-- CTA Button -->
              <div class="cta-container">
                <a href="${resetLink}" class="cta-button">Réinitialiser mon mot de passe</a>
              </div>
              
              <!-- Info Box -->
              <div class="info-box">
                <div class="info-box-title">Validité du lien</div>
                <div class="info-box-text">
                  Ce lien est valide pendant <strong>1 heure</strong> pour des raisons de sécurité. 
                  Après ce délai, vous devrez faire une nouvelle demande.
                </div>
              </div>
              
              <!-- Security Box -->
              <div class="security-box">
                <div class="security-box-title">Vous n'avez pas fait cette demande ?</div>
                <div class="security-box-text">
                  Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. 
                  Votre mot de passe actuel restera inchangé et votre compte est protégé. 🛡️
                </div>
              </div>
              
              <div class="divider"></div>
              
              <!-- Alternative Link -->
              <div class="link-container">
                <div class="link-label">🔗 Le bouton ne fonctionne pas ? Copiez ce lien :</div>
                <a href="${resetLink}" class="reset-link">${resetLink}</a>
              </div>
              
              <p class="message" style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Qu'Allah facilite votre parcours et vous guide vers une union bénie. 🤲
              </p>
            </div>
            
            <!-- Footer -->
            <div class="footer">
              <div class="footer-brand">Zawaj Connect</div>
              <div class="footer-tagline">"Construire des unions halal avec confiance"</div>
              
              <div class="footer-text">
                Cet email a été envoyé à <span class="footer-email">${email}</span><br>
                dans le cadre d'une demande de réinitialisation de mot de passe.
              </div>
              
              <div class="footer-text" style="margin-top: 15px;">
                © 2025 Zawaj Connect. Tous droits réservés.<br>
                Une plateforme de rencontres islamiques respectueuse et sécurisée.
              </div>
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
