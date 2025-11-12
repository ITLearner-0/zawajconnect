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
<td style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
<h1 style="margin: 0; font-size: 32px; color: #ffffff;">💬 Messages non lus</h1>
<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px; color: #ffffff;">Vous avez de nouveaux messages</p>
</td>
</tr>
<!-- Content -->
<tr>
<td style="padding: 40px 30px;">
<p style="font-size: 18px; margin: 0 0 20px 0;">Assalamu alaykum ${userName},</p>
<!-- Message Badge -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px; border-radius: 8px; text-align: center; box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);">
<p style="margin: 0; font-size: 28px; font-weight: bold; color: #ffffff;">${unread_count} message${unread_count > 1 ? 's' : ''} non lu${unread_count > 1 ? 's' : ''}</p>
</td>
</tr>
</table>
<!-- Info Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; border-radius: 8px;">
<p style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;"><strong>De :</strong> ${sender_name}</p>
<p style="margin: 0; font-size: 14px; color: #6b7280;">${unread_count > 1 ? `Vous avez ${unread_count} messages en attente de lecture.` : 'Un message attend votre réponse.'}</p>
</td>
</tr>
</table>
<p style="font-size: 16px; margin: 0 0 20px 0; color: #4a5568;">Une conversation active nécessite une attention régulière pour maintenir la connexion et progresser vers une éventuelle rencontre conforme aux principes islamiques.</p>
<!-- Islamic Reminder -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center;">
<p style="margin: 0; font-size: 16px; color: #92400e; font-style: italic;">"Les meilleurs d'entre vous sont ceux qui ont le meilleur comportement" - Prophète Muhammad (ﷺ)</p>
<p style="margin: 10px 0 0 0; font-size: 14px; color: #92400e;">Répondre avec respect et bienveillance fait partie des belles qualités islamiques</p>
</td>
</tr>
</table>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 30px 0;">
<a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/chat/${match_id}" style="display: inline-block; background: #3b82f6; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">📬 Lire les messages</a>
</td>
</tr>
</table>
<div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
<!-- Warning Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #fef2f2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px;">
<h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Conseils importants :</h4>
<ul style="margin: 5px 0; padding-left: 20px; color: #991b1b; font-size: 14px;">
<li>Maintenez une communication respectueuse et pudique</li>
<li>Évitez les sujets inappropriés ou trop personnels</li>
<li>Impliquez vos Walis dans les décisions importantes</li>
<li>Ne partagez pas d'informations personnelles sensibles</li>
</ul>
</td>
</tr>
</table>
<p style="margin-top: 20px; font-size: 14px; color: #6b7280;"><strong>Note :</strong> Si vous n'êtes plus intéressé(e) par cette conversation, vous pouvez la clôturer de manière respectueuse depuis votre espace de messagerie.</p>
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
<p style="color: #6b7280; font-size: 14px; margin: 0;">Qu'Allah vous guide vers ce qui est meilleur 🤲</p>
<p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Rappel automatique • Vous pouvez désactiver ces notifications dans vos paramètres</p>
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
