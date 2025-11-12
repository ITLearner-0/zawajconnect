import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MatchNotificationsRequest {
  matchId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { matchId }: MatchNotificationsRequest = await req.json();

    console.log('Sending match notifications for match:', matchId);

    // Create Supabase client with service role to access all data
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get match details
    const { data: match, error: matchError } = await supabaseAdmin
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error('Match not found');
    }

    // Get profiles for both users
    const { data: profiles } = await supabaseAdmin
      .from('profiles')
      .select('user_id, full_name')
      .in('user_id', [match.user1_id, match.user2_id]);

    if (!profiles || profiles.length !== 2) {
      throw new Error('User profiles not found');
    }

    // Get auth users to access emails
    const {
      data: { users },
      error: usersError,
    } = await supabaseAdmin.auth.admin.listUsers();

    if (usersError || !users) {
      throw new Error('Could not fetch user emails');
    }

    const user1 = users.find((u) => u.id === match.user1_id);
    const user2 = users.find((u) => u.id === match.user2_id);
    const profile1 = profiles.find((p) => p.user_id === match.user1_id);
    const profile2 = profiles.find((p) => p.user_id === match.user2_id);

    if (!user1?.email || !user2?.email || !profile1 || !profile2) {
      throw new Error('User data incomplete');
    }

    // Send notification to user 1
    const email1Response = await supabaseAdmin.functions.invoke('send-match-notification', {
      body: {
        recipientEmail: user1.email,
        recipientName: profile1.full_name || 'Utilisateur',
        matchName: profile2.full_name || 'Match',
        matchId: matchId,
      },
    });

    // Send notification to user 2
    const email2Response = await supabaseAdmin.functions.invoke('send-match-notification', {
      body: {
        recipientEmail: user2.email,
        recipientName: profile2.full_name || 'Utilisateur',
        matchName: profile1.full_name || 'Match',
        matchId: matchId,
      },
    });

    console.log('Match notifications sent successfully');

    return new Response(
      JSON.stringify({
        success: true,
        email1: email1Response.data,
        email2: email2Response.data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in send-match-notifications function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);
