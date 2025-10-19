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
    // Vérifier la présence du header Authorization
    const authHeader = req.headers.get('Authorization');
    console.log('Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      throw new Error('Authorization header manquant');
    }

    // Extraire le token du header Bearer
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted:', !!token);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Passer le token explicitement à getUser()
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser(token);

    console.log('User retrieved:', !!user, 'Error:', userError);

    if (userError || !user) {
      throw new Error(`Authentification échouée: ${userError?.message || 'Utilisateur non trouvé'}`);
    }

    const merchantId = Deno.env.get('BRAINTREE_MERCHANT_ID');
    const publicKey = Deno.env.get('BRAINTREE_PUBLIC_KEY');
    const privateKey = Deno.env.get('BRAINTREE_PRIVATE_KEY');
    const environment = Deno.env.get('BRAINTREE_ENVIRONMENT') || 'sandbox';

    if (!merchantId || !publicKey || !privateKey) {
      throw new Error('Configuration Braintree manquante');
    }

    const auth = btoa(`${publicKey}:${privateKey}`);
    
    // Générer le client token sans customerId pour simplifier
    const braintreeUrl = environment === 'production'
      ? `https://api.braintreegateway.com/merchants/${merchantId}/client_token`
      : `https://api.sandbox.braintreegateway.com/merchants/${merchantId}/client_token`;

    const response = await fetch(braintreeUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clientToken: {}
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur Braintree:', errorText);
      throw new Error(`Erreur Braintree: ${response.status}`);
    }

    const data = await response.json();

    return new Response(
      JSON.stringify({ clientToken: data.clientToken.value }),
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
