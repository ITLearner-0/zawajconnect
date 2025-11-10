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
  profiles: {
    full_name: string;
  } | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting 3-day expiration reminder process...');

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

    // Calculate date range for subscriptions expiring in 3 days
    const now = new Date();
    const threeDaysFromNow = new Date(now);
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);
    
    const startOfDay = new Date(threeDaysFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(threeDaysFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Searching for subscriptions expiring in 3 days: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

    const { data: expiringSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        expires_at,
        profiles!inner(full_name)
      `)
      .eq('status', 'active')
      .gte('expires_at', startOfDay.toISOString())
      .lte('expires_at', endOfDay.toISOString());

    if (fetchError) {
      console.error('Error fetching expiring subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring in 3 days`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No subscriptions expiring in 3 days',
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

    for (const subscription of expiringSubscriptions as ExpiringSubscription[]) {
      try {
        console.log(`Processing 3-day reminder for subscription ${subscription.id}`);

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
        
        // Determine discount code
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

        try {
          const emailResponse = await resend.emails.send({
            from: 'Mariage Halal <onboarding@resend.dev>',
            to: [userEmail],
            subject: '⚠️ Plus que 3 jours - Votre abonnement expire bientôt',
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
                      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                      color: white;
                      padding: 30px;
                      border-radius: 10px 10px 0 0;
                      text-align: center;
                      position: relative;
                      overflow: hidden;
                    }
                    .header::before {
                      content: "⚠️";
                      position: absolute;
                      font-size: 120px;
                      opacity: 0.1;
                      top: -20px;
                      right: -20px;
                    }
                    .content {
                      background: #f9fafb;
                      padding: 30px;
                      border-radius: 0 0 10px 10px;
                    }
                    .urgency-banner {
                      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                      color: white;
                      padding: 20px;
                      margin: 25px 0;
                      border-radius: 8px;
                      text-align: center;
                      font-size: 18px;
                      font-weight: bold;
                      box-shadow: 0 4px 10px rgba(239, 68, 68, 0.3);
                      animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                      0%, 100% { transform: scale(1); }
                      50% { transform: scale(1.02); }
                    }
                    .countdown {
                      display: flex;
                      justify-content: center;
                      gap: 20px;
                      margin: 30px 0;
                    }
                    .countdown-item {
                      background: white;
                      padding: 20px;
                      border-radius: 12px;
                      text-align: center;
                      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                      border: 3px solid #f97316;
                    }
                    .countdown-number {
                      font-size: 48px;
                      font-weight: bold;
                      color: #f97316;
                      line-height: 1;
                    }
                    .countdown-label {
                      font-size: 14px;
                      color: #6b7280;
                      margin-top: 5px;
                      text-transform: uppercase;
                    }
                    .offer-box {
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                      color: white;
                      padding: 25px;
                      margin: 25px 0;
                      border-radius: 8px;
                      text-align: center;
                    }
                    .promo-code {
                      background: white;
                      color: #10b981;
                      padding: 15px 30px;
                      border-radius: 8px;
                      font-family: monospace;
                      font-size: 24px;
                      font-weight: bold;
                      margin: 15px 0;
                      border: 3px dashed #10b981;
                      display: inline-block;
                    }
                    .button {
                      display: inline-block;
                      background: #f97316;
                      color: white;
                      padding: 18px 45px;
                      text-decoration: none;
                      border-radius: 8px;
                      margin: 20px 0;
                      font-weight: bold;
                      font-size: 18px;
                      box-shadow: 0 6px 12px rgba(249, 115, 22, 0.4);
                      transition: all 0.3s;
                    }
                    .warning-list {
                      background: #fef3c7;
                      border-left: 5px solid #f59e0b;
                      padding: 20px;
                      margin: 20px 0;
                      border-radius: 4px;
                    }
                    .warning-list li {
                      margin: 8px 0;
                      color: #78350f;
                    }
                    .footer {
                      text-align: center;
                      margin-top: 30px;
                      padding-top: 20px;
                      border-top: 1px solid #e5e7eb;
                      color: #6b7280;
                      font-size: 14px;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <h1 style="margin: 0; font-size: 28px;">⚠️ Rappel Urgent</h1>
                    <p style="margin: 10px 0; font-size: 16px; opacity: 0.9;">
                      Votre abonnement expire très bientôt
                    </p>
                  </div>
                  <div class="content">
                    <p>Bonjour ${userName},</p>
                    
                    <div class="urgency-banner">
                      ⏰ ATTENTION : PLUS QUE 3 JOURS ! ⏰
                    </div>
                    
                    <div class="countdown">
                      <div class="countdown-item">
                        <div class="countdown-number">3</div>
                        <div class="countdown-label">Jours</div>
                      </div>
                      <div class="countdown-item">
                        <div class="countdown-number">72</div>
                        <div class="countdown-label">Heures</div>
                      </div>
                    </div>
                    
                    <p style="text-align: center; font-size: 17px; font-weight: 500;">
                      Votre abonnement <strong>${subscription.plan_type}</strong> expire le 
                      <strong style="color: #f97316;">${expirationDate.toLocaleDateString('fr-FR', { 
                        weekday: 'long',
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}</strong>
                    </p>
                    
                    <div class="warning-list">
                      <strong style="font-size: 16px;">⚠️ Dans 3 jours, vous perdrez :</strong>
                      <ul style="margin: 15px 0 10px 0;">
                        <li><strong>❌ Matches illimités</strong> → Retour à 5 matches/jour maximum</li>
                        <li><strong>❌ Visibilité premium</strong> → Votre profil sera moins visible</li>
                        <li><strong>❌ Conversations prioritaires</strong> → Délais de réponse plus longs</li>
                        <li><strong>❌ Algorithme avancé</strong> → Moins de compatibilité</li>
                        <li><strong>❌ Support prioritaire</strong> → Assistance standard uniquement</li>
                      </ul>
                    </div>
                    
                    <div class="offer-box">
                      <h2 style="margin-top: 0; font-size: 24px;">🎁 Votre Offre Exclusive est Toujours Valable</h2>
                      <p style="font-size: 18px; margin: 15px 0;">
                        Renouvelez maintenant et profitez de
                      </p>
                      <div style="font-size: 36px; font-weight: bold; margin: 15px 0;">
                        -${discountPercent}% DE RÉDUCTION
                      </div>
                      <p style="margin: 20px 0;">
                        Code promo à utiliser :
                      </p>
                      <div class="promo-code">
                        ${discountCode}
                      </div>
                      <p style="font-size: 14px; opacity: 0.9; margin-top: 15px;">
                        ⏰ Offre valable jusqu'au ${expirationDate.toLocaleDateString('fr-FR')} - Plus que 3 jours !
                      </p>
                    </div>
                    
                    <center>
                      <a href="https://mariage-halal.com/settings?renew=true&code=${discountCode}&urgent=3days" class="button">
                        🚀 Renouveler Maintenant (-${discountPercent}%)
                      </a>
                    </center>
                    
                    <div style="background: white; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #10b981;">
                      <p style="margin: 0; font-size: 15px;">
                        <strong>💡 Témoignage récent :</strong><br>
                        <em>"Grâce à l'abonnement premium, j'ai trouvé mon épouse en seulement 2 mois. L'algorithme de matching est vraiment efficace !"</em><br>
                        <span style="color: #6b7280; font-size: 13px;">- Ahmed, membre premium depuis 6 mois</span>
                      </p>
                    </div>
                    
                    <p style="background: #fee2e2; padding: 15px; border-radius: 6px; border-left: 4px solid #ef4444;">
                      <strong style="color: #991b1b;">⚠️ Rappel Important :</strong><br>
                      <span style="color: #7f1d1d;">Sans renouvellement, votre accès premium prendra fin automatiquement dans 3 jours. N'attendez pas le dernier moment !</span>
                    </p>
                    
                    <p>Des questions ? Notre équipe est disponible pour vous accompagner.</p>
                    
                    <p>Qu'Allah facilite votre recherche,<br>
                    <strong>L'équipe Mariage Halal</strong></p>
                  </div>
                  <div class="footer">
                    <p><strong>Besoin d'aide ?</strong> Contactez-nous à support@mariage-halal.com</p>
                    <p style="margin-top: 10px; font-size: 12px;">
                      Vous recevez cet email car votre abonnement expire dans 3 jours.
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`3-day reminder email sent to ${userEmail}:`, emailResponse);
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

    console.log('3-day reminder process completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: '3-day reminder process completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Critical error in remind-expiring-3days function:', error);
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
