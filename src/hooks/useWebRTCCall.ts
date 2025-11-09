/**
 * useWebRTCCall Hook
 *
 * React hook for managing WebRTC calls with state management and lifecycle handling.
 * Provides a simple interface for initiating, accepting, and managing audio/video calls.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WebRTCSignalingService, CallType, CallState, CallOffer, QualityMetrics } from '@/services/webrtc-signaling';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface UseWebRTCCallOptions {
  matchId: string;
  onCallEnd?: () => void;
}

export interface UseWebRTCCallReturn {
  // State
  callState: CallState;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  incomingCall: CallOffer | null;
  callDuration: number;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  qualityMetrics: QualityMetrics | null;

  // Actions
  initiateCall: (callType: CallType, callerName: string) => Promise<void>;
  acceptCall: () => Promise<void>;
  rejectCall: () => Promise<void>;
  endCall: () => Promise<void>;
  toggleAudio: () => void;
  toggleVideo: () => void;

  // Connection info
  isCallActive: boolean;
  isIncomingCall: boolean;
}

/**
 * Custom hook for managing WebRTC calls
 */
export function useWebRTCCall({ matchId, onCallEnd }: UseWebRTCCallOptions): UseWebRTCCallReturn {
  const { user } = useAuth();
  const { toast } = useToast();

  // State
  const [callState, setCallState] = useState<CallState>('idle');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [incomingCall, setIncomingCall] = useState<CallOffer | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [currentCallType, setCurrentCallType] = useState<CallType>('audio');
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);

  // Refs
  const signalingService = useRef<WebRTCSignalingService | null>(null);
  const callTimerInterval = useRef<NodeJS.Timeout | null>(null);
  const currentCallId = useRef<string | null>(null);

  /**
   * Initialize signaling service
   */
  useEffect(() => {
    if (!user?.id || !matchId) return;

    const initializeService = async () => {
      try {
        // Create signaling service
        const service = new WebRTCSignalingService(matchId, user.id);

        // Set up callbacks
        service.onCallStateChange = async (state) => {
          console.log('📞 Call state changed:', state);
          setCallState(state);

          // Update call record in database
          if (currentCallId.current) {
            const updates: any = { status: state };

            if (state === 'connected') {
              updates.connected_at = new Date().toISOString();
              startCallTimer();
            } else if (state === 'ended' || state === 'rejected' || state === 'failed') {
              updates.ended_at = new Date().toISOString();
              if (state !== 'rejected' && state !== 'failed') {
                updates.duration_seconds = callDuration;
              }
              updates.end_reason = state;
              stopCallTimer();
            }

            const { error } = await supabase
              .from('webrtc_calls')
              .update(updates)
              .eq('id', currentCallId.current);

            if (error) {
              console.error('Failed to update call record:', error);
            }
          }
        };

        service.onLocalStream = (stream) => {
          console.log('📹 Local stream received');
          setLocalStream(stream);
        };

        service.onRemoteStream = (stream) => {
          console.log('📺 Remote stream received');
          setRemoteStream(stream);
        };

        service.onIncomingCall = (offer) => {
          console.log('📞 Incoming call from:', offer.callerName);
          setIncomingCall(offer);
          setCurrentCallType(offer.callType);

          // Show toast notification
          toast({
            title: `Appel ${offer.callType === 'video' ? 'vidéo' : 'audio'} entrant`,
            description: `${offer.callerName} vous appelle...`,
            duration: 30000 // 30 seconds
          });
        };

        service.onCallEnd = () => {
          console.log('📞 Call ended');
          handleCallCleanup();
          onCallEnd?.();
        };

        service.onError = (error) => {
          console.error('❌ WebRTC Error:', error);
          toast({
            title: "Erreur d'appel",
            description: error.message || "Une erreur s'est produite pendant l'appel",
            variant: "destructive"
          });
        };

        service.onQualityChange = (metrics) => {
          setQualityMetrics(metrics);
          
          // Notify user if quality drops to poor
          if (metrics.quality === 'poor') {
            toast({
              title: "Qualité de connexion faible",
              description: "La qualité vidéo a été réduite pour maintenir l'appel",
              variant: "default"
            });
          }
        };

        // Initialize the service
        await service.initialize();
        signalingService.current = service;

        console.log('✅ WebRTC service initialized');
      } catch (error) {
        console.error('❌ Failed to initialize WebRTC service:', error);
        toast({
          title: "Erreur d'initialisation",
          description: "Impossible d'initialiser le système d'appel",
          variant: "destructive"
        });
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      if (signalingService.current) {
        signalingService.current.cleanup();
        signalingService.current = null;
      }
      stopCallTimer();
    };
  }, [matchId, user?.id, toast, onCallEnd]);

  /**
   * Start call duration timer
   */
  const startCallTimer = useCallback(() => {
    setCallDuration(0);
    callTimerInterval.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);
  }, []);

  /**
   * Stop call duration timer
   */
  const stopCallTimer = useCallback(() => {
    if (callTimerInterval.current) {
      clearInterval(callTimerInterval.current);
      callTimerInterval.current = null;
    }
    setCallDuration(0);
  }, []);

  /**
   * Initiate an outgoing call
   */
  const initiateCall = useCallback(async (callType: CallType, callerName: string) => {
    if (!signalingService.current || !user?.id) {
      throw new Error('Signaling service not initialized');
    }

    try {
      setCurrentCallType(callType);
      
      // Déterminer le callee_id depuis le match
      const { data: matchData } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('id', matchId)
        .single();

      if (!matchData) throw new Error('Match not found');

      const calleeId = matchData.user1_id === user.id ? matchData.user2_id : matchData.user1_id;

      // Créer l'enregistrement de l'appel
      const { data: callRecord, error: callError } = await supabase
        .from('webrtc_calls')
        .insert({
          match_id: matchId,
          caller_id: user.id,
          callee_id: calleeId,
          call_type: callType,
          status: 'initiated'
        })
        .select()
        .single();

      if (callError) {
        console.error('Failed to create call record:', callError);
      } else {
        currentCallId.current = callRecord.id;
        console.log('📝 Call record created:', callRecord.id);
      }

      await signalingService.current.initiateCall(callType, callerName);
      console.log(`✅ ${callType} call initiated`);
    } catch (error) {
      console.error('❌ Failed to initiate call:', error);
      throw error;
    }
  }, [matchId, user?.id]);

  /**
   * Accept an incoming call
   */
  const acceptCall = useCallback(async () => {
    if (!signalingService.current || !incomingCall) {
      throw new Error('No incoming call to accept');
    }

    try {
      await signalingService.current.acceptCall(incomingCall.callType);
      setIncomingCall(null);
      console.log('✅ Call accepted');
    } catch (error) {
      console.error('❌ Failed to accept call:', error);
      throw error;
    }
  }, [incomingCall]);

  /**
   * Reject an incoming call
   */
  const rejectCall = useCallback(async () => {
    if (!signalingService.current) {
      throw new Error('Signaling service not initialized');
    }

    try {
      await signalingService.current.rejectCall();
      setIncomingCall(null);
      handleCallCleanup();
      console.log('✅ Call rejected');
    } catch (error) {
      console.error('❌ Failed to reject call:', error);
      throw error;
    }
  }, []);

  /**
   * End an ongoing call
   */
  const endCall = useCallback(async () => {
    if (!signalingService.current) {
      throw new Error('Signaling service not initialized');
    }

    try {
      await signalingService.current.endCall();
      handleCallCleanup();
      console.log('✅ Call ended');
    } catch (error) {
      console.error('❌ Failed to end call:', error);
      throw error;
    }
  }, []);

  /**
   * Toggle audio on/off
   */
  const toggleAudio = useCallback(() => {
    if (!signalingService.current) return;

    const newState = !isAudioEnabled;
    signalingService.current.toggleAudio(newState);
    setIsAudioEnabled(newState);
    console.log(`🎤 Audio ${newState ? 'enabled' : 'disabled'}`);
  }, [isAudioEnabled]);

  /**
   * Toggle video on/off
   */
  const toggleVideo = useCallback(() => {
    if (!signalingService.current || currentCallType === 'audio') return;

    const newState = !isVideoEnabled;
    signalingService.current.toggleVideo(newState);
    setIsVideoEnabled(newState);
    console.log(`📹 Video ${newState ? 'enabled' : 'disabled'}`);
  }, [isVideoEnabled, currentCallType]);

  /**
   * Handle call cleanup
   */
  const handleCallCleanup = useCallback(() => {
    currentCallId.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIncomingCall(null);
    setCallState('idle');
    setIsAudioEnabled(true);
    setIsVideoEnabled(true);
    stopCallTimer();
  }, [stopCallTimer]);

  /**
   * Computed values
   */
  const isCallActive = ['calling', 'ringing', 'connecting', 'connected'].includes(callState);
  const isIncomingCall = callState === 'ringing' && incomingCall !== null;

  return {
    // State
    callState,
    localStream,
    remoteStream,
    incomingCall,
    callDuration,
    isAudioEnabled,
    isVideoEnabled,
    qualityMetrics,

    // Actions
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,

    // Connection info
    isCallActive,
    isIncomingCall
  };
}
