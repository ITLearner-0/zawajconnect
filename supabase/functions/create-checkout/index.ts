import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[CREATE-CHECKOUT] ${step}${detailsStr}`);
};

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
    
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY not configured");
    }
    logStep("Stripe key loaded", { keyPrefix: stripeKey.substring(0, 7) });

    const { priceId } = await req.json();
    if (!priceId) {
      throw new Error("Price ID is required");
    }
    logStep("Price ID received", { priceId });

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    if (!user?.email) throw new Error("User not authenticated or email not available");
    logStep("User authenticated", { userId: user.id, email: user.email });

    const stripe = new Stripe(stripeKey, { 
      apiVersion: "2025-08-27.basil" 
    });

    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      logStep("Found existing customer", { customerId });
    } else {
      logStep("No existing customer found");
    }

    // Map price IDs to plan duration
    const priceToPlanDuration: { [key: string]: number } = {
      'price_1SEwsJKwsHyCjkzyvQfkbzxs': 3,  // Premium 3 mois
      'price_1SEwusKwsHyCjkzyNYF2O8Qx': 6,  // Premium 6 mois
      'price_1SEwy7KwsHyCjkzyZpjCkIz4': 12, // Premium 12 mois
    };

    const planDuration = priceToPlanDuration[priceId];
    const planStartDate = new Date().toISOString();
    
    const origin = req.headers.get("origin") || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      subscription_data: {
        metadata: {
          plan_duration: planDuration?.toString() || "12",
          plan_start_date: planStartDate
        }
      },
      // Enable automatic tax calculation with Stripe Tax
      automatic_tax: {
        enabled: true,
      },
      // Allow customers to provide VAT number for B2B transactions
      tax_id_collection: {
        enabled: true,
      },
      success_url: `${req.headers.get("origin")}/subscription-success`,
      cancel_url: `${req.headers.get("origin")}/settings?tab=subscription&canceled=true`,
    });

    logStep("Checkout session created", { sessionId: session.id });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR in create-checkout", { message: errorMessage });
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
