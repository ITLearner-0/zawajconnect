import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { sendEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WelcomeEmailRequest {
  userId: string;
  email: string;
  fullName: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId, email, fullName }: WelcomeEmailRequest = await req.json();

    // Validate required fields
    if (!email) {
      throw new Error("Email is required");
    }
    
    if (!fullName) {
      throw new Error("Full name is required");
    }

    console.log("Sending welcome email to:", email);

    await sendEmail({
      to: email,
      subject: "Bienvenue sur Zawaj-Connect ! 🌙",
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenue sur Zawaj-Connect</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">🌙 Zawaj-Connect</h1>
                      <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Votre parcours commence ici</p>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Bienvenue ${fullName} ! 👋</h2>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0;">
                        Nous sommes ravis de vous accueillir sur Zawaj-Connect, la plateforme de rencontres matrimoniales respectueuse des valeurs islamiques.
                      </p>
                      
                      <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 30px 0; border-radius: 4px;">
                        <h3 style="color: #333333; margin: 0 0 15px 0; font-size: 18px;">🎯 Prochaines étapes :</h3>
                        <ul style="color: #666666; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Complétez votre profil avec vos préférences</li>
                          <li>Ajoutez des photos authentiques</li>
                          <li>Invitez votre famille (optionnel)</li>
                          <li>Commencez à explorer les profils</li>
                        </ul>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${Deno.env.get("SUPABASE_URL")}/onboarding" 
                           style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                          Compléter mon profil
                        </a>
                      </div>
                      
                      <div style="background-color: #fff9e6; border: 1px solid #ffd700; padding: 20px; margin: 30px 0; border-radius: 8px;">
                        <p style="color: #856404; margin: 0; line-height: 1.6;">
                          <strong>💡 Conseil :</strong> Les profils complets et vérifiés ont 5x plus de chances de trouver un match compatible.
                        </p>
                      </div>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 20px 0;">
                        Notre équipe est là pour vous accompagner à chaque étape. N'hésitez pas à nous contacter si vous avez des questions.
                      </p>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0;">
                        Qu'Allah facilite votre recherche,<br>
                        <strong>L'équipe Zawaj-Connect</strong>
                      </p>
                    </td>
                  </tr>
                  
                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e9ecef;">
                      <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                        © 2025 Zawaj-Connect. Tous droits réservés.
                      </p>
                      <p style="color: #999999; font-size: 12px; margin: 0;">
                        <a href="${Deno.env.get("SUPABASE_URL")}/privacy-policy" style="color: #667eea; text-decoration: none;">Politique de confidentialité</a> | 
                        <a href="${Deno.env.get("SUPABASE_URL")}/terms-of-service" style="color: #667eea; text-decoration: none;">Conditions d'utilisation</a>
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    console.log("Welcome email sent successfully to:", email);

    return new Response(JSON.stringify({ success: true, email }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-welcome-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
