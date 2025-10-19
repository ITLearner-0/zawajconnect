import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
// @deno-types="npm:@types/braintree@3.3.11"
import braintree from "npm:braintree@3.23.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Log des headers pour debug
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    console.log('Authorization header:', authHeader ? authHeader.substring(0, 20) + '...' : 'none');
    
    if (!authHeader) {
      throw new Error('Authorization header manquant');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    console.log('Verifying JWT token...');
    // Extract JWT token from Authorization header
    const jwt = authHeader.replace('Bearer ', '');
    
    // Verify the JWT token using the service role client
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(jwt);

    console.log('User verification result:', { 
      hasUser: !!user, 
      userId: user?.id,
      error: userError?.message 
    });

    if (userError || !user) {
      console.error('JWT verification failed:', userError);
      throw new Error('Authentication invalide: ' + (userError?.message || 'Token invalide'));
    }
    
    console.log('User authenticated successfully:', user.email);

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

    console.log('Creating Braintree gateway...');
    
    // Utiliser le SDK Braintree officiel
    const gateway = new braintree.BraintreeGateway({
      environment: environment === 'production' 
        ? braintree.Environment.Production 
        : braintree.Environment.Sandbox,
      merchantId: merchantId,
      publicKey: publicKey,
      privateKey: privateKey,
    });

    console.log('Creating subscription with planId:', planId);
    
    // Créer l'abonnement
    const result = await gateway.subscription.create({
      paymentMethodNonce,
      planId,
    });

    if (!result.success) {
      console.error('Braintree error:', result.message);
      throw new Error(result.message || 'Impossible de créer l\'abonnement');
    }

    const subscription = result.subscription;

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
    console.log('Saving subscription to database...');
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

    console.log('Subscription created successfully');
    
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
