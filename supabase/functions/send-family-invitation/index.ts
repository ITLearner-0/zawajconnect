import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { sendEmail } from '../_shared/smtp.ts';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const FamilyInvitationSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().email().max(255),
  relationship: z.enum([
    'father',
    'mother',
    'brother',
    'sister',
    'uncle',
    'aunt',
    'grandfather',
    'grandmother',
    'guardian',
  ]),
  isWali: z.boolean(),
});

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from auth header (JWT verified by Supabase)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication requise' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication invalide' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Validate input
    let validatedInput;
    try {
      const rawInput = await req.json();
      validatedInput = FamilyInvitationSchema.parse(rawInput);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(JSON.stringify({ error: 'Données invalides' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Rate limiting: Check recent invitations (max 5 per day)
    const { data: recentInvitations, error: rateLimitError } = await supabase
      .from('family_members')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    if (recentInvitations && recentInvitations.length >= 5) {
      console.warn(`Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: "Limite d'invitations atteinte. Maximum 5 invitations par jour." }),
        { status: 429, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { fullName, email, relationship, isWali } = validatedInput;

    // Create family invitation
    const { data: invitationToken, error: invitationError } = await supabase.rpc(
      'create_family_invitation',
      {
        p_user_id: user.id,
        p_full_name: fullName,
        p_email: email,
        p_relationship: relationship,
        p_is_wali: isWali,
      }
    );

    if (invitationError) {
      console.error('Failed to create invitation:', invitationError);
      return new Response(
        JSON.stringify({ error: "Impossible de créer l'invitation. Veuillez réessayer." }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get user profile for invitation email
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('user_id', user.id)
      .single();

    const inviterName = profile?.full_name || 'Un membre de famille';

    // Construct invitation URL dynamically
    const baseUrl =
      req.headers.get('origin') ||
      req.headers.get('referer')?.split('/')[0] +
        '//' +
        req.headers.get('referer')?.split('/')[2] ||
      'https://preview--deen-dates-platform.lovable.app';
    const invitationUrl = `${baseUrl}/invitation-accept?token=${invitationToken}`;

    console.log('Sending invitation (token redacted)');

    // Send invitation email
    try {
      await sendEmail({
        to: email,
        subject: '🕌 Invitation Wali - Zawaj-Connect',
        html: `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f3f4f6;">
<tr>
<td style="padding: 40px 20px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);">
<!-- Header -->
<tr>
<td style="text-align: center; padding: 30px;">
<h1 style="color: #16a34a; font-size: 28px; margin: 0;">🕌 Zawaj-Connect</h1>
<p style="color: #666; margin: 5px 0 0 0;">Plateforme matrimoniale islamique avec supervision familiale</p>
</td>
</tr>
<!-- Main Content -->
<tr>
<td style="padding: 0 30px 30px 30px;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="background: linear-gradient(135deg, #f0f9f0 0%, #e8f5e8 100%); border: 2px solid #16a34a; padding: 25px; border-radius: 12px;">
<h2 style="color: #16a34a; margin: 0 0 15px 0; font-size: 24px;">Assalamu Alaikum ${fullName}</h2>
<p style="color: #333; font-size: 16px; line-height: 1.6; margin: 15px 0;">${inviterName} vous invite à devenir ${isWali ? '<strong>Wali (tuteur islamique)</strong>' : 'membre de famille'} pour superviser leurs interactions matrimoniales selon les principes de l'Islam.</p>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
<tr>
<td style="background-color: rgba(255,255,255,0.7); padding: 20px; border-radius: 8px;">
<p style="margin: 0 0 10px 0;"><strong>🎯 Votre rôle :</strong> ${getRelationshipLabel(relationship)}</p>
${isWali ? '<p style="margin: 10px 0; color: #16a34a;"><strong>✅ Statut Wali (Tuteur Islamique)</strong></p>' : ''}
<p style="margin: 15px 0 10px 0; font-weight: bold;">Vos autorisations :</p>
<ul style="margin: 0; padding-left: 20px; color: #333;">
<li>📋 <strong>Superviser les conversations</strong> - Veiller à la pudeur islamique</li>
<li>👁️ <strong>Consulter les profils</strong> - Vérifier la compatibilité</li>
<li>🛡️ <strong>Recevoir des alertes</strong> - Modération automatique</li>
<li>💬 <strong>Guidance islamique</strong> - Conseiller selon la Sunna</li>
${isWali ? '<li>✅ <strong>Approuver les matches</strong> - Pouvoir de décision Wali</li>' : ''}
</ul>
</td>
</tr>
</table>
</td>
</tr>
</table>
<!-- CTA Button -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center; padding: 30px 0;">
<a href="${invitationUrl}" style="display: inline-block; background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 18px 35px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(22,163,74,0.3);">🔗 Accepter l'Invitation</a>
</td>
</tr>
</table>
<!-- Warning Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 25px 0;">
<tr>
<td style="background-color: #fef3c7; border: 1px solid #f59e0b; padding: 15px; border-radius: 8px;">
<p style="margin: 0; color: #92400e; font-size: 14px;"><strong>⏰ Important :</strong> Cette invitation expire dans 30 jours. Si vous n'avez pas sollicité cette invitation, vous pouvez l'ignorer en toute sécurité.</p>
</td>
</tr>
</table>
<!-- Guidance Box -->
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 20px 0;">
<tr>
<td style="background-color: #e0f2fe; border: 1px solid #0ea5e9; padding: 15px; border-radius: 8px;">
<h4 style="color: #0c4a6e; margin: 0 0 10px 0;">📚 Guidance Islamique</h4>
<p style="margin: 0; color: #0c4a6e; font-size: 14px;">En acceptant, vous vous engagez à superviser selon les enseignements islamiques, en préservant la pudeur (Haya) et en favorisant des relations halal conformes à la Sunna.</p>
</td>
</tr>
</table>
<div style="height: 1px; background: #ddd; margin: 30px 0;"></div>
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="text-align: center;">
<p style="color: #888; font-size: 12px; margin: 5px 0;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :</p>
<p style="color: #16a34a; font-size: 12px; word-break: break-all; margin: 5px 0;">${invitationUrl}</p>
</td>
</tr>
</table>
</td>
</tr>
</table>
</td>
</tr>
</table>
</body>
</html>`,
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      return new Response(
        JSON.stringify({ error: "Erreur lors de l'envoi de l'email. Veuillez réessayer." }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    function getRelationshipLabel(relationship: string): string {
      const labels: Record<string, string> = {
        father: 'Père',
        mother: 'Mère',
        brother: 'Frère',
        sister: 'Sœur',
        uncle: 'Oncle',
        aunt: 'Tante',
        grandfather: 'Grand-père',
        grandmother: 'Grand-mère',
        guardian: 'Tuteur légal',
      };
      return labels[relationship] || relationship;
    }

    console.log('Invitation sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        invitationToken,
        message: 'Invitation envoyée avec succès',
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
    console.error('Error in send-family-invitation function:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
