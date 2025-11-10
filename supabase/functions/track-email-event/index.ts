import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackEventRequest {
  result_id: string;
  event_type: 'opened' | 'clicked' | 'renewed';
  renewal_amount?: number;
  promo_code_used?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Tracking email event...');

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { result_id, event_type, renewal_amount, promo_code_used }: TrackEventRequest = await req.json();

    if (!result_id || !event_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: result_id and event_type' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    console.log(`Tracking ${event_type} event for result ${result_id}`);

    // Update the appropriate field based on event type
    const updateData: any = {};
    
    if (event_type === 'opened') {
      updateData.opened_at = new Date().toISOString();
    } else if (event_type === 'clicked') {
      updateData.clicked_at = new Date().toISOString();
    } else if (event_type === 'renewed') {
      updateData.renewed_at = new Date().toISOString();
      if (renewal_amount) updateData.renewal_amount = renewal_amount;
      if (promo_code_used) updateData.promo_code_used = promo_code_used;
    }

    const { data, error } = await supabaseAdmin
      .from('email_ab_test_results')
      .update(updateData)
      .eq('id', result_id)
      .select()
      .single();

    if (error) {
      console.error('Error updating email event:', error);
      throw error;
    }

    console.log('Email event tracked successfully:', data);

    return new Response(
      JSON.stringify({
        success: true,
        message: `${event_type} event tracked successfully`,
        data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in track-email-event function:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
