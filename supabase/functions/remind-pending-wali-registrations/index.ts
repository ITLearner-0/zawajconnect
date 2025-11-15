import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';
import { sendEmail } from '../_shared/smtp.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  relationship: string;
  submitted_at: string;
  days_pending: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting pending Wali registrations reminder check...');

    // Récupérer les inscriptions en attente depuis 7+ jours
    const { data: pendingRegistrations, error: fetchError } = await supabase
      .from('wali_registrations')
      .select('id, full_name, email, phone, relationship, created_at')
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (fetchError) {
      console.error('Error fetching pending registrations:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${pendingRegistrations?.length || 0} pending registrations older than 7 days`);

    if (!pendingRegistrations || pendingRegistrations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No pending registrations requiring reminders',
          results: { total: 0, emailsSent: 0, errors: [] }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Récupérer les emails des admins
    const { data: adminUsers, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'super_admin']);

    if (adminError || !adminUsers || adminUsers.length === 0) {
      console.error('Error fetching admin users:', adminError);
      throw new Error('No admin users found');
    }

    const adminEmails: string[] = [];
    for (const admin of adminUsers) {
      const { data: authData } = await supabase.auth.admin.getUserById(admin.user_id);
      if (authData.user?.email) {
        adminEmails.push(authData.user.email);
      }
    }

    console.log(`Sending reminders to ${adminEmails.length} admin(s)`);

    const emailsSent: string[] = [];
    const errors: string[] = [];

    // Préparer la liste des inscriptions pour l'email
    const registrationsList = pendingRegistrations
      .map((reg) => {
        const daysPending = Math.floor(
          (Date.now() - new Date(reg.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        return `
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px; font-weight: 500;">${reg.full_name}</td>
            <td style="padding: 12px;">${reg.relationship}</td>
            <td style="padding: 12px;">${reg.email}</td>
            <td style="padding: 12px; color: #ef4444; font-weight: 600;">${daysPending} jours</td>
          </tr>
        `;
      })
      .join('');

    // Envoyer un email groupé à tous les admins
    for (const adminEmail of adminEmails) {
      try {
        await sendEmail({
          to: adminEmail,
          subject: `⚠️ ${pendingRegistrations.length} inscription(s) Wali en attente de traitement`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
              <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
                  <div style="width: 60px; height: 60px; background: rgba(255,255,255,0.2); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 16px;">
                    <span style="font-size: 32px;">⚠️</span>
                  </div>
                  <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">Inscriptions Wali en Attente</h1>
                  <p style="color: rgba(255,255,255,0.9); margin: 12px 0 0 0; font-size: 16px;">
                    ${pendingRegistrations.length} inscription(s) nécessitent votre attention
                  </p>
                </div>

                <!-- Content -->
                <div style="background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.07);">
                  
                  <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                    <p style="margin: 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                      🚨 Ces inscriptions sont en attente depuis plus de 7 jours
                    </p>
                  </div>

                  <h2 style="color: #111827; font-size: 18px; font-weight: 600; margin: 0 0 20px 0;">
                    Inscriptions en attente de traitement :
                  </h2>

                  <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; background: #f9fafb; border-radius: 8px; overflow: hidden;">
                    <thead>
                      <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Nom</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Relation</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">Email</th>
                        <th style="padding: 12px; text-align: left; font-weight: 600; color: #374151;">En attente</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${registrationsList}
                    </tbody>
                  </table>

                  <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 30px;">
                    <p style="margin: 0 0 8px 0; color: #065f46; font-weight: 600; font-size: 14px;">
                      💡 Rappel : Traitement rapide recommandé
                    </p>
                    <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.6;">
                      Les inscriptions Wali doivent être traitées rapidement pour maintenir la confiance des utilisateurs et assurer un processus de validation fluide.
                    </p>
                  </div>

                  <div style="text-align: center; margin-top: 30px;">
                    <a href="https://mariage-halal.com/admin/wali-registrations" 
                       style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);">
                      📋 Gérer les Inscriptions
                    </a>
                  </div>

                  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
                    <p style="margin: 0; color: #6b7280; font-size: 13px; line-height: 1.6;">
                      Vous recevez cet email car vous êtes administrateur de Mariage Halal.<br>
                      Cet email est automatique et envoyé quotidiennement si des inscriptions sont en attente.
                    </p>
                  </div>

                </div>

                <!-- Footer -->
                <div style="text-align: center; margin-top: 30px; padding: 0 20px;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © 2025 Mariage Halal - Plateforme de rencontre halal
                  </p>
                </div>

              </div>
            </body>
            </html>
          `,
        });

        emailsSent.push(adminEmail);
        console.log(`Reminder email sent to admin: ${adminEmail}`);
      } catch (emailError) {
        console.error(`Failed to send email to ${adminEmail}:`, emailError);
        errors.push(`Failed to send to ${adminEmail}: ${emailError.message}`);
      }
    }

    // Logger l'action dans la table d'audit
    for (const registration of pendingRegistrations) {
      await supabase.from('wali_registration_activity_log').insert({
        registration_id: registration.id,
        action_type: 'reminder_sent',
        action_by: null, // System action
        details: {
          reminder_type: 'pending_7_days',
          admins_notified: adminEmails.length,
          days_pending: Math.floor(
            (Date.now() - new Date(registration.created_at).getTime()) / (1000 * 60 * 60 * 24)
          )
        }
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Pending Wali registrations reminder process completed',
        results: {
          total: pendingRegistrations.length,
          emailsSent: emailsSent.length,
          adminEmails: adminEmails.length,
          errors
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );

  } catch (error) {
    console.error('Error in remind-pending-wali-registrations function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
