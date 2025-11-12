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

    console.log(
      `Searching for subscriptions expiring between ${startOfDay.toISOString()} and ${endOfDay.toISOString()}`
    );

    // Find all active subscriptions expiring in exactly 7 days
    const { data: expiringSubscriptions, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select(
        `
        id,
        user_id,
        plan_type,
        expires_at,
        granted_at,
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

    console.log(`Found ${expiringSubscriptions?.length || 0} subscriptions expiring in 7 days`);

    if (!expiringSubscriptions || expiringSubscriptions.length === 0) {
      return new Response(
        JSON.stringify({
          message: 'No subscriptions expiring in 7 days',
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

    // Process each expiring subscription
    for (const subscription of expiringSubscriptions as ExpiringSubscription[]) {
      try {
        console.log(
          `Processing reminder for subscription ${subscription.id} for user ${subscription.user_id}`
        );

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

        // Select A/B test variant
        const variant = await selectABVariant(supabaseAdmin, '7days');

        if (!variant) {
          console.warn('No A/B variant found, skipping email for', subscription.id);
          results.errors.push(`No A/B variant configured for 7days reminder`);
          continue;
        }

        console.log(`Using A/B variant: ${variant.variant_name} for user ${subscription.user_id}`);

        // Track email about to be sent
        const trackingId = await trackEmailSent(supabaseAdmin, variant.ab_test_id, {
          userName,
          expirationDate,
          planType: subscription.plan_type,
          daysUntilExpiry: 7,
          subscriptionId: subscription.id,
          userId: subscription.user_id,
        });

        if (!trackingId) {
          console.warn('Failed to create tracking record');
        }

        // Generate email HTML with A/B variant
        const emailHTML = generateEmailHTML(
          variant,
          {
            userName,
            expirationDate,
            planType: subscription.plan_type,
            daysUntilExpiry: 7,
            subscriptionId: subscription.id,
            userId: subscription.user_id,
          },
          trackingId || 'no-track'
        );

        // Send email
        try {
          const emailResponse = await resend.emails.send({
            from: 'Mariage Halal <onboarding@resend.dev>',
            to: [userEmail],
            subject: variant.subject_line,
            html: emailHTML,
          });

          console.log(`Reminder email sent to ${userEmail}:`, emailResponse);
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
