import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaliEmailRequest {
  wali_user_id: string;
  email_type: 'contact' | 'suspension';
  subject?: string;
  message?: string;
  suspension_reason?: string;
  suspension_duration_days?: number;
  admin_name?: string;
}

const getContactEmailTemplate = (waliName: string, message: string, adminName: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Message de l'équipe Zawaj Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Zawaj Connect</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Message de l'Administration</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                السلام عليكم ورحمة الله وبركاته<br>
                Bonjour ${waliName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                L'équipe d'administration de Zawaj Connect souhaite vous contacter concernant votre activité en tant que Wali.
              </p>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0;">
                <p style="color: #333333; font-size: 15px; line-height: 1.6; margin: 0;">
                  ${message}
                </p>
              </div>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Si vous avez des questions ou souhaitez discuter de cette communication, n'hésitez pas à nous contacter.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Message envoyé par ${adminName}
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Zawaj Connect - Plateforme de rencontre halal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const getSuspensionEmailTemplate = (
  waliName: string, 
  reason: string, 
  durationDays: number, 
  expiryDate: string,
  adminName: string
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification de suspension - Zawaj Connect</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">⚠️ Notification de Suspension</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; opacity: 0.9;">Zawaj Connect - Administration</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                السلام عليكم ورحمة الله وبركاته<br>
                Cher(ère) ${waliName},
              </p>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                Nous vous informons que votre compte Wali sur Zawaj Connect a été temporairement suspendu.
              </p>
              
              <!-- Suspension Details -->
              <div style="background-color: #fef2f2; border: 2px solid #ef4444; border-radius: 6px; padding: 20px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 15px 0; font-size: 18px;">📋 Détails de la suspension</h3>
                
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #666666;">Raison :</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 15px 0;">
                      <p style="color: #333333; margin: 0; font-size: 15px;">${reason}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #666666;">Durée :</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 15px 0;">
                      <p style="color: #333333; margin: 0; font-size: 15px;">${durationDays} jours</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;">
                      <strong style="color: #666666;">Date de levée de suspension :</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0;">
                      <p style="color: #333333; margin: 0; font-size: 15px;">${expiryDate}</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Appeal Process -->
              <div style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin: 0 0 15px 0; font-size: 16px;">📝 Procédure d'appel</h3>
                <p style="color: #333333; font-size: 14px; line-height: 1.6; margin: 0 0 10px 0;">
                  Si vous estimez que cette décision est injustifiée, vous avez le droit de faire appel :
                </p>
                <ol style="color: #333333; font-size: 14px; line-height: 1.6; margin: 10px 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Répondez à cet email avec vos explications détaillées</li>
                  <li style="margin-bottom: 8px;">Fournissez toute preuve ou contexte pertinent</li>
                  <li style="margin-bottom: 8px;">Notre équipe examinera votre appel sous 48-72 heures</li>
                  <li>Vous recevrez une réponse par email avec la décision finale</li>
                </ol>
              </div>
              
              <p style="color: #333333; font-size: 16px; line-height: 1.6; margin: 20px 0 0 0;">
                Nous restons à votre disposition pour tout éclaircissement.
              </p>
              
              <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 20px 0 0 0; font-style: italic;">
                وَاللَّهُ يَعْلَمُ وَأَنتُمْ لَا تَعْلَمُونَ<br>
                "Et Allah sait, alors que vous ne savez pas" (Coran 2:216)
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #666666; font-size: 14px; margin: 0 0 10px 0;">
                Décision prise par ${adminName}
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0 0 10px 0;">
                Pour contacter l'administration : admin@zawaj-connect.com
              </p>
              <p style="color: #999999; font-size: 12px; margin: 0;">
                © 2025 Zawaj Connect - Plateforme de rencontre halal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    // Vérifier que l'utilisateur est admin
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .single();

    if (!roleData || !['admin', 'super_admin'].includes(roleData.role)) {
      throw new Error('Unauthorized: Admin access required');
    }

    const {
      wali_user_id,
      email_type,
      subject,
      message,
      suspension_reason,
      suspension_duration_days,
      admin_name
    }: WaliEmailRequest = await req.json();

    console.log(`📧 Envoi email ${email_type} pour Wali ${wali_user_id}`);

    // Récupérer les infos du Wali
    const { data: waliProfile } = await supabaseClient
      .from('profiles')
      .select('first_name, last_name, email')
      .eq('id', wali_user_id)
      .single();

    if (!waliProfile || !waliProfile.email) {
      throw new Error('Wali profile or email not found');
    }

    const waliName = `${waliProfile.first_name} ${waliProfile.last_name}`;
    const adminDisplayName = admin_name || 'L\'équipe Zawaj Connect';

    let emailHtml: string;
    let emailSubject: string;

    if (email_type === 'suspension') {
      if (!suspension_reason || !suspension_duration_days) {
        throw new Error('Suspension reason and duration are required');
      }

      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + suspension_duration_days);
      const formattedExpiry = expiryDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      emailSubject = '⚠️ Suspension temporaire de votre compte Wali - Zawaj Connect';
      emailHtml = getSuspensionEmailTemplate(
        waliName,
        suspension_reason,
        suspension_duration_days,
        formattedExpiry,
        adminDisplayName
      );
    } else if (email_type === 'contact') {
      if (!message) {
        throw new Error('Message is required for contact email');
      }

      emailSubject = subject || 'Message de l\'équipe Zawaj Connect';
      emailHtml = getContactEmailTemplate(waliName, message, adminDisplayName);
    } else {
      throw new Error('Invalid email type');
    }

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: "Zawaj Connect <onboarding@resend.dev>", // Remplacer par votre domaine vérifié
      to: [waliProfile.email],
      subject: emailSubject,
      html: emailHtml,
    });

    console.log(`✅ Email envoyé avec succès:`, emailResponse);

    // Logger l'email dans wali_email_history
    const emailHistoryData = {
      wali_user_id,
      sent_by: userData.user.id,
      email_type,
      subject: emailSubject,
      message_content: email_type === 'suspension' 
        ? suspension_reason || ''
        : message || '',
      delivery_status: 'sent',
      resend_email_id: emailResponse.id,
      metadata: {
        suspension_duration_days: suspension_duration_days || null,
        admin_name: adminDisplayName,
        wali_email: waliProfile.email
      }
    };

    const { error: historyError } = await supabaseClient
      .from('wali_email_history')
      .insert(emailHistoryData);

    if (historyError) {
      console.error('Erreur lors de l\'enregistrement dans l\'historique:', historyError);
    }

    // Logger l'envoi d'email dans l'audit
    await supabaseClient
      .from('wali_action_audit')
      .insert({
        wali_user_id,
        action_type: `email_sent_${email_type}`,
        action_details: {
          email_type,
          subject: emailSubject,
          sent_to: waliProfile.email,
          sent_by: userData.user.id,
          resend_id: emailResponse.id
        },
        success: true
      });

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResponse.id,
        message: 'Email envoyé avec succès'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    console.error('❌ Erreur fonction send-wali-email:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
