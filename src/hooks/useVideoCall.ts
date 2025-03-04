
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoCallStatus } from '@/types/profile';

export const useVideoCall = (userId: string | null, conversationId: string | undefined) => {
  const [videoCallStatus, setVideoCallStatus] = useState<VideoCallStatus>({
    isActive: false,
    waliPresent: false
  });

  const startVideoCall = async (participantId: string) => {
    if (!userId || !conversationId) return;
    
    // Check if wali supervision is required
    const { data: profileData } = await supabase
      .from('profiles')
      .select('gender')
      .eq('id', userId)
      .single();
      
    const isUserFemale = profileData?.gender === 'Female';
    const waliPresent = isUserFemale;
    
    setVideoCallStatus({
      isActive: true,
      participantId,
      waliPresent,
      startTime: new Date()
    });
    
    // Log video call start in database
    await supabase
      .from('video_calls')
      .insert({
        conversation_id: conversationId,
        initiator_id: userId,
        receiver_id: participantId,
        wali_present: waliPresent
      });
  };

  const endVideoCall = async () => {
    if (!videoCallStatus.startTime || !userId) return;
    
    // Calculate duration
    const duration = Math.round(
      (new Date().getTime() - videoCallStatus.startTime.getTime()) / 1000
    );
    
    // Update video call record
    if (conversationId && videoCallStatus.participantId) {
      await supabase
        .from('video_calls')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: duration
        })
        .eq('conversation_id', conversationId)
        .eq('initiator_id', userId)
        .is('ended_at', null);
    }
    
    setVideoCallStatus({
      isActive: false,
      waliPresent: false
    });
  };

  return {
    videoCallStatus,
    startVideoCall,
    endVideoCall
  };
};
