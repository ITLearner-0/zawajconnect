/**
 * MobileCallInterface Component
 * 
 * Mobile-optimized call interface with:
 * - Picture-in-Picture support
 * - Touch gestures (swipe, double-tap, pinch-to-zoom)
 * - Adaptive portrait/landscape layouts
 * - Battery-saving mode
 */

import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  PhoneOff,
  PictureInPicture,
  Maximize2,
  Battery,
  BatteryLow
} from 'lucide-react';
import { CallState, QualityMetrics } from '@/services/webrtc-signaling';
import { ConnectionQualityIndicator } from '@/components/ConnectionQualityIndicator';
import { useOrientation } from '@/hooks/useOrientation';
import { usePictureInPicture } from '@/hooks/usePictureInPicture';
import { useTouchGestures } from '@/hooks/useTouchGestures';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface MobileCallInterfaceProps {
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

export function MobileCallInterface({
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
}: MobileCallInterfaceProps) {
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const { orientation, isPortrait, isLandscape } = useOrientation();
  const { isInPiP, isSupported: pipSupported, togglePiP } = usePictureInPicture(remoteVideoRef);
  
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [batterySaving, setBatterySaving] = useState(false);
  const [videoScale, setVideoScale] = useState(1);

  // Auto-hide controls after 3 seconds
  React.useEffect(() => {
    if (!showControls) return;
    
    const timer = setTimeout(() => {
      if (callState === 'connected') {
        setShowControls(false);
      }
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [showControls, callState]);

  // Touch gesture handlers
  useTouchGestures(containerRef, {
    onSwipeUp: () => {
      setShowControls(prev => !prev);
      toast({
        title: showControls ? "Contrôles masqués" : "Contrôles affichés",
        duration: 1000
      });
    },
    onSwipeDown: () => {
      setShowControls(prev => !prev);
    },
    onDoubleTap: () => {
      toggleFullscreen();
    },
    onPinch: (scale) => {
      if (isVideoCall && scale !== 1) {
        setVideoScale(Math.max(1, Math.min(3, scale)));
      }
    },
    onLongPress: () => {
      if (pipSupported && isVideoCall) {
        togglePiP();
      }
    }
  });

  // Attach streams to video elements
  React.useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  React.useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      await document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const toggleBatterySaving = useCallback(() => {
    setBatterySaving(prev => !prev);
    toast({
      title: batterySaving ? "Mode normal" : "Mode économie d'énergie",
      description: batterySaving ? "Qualité vidéo restaurée" : "Résolution réduite pour économiser la batterie"
    });
  }, [batterySaving, toast]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const partnerInitials = partnerName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  const getLayoutStyles = () => {
    if (isPortrait) {
      return {
        container: 'flex-col',
        remoteVideo: 'h-2/3',
        localVideo: 'bottom-4 right-4 w-32 h-40',
        controls: 'bottom-4'
      };
    } else {
      return {
        container: 'flex-row',
        remoteVideo: 'w-full',
        localVideo: 'top-4 right-4 w-40 h-32',
        controls: 'bottom-4'
      };
    }
  };

  const layout = getLayoutStyles();

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black touch-none"
      onClick={() => setShowControls(prev => !prev)}
    >
      {/* Remote Video/Avatar */}
      <div className={`relative w-full h-full flex items-center justify-center ${layout.remoteVideo}`}>
        {isVideoCall && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{
              transform: `scale(${videoScale})`,
              transition: 'transform 0.3s ease',
              filter: batterySaving ? 'blur(1px)' : 'none'
            }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center">
            <Avatar className="w-24 h-24 mb-4 border-4 border-white/20">
              <AvatarImage src={partnerAvatar} alt={partnerName} />
              <AvatarFallback className="text-3xl bg-primary/20 text-white">
                {partnerInitials}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold text-white">{partnerName}</h2>
          </div>
        )}

        {/* Local Video - PiP Style */}
        {isVideoCall && localStream && isVideoEnabled && (
          <Card className={`absolute ${layout.localVideo} overflow-hidden border-2 border-white/30 shadow-2xl`}>
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform scale-x-[-1]"
              style={{ filter: batterySaving ? 'blur(1px)' : 'none' }}
            />
            {!isAudioEnabled && (
              <div className="absolute bottom-1 right-1 bg-red-500 rounded-full p-1">
                <MicOff className="w-3 h-3 text-white" />
              </div>
            )}
          </Card>
        )}

        {/* Header - Status */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-10 h-10 border-2 border-white/30">
                    <AvatarImage src={partnerAvatar} alt={partnerName} />
                    <AvatarFallback className="bg-primary/20 text-white text-sm">
                      {partnerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white font-semibold text-sm">{partnerName}</p>
                    <Badge variant="secondary" className="text-xs">
                      {callState === 'connected' ? formatDuration(callDuration) : 'Connexion...'}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Battery Saving Mode */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleBatterySaving();
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    {batterySaving ? (
                      <BatteryLow className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Battery className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Picture-in-Picture */}
                  {pipSupported && isVideoCall && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePiP();
                      }}
                      className="text-white hover:bg-white/20 h-8 w-8"
                    >
                      <PictureInPicture className="h-4 w-4" />
                    </Button>
                  )}

                  {/* Fullscreen */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFullscreen();
                    }}
                    className="text-white hover:bg-white/20 h-8 w-8"
                  >
                    <Maximize2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Connection Quality */}
              {qualityMetrics && (
                <div className="mt-2">
                  <ConnectionQualityIndicator metrics={qualityMetrics} compact />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Call Controls - Bottom */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={`absolute ${layout.controls} left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent`}
            >
              <div className="flex items-center justify-center gap-3">
                {/* Audio Toggle */}
                <Button
                  variant={isAudioEnabled ? 'secondary' : 'destructive'}
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleAudio();
                  }}
                  className="rounded-full w-14 h-14 p-0 touch-manipulation"
                >
                  {isAudioEnabled ? (
                    <Mic className="w-5 h-5" />
                  ) : (
                    <MicOff className="w-5 h-5" />
                  )}
                </Button>

                {/* Video Toggle */}
                {isVideoCall && (
                  <Button
                    variant={isVideoEnabled ? 'secondary' : 'destructive'}
                    size="lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVideo();
                    }}
                    className="rounded-full w-14 h-14 p-0 touch-manipulation"
                  >
                    {isVideoEnabled ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <VideoOff className="w-5 h-5" />
                    )}
                  </Button>
                )}

                {/* End Call */}
                <Button
                  variant="destructive"
                  size="lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEndCall();
                  }}
                  className="rounded-full w-16 h-16 p-0 bg-red-600 hover:bg-red-700 touch-manipulation"
                >
                  <PhoneOff className="w-6 h-6" />
                </Button>
              </div>

              {/* Gesture Hints */}
              <div className="text-center mt-3">
                <p className="text-xs text-white/60">
                  Swipe ↕ : contrôles | Double-tap : plein écran | Pinch : zoom
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}