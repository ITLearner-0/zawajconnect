import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { Resend } from 'npm:resend@2.0.0';
import { selectABVariant, trackEmailSent, generateEmailHTML } from '../_shared/email-ab-helper.ts';

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

    console.log(
      `Searching for subscriptions expiring tomorrow: ${startOfDay.toISOString()} to ${endOfDay.toISOString()}`
    );

    const { data: expiringSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(
        `
        id,
        user_id,
        plan_type,
        expires_at,
        profiles!inner(full_name)
      `
      )
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
          count: 0,
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

        // Select A/B test variant
        const variant = await selectABVariant(supabaseAdmin, '1day');

        if (!variant) {
          console.warn('No A/B variant found, skipping email for', subscription.id);
          results.errors.push(`No A/B variant configured for 1day reminder`);
          continue;
        }

        console.log(`Using A/B variant: ${variant.variant_name} for user ${subscription.user_id}`);

        // Track email
        const trackingId = await trackEmailSent(supabaseAdmin, variant.ab_test_id, {
          userName,
          expirationDate,
          planType: subscription.plan_type,
          daysUntilExpiry: 1,
          subscriptionId: subscription.id,
          userId: subscription.user_id,
        });

        // Generate email HTML
        const emailHTML = generateEmailHTML(
          variant,
          {
            userName,
            expirationDate,
            planType: subscription.plan_type,
            daysUntilExpiry: 1,
            subscriptionId: subscription.id,
            userId: subscription.user_id,
          },
          trackingId || 'no-track'
        );

        try {
          const emailResponse = await resend.emails.send({
            from: 'Mariage Halal <onboarding@resend.dev>',
            to: [userEmail],
            subject: variant.subject_line,
            html: emailHTML,
          });

          console.log(`Final reminder email sent to ${userEmail}:`, emailResponse);
          results.emailsSent++;
        } catch (emailError: any) {
          console.error(`Error sending email to ${userEmail}:`, emailError);
          results.errors.push(`Email failed for ${userEmail}: ${emailError.message}`);
        }
      } catch (subscriptionError: any) {
        console.error(`Error processing subscription ${subscription.id}:`, subscriptionError);
        results.errors.push(
          `Processing failed for ${subscription.id}: ${subscriptionError.message}`
        );
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
