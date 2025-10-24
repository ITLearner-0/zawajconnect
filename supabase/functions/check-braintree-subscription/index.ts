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
    // Utiliser le SERVICE_ROLE_KEY pour avoir accès aux opérations admin
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    console.log('🔍 Utilisateur authentifié:', user?.id, user?.email);

    if (!user) {
      console.log('❌ Aucun utilisateur authentifié');
      return new Response(
        JSON.stringify({ subscribed: false, plan_id: null, subscription_end: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    // Vérifier dans Supabase si l'utilisateur a un abonnement actif
    // On vérifie TOUS les abonnements actifs (manuels, Braintree, etc.)
    console.log('🔍 Recherche d\'abonnement pour user_id:', user.id);
    
    const { data: subscription, error } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    console.log('📊 Résultat de la requête:', { subscription, error });

    if (error) {
      console.error('❌ Erreur lors de la requête:', error);
      return new Response(
        JSON.stringify({ subscribed: false, plan_id: null, subscription_end: null }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    if (!subscription) {
      console.log('❌ Aucun abonnement trouvé');
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

    const response = {
      subscribed: true,
      plan_id: subscription.plan_type,
      subscription_end: subscription.expires_at,
    };
    
    console.log('✅ Abonnement trouvé:', response);
    
    return new Response(
      JSON.stringify(response),
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
