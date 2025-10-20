import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { sendEmail } from "../_shared/smtp.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchNotificationRequest {
  recipientEmail: string;
  recipientName: string;
  matchName: string;
  matchId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recipientEmail, recipientName, matchName, matchId }: MatchNotificationRequest = await req.json();

    console.log("Sending match notification to:", recipientEmail);

    await sendEmail({
      to: recipientEmail,
      subject: "🎉 Nouveau match mutuel !",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nouveau Match</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 0;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; text-align: center; border-radius: 12px 12px 0 0;">
                      <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
                      <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">Nouveau Match Mutuel !</h1>
                    </td>
                  </tr>
                  
                  <!-- Content -->
                  <tr>
                    <td style="padding: 40px;">
                      <h2 style="color: #333333; margin: 0 0 20px 0; font-size: 24px;">Bonne nouvelle ${recipientName} ! 💚</h2>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                        Vous et <strong style="color: #10b981;">${matchName}</strong> avez mutuellement manifesté votre intérêt !
                      </p>
                      
                      <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-left: 4px solid #10b981; padding: 25px; margin: 30px 0; border-radius: 8px;">
                        <h3 style="color: #065f46; margin: 0 0 15px 0; font-size: 18px;">✨ Que faire maintenant ?</h3>
                        <ul style="color: #047857; line-height: 1.8; margin: 0; padding-left: 20px;">
                          <li>Commencez une conversation respectueuse</li>
                          <li>Partagez vos valeurs et aspirations</li>
                          <li>Impliquez vos familles si approprié</li>
                          <li>Prenez votre temps pour mieux vous connaître</li>
                        </ul>
                      </div>
                      
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${Deno.env.get("SUPABASE_URL")}/chat?match=${matchId}" 
                           style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
                          Commencer la conversation 💬
                        </a>
                      </div>
                      
                      <div style="background-color: #fef3c7; border: 1px solid #fbbf24; padding: 20px; margin: 30px 0; border-radius: 8px;">
                        <p style="color: #92400e; margin: 0; line-height: 1.6; font-size: 14px;">
                          <strong>📌 Rappel important :</strong> Maintenez toujours une communication respectueuse et conforme aux valeurs islamiques. Notre équipe modère les conversations pour assurer un environnement sûr.
                        </p>
                      </div>
                      
                      <p style="color: #666666; line-height: 1.6; margin: 20px 0 0 0; font-size: 14px;">
                        Qu'Allah bénisse cette connexion et facilite votre parcours,<br>
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
                        <a href="${Deno.env.get("SUPABASE_URL")}/settings" style="color: #10b981; text-decoration: none;">Gérer mes notifications</a>
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

    console.log("Match notification sent successfully to:", recipientEmail);

    return new Response(JSON.stringify({ success: true, email: recipientEmail }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Error in send-match-notification function:", error);
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
