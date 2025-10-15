import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CHECK-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

async function getPayPalAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch("https://api-m.paypal.com/v1/oauth2/token", {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new Error(`Failed to get PayPal access token: ${response.statusText}`);
  }

  const data = await response.json();
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    logStep("Function started");

    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    logStep("PayPal credentials verified");

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");
    logStep("Authorization header found");

    const token = authHeader.replace("Bearer ", "");
    logStep("Authenticating user with token");
    
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError) throw new Error(`Authentication error: ${userError.message}`);
    const user = userData.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const accessToken = await getPayPalAccessToken(clientId, clientSecret);
    logStep("PayPal access token obtained");

    // Check if user has a subscription record in our database
    const { data: subData } = await supabaseClient
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();

    if (!subData || !subData.paypal_subscription_id) {
      logStep("No active subscription found");
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verify subscription status with PayPal
    const subscriptionResponse = await fetch(
      `https://api-m.paypal.com/v1/billing/subscriptions/${subData.paypal_subscription_id}`,
      {
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!subscriptionResponse.ok) {
      logStep("Failed to fetch PayPal subscription", { status: subscriptionResponse.status });
      return new Response(JSON.stringify({ subscribed: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const subscription = await subscriptionResponse.json();
    logStep("PayPal subscription fetched", { 
      subscriptionId: subscription.id,
      status: subscription.status 
    });

    const isActive = subscription.status === "ACTIVE";
    const planId = subscription.plan_id;
    
    // Extract next billing time
    let subscriptionEnd = null;
    if (subscription.billing_info?.next_billing_time) {
      subscriptionEnd = new Date(subscription.billing_info.next_billing_time).toISOString();
    }

    // Update local subscription status if needed
    if (!isActive && subData.status === 'active') {
      await supabaseClient
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('id', subData.id);
      logStep("Updated local subscription status to cancelled");
    }

    return new Response(JSON.stringify({
      subscribed: isActive,
      plan_id: planId,
      subscription_end: subscriptionEnd
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in check-paypal-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ 
      subscribed: false,
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200, // Return 200 with subscribed: false instead of 500
    });
  }
});
