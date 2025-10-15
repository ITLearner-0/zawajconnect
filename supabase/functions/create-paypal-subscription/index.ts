import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-PAYPAL-SUBSCRIPTION] ${step}${detailsStr}`);
};

// Get PayPal access token
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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    logStep("Function started");
    
    const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    
    if (!clientId || !clientSecret) {
      throw new Error("PayPal credentials not configured");
    }
    logStep("PayPal credentials loaded");

    const { planId } = await req.json();
    if (!planId) {
      throw new Error("Plan ID is required");
    }
    logStep("Plan ID received", { planId });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, emailDomain: user.email.split('@')[1] });

    // Map plan IDs to PayPal plan IDs (these need to be created in PayPal dashboard first)
    const paypalPlanIds: { [key: string]: string } = {
      '3_months': Deno.env.get("PAYPAL_PLAN_3_MONTHS") || "",
      '6_months': Deno.env.get("PAYPAL_PLAN_6_MONTHS") || "",
      '12_months': Deno.env.get("PAYPAL_PLAN_12_MONTHS") || "",
    };

    const paypalPlanId = paypalPlanIds[planId];
    if (!paypalPlanId) {
      throw new Error(`Invalid plan ID: ${planId}`);
    }

    const accessToken = await getPayPalAccessToken(clientId, clientSecret);
    logStep("PayPal access token obtained");

    const origin = req.headers.get("origin") || "http://localhost:3000";

    // Create PayPal subscription
    const subscriptionResponse = await fetch("https://api-m.paypal.com/v1/billing/subscriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plan_id: paypalPlanId,
        subscriber: {
          email_address: user.email,
        },
        application_context: {
          brand_name: "Mariage Halal",
          locale: "fr-FR",
          shipping_preference: "NO_SHIPPING",
          user_action: "SUBSCRIBE_NOW",
          return_url: `${origin}/subscription-success`,
          cancel_url: `${origin}/subscription-canceled`,
        },
      }),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      logStep("PayPal API error", { status: subscriptionResponse.status, error: errorText });
      throw new Error(`PayPal API error: ${subscriptionResponse.statusText}`);
    }

    const subscription = await subscriptionResponse.json();
    logStep("PayPal subscription created", { subscriptionId: subscription.id });

    // Find the approval URL
    const approvalLink = subscription.links.find((link: any) => link.rel === "approve");
    if (!approvalLink) {
      throw new Error("No approval link found in PayPal response");
    }

    return new Response(JSON.stringify({ url: approvalLink.href }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-paypal-subscription", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Failed to create PayPal subscription" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
