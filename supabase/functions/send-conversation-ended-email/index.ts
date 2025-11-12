import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConversationEndedEmailRequest {
  recipient_user_id: string;
  sender_name: string;
  reason: string;
  courtesy_message?: string;
  islamic_message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const {
      recipient_user_id,
      sender_name,
      reason,
      courtesy_message,
      islamic_message,
    }: ConversationEndedEmailRequest = await req.json();

    // Get recipient email and profile
    const { data: userData, error: userError } =
      await supabase.auth.admin.getUserById(recipient_user_id);

    if (userError || !userData.user) {
      throw new Error('Recipient user not found');
    }

    const recipientEmail = userData.user.email;
    if (!recipientEmail) {
      throw new Error('Recipient email not found');
    }

    // Get recipient profile for name
    const { data: recipientProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', recipient_user_id)
      .maybeSingle();

    const recipientName = recipientProfile?.full_name || 'Cher(e) membre';

    // Prepare reason text in French
    const reasonTexts: Record<string, string> = {
      incompatibilite_religieuse: 'Incompatibilité religieuse',
      valeurs_familiales: 'Différences de valeurs familiales',
      situation_personnelle: 'Situation personnelle qui a changé',
      besoin_reflexion: 'Besoin de réflexion supplémentaire',
      conseil_famille: 'Conseil de la famille',
      autre: 'Autre raison',
    };

    const reasonText = reasonTexts[reason] || reason;

    // Compose email HTML
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
<td style="background: linear-gradient(135deg, #059669 0%, #10b981 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
<h1 style="margin: 0; font-size: 32px; color: #ffffff;">🤲 Notification Importante</h1>
<p style="margin: 10px 0 0 0; opacity: 0.9; font-size: 18px; color: #ffffff;">Fin d'un échange</p>
</td>
</tr>
<!-- Content -->
<tr>
<td style="padding: 40px 30px;">
<p style="font-size: 18px; margin: 0 0 20px 0;">Assalamu alaykum ${recipientName},</p>
<p style="font-size: 16px; margin: 0 0 20px 0; color: #4a5568;">Nous vous informons que <strong>${sender_name}</strong> a décidé de mettre fin à votre échange en cours.</p>
<!-- Reason Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f3f4f6; border-left: 4px solid #059669; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 10px 0; color: #059669; font-size: 18px;">📋 Raison de la clôture :</h3>
<p style="margin: 0; font-size: 16px; color: #1f2937;"><strong>${reasonText}</strong></p>
</td>
</tr>
</table>
${
  courtesy_message
    ? `
<!-- Personal Message Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: #f3f4f6; border-left: 4px solid #059669; padding: 20px; border-radius: 8px;">
<h3 style="margin: 0 0 10px 0; color: #059669; font-size: 18px;">💌 Message personnel :</h3>
<p style="margin: 0; font-size: 16px; color: #1f2937; white-space: pre-wrap;">${courtesy_message}</p>
</td>
</tr>
</table>
`
    : ''
}
<!-- Islamic Message Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border: 2px solid #f59e0b; padding: 20px; border-radius: 8px; text-align: center;">
<p style="margin: 0; font-size: 16px; color: #92400e; font-style: italic;">${islamic_message}</p>
</td>
</tr>
</table>
<div style="height: 1px; background: #e5e7eb; margin: 30px 0;"></div>
<h3 style="color: #059669; font-size: 20px; margin: 0 0 15px 0;">✨ Prochaines étapes</h3>
<ul style="line-height: 1.8; color: #4a5568; padding-left: 20px;">
<li>Vous êtes maintenant libre de chercher de nouveaux profils</li>
<li>Vous pouvez accepter de nouvelles demandes de mise en relation</li>
<li>Cette personne ne vous sera plus proposée dans les résultats de recherche</li>
</ul>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 30px 0;">
<a href="https://dgfctwtivkqcfhwqgkya.supabase.co" style="display: inline-block; background: #059669; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px;">Découvrir de nouveaux profils</a>
</td>
</tr>
</table>
<p style="margin-top: 30px; font-size: 14px; color: #6b7280; line-height: 1.6;"><strong>Note :</strong> Cette décision a été prise dans le respect des principes islamiques et de la bienveillance mutuelle. Nous vous encourageons à poursuivre votre recherche avec confiance et sérénité.</p>
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
<p style="color: #6b7280; font-size: 14px; margin: 0;">Qu'Allah facilite votre chemin vers un mariage béni 🤲</p>
<p style="color: #9ca3af; font-size: 12px; margin: 10px 0 0 0;">Cet email a été envoyé automatiquement par notre plateforme de rencontre islamique</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

    // Send email
    await sendEmail({
      to: recipientEmail,
      subject: `Notification : Fin d'échange avec ${sender_name}`,
      html: emailHtml,
    });

    console.log('Conversation ended email sent successfully to:', recipientEmail);

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error('Error sending conversation ended email:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
};

serve(handler);
