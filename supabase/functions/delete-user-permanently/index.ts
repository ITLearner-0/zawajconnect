import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { handleError, successResponse, ErrorCode } from '../_shared/errorHandler.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Get the authorization header
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')

    // Verify the user is authenticated and is an admin
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    if (authError || !user) {
      return handleError(authError || new Error('No user'), ErrorCode.UNAUTHORIZED, 'DELETE_USER')
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
      return handleError(new Error('Not admin'), ErrorCode.FORBIDDEN, 'DELETE_USER')
    }

    const { userId } = await req.json()

    if (!userId) {
      return handleError(new Error('Missing userId'), ErrorCode.VALIDATION_ERROR, 'DELETE_USER')
    }

    // Get user info before deletion for logging
    const { data: userProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('user_id', userId)
      .single()

    // Delete user from auth.users (this will cascade to all related tables)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('[DELETE_USER] Failed to delete user:', {
        userId,
        error: deleteError.message,
        adminUser: user.email,
      })
      return handleError(deleteError, ErrorCode.OPERATION_FAILED, 'DELETE_USER')
    }

    console.log('[DELETE_USER] Success:', {
      userName: userProfile?.full_name || 'unknown',
      userId,
      deletedBy: user.email,
    })

    return successResponse({ 
      success: true, 
      message: `Utilisateur ${userProfile?.full_name || 'inconnu'} supprimé définitivement` 
    })

  } catch (error) {
    return handleError(error, ErrorCode.INTERNAL_ERROR, 'DELETE_USER')
  }
})