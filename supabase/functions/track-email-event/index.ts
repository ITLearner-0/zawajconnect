import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import {
  parseTrackingParams,
  validateTrackingRequest,
  type TrackingParams,
} from '../_shared/tracking-security.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackEventRequest {
  result_id: string;
  event_type: 'opened' | 'clicked' | 'renewed';
  user_id?: string;
  renewal_amount?: number;
  promo_code_used?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('🔒 Tracking email event with security validation...');

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

    // Handle GET requests (email pixel tracking with signed URLs)
    if (req.method === 'GET') {
      const url = new URL(req.url);
      const params = parseTrackingParams(url);

      if (!params) {
        return new Response(JSON.stringify({ error: 'Missing required tracking parameters' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get the user_id from the result record to validate signature
      const { data: resultData, error: fetchError } = await supabaseAdmin
        .from('email_ab_test_results')
        .select('user_id, opened_at, clicked_at')
        .eq('id', params.result_id)
        .single();

      if (fetchError || !resultData) {
        console.error('Result not found:', params.result_id);
        return new Response('Not Found', { status: 404, headers: corsHeaders });
      }

      // Validate signature and timestamp
      const validation = await validateTrackingRequest(params, resultData.user_id);
      if (!validation.valid) {
        console.error('❌ Validation failed:', validation.error);
        return new Response(JSON.stringify({ error: validation.error }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Replay attack prevention: check if already tracked
      if (params.event_type === 'opened' && resultData.opened_at) {
        console.log('⚠️ Email already opened, skipping duplicate');
        // Return success but don't update (idempotent)
        return new Response('OK', {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'image/gif' },
        });
      }

      if (params.event_type === 'clicked' && resultData.clicked_at) {
        console.log('⚠️ Already clicked, skipping duplicate');
        return new Response('OK', { status: 200, headers: corsHeaders });
      }

      // Update the record
      const updateData: any = {};
      if (params.event_type === 'opened') {
        updateData.opened_at = new Date().toISOString();
      } else if (params.event_type === 'clicked') {
        updateData.clicked_at = new Date().toISOString();
      }

      const { error: updateError } = await supabaseAdmin
        .from('email_ab_test_results')
        .update(updateData)
        .eq('id', params.result_id);

      if (updateError) {
        console.error('Error updating:', updateError);
        throw updateError;
      }

      console.log(`✅ ${params.event_type} event tracked successfully`);

      // For opened events, return 1x1 transparent GIF
      if (params.event_type === 'opened') {
        const gif = Uint8Array.from(
          atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'),
          (c) => c.charCodeAt(0)
        );
        return new Response(gif, {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        });
      }

      return new Response('OK', { status: 200, headers: corsHeaders });
    }

    // Handle POST requests (renewed events from authenticated users)
    if (req.method === 'POST') {
      // Extract JWT token
      const authHeader = req.headers.get('Authorization');
      if (!authHeader) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        console.error('❌ Authentication failed:', authError);
        return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { result_id, event_type, renewal_amount, promo_code_used }: TrackEventRequest =
        await req.json();

      if (!result_id || !event_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: result_id and event_type' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      console.log(
        `🔐 Authenticated user ${user.id} tracking ${event_type} for result ${result_id}`
      );

      // Validate user ownership of the tracking result
      const { data: resultData, error: fetchError } = await supabaseAdmin
        .from('email_ab_test_results')
        .select('user_id, clicked_at, renewed_at')
        .eq('id', result_id)
        .single();

      if (fetchError || !resultData) {
        console.error('❌ Result not found:', result_id);
        return new Response(JSON.stringify({ error: 'Tracking result not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify user owns this result
      if (resultData.user_id !== user.id) {
        console.error('❌ User does not own this tracking result');
        return new Response(
          JSON.stringify({ error: 'Unauthorized: You do not own this tracking result' }),
          {
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Replay prevention for clicked and renewed events
      if (event_type === 'clicked' && resultData.clicked_at) {
        console.log('⚠️ Click already tracked, returning success (idempotent)');
        return new Response(JSON.stringify({ success: true, message: 'Click already tracked' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      if (event_type === 'renewed' && resultData.renewed_at) {
        console.log('⚠️ Renewal already tracked, returning success (idempotent)');
        return new Response(JSON.stringify({ success: true, message: 'Renewal already tracked' }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update the appropriate field based on event type
      const updateData: any = {};

      if (event_type === 'clicked') {
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
        console.error('❌ Error updating email event:', error);
        throw error;
      }

      console.log('✅ Email event tracked successfully:', data);

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
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('❌ Error in track-email-event function:', error);
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
