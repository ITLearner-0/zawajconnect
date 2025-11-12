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
<td style="background: linear-gradient(135deg, ${actionInfo.color} 0%, ${severity === 'critical' ? '#7f1d1d' : actionInfo.color} 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
<h1 style="margin: 0; font-size: 32px; color: #ffffff;">${actionInfo.emoji} ${actionInfo.title}</h1>
<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px; color: #ffffff;">Notification de modération</p>
</td>
</tr>
<!-- Content -->
<tr>
<td style="padding: 40px 30px;">
<p style="font-size: 18px; margin: 0 0 20px 0;">Assalamu alaykum ${userName},</p>
<!-- Alert Badge -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: ${severity === 'critical' || severity === 'high' ? '#fee2e2' : '#fef3c7'}; border: 2px solid ${severityColor}; padding: 20px; border-radius: 8px; text-align: center;">
<h3 style="margin: 0; font-size: 24px; color: ${severityColor};">${actionInfo.title}</h3>
<p style="margin: 10px 0 0 0; font-size: 16px; color: ${severityColor};">Sévérité : <strong>${severity === 'critical' ? 'Critique' : severity === 'high' ? 'Élevée' : severity === 'medium' ? 'Moyenne' : 'Faible'}</strong></p>
</td>
</tr>
</table>
<p style="font-size: 16px; margin: 0 0 20px 0; color: #4a5568;">Notre système de modération automatique a détecté un contenu ne respectant pas nos principes islamiques et nos conditions d'utilisation.</p>
<!-- Reason Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f9fafb; border-left: 4px solid ${severityColor}; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 10px 0; color: ${severityColor}; font-size: 18px;">📋 Raison de la modération</h3>
<p style="margin: 0; font-size: 16px; color: #1f2937;"><strong>${reason}</strong></p>
${details ? `<p style="margin: 10px 0 0 0; font-size: 14px; color: #6b7280;">${details}</p>` : ''}
</td>
</tr>
</table>
${action_taken === 'blocked' || action_taken === 'removed' ? `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #fee2e2; border: 1px solid #fca5a5; padding: 15px; border-radius: 8px;">
<h4 style="margin: 0 0 10px 0; color: #991b1b;">⚠️ Conséquences :</h4>
<p style="margin: 0; color: #991b1b; font-size: 14px;">${action_taken === 'blocked' ? 'Votre contenu a été bloqué et ne peut pas être envoyé. Veuillez reformuler votre message en respectant nos principes.' : 'Votre contenu a été supprimé de la plateforme. Des violations répétées peuvent entraîner la suspension de votre compte.'}</p>
</td>
</tr>
</table>
` : ''}
<!-- Islamic Guidance -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border: 2px solid #3b82f6; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">🕌 Guidance Islamique</h3>
<p style="margin: 0; color: #1e40af; font-size: 15px; font-style: italic;">"Celui qui croit en Allah et au Jour Dernier, qu'il dise du bien ou qu'il se taise" - Prophète Muhammad (ﷺ)</p>
<p style="margin: 10px 0 0 0; color: #1e40af; font-size: 14px;">Notre plateforme s'engage à maintenir un environnement respectueux des valeurs islamiques de pudeur (Haya), de respect mutuel et de bienveillance.</p>
</td>
</tr>
</table>
<!-- Guidelines -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f0fdf4; border: 1px solid #059669; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 15px 0; color: #065f46; font-size: 18px;">✅ Rappel des bonnes pratiques :</h3>
<ul style="margin: 0; line-height: 1.8; padding-left: 20px; color: #065f46;">
<li>Respecter la pudeur islamique dans toutes les conversations</li>
<li>Éviter tout langage inapproprié ou vulgaire</li>
<li>Ne pas partager d'informations personnelles sensibles</li>
<li>Maintenir un ton respectueux et bienveillant</li>
<li>Impliquer votre Wali dans les décisions importantes</li>
<li>Signaler tout comportement inapproprié</li>
</ul>
</td>
</tr>
</table>
<div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 30px 0;">
<a href="${Deno.env.get("SUPABASE_URL") || 'https://dgfctwtivkqcfhwqgkya.supabase.co'}/community-guidelines" style="display: inline-block; background: #059669; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">📖 Consulter les règles complètes</a>
</td>
</tr>
</table>
<p style="font-size: 14px; color: #6b7280; margin-top: 20px;"><strong>Besoin d'aide ?</strong> Si vous pensez qu'il s'agit d'une erreur ou si vous avez des questions, n'hésitez pas à contacter notre équipe de support.</p>
${severity === 'critical' || action_taken === 'removed' ? `
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #fef2f2; border: 2px solid #dc2626; padding: 15px; border-radius: 8px;">
<p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: bold;">⚠️ Avertissement important : Des violations répétées de nos règles peuvent entraîner la suspension temporaire ou permanente de votre compte.</p>
</td>
</tr>
</table>
` : ''}
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
<p style="color: #6b7280; font-size: 14px; margin: 0;">Qu'Allah vous guide vers le comportement exemplaire 🤲</p>
<p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Notification automatique de modération • ${new Date().toLocaleDateString('fr-FR')}</p>
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
