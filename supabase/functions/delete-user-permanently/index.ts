import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      throw new Error('Non autorisé')
    }

    // Check if user is admin
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (!userRole || !['admin', 'super_admin'].includes(userRole.role)) {
      throw new Error('Privilèges administrateur requis')
    }

    const { userId } = await req.json()

    if (!userId) {
      throw new Error('ID utilisateur requis')
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
      console.error('Error deleting user from auth:', deleteError)
      throw new Error(`Erreur lors de la suppression: ${deleteError.message}`)
    }

    console.log(`User ${userProfile?.full_name || userId} permanently deleted by admin ${user.email}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Utilisateur ${userProfile?.full_name || 'inconnu'} supprimé définitivement` 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Delete user error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})