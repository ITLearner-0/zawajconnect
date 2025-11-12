import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
// @deno-types="npm:@types/braintree@3.3.11"
import braintree from 'npm:braintree@3.23.0';

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

    // Récupérer l'abonnement actif
    const { data: subscription, error: subError } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('provider', 'braintree')
      .single();

    if (subError || !subscription) {
      throw new Error('Aucun abonnement actif trouvé');
    }

    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');
    const environment = Deno.env.get('BRAINTREE_ENVIRONMENT') || 'sandbox';

    if (!merchantId || !publicKey || !privateKey) {
      throw new Error('Configuration Braintree manquante');
    }

    console.log('Creating Braintree gateway...');

    // Utiliser le SDK Braintree officiel
    const gateway = new braintree.BraintreeGateway({
      environment:
        environment === 'production'
          ? braintree.Environment.Production
          : braintree.Environment.Sandbox,
      merchantId: merchantId,
      publicKey: publicKey,
      privateKey: privateKey,
    });

    console.log('Canceling subscription:', subscription.provider_subscription_id);

    // Annuler l'abonnement
    const result = await gateway.subscription.cancel(subscription.provider_subscription_id);

    if (!result.success) {
      console.error('Braintree error:', result.message);
      throw new Error(result.message || "Impossible d'annuler l'abonnement");
    }

    // Mettre à jour le statut dans Supabase
    console.log('Updating subscription status in database...');
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({ status: 'cancelled' })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Erreur DB:', updateError);
      throw new Error('Erreur lors de la mise à jour');
    }

    console.log('Subscription cancelled successfully');

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Erreur:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
