import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { Resend } from 'npm:resend@4.0.0';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WaliAlertEmailRequest {
  alertId: string;
  waliUserId: string;
  waliEmail: string;
  waliName: string;
  emailType: 'warning' | 'inquiry' | 'suspension';
  subject: string;
  message: string;
  alertDetails?: {
    pattern: string;
    riskLevel: string;
    details: Record<string, any>;
  };
  suspensionDetails?: {
    reason: string;
    duration: number;
    expiresAt: string;
  };
}

const getWarningTemplate = (waliName: string, message: string, alertDetails: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avertissement - Comportement Suspect Détecté</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 32px;">⚠️</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Avertissement Important</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Comportement Suspect Détecté</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${waliName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Notre système de surveillance a détecté un comportement inhabituel associé à votre compte wali. Cet avertissement est émis pour assurer la sécurité et l'intégrité de notre communauté.
              </p>
              
              <!-- Alert Details Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef2f2; border-left: 4px solid #dc2626; border-radius: 4px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #991b1b; font-weight: 600; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Détails de l'Alerte
                    </p>
                    <p style="color: #450a0a; font-size: 15px; line-height: 1.6; margin: 0;">
                      <strong>Pattern détecté:</strong> ${alertDetails?.pattern || 'N/A'}<br>
                      <strong>Niveau de risque:</strong> ${alertDetails?.riskLevel || 'N/A'}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
                <p style="color: #1f2937; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Action Required -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #92400e; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">
                      Action Requise
                    </p>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                      Veuillez réviser vos activités récentes et vous assurer que toutes vos actions sont conformes à nos directives communautaires. Si vous pensez qu'il s'agit d'une erreur, contactez-nous immédiatement.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Cordialement,<br>
                <strong>L'Équipe de Modération</strong><br>
                Mariage Halal
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.<br>
                © ${new Date().getFullYear()} Mariage Halal. Tous droits réservés.
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

const getInquiryTemplate = (waliName: string, subject: string, message: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Demande d'Information</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 32px;">📧</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Demande d'Information</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Message de l'équipe administrative</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${waliName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous vous contactons concernant une demande d'information relative à votre rôle de wali sur notre plateforme.
              </p>
              
              <!-- Subject Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #eff6ff; border-left: 4px solid #2563eb; border-radius: 4px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #1e40af; font-weight: 600; font-size: 14px; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Objet
                    </p>
                    <p style="color: #1e3a8a; font-size: 16px; font-weight: 600; margin: 0;">
                      ${subject}
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
                <p style="color: #1f2937; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Contact Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #166534; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">
                      Besoin d'aide?
                    </p>
                    <p style="color: #15803d; font-size: 14px; line-height: 1.6; margin: 0;">
                      Si vous avez des questions ou avez besoin de clarifications, n'hésitez pas à nous contacter via le support de la plateforme.
                    </p>
                  </td>
                </tr>
              </table>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Cordialement,<br>
                <strong>L'Équipe Administrative</strong><br>
                Mariage Halal
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                © ${new Date().getFullYear()} Mariage Halal. Tous droits réservés.
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

const getSuspensionTemplate = (waliName: string, message: string, suspensionDetails: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Notification de Suspension</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table cellpadding="0" cellspacing="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%); padding: 40px; text-align: center; border-radius: 8px 8px 0 0;">
              <div style="width: 64px; height: 64px; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                <span style="font-size: 32px;">🚫</span>
              </div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">Suspension de Compte</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 8px 0 0 0; font-size: 16px;">Action administrative requise</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="color: #111827; font-size: 16px; line-height: 1.6; margin: 0 0 16px 0;">
                Bonjour <strong>${waliName}</strong>,
              </p>
              
              <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
                Nous vous informons que votre compte wali a été temporairement suspendu en raison de comportements non conformes à nos directives communautaires.
              </p>
              
              <!-- Suspension Details Box -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #faf5ff; border-left: 4px solid #7c3aed; border-radius: 4px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #6b21a8; font-weight: 600; font-size: 14px; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.5px;">
                      Détails de la Suspension
                    </p>
                    <p style="color: #581c87; font-size: 15px; line-height: 1.6; margin: 0;">
                      <strong>Raison:</strong> ${suspensionDetails?.reason || 'Non spécifié'}<br>
                      <strong>Durée:</strong> ${suspensionDetails?.duration || 0} jours<br>
                      <strong>Expire le:</strong> ${
                        suspensionDetails?.expiresAt
                          ? new Date(suspensionDetails.expiresAt).toLocaleDateString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : 'N/A'
                      }
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- Message -->
              <div style="background-color: #f9fafb; border-radius: 8px; padding: 24px; margin: 0 0 24px 0;">
                <p style="color: #1f2937; font-size: 15px; line-height: 1.7; margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
              
              <!-- Appeal Process -->
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #fef3c7; border: 1px solid #fbbf24; border-radius: 8px; margin: 0 0 24px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="color: #92400e; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">
                      Procédure de Recours
                    </p>
                    <p style="color: #78350f; font-size: 14px; line-height: 1.6; margin: 0;">
                      Si vous estimez que cette décision est injustifiée, vous pouvez soumettre un recours via le portail de support dans les 7 jours suivant cette notification. Notre équipe examinera votre demande dans les plus brefs délais.
                    </p>
                  </td>
                </tr>
              </table>
              
              <!-- What Happens Next -->
              <div style="background-color: #f0f9ff; border-radius: 8px; padding: 20px; margin: 0 0 24px 0;">
                <p style="color: #0c4a6e; font-weight: 600; font-size: 14px; margin: 0 0 12px 0;">
                  Que se passe-t-il ensuite?
                </p>
                <ul style="color: #075985; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 8px;">Votre accès aux fonctionnalités wali est temporairement bloqué</li>
                  <li style="margin-bottom: 8px;">Les utilisateurs sous votre supervision seront notifiés</li>
                  <li style="margin-bottom: 8px;">Une révision complète de votre compte sera effectuée</li>
                  <li>Vous recevrez une notification lorsque la suspension sera levée</li>
                </ul>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0;">
                Cordialement,<br>
                <strong>L'Équipe de Modération</strong><br>
                Mariage Halal
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 8px 8px;">
              <p style="color: #9ca3af; font-size: 12px; line-height: 1.5; margin: 0;">
                Cet email a été envoyé automatiquement suite à une action administrative.<br>
                © ${new Date().getFullYear()} Mariage Halal. Tous droits réservés.
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

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: WaliAlertEmailRequest = await req.json();
    console.log('Sending wali alert email:', {
      alertId: requestData.alertId,
      emailType: requestData.emailType,
      waliEmail: requestData.waliEmail,
    });

    // Validate required fields
    if (!requestData.waliEmail || !requestData.waliName || !requestData.emailType) {
      throw new Error('Missing required fields: waliEmail, waliName, or emailType');
    }

    // Generate HTML based on email type
    let htmlContent: string;
    switch (requestData.emailType) {
      case 'warning':
        htmlContent = getWarningTemplate(
          requestData.waliName,
          requestData.message,
          requestData.alertDetails
        );
        break;
      case 'inquiry':
        htmlContent = getInquiryTemplate(
          requestData.waliName,
          requestData.subject,
          requestData.message
        );
        break;
      case 'suspension':
        htmlContent = getSuspensionTemplate(
          requestData.waliName,
          requestData.message,
          requestData.suspensionDetails
        );
        break;
      default:
        throw new Error(`Invalid email type: ${requestData.emailType}`);
    }

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: 'Mariage Halal - Modération <onboarding@resend.dev>',
      to: [requestData.waliEmail],
      subject: requestData.subject,
      html: htmlContent,
    });

    console.log('Email sent successfully:', emailResponse);

    // Log the email in database using Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    await supabase.from('wali_email_history').insert({
      wali_user_id: requestData.waliUserId,
      alert_id: requestData.alertId,
      email_type: requestData.emailType,
      subject: requestData.subject,
      message_content: requestData.message,
      delivery_status: 'sent',
      sent_by: requestData.waliUserId, // This should be the admin user ID in real implementation
    });

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.id,
        message: 'Email sent successfully',
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
    console.error('Error in send-wali-alert-email function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
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
