import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SubscriptionExpiringRequest {
  user_id: string;
  plan_type: string;
  expires_at: string;
  days_remaining: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { user_id, plan_type, expires_at, days_remaining }: SubscriptionExpiringRequest = await req.json();

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

    // Plan labels
    const planLabels: Record<string, string> = {
      premium: "Premium",
      vip: "VIP",
      family: "Famille"
    };
    const planLabel = planLabels[plan_type] || plan_type;

    // Format expiry date
    const expiryDate = new Date(expires_at);
    const formattedDate = expiryDate.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Urgency level
    const isUrgent = days_remaining <= 3;
    const urgencyColor = isUrgent ? '#dc2626' : '#f59e0b';
    const urgencyEmoji = isUrgent ? '🚨' : '⏰';

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
              background: linear-gradient(135deg, ${urgencyColor} 0%, ${isUrgent ? '#b91c1c' : '#d97706'} 100%);
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
            .expiry-badge {
              background: ${isUrgent ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'};
              color: ${urgencyColor};
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
              font-size: 24px;
              font-weight: bold;
              border: 2px solid ${urgencyColor};
            }
            .plan-details {
              background: #f9fafb;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border-left: 4px solid #059669;
            }
            .benefits-lost {
              background: #fef2f2;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              border: 1px solid #fca5a5;
            }
            .benefits-lost ul {
              margin: 10px 0;
              padding-left: 20px;
              color: #991b1b;
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
            <h1 style="margin: 0; font-size: 32px;">${urgencyEmoji} ${isUrgent ? 'Expiration imminente' : 'Renouvellement requis'}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px;">Votre abonnement ${planLabel}</p>
          </div>
          
          <div class="content">
            <p style="font-size: 18px;">Assalamu alaykum ${userName},</p>
            
            <div class="expiry-badge">
              ${days_remaining} jour${days_remaining > 1 ? 's' : ''} restant${days_remaining > 1 ? 's' : ''}
            </div>
            
            <p style="font-size: 16px;">
              ${isUrgent 
                ? `Votre abonnement <strong>${planLabel}</strong> arrive à expiration très bientôt. Agissez maintenant pour ne pas perdre vos avantages !`
                : `Votre abonnement <strong>${planLabel}</strong> se termine bientôt. Pensez à le renouveler pour continuer à profiter de tous les avantages.`
              }
            </p>
            
            <div class="plan-details">
              <h3 style="margin: 0 0 15px 0; color: #059669;">📋 Détails de votre abonnement</h3>
              <p style="margin: 5px 0;"><strong>Plan actuel :</strong> ${planLabel}</p>
              <p style="margin: 5px 0;"><strong>Date d'expiration :</strong> ${formattedDate}</p>
              <p style="margin: 5px 0;"><strong>Jours restants :</strong> ${days_remaining} jour${days_remaining > 1 ? 's' : ''}</p>
            </div>
            
            <div class="benefits-lost">
              <h3 style="margin: 0 0 15px 0; color: #991b1b;">⚠️ Avantages à préserver :</h3>
              <ul style="margin: 0; line-height: 1.8;">
                <li>Messages illimités avec vos matchs</li>
                <li>Accès aux profils vérifiés premium</li>
                <li>Visibilité prioritaire dans les recherches</li>
                <li>Supervision familiale avancée</li>
                <li>Badge vérifié sur votre profil</li>
                <li>Support prioritaire</li>
              </ul>
            </div>
            
            <div class="divider"></div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/settings" class="button">
                🔄 Renouveler mon abonnement
              </a>
            </div>
            
            <div style="background: #f0f9ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4 style="margin: 0 0 10px 0; color: #1e40af;">💡 Le saviez-vous ?</h4>
              <p style="margin: 0; color: #1e40af; font-size: 14px;">
                En renouvelant maintenant, vous conservez tous vos matchs actifs et votre historique de conversations. 
                Ne perdez pas les connexions que vous avez construites !
              </p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280; margin-top: 20px;">
              <strong>Besoin d'aide ?</strong> Notre équipe est disponible pour répondre à vos questions 
              sur les options d'abonnement et les modalités de renouvellement.
            </p>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">
              Qu'Allah facilite votre parcours vers un mariage béni 🤲
            </p>
            <p style="margin: 10px 0 0 0; font-size: 12px;">
              Rappel automatique • ${days_remaining} jour${days_remaining > 1 ? 's' : ''} avant expiration
            </p>
          </div>
        </body>
      </html>
    `;

    const emailResponse = await resend.emails.send({
      from: "Plateforme Mariage Islamique <onboarding@resend.dev>",
      to: [userEmail],
      subject: `${urgencyEmoji} Votre abonnement ${planLabel} expire dans ${days_remaining} jour${days_remaining > 1 ? 's' : ''}`,
      html: emailHtml,
    });

    console.log("Subscription expiring email sent successfully:", emailResponse);

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
    console.error("Error sending subscription expiring email:", error);
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
