import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ModerationNotificationRequest {
  user_id: string;
  action_taken: 'warned' | 'blocked' | 'removed';
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  details?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, action_taken, reason, severity, details }: ModerationNotificationRequest = await req.json();

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

    // Action labels and colors
    const actionLabels: Record<string, { title: string; emoji: string; color: string }> = {
      warned: { title: "Avertissement", emoji: "⚠️", color: "#f59e0b" },
      blocked: { title: "Contenu bloqué", emoji: "🚫", color: "#dc2626" },
      removed: { title: "Contenu supprimé", emoji: "🗑️", color: "#991b1b" }
    };

    const actionInfo = actionLabels[action_taken] || actionLabels.warned;

    // Severity colors
    const severityColors: Record<string, string> = {
      low: "#10b981",
      medium: "#f59e0b",
      high: "#dc2626",
      critical: "#991b1b"
    };
    const severityColor = severityColors[severity] || severityColors.medium;

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
              background: linear-gradient(135deg, ${actionInfo.color} 0%, ${severity === 'critical' ? '#7f1d1d' : actionInfo.color} 100%);
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
            .alert-box {
              background: ${severity === 'critical' || severity === 'high' ? '#fee2e2' : '#fef3c7'};
              color: ${severityColor};
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              border: 2px solid ${severityColor};
            }
            .reason-box {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid ${severityColor};
            }
            .islamic-guidance {
              background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 2px solid #3b82f6;
            }
            .guidelines-box {
              background: #f0fdf4;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #059669;
            }
            .guidelines-box ul {
              margin: 10px 0;
              padding-left: 20px;
              color: #065f46;
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
              background: #059669;
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
            <h1 style="margin: 0; font-size: 32px;">${actionInfo.emoji} ${actionInfo.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Notification de modération</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Assalamu alaykum ${userName},</p>
            
            <div class="alert-box">
              <h3 style="margin: 0; font-size: 24px;">${actionInfo.title}</h3>
              <p style="margin: 10px 0 0 0; font-size: 16px;">
                Sévérité : <strong>${severity === 'critical' ? 'Critique' : 
                                    severity === 'high' ? 'Élevée' : 
                                    severity === 'medium' ? 'Moyenne' : 'Faible'}</strong>
              </p>
            </div>
            
            <p style="font-size: 16px;">
              Notre système de modération automatique a détecté un contenu ne respectant pas nos principes islamiques 
              et nos conditions d'utilisation.
            </p>
            
            <div class="reason-box">
              <h3 style="margin: 0 0 10px 0; color: ${severityColor};">📋 Raison de la modération</h3>
              <p style="margin: 0; font-size: 16px;"><strong>${reason}</strong></p>
              ${details ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${details}</p>` : ''}
            </div>
            
            ${action_taken === 'blocked' || action_taken === 'removed' ? `
              <div style="background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Conséquences :</h4>
                <p style="margin: 0; color: #991b1b; font-size: 14px;">
                  ${action_taken === 'blocked' 
                    ? 'Votre contenu a été bloqué et ne peut pas être envoyé. Veuillez reformuler votre message en respectant nos principes.'
                    : 'Votre contenu a été supprimé de la plateforme. Des violations répétées peuvent entraîner la suspension de votre compte.'}
                </p>
              </div>
            ` : ''}
            
            <div class="islamic-guidance">
              <h3 style="margin: 0 0 15px 0; color: #1e40af;">🕌 Guidance Islamique</h3>
              <p style="margin: 0; color: #1e40af; font-size: 15px; font-style: italic;">
                "Celui qui croit en Allah et au Jour Dernier, qu'il dise du bien ou qu'il se taise" 
                - Prophète Muhammad (ﷺ)
              </p>
              <p style="margin: 10px 0 0 0; color: #1e40af; font-size: 14px;">
                Notre plateforme s'engage à maintenir un environnement respectueux des valeurs islamiques 
                de pudeur (Haya), de respect mutuel et de bienveillance.
              </p>
            </div>
            
            <div class="guidelines-box">
              <h3 style="margin: 0 0 15px 0; color: #065f46;">✅ Rappel des bonnes pratiques :</h3>
              <ul style="margin: 0; line-height: 1.8;">
                <li>Respecter la pudeur islamique dans toutes les conversations</li>
                <li>Éviter tout langage inapproprié ou vulgaire</li>
                <li>Ne pas partager d'informations personnelles sensibles</li>
                <li>Maintenir un ton respectueux et bienveillant</li>
                <li>Impliquer votre Wali dans les décisions importantes</li>
                <li>Signaler tout comportement inapproprié</li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/community-guidelines" class="button">
                📖 Consulter les règles complètes
              </a>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              <strong>Besoin d'aide ?</strong> Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, 
              n'hésitez pas à contacter notre équipe de support.
            </p>
            
            ${severity === 'critical' || action_taken === 'removed' ? `
              <div style="background: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: bold;">
                  ⚠️ Avertissement important : Des violations répétées de nos règles peuvent entraîner 
                  la suspension temporaire ou permanente de votre compte.
                </p>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              Qu'Allah vous guide vers le comportement exemplaire 🤲
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Notification automatique de modération • ${new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: userEmail,
      subject: `${actionInfo.emoji} ${actionInfo.title} - Notification importante`,
      html: emailHtml,
    });

    console.log("Moderation notification email sent successfully to:", userEmail);

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
    console.error("Error sending moderation notification email:", error);
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
