import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MeetingRequest {
  title?: string;
  description?: string;
  duration?: number;
  matchId: string;
  participantIds: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the authorization header
    const authHeader = req.headers.get('authorization')!
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const { title, description, duration = 60, matchId, participantIds }: MeetingRequest = await req.json()

    // Vérifier que l'utilisateur a accès au match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single()

    if (matchError || !match) {
      return new Response(
        JSON.stringify({ error: 'Match not found or access denied' }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Pour l'instant, on simule la création d'une réunion Google Meet
    // Dans une vraie implémentation, vous utiliseriez l'API Google Meet ici
    
    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const meetingLink = `https://meet.google.com/${meetingId}`
    const startTime = new Date()
    const endTime = new Date(startTime.getTime() + (duration * 60 * 1000))

    // Sauvegarder la réunion dans la base de données
    const { data: videoCall, error: insertError } = await supabase
      .from('video_calls')
      .insert({
        match_id: matchId,
        meeting_id: meetingId,
        meeting_link: meetingLink,
        platform: 'google_meet',
        start_time: startTime.toISOString(),
        scheduled_end_time: endTime.toISOString(),
        participants: participantIds,
        status: 'scheduled',
        title: title || `Appel avec ${match.user1_id === user.id ? 'votre correspondant' : 'votre correspondante'}`,
        description: description
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting video call:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to create meeting record' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // TODO: Dans une vraie implémentation, envoyer une notification aux participants
    // et créer la réunion via l'API Google Meet

    return new Response(
      JSON.stringify({
        success: true,
        meeting: {
          id: meetingId,
          link: meetingLink,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          participants: participantIds,
          title: videoCall.title,
          description: videoCall.description
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Error in create-google-meet function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})