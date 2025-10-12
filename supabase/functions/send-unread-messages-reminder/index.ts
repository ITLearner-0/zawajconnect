import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UnreadMessagesRequest {
  user_id: string;
  unread_count: number;
  sender_name: string;
  match_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, unread_count, sender_name, match_id }: UnreadMessagesRequest = await req.json();

    // Get user email and profile
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(user_id);
    if (userError || !userData.user) {
      throw new Error("User not found");
    }

    const userEmail = userData.user.email;
    if (!userEmail) {
      throw new Error("User email not found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", user_id)
      .maybeSingle();

    const userName = profile?.full_name || "Cher(e) membre";

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
              color: white;
              padding: 30px;
              border-radius: 10px 10px 0 0;
              text-align: center;
            }
            .content {
              background: #ffffff;
              padding: 30px;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .message-badge {
              background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              font-size: 28px;
              font-weight: bold;
              box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
            }
            .info-box {
              background: #f0f9ff;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #3b82f6;
              margin: 20px 0;
            }
            .islamic-reminder {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #f59e0b;
              text-align: center;
            }
            .footer {
              background: #f9fafb;
              padding: 20px;
              border-radius: 0 0 10px 10px;
              text-align: center;
              font-size: 14px;
              color: #6b7280;
              border: 1px solid #e5e7eb;
              border-top: none;
            }
            .button {
              display: inline-block;
              padding: 15px 40px;
              background: #3b82f6;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
              font-size: 18px;
            }
            .divider {
              height: 1px;
              background: #e5e7eb;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 32px;">💬 Messages non lus</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Vous avez de nouveaux messages</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Assalamu alaykum ${userName},</p>
            
            <div class="message-badge">
              ${unread_count} message${unread_count > 1 ? 's' : ''} non lu${unread_count > 1 ? 's' : ''}
            </div>
            
            <div class="info-box">
              <p style="margin: 0 0 10px 0; font-size: 16px;">
                <strong>De :</strong> ${sender_name}
              </p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">
                ${unread_count > 1 
                  ? `Vous avez ${unread_count} messages en attente de lecture.` 
                  : 'Un message attend votre réponse.'}
              </p>
            </div>
            
            <p style="font-size: 16px;">
              Une conversation active nécessite une attention régulière pour maintenir la connexion et progresser 
              vers une éventuelle rencontre conforme aux principes islamiques.
            </p>
            
            <div class="islamic-reminder">
              <p style="margin: 0; font-size: 16px; color: #92400e; font-style: italic;">
                "Les meilleurs d'entre vous sont ceux qui ont le meilleur comportement" - Prophète Muhammad (ﷺ)
              </p>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">
                Répondre avec respect et bienveillance fait partie des belles qualités islamiques
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/chat/${match_id}" class="button">
                📬 Lire les messages
              </a>
            </div>
            
            <div class="divider"></div>
            
            <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px;">
              <h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Conseils importants :</h4>
              <ul style="margin: 5px 0; padding-left: 20px; color: #991b1b; font-size: 14px;">
                <li>Maintenez une communication respectueuse et pudique</li>
                <li>Évitez les sujets inappropriés ou trop personnels</li>
                <li>Impliquez vos Walis dans les décisions importantes</li>
                <li>Ne partagez pas d'informations personnelles sensibles</li>
              </ul>
            </div>
            
            <p style="margin-top: 20px; font-size: 14px; color: #6b7280;">
              <strong>Note :</strong> Si vous n'êtes plus intéressé(e) par cette conversation, 
              vous pouvez la clôturer de manière respectueuse depuis votre espace de messagerie.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              Qu'Allah vous guide vers ce qui est meilleur 🤲
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Rappel automatique • Vous pouvez désactiver ces notifications dans vos paramètres
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: userEmail,
      subject: `💬 ${unread_count} message${unread_count > 1 ? 's' : ''} non lu${unread_count > 1 ? 's' : ''} de ${sender_name}`,
      html: emailHtml,
    });

    console.log("Unread messages reminder sent successfully to:", userEmail);

    return new Response(
      JSON.stringify({
        success: true,
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
    console.error("Error sending unread messages reminder:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
