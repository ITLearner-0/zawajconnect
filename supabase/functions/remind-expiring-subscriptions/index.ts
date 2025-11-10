import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiringSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  expires_at: string;
  granted_at: string;
  profiles: {
    full_name: string;
  } | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting expiring subscriptions reminder process...');

    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Calculate date range for subscriptions expiring in 7 days
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    
    // Set to start of day (00:00:00)
    const startOfDay = new Date(sevenDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    // Set to end of day (23:59:59)
    const endOfDay = new Date(sevenDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Searching for subscriptions expiring between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`);

    // Find all active subscriptions expiring in exactly 7 days
    const { data: expiringSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        expires_at,
        granted_at,
        profiles!inner(full_name)
      `)
      .eq('status', 'active')
      .gte('expires_at', startOfDay.toISOString())
      .lte('expires_at', endOfDay.toISOString());

    if (fetchError) {
      console.error('Error fetching expiring subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring in 7 days`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No subscriptions expiring in 7 days',
          count: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = {
      total: expiringSubscriptions.length,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Process each expiring subscription
    for (const subscription of expiringSubscriptions as ExpiringSubscription[]) {
      try {
        console.log(`Processing reminder for subscription ${subscription.id} for user ${subscription.user_id}`);

        // Get user email from auth.users
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.getUserById(
          subscription.user_id
        );

        if (authError || !authUser?.user?.email) {
          console.error(`Could not fetch email for user ${subscription.user_id}:`, authError);
          results.errors.push(`No email found for user ${subscription.user_id}`);
          continue;
        }

        const userEmail = authUser.user.email;
        const userName = subscription.profiles?.full_name || 'Membre';
        const expirationDate = new Date(subscription.expires_at);
        
        // Calculate subscription duration
        const grantedDate = new Date(subscription.granted_at);
        const durationMonths = Math.round((expirationDate.getTime() - grantedDate.getTime()) / (1000 * 60 * 60 * 24 * 30));

        // Determine discount based on plan type
        let discountPercent = 0;
        let discountCode = '';
        if (subscription.plan_type.includes('12')) {
          discountPercent = 15;
          discountCode = 'RENOUVELLEMENT15';
        } else if (subscription.plan_type.includes('6')) {
          discountPercent = 10;
          discountCode = 'RENOUVELLEMENT10';
        } else {
          discountPercent = 5;
          discountCode = 'RENOUVELLEMENT5';
        }

        // Send reminder email
        try {
          const emailResponse = await resend.emails.send({
            from: 'Mariage Halal <onboarding@resend.dev>',
            to: [userEmail],
            subject: '⏰ Votre abonnement expire dans 7 jours - Offre de renouvellement',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                    }
                    .header {
                      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
                      color: white;
                      padding: 30px;
                      border-radius: 10px 10px 0 0;
                      text-align: center;
                    }
                    .content {
                      background: #f9fafb;
                      padding: 30px;
                      border-radius: 0 0 10px 10px;
                    }
                    .warning-box {
                      background: #fef3c7;
                      border-left: 4px solid #f59e0b;
                      padding: 15px;
                      margin: 20px 0;
                      border-radius: 4px;
                    }
                    .offer-box {
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                      color: white;
                      padding: 25px;
                      margin: 25px 0;
                      border-radius: 8px;
                      text-align: center;
                    }
                    .discount-badge {
                      display: inline-block;
                      background: #fbbf24;
                      color: #78350f;
                      padding: 8px 20px;
                      border-radius: 20px;
                      font-weight: bold;
                      font-size: 18px;
                      margin: 10px 0;
                    }
                    .promo-code {
                      background: white;
                      color: #10b981;
                      padding: 12px 25px;
                      border-radius: 6px;
                      font-family: monospace;
                      font-size: 20px;
                      font-weight: bold;
                      margin: 15px 0;
                      border: 2px dashed #10b981;
                      display: inline-block;
                    }
                    .button {
                      display: inline-block;
                      background: #fbbf24;
                      color: #78350f;
                      padding: 15px 40px;
                      text-decoration: none;
                      border-radius: 8px;
                      margin: 20px 0;
                      font-weight: bold;
                      font-size: 16px;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                    }
                    .features-list {
                      background: white;
                      padding: 20px;
                      border-radius: 8px;
                      margin: 20px 0;
                    }
                    .features-list li {
                      margin: 10px 0;
                      padding-left: 10px;
                    }
                    .footer {
                      text-align: center;
                      margin-top: 30px;
                      padding-top: 20px;
                      border-top: 1px solid #e5e7eb;
                      color: #6b7280;
                      font-size: 14px;
                    }
                    .countdown {
                      font-size: 32px;
                      font-weight: bold;
                      color: #f59e0b;
                      text-align: center;
                      margin: 20px 0;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1>⏰ Rappel d'Expiration</h1>
                    <p style="margin: 10px 0; font-size: 18px;">Votre abonnement expire bientôt</p>
                  </div>
                  <div class="content">
                    <p>Bonjour ${userName},</p>
                    
                    <div class="countdown">
                      7 JOURS
                    </div>
                    
                    <p style="text-align: center; font-size: 16px;">
                      Votre abonnement <strong>${subscription.plan_type}</strong> expire le <strong>${expirationDate.toLocaleDateString('fr-FR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong>.
                    </p>
                    
                    <div class="warning-box">
                      <strong>⚠️ Que se passera-t-il après l'expiration ?</strong>
                      <ul style="margin: 10px 0;">
                        <li>Retour au compte gratuit avec limitations</li>
                        <li>Perte de la visibilité premium de votre profil</li>
                        <li>Accès restreint aux conversations</li>
                        <li>Limite quotidienne sur les matches</li>
                      </ul>
                    </div>
                    
                    <div class="offer-box">
                      <h2 style="margin-top: 0;">🎁 Offre Exclusive de Renouvellement</h2>
                      <p style="font-size: 18px; margin: 15px 0;">
                        Renouvelez maintenant et bénéficiez de
                      </p>
                      <div class="discount-badge">
                        -${discountPercent}% DE RÉDUCTION
                      </div>
                      <p style="margin: 20px 0;">
                        Utilisez le code promo ci-dessous lors du renouvellement
                      </p>
                      <div class="promo-code">
                        ${discountCode}
                      </div>
                      <p style="font-size: 14px; opacity: 0.9; margin-top: 15px;">
                        ⏰ Offre valable jusqu'au ${expirationDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    
                    <div class="features-list">
                      <strong>✨ Continuez à profiter de :</strong>
                      <ul>
                        <li>🔍 <strong>Matches illimités</strong> - Explorez sans limites</li>
                        <li>💬 <strong>Conversations prioritaires</strong> - Réponses plus rapides</li>
                        <li>👀 <strong>Visibilité maximale</strong> - Profil mis en avant</li>
                        <li>🎯 <strong>Algorithme premium</strong> - Meilleurs matchs</li>
                        <li>👨‍👩‍👧 <strong>Implication familiale</strong> - Outils pour le wali</li>
                        <li>🔒 <strong>Sécurité renforcée</strong> - Vérifications avancées</li>
                      </ul>
                    </div>
                    
                    <center>
                      <a href="https://mariage-halal.com/settings?renew=true&code=${discountCode}" class="button">
                        🎯 Renouveler maintenant avec -${discountPercent}%
                      </a>
                    </center>
                    
                    <p style="margin-top: 30px; padding: 15px; background: white; border-radius: 6px; border-left: 4px solid #10b981;">
                      <strong>💡 Le saviez-vous ?</strong><br>
                      Les membres premium ont <strong>3x plus de chances</strong> de trouver leur moitié grâce à notre algorithme de matching avancé et à la visibilité accrue de leur profil.
                    </p>
                    
                    <p>Vous avez des questions ? Notre équipe est disponible pour vous accompagner.</p>
                    
                    <p>Qu'Allah facilite votre recherche,<br>
                    <strong>L'équipe Mariage Halal</strong></p>
                  </div>
                  <div class="footer">
                    <p><strong>Besoin d'aide ?</strong> Contactez-nous à support@mariage-halal.com</p>
                    <p style="margin-top: 10px; font-size: 12px;">
                      Vous recevez cet email car votre abonnement expire bientôt.<br>
                      Mariage Halal - Plateforme de rencontres conformes aux valeurs islamiques
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`Reminder email sent to ${userEmail}:`, emailResponse);
          results.emailsSent++;
        } catch (emailError: any) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          results.errors.push(`Email failed for ${userEmail}: ${emailError.message}`);
        }
      } catch (subscriptionError: any) {
        console.error(`Error processing subscription ${subscription.id}:`, subscriptionError);
        results.errors.push(`Processing failed for ${subscription.id}: ${subscriptionError.message}`);
      }
    }

    console.log('Reminder process completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription reminder process completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Critical error in remind-expiring-subscriptions function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
