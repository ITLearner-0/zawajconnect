import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { handleError, successResponse, ErrorCode } from '../_shared/errorHandler.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return handleError(new Error('No auth header'), ErrorCode.UNAUTHORIZED, 'LOG_PROFILE_VIEW');
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) {
      return handleError(userError || new Error('No user'), ErrorCode.UNAUTHORIZED, 'LOG_PROFILE_VIEW');
    }

    const { viewed_user_id } = await req.json();
    if (!viewed_user_id) {
      return handleError(new Error('Missing viewed_user_id'), ErrorCode.VALIDATION_ERROR, 'LOG_PROFILE_VIEW');
    }

    // Logger la vue
    const { error: insertError } = await supabaseClient
      .from('profile_views_daily')
      .insert({
        user_id: userData.user.id,
        viewed_user_id: viewed_user_id
      });

    if (insertError) {
      console.error('[LOG_PROFILE_VIEW] Failed to log view:', {
        viewer: userData.user.id,
        viewed: viewed_user_id,
        error: insertError.message,
      });
      return handleError(insertError, ErrorCode.OPERATION_FAILED, 'LOG_PROFILE_VIEW');
    }

    return successResponse({ success: true });
  } catch (error) {
    return handleError(error, ErrorCode.INTERNAL_ERROR, 'LOG_PROFILE_VIEW');
  }
});
