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
    console.log('Starting 1-day final reminder process...');

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

    // Calculate date range for subscriptions expiring in 1 day (tomorrow)
    const now = new Date();
    const oneDayFromNow = new Date(now);
    oneDayFromNow.setDate(oneDayFromNow.getDate() + 1);
    
    const startOfDay = new Date(oneDayFromNow);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(oneDayFromNow);
    endOfDay.setHours(23, 59, 59, 999);

    console.log(`Searching for subscriptions expiring tomorrow: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`);

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

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring tomorrow`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No subscriptions expiring tomorrow',
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
        console.log(`Processing final reminder for subscription ${subscription.id}`);

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
        const hoursLeft = Math.ceil((expirationDate.getTime() - Date.now()) / (1000 * 60 * 60));
        
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
            subject: '🚨 DERNIÈRE CHANCE - Votre abonnement expire DEMAIN !',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <meta charset="utf-8">
                  <style>
                    @keyframes blink {
                      0%, 50%, 100% { opacity: 1; }
                      25%, 75% { opacity: 0.3; }
                    }
                    @keyframes shake {
                      0%, 100% { transform: translateX(0); }
                      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                      20%, 40%, 60%, 80% { transform: translateX(5px); }
                    }
                    @keyframes countdown-pulse {
                      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
                      50% { transform: scale(1.05); box-shadow: 0 0 20px 10px rgba(239, 68, 68, 0); }
                    }
                    body {
                      font-family: Arial, sans-serif;
                      line-height: 1.6;
                      color: #333;
                      max-width: 600px;
                      margin: 0 auto;
                      padding: 20px;
                    }
                    .header {
                      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                      color: white;
                      padding: 35px;
                      border-radius: 10px 10px 0 0;
                      text-align: center;
                      position: relative;
                      border: 3px solid #7f1d1d;
                    }
                    .alert-badge {
                      display: inline-block;
                      background: #fef3c7;
                      color: #991b1b;
                      padding: 8px 20px;
                      border-radius: 20px;
                      font-weight: bold;
                      font-size: 14px;
                      margin-bottom: 15px;
                      animation: blink 2s infinite;
                    }
                    .content {
                      background: #f9fafb;
                      padding: 30px;
                      border-radius: 0 0 10px 10px;
                      border: 3px solid #dc2626;
                      border-top: none;
                    }
                    .critical-banner {
                      background: linear-gradient(135deg, #7f1d1d 0%, #450a0a 100%);
                      color: white;
                      padding: 25px;
                      margin: 25px 0;
                      border-radius: 8px;
                      text-align: center;
                      font-size: 22px;
                      font-weight: bold;
                      animation: shake 3s infinite;
                      border: 3px solid #991b1b;
                    }
                    .countdown-container {
                      background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
                      padding: 30px;
                      margin: 30px 0;
                      border-radius: 12px;
                      border: 3px solid #ef4444;
                    }
                    .countdown {
                      display: flex;
                      justify-content: center;
                      gap: 15px;
                      margin: 20px 0;
                    }
                    .countdown-item {
                      background: white;
                      padding: 25px 20px;
                      border-radius: 12px;
                      text-align: center;
                      box-shadow: 0 8px 16px rgba(220, 38, 38, 0.3);
                      border: 4px solid #dc2626;
                      animation: countdown-pulse 2s infinite;
                      min-width: 80px;
                    }
                    .countdown-number {
                      font-size: 56px;
                      font-weight: bold;
                      color: #dc2626;
                      line-height: 1;
                      text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
                    }
                    .countdown-label {
                      font-size: 14px;
                      color: #991b1b;
                      margin-top: 8px;
                      text-transform: uppercase;
                      font-weight: bold;
                    }
                    .offer-box {
                      background: linear-gradient(135deg, #10b981 0%, #047857 100%);
                      color: white;
                      padding: 30px;
                      margin: 25px 0;
                      border-radius: 10px;
                      text-align: center;
                      border: 3px solid #059669;
                    }
                    .promo-code {
                      background: #fef3c7;
                      color: #991b1b;
                      padding: 20px 35px;
                      border-radius: 10px;
                      font-family: monospace;
                      font-size: 28px;
                      font-weight: bold;
                      margin: 20px 0;
                      border: 4px dashed #dc2626;
                      display: inline-block;
                      animation: countdown-pulse 2s infinite;
                    }
                    .button {
                      display: inline-block;
                      background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%);
                      color: white;
                      padding: 22px 50px;
                      text-decoration: none;
                      border-radius: 10px;
                      margin: 20px 0;
                      font-weight: bold;
                      font-size: 20px;
                      box-shadow: 0 8px 20px rgba(220, 38, 38, 0.5);
                      border: 3px solid #7f1d1d;
                      animation: countdown-pulse 3s infinite;
                    }
                    .loss-list {
                      background: #fee2e2;
                      border-left: 6px solid #dc2626;
                      padding: 25px;
                      margin: 25px 0;
                      border-radius: 8px;
                    }
                    .loss-list li {
                      margin: 12px 0;
                      color: #7f1d1d;
                      font-weight: 500;
                      font-size: 15px;
                    }
                    .footer {
                      text-align: center;
                      margin-top: 30px;
                      padding-top: 20px;
                      border-top: 2px solid #e5e7eb;
                      color: #6b7280;
                      font-size: 14px;
                    }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="alert-badge">
                      🚨 ALERTE CRITIQUE 🚨
                    </div>
                    <h1 style="margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">
                      ⏰ DERNIÈRE CHANCE ⏰
                    </h1>
                    <p style="margin: 15px 0; font-size: 18px; font-weight: bold;">
                      Votre abonnement expire DEMAIN à minuit !
                    </p>
                  </div>
                  <div class="content">
                    <p style="font-size: 16px;">Bonjour ${userName},</p>
                    
                    <div class="critical-banner">
                      🔴 C'EST VOTRE DERNIÈRE JOURNÉE ! 🔴
                    </div>
                    
                    <div class="countdown-container">
                      <p style="text-align: center; font-size: 20px; font-weight: bold; color: #991b1b; margin: 0 0 15px 0;">
                        ⏱️ TEMPS RESTANT AVANT EXPIRATION ⏱️
                      </p>
                      <div class="countdown">
                        <div class="countdown-item">
                          <div class="countdown-number">1</div>
                          <div class="countdown-label">Jour</div>
                        </div>
                        <div class="countdown-item">
                          <div class="countdown-number">${hoursLeft}</div>
                          <div class="countdown-label">Heures</div>
                        </div>
                      </div>
                      <p style="text-align: center; font-size: 16px; font-weight: bold; color: #991b1b; margin: 15px 0 0 0;">
                        Expiration : <span style="color: #7f1d1d;">${expirationDate.toLocaleDateString('fr-FR', { 
                          weekday: 'long',
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</span>
                      </p>
                    </div>
                    
                    <div class="loss-list">
                      <p style="font-size: 18px; font-weight: bold; color: #991b1b; margin: 0 0 15px 0; text-align: center;">
                        🚨 DEMAIN, VOUS PERDREZ TOUT 🚨
                      </p>
                      <ul style="margin: 15px 0;">
                        <li>❌ <strong>Fini les matches illimités</strong> - Retour à 5 par jour seulement</li>
                        <li>❌ <strong>Votre profil disparaît</strong> - Visibilité minimale dans les recherches</li>
                        <li>❌ <strong>Plus de conversations prioritaires</strong> - Vous attendrez comme tout le monde</li>
                        <li>❌ <strong>Adieu l'algorithme premium</strong> - Matchs de qualité très réduite</li>
                        <li>❌ <strong>Support standard uniquement</strong> - Plus d'assistance rapide</li>
                        <li>❌ <strong>Toutes vos statistiques premium</strong> - Accès restreint à vos données</li>
                      </ul>
                      <p style="text-align: center; font-size: 16px; font-weight: bold; color: #7f1d1d; margin: 20px 0 0 0;">
                        ⚠️ NE LAISSEZ PAS TOUT ÇA PARTIR ! ⚠️
                      </p>
                    </div>
                    
                    <div class="offer-box">
                      <h2 style="margin-top: 0; font-size: 28px;">🎁 OFFRE DE DERNIÈRE MINUTE</h2>
                      <p style="font-size: 20px; margin: 20px 0;">
                        <strong>DERNIÈRE OCCASION</strong> de profiter de
                      </p>
                      <div style="font-size: 48px; font-weight: bold; margin: 20px 0; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">
                        -${discountPercent}%
                      </div>
                      <p style="font-size: 18px; margin: 20px 0;">
                        Copiez ce code maintenant :
                      </p>
                      <div class="promo-code">
                        ${discountCode}
                      </div>
                      <p style="font-size: 16px; margin-top: 20px; background: rgba(255,255,255,0.2); padding: 15px; border-radius: 6px;">
                        ⏰ <strong>Cette offre expire en même temps que votre abonnement !</strong><br>
                        Demain à minuit, elle disparaît pour toujours.
                      </p>
                    </div>
                    
                    <center>
                      <a href="https://mariage-halal.com/settings?renew=true&code=${discountCode}&urgent=lastday" class="button">
                        🔥 RENOUVELER IMMÉDIATEMENT 🔥
                      </a>
                    </center>
                    
                    <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 25px; border-radius: 10px; margin: 30px 0; border: 3px solid #f59e0b; text-align: center;">
                      <p style="font-size: 18px; font-weight: bold; color: #78350f; margin: 0 0 15px 0;">
                        ⚡ STATISTIQUE CHOC ⚡
                      </p>
                      <p style="font-size: 16px; color: #92400e; margin: 0;">
                        <strong>87% des membres</strong> qui laissent expirer leur abonnement premium <strong>le regrettent dans les 48h</strong> et reviennent... mais à un prix plus élevé ! 😱
                      </p>
                    </div>
                    
                    <div style="background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 3px solid #dc2626;">
                      <p style="font-size: 18px; font-weight: bold; color: #991b1b; text-align: center; margin: 0 0 15px 0;">
                        💬 Témoignage d'un ancien utilisateur
                      </p>
                      <p style="margin: 0; font-size: 15px; font-style: italic; color: #374151;">
                        "J'ai laissé mon abonnement expirer en pensant le reprendre plus tard. Grosse erreur ! J'ai perdu plusieurs conversations prometteuses et mon profil est devenu invisible. J'ai dû reprendre à plein tarif..."
                      </p>
                      <p style="text-align: right; color: #6b7280; font-size: 13px; margin: 10px 0 0 0;">
                        - Karim, 32 ans
                      </p>
                    </div>
                    
                    <div style="background: #7f1d1d; color: white; padding: 25px; border-radius: 8px; text-align: center; font-size: 17px; font-weight: bold;">
                      ⚠️ C'EST MAINTENANT OU JAMAIS ! ⚠️<br>
                      <span style="font-size: 15px; font-weight: normal; opacity: 0.9;">
                        Dans 24 heures, il sera trop tard.
                      </span>
                    </div>
                    
                    <p style="margin-top: 30px;">
                      Une question ? Notre équipe est disponible <strong>24/7</strong> pour vous aider à renouveler.
                    </p>
                    
                    <p>Ne laissez pas passer cette chance,<br>
                    <strong>L'équipe Mariage Halal</strong></p>
                  </div>
                  <div class="footer">
                    <p style="color: #dc2626; font-weight: bold; font-size: 16px;">
                      🚨 SUPPORT URGENT 24/7 : support@mariage-halal.com
                    </p>
                    <p style="margin-top: 15px; font-size: 12px;">
                      Ceci est votre dernier rappel. Votre abonnement expire demain.
                    </p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`Final reminder email sent to ${userEmail}:`, emailResponse);
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

    console.log('Final reminder process completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Final reminder process completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Critical error in remind-expiring-1day function:', error);
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
