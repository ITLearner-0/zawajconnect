import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { planId, userId } = await req.json();

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get Stripe secret key from environment variables
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      return new Response(JSON.stringify({ error: 'Stripe not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Define subscription plans
    const plans = {
      premium: {
        priceId: 'price_premium_monthly', // Replace with your actual Stripe price ID
        name: 'Premium',
        amount: 1999, // €19.99 in cents
      },
      family_plus: {
        priceId: 'price_family_plus_monthly', // Replace with your actual Stripe price ID
        name: 'Famille+',
        amount: 3999, // €39.99 in cents
      },
    };

    const selectedPlan = plans[planId as keyof typeof plans];
    if (!selectedPlan) {
      return new Response(JSON.stringify({ error: 'Invalid plan selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create Stripe checkout session
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        success_url: `${req.headers.get('origin')}/dashboard?success=true&plan=${planId}`,
        cancel_url: `${req.headers.get('origin')}/settings?canceled=true`,
        'payment_method_types[0]': 'card',
        mode: 'subscription',
        'line_items[0][price]': selectedPlan.priceId,
        'line_items[0][quantity]': '1',
        customer_email: user.email || '',
        'metadata[user_id]': user.id,
        'metadata[plan_id]': planId,
        'subscription_data[metadata][user_id]': user.id,
        'subscription_data[metadata][plan_id]': planId,
        allow_promotion_codes: 'true',
        billing_address_collection: 'auto',
        customer_creation: 'always',
      }),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe API error:', error);
      return new Response(JSON.stringify({ error: 'Failed to create checkout session' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const session = await stripeResponse.json();

    // Log the subscription attempt
    await supabaseClient.from('subscription_logs').insert({
      user_id: user.id,
      plan_id: planId,
      stripe_session_id: session.id,
      amount: selectedPlan.amount,
      status: 'pending',
    });

    return new Response(
      JSON.stringify({
        url: session.url,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
