import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Input validation schema
const MeetingRequestSchema = z.object({
  title: z.string().trim().max(200).optional(),
  description: z.string().trim().max(1000).optional(),
  duration: z.number().min(15).max(240).optional().default(60),
  matchId: z.string().uuid(),
  participantIds: z.array(z.string().uuid()).min(1).max(10),
});

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header (JWT verified by Supabase)
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authentication requise' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify the user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Authentication invalide' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate input
    let validatedInput;
    try {
      const rawInput = await req.json();
      validatedInput = MeetingRequestSchema.parse(rawInput);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(JSON.stringify({ error: 'Données invalides' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { title, description, duration, matchId, participantIds } = validatedInput;

    // Vérifier que l'utilisateur a accès au match
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .eq('id', matchId)
      .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
      .single();

    if (matchError || !match) {
      console.error('Match access denied:', matchError);
      return new Response(JSON.stringify({ error: 'Accès refusé' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Pour l'instant, on simule la création d'une réunion Google Meet
    // Dans une vraie implémentation, vous utiliseriez l'API Google Meet ici

    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const meetingLink = `https://meet.google.com/${meetingId}`;
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

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
        title:
          title ||
          `Appel avec ${match.user1_id === user.id ? 'votre correspondant' : 'votre correspondante'}`,
        description: description,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database insert failed:', insertError);
      return new Response(JSON.stringify({ error: 'Impossible de créer la réunion' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Meeting created successfully');

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
          description: videoCall.description,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in create-google-meet function:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
