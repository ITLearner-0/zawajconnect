import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { sendEmail } from "../_shared/smtp.ts";

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

    const emailHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f3f4f6;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
<tr>
<td style="padding: 40px 20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);">
<!-- Header -->
<tr>
<td style="background: linear-gradient(135deg, ${urgencyColor} 0%, ${isUrgent ? '#b91c1c' : '#d97706'} 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
<h1 style="margin: 0; font-size: 32px; color: #ffffff;">${urgencyEmoji} ${isUrgent ? 'Expiration imminente' : 'Renouvellement requis'}</h1>
<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px; color: #ffffff;">Votre abonnement ${planLabel}</p>
</td>
</tr>
<!-- Content -->
<tr>
<td style="padding: 40px 30px;">
<p style="font-size: 18px; margin: 0 0 20px 0;">Assalamu alaykum ${userName},</p>
<!-- Expiry Badge -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: ${isUrgent ? 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)' : 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)'}; border: 2px solid ${urgencyColor}; padding: 20px; border-radius: 8px; text-align: center;">
<p style="margin: 0; font-size: 24px; font-weight: bold; color: ${urgencyColor};">${days_remaining} jour${days_remaining > 1 ? 's' : ''} restant${days_remaining > 1 ? 's' : ''}</p>
</td>
</tr>
</table>
<p style="font-size: 16px; margin: 0 0 20px 0; color: #4a5568;">${isUrgent ? `Votre abonnement <strong>${planLabel}</strong> arrive à expiration très bientôt. Agissez maintenant pour ne pas perdre vos avantages !` : `Votre abonnement <strong>${planLabel}</strong> se termine bientôt. Pensez à le renouveler pour continuer à profiter de tous les avantages.`}</p>
<!-- Plan Details -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f9fafb; border-left: 4px solid #059669; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 15px 0; color: #059669; font-size: 18px;">📋 Détails de votre abonnement</h3>
<p style="margin: 5px 0; color: #1f2937;"><strong>Plan actuel :</strong> ${planLabel}</p>
<p style="margin: 5px 0; color: #1f2937;"><strong>Date d'expiration :</strong> ${formattedDate}</p>
<p style="margin: 5px 0; color: #1f2937;"><strong>Jours restants :</strong> ${days_remaining} jour${days_remaining > 1 ? 's' : ''}</p>
</td>
</tr>
</table>
<!-- Benefits Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #fef2f2; border: 1px solid #fca5a5; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 15px 0; color: #991b1b; font-size: 18px;">⚠️ Avantages à préserver :</h3>
<ul style="margin: 0; line-height: 1.8; padding-left: 20px; color: #991b1b;">
<li>Messages illimités avec vos matchs</li>
<li>Accès aux profils vérifiés premium</li>
<li>Visibilité prioritaire dans les recherches</li>
<li>Supervision familiale avancée</li>
<li>Badge vérifié sur votre profil</li>
<li>Support prioritaire</li>
</ul>
</td>
</tr>
</table>
<div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 30px 0;">
<a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/settings" style="display: inline-block; background: #059669; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">🔄 Renouveler mon abonnement</a>
</td>
</tr>
</table>
<!-- Info Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f0f9ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 8px;">
<h4 style="margin: 0 0 10px 0; color: #1e40af;">💡 Le saviez-vous ?</h4>
<p style="margin: 0; color: #1e40af; font-size: 14px;">En renouvelant maintenant, vous conservez tous vos matchs actifs et votre historique de conversations. Ne perdez pas les connexions que vous avez construites !</p>
</td>
</tr>
</table>
<p style="font-size: 14px; color: #6b7280; margin-top: 20px;"><strong>Besoin d'aide ?</strong> Notre équipe est disponible pour répondre à vos questions sur les options d'abonnement et les modalités de renouvellement.</p>
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
<p style="color: #6b7280; font-size: 14px; margin: 0;">Qu'Allah facilite votre parcours vers un mariage béni 🤲</p>
<p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Rappel automatique • ${days_remaining} jour${days_remaining > 1 ? 's' : ''} avant expiration</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

    await sendEmail({
      to: userEmail,
      subject: `${urgencyEmoji} Votre abonnement ${planLabel} expire dans ${days_remaining} jour${days_remaining > 1 ? 's' : ''}`,
      html: emailHtml,
    });

    console.log("Subscription expiring email sent successfully to:", userEmail);

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
