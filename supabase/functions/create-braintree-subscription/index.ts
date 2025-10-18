import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error('Non authentifié');
    }

    const { paymentMethodNonce, planId } = await req.json();

    if (!paymentMethodNonce || !planId) {
      throw new Error('Données manquantes');
    }

    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');
    const environment = Deno.env.get('BRAINTREE_ENVIRONMENT') || 'sandbox';

    if (!merchantId || !publicKey || !privateKey) {
      throw new Error('Configuration Braintree manquante');
    }

    const braintreeUrl = environment === 'production'
      ? `https://api.braintreegateway.com/merchants/${merchantId}/subscriptions`
      : `https://api.sandbox.braintreegateway.com/merchants/${merchantId}/subscriptions`;

    const auth = btoa(`${publicKey}:${privateKey}`);

    const response = await fetch(braintreeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        subscription: {
          paymentMethodNonce,
          planId,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Braintree:', errorText);
      throw new Error('Impossible de créer l\'abonnement');
    }

    const data = await response.json();
    const subscription = data.subscription;

    // Calculer la date d'expiration
    let expiresAt = new Date();
    if (planId.includes('3_months')) {
      expiresAt.setMonth(expiresAt.getMonth() + 3);
    } else if (planId.includes('6_months')) {
      expiresAt.setMonth(expiresAt.getMonth() + 6);
    } else if (planId.includes('12_months')) {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    // Enregistrer l'abonnement dans Supabase
    const { error: dbError } = await supabaseClient
      .from('subscriptions')
      .upsert({
        user_id: user.id,
        plan_type: planId.includes('12_months') ? '12_months' : 
                   planId.includes('6_months') ? '6_months' : '3_months',
        status: 'active',
        provider: 'braintree',
        provider_subscription_id: subscription.id,
        expires_at: expiresAt.toISOString(),
      });

    if (dbError) {
      console.error('Erreur DB:', dbError);
      throw new Error('Erreur lors de l\'enregistrement');
    }

    return new Response(
      JSON.stringify({ success: true, subscription }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
