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
      return new Response(
        JSON.stringify({ subscribed: false, plan_id: null, subscription_end: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Vérifier dans Supabase si l'utilisateur a un abonnement actif
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .eq('provider', 'braintree')
      .single();

    if (error || !subscription) {
      return new Response(
        JSON.stringify({ subscribed: false, plan_id: null, subscription_end: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Vérifier si l'abonnement n'est pas expiré
    const expiresAt = new Date(subscription.expires_at);
    const now = new Date();
    
    if (expiresAt < now) {
      // Abonnement expiré, mettre à jour le statut
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'expired' })
        .eq('id', subscription.id);

      return new Response(
        JSON.stringify({ subscribed: false, plan_id: null, subscription_end: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({
        subscribed: true,
        plan_id: subscription.plan_type,
        subscription_end: subscription.expires_at,
      }),
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
