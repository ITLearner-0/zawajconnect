import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { sendEmail } from '../_shared/smtp.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PasswordResetRequest {
  email: string;
  redirectUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('🔑 Password reset email function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, redirectUrl }: PasswordResetRequest = await req.json();

    console.log('📧 Processing password reset for:', email);

    // Créer un client Supabase avec les permissions admin
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Générer un lien de réinitialisation sans envoyer d'email
    const { data, error: generateError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (generateError) {
      console.error('❌ Error generating reset link:', generateError);
      throw new Error(`Failed to generate reset link: ${generateError.message}`);
    }

    if (!data?.properties?.action_link) {
      throw new Error('No reset link generated');
    }

    const resetLink = data.properties.action_link;
    console.log('✅ Reset link generated, sending email via SMTP...');

    // Créer le contenu HTML de l'email avec un design professionnel et compatible email
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
<td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 40px 30px; text-align: center; border-radius: 16px 16px 0 0;">
<div style="font-size: 48px; margin-bottom: 10px;">💚</div>
<h1 style="color: #ffffff; font-size: 28px; font-weight: 700; margin: 15px 0 5px 0;">Zawaj Connect</h1>
<p style="color: rgba(255, 255, 255, 0.9); font-size: 16px; margin: 0;">Votre plateforme de rencontres islamiques de confiance</p>
</td>
</tr>
<!-- Content -->
<tr>
<td style="padding: 40px 30px;">
<div style="font-size: 18px; color: #059669; font-weight: 600; margin-bottom: 20px;">Salam alaykoum cher membre,</div>
<p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin-bottom: 25px;">Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte Zawaj Connect. Pas d'inquiétude, c'est un processus simple et sécurisé ! 🔒</p>
<p style="color: #4b5563; font-size: 15px; line-height: 1.8; margin-bottom: 25px;">Pour créer votre nouveau mot de passe, il vous suffit de cliquer sur le bouton ci-dessous :</p>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 35px 0;">
<a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; box-shadow: 0 4px 15px rgba(5, 150, 105, 0.3);">🔐 Réinitialiser mon mot de passe</a>
</td>
</tr>
</table>
<!-- Info Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); border-left: 4px solid #f59e0b; padding: 20px; border-radius: 10px;">
<div style="font-weight: 700; color: #92400e; margin-bottom: 8px; font-size: 15px;">⏰ Validité du lien</div>
<div style="color: #78350f; font-size: 14px; line-height: 1.6;">Ce lien est valide pendant <strong>1 heure</strong> pour des raisons de sécurité. Après ce délai, vous devrez faire une nouvelle demande.</div>
</td>
</tr>
</table>
<!-- Security Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%); border-left: 4px solid #3b82f6; padding: 20px; border-radius: 10px;">
<div style="font-weight: 700; color: #1e40af; margin-bottom: 8px; font-size: 15px;">🛡️ Vous n'avez pas fait cette demande ?</div>
<div style="color: #1e3a8a; font-size: 14px; line-height: 1.6;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel restera inchangé et votre compte est protégé. 🛡️</div>
</td>
</tr>
</table>
<!-- Divider -->
<div style="height: 1px; background-color: #e5e7eb; margin: 30px 0;"></div>
<!-- Link Container -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
<tr>
<td style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px dashed #d1d5db;">
<div style="font-size: 13px; color: #6b7280; margin-bottom: 8px; font-weight: 600;">🔗 Le bouton ne fonctionne pas ? Copiez ce lien :</div>
<a href="${resetLink}" style="word-break: break-all; color: #059669; font-size: 12px; text-decoration: none; display: block;">${resetLink}</a>
</td>
</tr>
</table>
<p style="margin-top: 30px; font-size: 14px; color: #6b7280; line-height: 1.8;">Qu'Allah facilite votre parcours et vous guide vers une union bénie. 🤲</p>
</td>
</tr>
<!-- Footer -->
<tr>
<td style="background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 16px 16px;">
<div style="font-size: 20px; font-weight: 700; color: #059669; margin-bottom: 10px;">Zawaj Connect</div>
<div style="color: #6b7280; font-size: 14px; margin-bottom: 15px; font-style: italic;">"Construire des unions halal avec confiance"</div>
<div style="color: #9ca3af; font-size: 13px; line-height: 1.6;">Cet email a été envoyé à <span style="color: #6b7280; font-weight: 600;">${email}</span><br>dans le cadre d'une demande de réinitialisation de mot de passe.</div>
<div style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin-top: 15px;">© 2025 Zawaj Connect. Tous droits réservés.<br>Une plateforme de rencontres islamiques respectueuse et sécurisée.</div>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`;

    // Envoyer l'email via SMTP
    await sendEmail({
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Zawaj Connect',
      html: emailHtml,
    });

    console.log('✅ Password reset email sent successfully to:', email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Email de réinitialisation envoyé avec succès',
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
    console.error('❌ Error in send-password-reset-email function:', error);
    return new Response(
      JSON.stringify({
        error: error.message || "Une erreur est survenue lors de l'envoi de l'email",
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
