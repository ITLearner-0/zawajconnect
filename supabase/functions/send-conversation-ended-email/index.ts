import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConversationEndedEmailRequest {
  recipient_user_id: string;
  sender_name: string;
  reason: string;
  courtesy_message?: string;
  islamic_message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      recipient_user_id,
      sender_name,
      reason,
      courtesy_message,
      islamic_message,
    }: ConversationEndedEmailRequest = await req.json();

    // Get recipient email and profile
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(
      recipient_user_id
    );

    if (userError || !userData.user) {
      throw new Error("Recipient user not found");
    }

    const recipientEmail = userData.user.email;
    if (!recipientEmail) {
      throw new Error("Recipient email not found");
    }

    // Get recipient profile for name
    const { data: recipientProfile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", recipient_user_id)
      .maybeSingle();

    const recipientName = recipientProfile?.full_name || "Cher(e) membre";

    // Prepare reason text in French
    const reasonTexts: Record<string, string> = {
      incompatibilite_religieuse: "Incompatibilité religieuse",
      valeurs_familiales: "Différences de valeurs familiales",
      situation_personnelle: "Situation personnelle qui a changé",
      besoin_reflexion: "Besoin de réflexion supplémentaire",
      conseil_famille: "Conseil de la famille",
      autre: "Autre raison",
    };

    const reasonText = reasonTexts[reason] || reason;

    // Compose email HTML
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
              background: linear-gradient(135deg, #059669 0%, #10b981 100%);
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
            .message-box {
              background: #f3f4f6;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #059669;
            }
            .islamic-message {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              font-style: italic;
              text-align: center;
              border: 2px solid #f59e0b;
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
              padding: 12px 30px;
              background: #059669;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
              font-weight: bold;
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
            <h1 style="margin: 0; font-size: 28px;">🤲 Notification Importante</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Fin d'un échange</p>
          </div>
          
          <div class="content">
            <p>Assalamu alaykum ${recipientName},</p>
            
            <p>Nous vous informons que <strong>${sender_name}</strong> a décidé de mettre fin à votre échange en cours.</p>
            
            <div class="message-box">
              <h3 style="margin-top: 0; color: #059669;">📋 Raison de la clôture :</h3>
              <p style="margin: 10px 0;"><strong>${reasonText}</strong></p>
            </div>
            
            ${courtesy_message ? `
              <div class="message-box">
                <h3 style="margin-top: 0; color: #059669;">💌 Message personnel :</h3>
                <p style="margin: 10px 0; white-space: pre-wrap;">${courtesy_message}</p>
              </div>
            ` : ""}
            
            <div class="islamic-message">
              <p style="margin: 0; font-size: 16px; color: #92400e;">
                ${islamic_message}
              </p>
            </div>
            
            <div class="divider"></div>
            
            <h3 style="color: #059669;">✨ Prochaines étapes</h3>
            <ul style="line-height: 1.8;">
              <li>Vous êtes maintenant libre de chercher de nouveaux profils</li>
              <li>Vous pouvez accepter de nouvelles demandes de mise en relation</li>
              <li>Cette personne ne vous sera plus proposée dans les résultats de recherche</li>
            </ul>
            
            <div style="text-align: center;">
              <a href="https://dgfctwtivkqcfhwqgkya.supabase.co" class="button">
                Découvrir de nouveaux profils
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              <strong>Note :</strong> Cette décision a été prise dans le respect des principes islamiques et de la bienveillance mutuelle. Nous vous encourageons à poursuivre votre recherche avec confiance et sérénité.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              Qu'Allah facilite votre chemin vers un mariage béni 🤲
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Cet email a été envoyé automatiquement par notre plateforme de rencontre islamique
            </p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const emailResponse = await resend.emails.send({
      from: "Plateforme Mariage Islamique <onboarding@resend.dev>",
      to: [recipientEmail],
      subject: `Notification : Fin d'échange avec ${sender_name}`,
      html: emailHtml,
    });

    console.log("Conversation ended email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        email_id: emailResponse.id,
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
    console.error("Error sending conversation ended email:", error);
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
