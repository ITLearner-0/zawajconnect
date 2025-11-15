/**
 * IncomingCallNotification Component
 *
 * Displays an incoming call notification with accept/reject buttons
 * Plays a ringtone sound and shows caller information
 */

import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { CallOffer } from '@/services/webrtc-signaling';
import { motion, AnimatePresence } from 'framer-motion';

interface IncomingCallNotificationProps {
  incomingCall: CallOffer;
  onAccept: () => void;
  onReject: () => void;
  callerAvatar?: string;
}

export function IncomingCallNotification({
  incomingCall,
  onAccept,
  onReject,
  callerAvatar,
}: IncomingCallNotificationProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Play ringtone on mount
   */
  useEffect(() => {
    // Create audio element for ringtone
    // Note: Using a simple beep pattern. In production, use a proper ringtone audio file
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

    const playRingtone = () => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 440; // A4 note
      gainNode.gain.value = 0.3;

      oscillator.start();
      oscillator.stop(audioContext.currentTime + 0.2);
    };

    // Play ringtone every 2 seconds
    const ringtoneInterval = setInterval(playRingtone, 2000);
    playRingtone(); // Play immediately

    return () => {
      clearInterval(ringtoneInterval);
      audioContext.close();
    };
  }, []);

  const isVideoCall = incomingCall.callType === 'video';
  const callerInitials = incomingCall.callerName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -50 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      >
        <Card className="w-full max-w-md mx-4 overflow-hidden border-2 border-emerald/30 shadow-2xl">
          <CardContent className="p-0">
            {/* Header with pulsing animation */}
            <div className="bg-gradient-to-r from-emerald to-emerald-dark p-6 text-white relative overflow-hidden">
              <motion.div
                className="absolute inset-0 bg-white/10"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
              />
              <div className="relative z-10 text-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  {isVideoCall ? (
                    <Video className="w-12 h-12 mx-auto mb-2" />
                  ) : (
                    <Phone className="w-12 h-12 mx-auto mb-2" />
                  )}
                </motion.div>
                <h3 className="text-lg font-semibold">
                  Appel {isVideoCall ? 'vidéo' : 'audio'} entrant
                </h3>
              </div>
            </div>

            {/* Caller Info */}
            <div className="p-8 text-center bg-gradient-to-b from-white to-cream">
              <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-emerald/20">
                <AvatarImage src={callerAvatar} alt={incomingCall.callerName} />
                <AvatarFallback className="text-2xl bg-emerald/10 text-emerald-dark">
                  {callerInitials}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-bold text-foreground mb-2">{incomingCall.callerName}</h2>

              <p className="text-muted-foreground mb-6">vous appelle...</p>

              {/* Call Action Buttons */}
              <div className="flex gap-4 justify-center">
                {/* Reject Button */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="destructive"
                    size="lg"
                    onClick={onReject}
                    className="rounded-full w-16 h-16 p-0"
                  >
                    <PhoneOff className="w-6 h-6" />
                  </Button>
                </motion.div>

                {/* Accept Button */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Button
                    size="lg"
                    onClick={onAccept}
                    className="rounded-full w-16 h-16 p-0 bg-green-500 hover:bg-green-600"
                  >
                    <Phone className="w-6 h-6" />
                  </Button>
                </motion.div>
              </div>

              {/* Button Labels */}
              <div className="flex gap-4 justify-center mt-2">
                <span className="text-xs text-destructive w-16 text-center">Refuser</span>
                <span className="text-xs text-green-600 w-16 text-center">Accepter</span>
              </div>
            </div>

            {/* Auto-reject timer (optional) */}
            <div className="px-6 pb-4 text-center">
              <p className="text-xs text-muted-foreground">
                L'appel sera automatiquement refusé dans 30 secondes
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
