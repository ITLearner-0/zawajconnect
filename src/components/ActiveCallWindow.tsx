/**
 * ActiveCallWindow Component
 *
 * Full-screen call interface showing local and remote video/audio streams
 * with call controls (mute, camera toggle, end call)
 */

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Phone,
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { CallState, QualityMetrics } from '@/services/webrtc-signaling';
import { ConnectionQualityIndicator } from '@/components/ConnectionQualityIndicator';
import { MobileCallInterface } from '@/components/mobile/MobileCallInterface';
import { useIsMobile } from '@/hooks/use-mobile';
import { motion } from 'framer-motion';

interface ActiveCallWindowProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  callState: CallState;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  callDuration: number;
  partnerName: string;
  partnerAvatar?: string;
  isVideoCall: boolean;
  qualityMetrics: QualityMetrics | null;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

export function ActiveCallWindow({
  localStream,
  remoteStream,
  callState,
  isAudioEnabled,
  isVideoEnabled,
  callDuration,
  partnerName,
  partnerAvatar,
  isVideoCall,
  qualityMetrics,
  onToggleAudio,
  onToggleVideo,
  onEndCall
}: ActiveCallWindowProps) {
  const isMobile = useIsMobile();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  /**
   * Attach local stream to video element
   */
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  /**
   * Attach remote stream to video element
   */
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Use mobile interface on mobile devices
  if (isMobile) {
    return (
      <MobileCallInterface
        localStream={localStream}
        remoteStream={remoteStream}
        callState={callState}
        isAudioEnabled={isAudioEnabled}
        isVideoEnabled={isVideoEnabled}
        callDuration={callDuration}
        partnerName={partnerName}
        partnerAvatar={partnerAvatar}
        isVideoCall={isVideoCall}
        qualityMetrics={qualityMetrics}
        onToggleAudio={onToggleAudio}
        onToggleVideo={onToggleVideo}
        onEndCall={onEndCall}
      />
    );
  }

  /**
   * Format call duration as MM:SS
   */
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Get status badge variant based on call state
   */
  const getStatusBadge = () => {
    switch (callState) {
      case 'calling':
        return { text: 'Appel en cours...', variant: 'secondary' as const };
      case 'ringing':
        return { text: 'Sonnerie...', variant: 'secondary' as const };
      case 'connecting':
        return { text: 'Connexion...', variant: 'secondary' as const };
      case 'connected':
        return { text: formatDuration(callDuration), variant: 'default' as const };
      default:
        return { text: 'Inactif', variant: 'secondary' as const };
    }
  };

  const statusBadge = getStatusBadge();
  const partnerInitials = partnerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const showVideo = isVideoCall && isVideoEnabled;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 bg-gray-900 ${
        isMinimized ? 'bottom-auto top-auto right-4 top-4 w-80 h-60' : ''
      }`}
    >
      {/* Remote Video/Avatar - Main View */}
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-900">
        {isVideoCall && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Avatar className="w-32 h-32 mb-6 border-4 border-white/20">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback className="text-4xl bg-emerald/20 text-white">
                {partnerInitials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold text-white mb-2">{partnerName}</h2>
            <Badge variant={statusBadge.variant} className="text-sm">
              {statusBadge.text}
            </Badge>
          </div>
        )}

        {/* Local Video - Picture in Picture */}
        {isVideoCall && localStream && showVideo && (
          <Card className="absolute top-4 right-4 w-40 h-32 overflow-hidden border-2 border-white/30 shadow-2xl">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            {!isAudioEnabled && (
              <div className="absolute bottom-2 right-2 bg-red-500 rounded-full p-1">
                <MicOff className="w-4 h-4 text-white" />
              </div>
            )}
          </Card>
        )}

        {/* Header - Status and Partner Name */}
        <div className="absolute top-0 left-0 right-0 p-6 bg-gradient-to-b from-black/70 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarImage src={partnerAvatar} alt={partnerName} />
                <AvatarFallback className="bg-emerald/20 text-white">
                  {partnerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-white font-semibold text-lg">{partnerName}</h3>
                <Badge variant={statusBadge.variant} className="text-xs">
                  {statusBadge.text}
                </Badge>
              </div>
            </div>

            {/* Minimize/Maximize Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/20"
            >
              {isMinimized ? (
                <Maximize2 className="w-5 h-5" />
              ) : (
                <Minimize2 className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Call Controls - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center justify-center gap-4">
            {/* Audio Toggle */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
              <Button
                variant={isAudioEnabled ? 'secondary' : 'destructive'}
                size="lg"
                onClick={onToggleAudio}
                className="rounded-full w-14 h-14 p-0"
              >
                {isAudioEnabled ? (
                  <Mic className="w-6 h-6" />
                ) : (
                  <MicOff className="w-6 h-6" />
                )}
              </Button>
            </motion.div>

            {/* Video Toggle (only for video calls) */}
            {isVideoCall && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <Button
                  variant={isVideoEnabled ? 'secondary' : 'destructive'}
                  size="lg"
                  onClick={onToggleVideo}
                  className="rounded-full w-14 h-14 p-0"
                >
                  {isVideoEnabled ? (
                    <Video className="w-6 h-6" />
                  ) : (
                    <VideoOff className="w-6 h-6" />
                  )}
                </Button>
              </motion.div>
            )}

            {/* End Call Button */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              animate={{ scale: callState === 'calling' ? [1, 1.05, 1] : 1 }}
              transition={{ repeat: callState === 'calling' ? Infinity : 0, duration: 1 }}
            >
              <Button
                variant="destructive"
                size="lg"
                onClick={onEndCall}
                className="rounded-full w-16 h-16 p-0 bg-red-600 hover:bg-red-700"
              >
                <PhoneOff className="w-6 h-6" />
              </Button>
            </motion.div>
          </div>

          {/* Control Labels */}
          <div className="flex items-center justify-center gap-4 mt-2">
            <span className="text-xs text-white/70 w-14 text-center">
              {isAudioEnabled ? 'Muet' : 'Audio'}
            </span>
            {isVideoCall && (
              <span className="text-xs text-white/70 w-14 text-center">
                {isVideoEnabled ? 'Caméra' : 'Vidéo'}
              </span>
            )}
            <span className="text-xs text-white/70 w-16 text-center">
              Terminer
            </span>
          </div>
        </div>

        {/* Connection Quality Indicator */}
        {callState === 'connected' && qualityMetrics && (
          <div className="absolute top-20 left-6">
            <ConnectionQualityIndicator metrics={qualityMetrics} compact />
          </div>
        )}
      </div>
    </motion.div>
  );
}
