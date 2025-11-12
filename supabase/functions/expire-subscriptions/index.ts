import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';

const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExpiredSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  expires_at: string;
  profiles: {
    full_name: string;
    email?: string;
  } | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting subscription expiration process...');

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

    // Find all active subscriptions that have expired
    const { data: expiredSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(`
        id,
        user_id,
        plan_type,
        expires_at,
        profiles!inner(full_name)
      `)
      .eq('status', 'active')
      .lt('expires_at', new Date().toISOString())
      .not('expires_at', 'is', null);

    if (fetchError) {
      console.error('Error fetching expired subscriptions:', fetchError);
      throw fetchError;
    }

    console.log(`Found ${expiredSubscriptions?.length || 0} expired subscriptions`);

    if (!expiredSubscriptions || expiredSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({ 
          message: 'No expired subscriptions found',
          count: 0 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const results = {
      total: expiredSubscriptions.length,
      expired: 0,
      emailsSent: 0,
      errors: [] as string[],
    };

    // Process each expired subscription
    for (const subscription of expiredSubscriptions as ExpiredSubscription[]) {
      try {
        console.log(`Processing subscription ${subscription.id} for user ${subscription.user_id}`);

        // Update subscription status to expired
        const { error: updateError } = await supabaseAdmin
          .from('subscriptions')
          .update({ status: 'expired' })
          .eq('id', subscription.id);

        if (updateError) {
          console.error(`Error updating subscription ${subscription.id}:`, updateError);
          results.errors.push(`Failed to update ${subscription.id}: ${updateError.message}`);
          continue;
        }

        results.expired++;
        console.log(`Subscription ${subscription.id} marked as expired`);

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

        // Send expiration notification email
        try {
          const emailResponse = await resend.emails.send({
            from: 'Mariage Halal <onboarding@resend.dev>',
            to: [userEmail],
            subject: 'Votre abonnement a expiré - Mariage Halal',
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
                      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
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
                    .info-box {
                      background: white;
                      border-left: 4px solid #f59e0b;
                      padding: 15px;
                      margin: 20px 0;
                      border-radius: 4px;
                    }
                    .button {
                      display: inline-block;
                      background: #10b981;
                      color: white;
                      padding: 12px 30px;
                      text-decoration: none;
                      border-radius: 6px;
                      margin: 20px 0;
                      font-weight: bold;
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
                    <h1>📋 Votre abonnement a expiré</h1>
                  </div>
                  <div class="content">
                    <p>Bonjour ${userName},</p>
                    
                    <p>Votre abonnement <strong>${subscription.plan_type}</strong> est arrivé à expiration le <strong>${new Date(subscription.expires_at).toLocaleDateString('fr-FR', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</strong>.</p>
                    
                    <div class="info-box">
                      <strong>⚠️ Limitations du compte gratuit :</strong>
                      <ul>
                        <li>Nombre de conversations limitées par jour</li>
                        <li>Accès restreint aux fonctionnalités premium</li>
                        <li>Visibilité réduite de votre profil</li>
                      </ul>
                    </div>
                    
                    <p>Pour continuer à profiter de tous les avantages et augmenter vos chances de trouver votre moitié, nous vous invitons à renouveler votre abonnement.</p>
                    
                    <center>
                      <a href="https://mariage-halal.com/settings" class="button">
                        ✨ Renouveler mon abonnement
                      </a>
                    </center>
                    
                    <p>Notre équipe reste à votre disposition pour toute question.</p>
                    
                    <p>Qu'Allah facilite votre recherche,<br>
                    <strong>L'équipe Mariage Halal</strong></p>
                  </div>
                  <div class="footer">
                    <p>Cet email a été envoyé automatiquement. Pour toute question, contactez-nous à support@mariage-halal.com</p>
                  </div>
                </body>
              </html>
            `,
          });

          console.log(`Email sent to ${userEmail}:`, emailResponse);
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

    console.log('Expiration process completed:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Subscription expiration process completed',
        results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Critical error in expire-subscriptions function:', error);
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
