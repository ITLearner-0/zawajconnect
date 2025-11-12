import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VideoCallStatus } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useVideoCall = (conversationId: string | undefined, userId?: string | null) => {
  const { toast } = useToast();
  const [videoCallStatus, setVideoCallStatus] = useState<VideoCallStatus>({
    isActive: false,
    waliPresent: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startVideoCall = async (participantId: string) => {
    if (!userId || !conversationId) return;

    setLoading(true);
    setError(null);

    try {
      // Check if wali supervision is required
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      const isUserFemale = profileData?.gender === 'Female';
      const waliPresent = isUserFemale;

      setVideoCallStatus({
        isActive: true,
        participantId,
        waliPresent,
        startTime: new Date(),
      });

      // Log video call start in database
      const { error: insertError } = await supabase.from('video_calls').insert({
        conversation_id: conversationId,
        initiator_id: userId,
        receiver_id: participantId,
        wali_present: waliPresent,
      });

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Video call started',
        description: `Connected with ${participantId}`,
      });
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error starting video call',
        description: err.message,
        variant: 'destructive',
      });

      // Reset video call state in case of error
      setVideoCallStatus({
        isActive: false,
        waliPresent: false,
      });
    } finally {
      setLoading(false);
    }
  };

  const endVideoCall = async () => {
    if (!videoCallStatus.startTime || !userId) return;

    setLoading(true);
    setError(null);

    try {
      // Calculate duration
      const duration = Math.round(
        (new Date().getTime() - videoCallStatus.startTime.getTime()) / 1000
      );

      // Update video call record
      if (conversationId && videoCallStatus.participantId) {
        const { error: updateError } = await supabase
          .from('video_calls')
          .update({
            ended_at: new Date().toISOString(),
            duration_seconds: duration,
          })
          .eq('conversation_id', conversationId)
          .eq('initiator_id', userId)
          .is('ended_at', null);

        if (updateError) {
          throw updateError;
        }

        toast({
          title: 'Video call ended',
          description: `Call duration: ${Math.floor(duration / 60)}m ${duration % 60}s`,
        });
      }
    } catch (err: any) {
      setError(err.message);
      toast({
        title: 'Error ending video call',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      setVideoCallStatus({
        isActive: false,
        waliPresent: false,
      });
    }
  };

  return {
    videoCallStatus,
    startVideoCall,
    endVideoCall,
    loading,
    error,
  };
};
