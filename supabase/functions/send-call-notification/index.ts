import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CallNotificationRequest {
  callId: string;
  matchId: string;
  callerId: string;
  calleeId: string;
  callType: 'audio' | 'video';
  eventType: 'started' | 'ended' | 'duration_exceeded';
  duration?: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const requestData: CallNotificationRequest = await req.json();
    const { callId, matchId, callerId, calleeId, callType, eventType, duration } = requestData;

    console.log('Processing call notification:', { callId, matchId, eventType });

    // Get match details
    const { data: match } = await supabase
      .from('matches')
      .select('user1_id, user2_id')
      .eq('id', matchId)
      .single();

    if (!match) {
      throw new Error('Match not found');
    }

    // Get profiles for both users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('user_id, full_name, gender')
      .in('user_id', [callerId, calleeId]);

    const callerProfile = profiles?.find((p) => p.user_id === callerId);
    const calleeProfile = profiles?.find((p) => p.user_id === calleeId);

    // Find walis for both users
    const { data: familyMembers } = await supabase
      .from('family_members')
      .select(
        'id, user_id, invited_user_id, full_name, is_wali, notify_on_calls, max_call_duration_minutes'
      )
      .or(`user_id.eq.${callerId},user_id.eq.${calleeId}`)
      .eq('invitation_status', 'accepted')
      .eq('is_wali', true);

    if (!familyMembers || familyMembers.length === 0) {
      console.log('No walis to notify');
      return new Response(JSON.stringify({ success: true, notified: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const notifications = [];

    for (const wali of familyMembers) {
      // Skip if wali doesn't want call notifications
      if (!wali.notify_on_calls) continue;

      const supervisedUserId = wali.user_id;
      const supervisedProfile = profiles?.find((p) => p.user_id === supervisedUserId);
      const otherProfile = supervisedUserId === callerId ? calleeProfile : callerProfile;

      let content = '';
      let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      let notificationType = '';

      if (eventType === 'started') {
        notificationType = 'call_started';
        content = `${supervisedProfile?.full_name} a ${callType === 'video' ? 'commencé un appel vidéo' : 'commencé un appel audio'} avec ${otherProfile?.full_name}`;
        severity = 'medium';
      } else if (eventType === 'ended') {
        notificationType = 'call_ended';
        const durationText = duration
          ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
          : 'inconnue';
        content = `${supervisedProfile?.full_name} a terminé un appel ${callType === 'video' ? 'vidéo' : 'audio'} avec ${otherProfile?.full_name} (durée: ${durationText})`;
        severity = 'low';
      } else if (eventType === 'duration_exceeded') {
        notificationType = 'call_duration_exceeded';
        const maxDuration = wali.max_call_duration_minutes || 60;
        content = `⚠️ L'appel de ${supervisedProfile?.full_name} avec ${otherProfile?.full_name} a dépassé la durée maximale autorisée (${maxDuration} minutes)`;
        severity = 'high';
      }

      // Create notification
      const { error: notifError } = await supabase.from('family_notifications').insert({
        family_member_id: wali.id,
        match_id: matchId,
        notification_type: notificationType,
        content,
        severity,
        action_required: eventType === 'duration_exceeded',
        metadata: {
          call_id: callId,
          call_type: callType,
          event_type: eventType,
          duration,
          caller_id: callerId,
          callee_id: calleeId,
        },
      });

      if (notifError) {
        console.error('Error creating notification:', notifError);
      } else {
        notifications.push({ wali_id: wali.invited_user_id, notification_type: notificationType });
      }
    }

    console.log(`Successfully sent ${notifications.length} notifications`);

    return new Response(
      JSON.stringify({ success: true, notified: notifications.length, notifications }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-call-notification:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
