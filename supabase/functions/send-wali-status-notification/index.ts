import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationRequest {
  registration_id: string;
  status: 'approved' | 'rejected';
  rejection_reason?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { registration_id, status, rejection_reason }: NotificationRequest = await req.json();

    console.log('Processing Wali status notification:', { registration_id, status });

    // Get registration details
    const { data: registration, error: regError } = await supabaseClient
      .from('wali_registrations')
      .select('*, profiles!inner(full_name, user_id)')
      .eq('id', registration_id)
      .single();

    if (regError) {
      console.error('Error fetching registration:', regError);
      throw new Error('Registration not found');
    }

    // Get user email from auth
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.admin.getUserById(registration.user_id);

    if (userError || !user?.email) {
      console.error('Error fetching user:', userError);
      throw new Error('User email not found');
    }

    // Prepare email content based on status
    let subject: string;
    let html: string;

    if (status === 'approved') {
      subject = '✅ Votre candidature Wali a été approuvée';
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .success-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
              .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 Félicitations !</h1>
              </div>
              <div class="content">
                <p>Cher(e) ${registration.full_name},</p>
                
                <div class="success-badge">✅ Candidature Approuvée</div>
                
                <p>Nous avons le plaisir de vous informer que votre candidature en tant que <strong>Wali</strong> a été approuvée avec succès.</p>
                
                <p><strong>Vos nouvelles responsabilités :</strong></p>
                <ul>
                  <li>Accompagner les membres de votre famille dans leur recherche</li>
                  <li>Superviser et valider les interactions importantes</li>
                  <li>Accéder au tableau de bord Wali dédié</li>
                  <li>Recevoir des notifications sur les activités</li>
                </ul>
                
                <p>Vous pouvez dès maintenant accéder à votre espace Wali pour commencer à superviser et accompagner.</p>
                
                <a href="https://mariage-halal.com/wali-dashboard" class="cta-button">Accéder au Dashboard Wali</a>
                
                <p style="margin-top: 30px;">Nous vous remercions de votre engagement et de votre confiance.</p>
                
                <p>Cordialement,<br><strong>L'équipe Zawaj Connect</strong></p>
              </div>
              <div class="footer">
                <p>Zawaj Connect - Plateforme de Mariage Halal</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    } else {
      subject = '❌ Mise à jour de votre candidature Wali';
      html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
              .warning-badge { background: #ef4444; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; margin: 20px 0; }
              .reason-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .cta-button { background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; }
              .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Mise à jour de votre candidature</h1>
              </div>
              <div class="content">
                <p>Cher(e) ${registration.full_name},</p>
                
                <div class="warning-badge">❌ Candidature Non Approuvée</div>
                
                <p>Nous vous informons que votre candidature en tant que Wali n'a pas pu être approuvée pour le moment.</p>
                
                ${
                  rejection_reason
                    ? `
                  <div class="reason-box">
                    <strong>Raison :</strong><br>
                    ${rejection_reason}
                  </div>
                `
                    : ''
                }
                
                <p><strong>Prochaines étapes :</strong></p>
                <ul>
                  <li>Vérifiez que tous les documents fournis sont valides et lisibles</li>
                  <li>Assurez-vous que les informations sont correctes et à jour</li>
                  <li>Vous pouvez soumettre une nouvelle candidature après révision</li>
                </ul>
                
                <p>Si vous avez des questions ou besoin d'éclaircissements, n'hésitez pas à contacter notre équipe de support.</p>
                
                <a href="https://mariage-halal.com/wali-registration" class="cta-button">Soumettre une Nouvelle Candidature</a>
                
                <p style="margin-top: 30px;">Nous restons à votre disposition.</p>
                
                <p>Cordialement,<br><strong>L'équipe Zawaj Connect</strong></p>
              </div>
              <div class="footer">
                <p>Zawaj Connect - Plateforme de Mariage Halal</p>
                <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
              </div>
            </div>
          </body>
        </html>
      `;
    }

    // Send email
    await sendEmail({
      to: user.email,
      subject: subject,
      html: html,
    });

    console.log('Wali status notification sent successfully to:', user.email);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Notification sent successfully',
        email: user.email,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error sending Wali status notification:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to send notification',
        details: error.toString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
