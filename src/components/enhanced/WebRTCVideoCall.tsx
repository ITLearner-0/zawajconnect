// @ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Users,
  MessageSquare,
  Settings,
} from 'lucide-react';

interface WebRTCVideoCallProps {
  matchId: string;
  partnerId: string;
  partnerName: string;
  onCallEnd: () => void;
  isVideoCall?: boolean;
  autoStart?: boolean;
}

const WebRTCVideoCall: React.FC<WebRTCVideoCallProps> = ({
  matchId,
  partnerId,
  partnerName,
  onCallEnd,
  isVideoCall = true,
  autoStart = false,
}) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);

  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(isVideoCall);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Auto-start call
  useEffect(() => {
    if (autoStart && !isCallActive) {
      startCall();
    }
  }, [autoStart]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupCall();
    };
  }, []);

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    };

    const pc = new RTCPeerConnection(configuration);

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
      switch (pc.iceConnectionState) {
        case 'connected':
        case 'completed':
          setConnectionStatus('connected');
          break;
        case 'disconnected':
        case 'failed':
          setConnectionStatus('disconnected');
          break;
        default:
          setConnectionStatus('connecting');
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote stream');
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoCall,
        audio: true,
      });

      setLocalStream(stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      toast({
        title: "Erreur d'accès aux médias",
        description: "Impossible d'accéder à votre caméra ou microphone",
        variant: 'destructive',
      });
      throw error;
    }
  };

  const startCall = async () => {
    try {
      setIsCallActive(true);
      setConnectionStatus('connecting');

      // Initialize peer connection
      const pc = initializePeerConnection();
      peerConnectionRef.current = pc;

      // Get user media
      const stream = await initializeMedia();

      // Add tracks to peer connection
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Create offer (in a real app, this would be sent via signaling server)
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      // Simulate connection established
      setTimeout(() => {
        setConnectionStatus('connected');
        toast({
          title: 'Appel connecté',
          description: `Connecté avec ${partnerName}`,
        });
      }, 2000);
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: 'Erreur de connexion',
        description: "Impossible d'établir la connexion",
        variant: 'destructive',
      });
      endCall();
    }
  };

  const endCall = () => {
    cleanupCall();
    setIsCallActive(false);
    setCallDuration(0);
    setConnectionStatus('disconnected');

    toast({
      title: 'Appel terminé',
      description: `Appel avec ${partnerName} terminé`,
    });

    onCallEnd();
  };

  const cleanupCall = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
      setLocalStream(null);
    }

    // Close peer connection
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
  };

  const toggleVideo = () => {
    if (localStream && isVideoCall) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (!isCallActive) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isVideoCall ? <Video className="h-6 w-6" /> : <Phone className="h-6 w-6" />}
            {isVideoCall ? 'Appel Vidéo' : 'Appel Audio'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{partnerName}</h3>
            <p className="text-muted-foreground">
              Prêt pour un {isVideoCall ? 'appel vidéo' : 'appel audio'}?
            </p>
          </div>

          <Button onClick={startCall} className="w-full" size="lg">
            {isVideoCall ? <Video className="h-5 w-5 mr-2" /> : <Phone className="h-5 w-5 mr-2" />}
            Démarrer l'{isVideoCall ? 'appel vidéo' : 'appel audio'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Connection Status & Call Info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Badge variant="secondary" className={`${getConnectionStatusColor()} text-white`}>
          <div className="w-2 h-2 rounded-full bg-white mr-2" />
          {connectionStatus === 'connected'
            ? 'Connecté'
            : connectionStatus === 'connecting'
              ? 'Connexion...'
              : 'Déconnecté'}
        </Badge>

        {isCallActive && (
          <Badge variant="outline" className="bg-black/50 text-white border-white/30">
            {formatDuration(callDuration)}
          </Badge>
        )}
      </div>

      {/* Partner Name */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="outline" className="bg-black/50 text-white border-white/30">
          <Users className="h-4 w-4 mr-2" />
          {partnerName}
        </Badge>
      </div>

      {/* Remote Video/Audio Placeholder */}
      <div className="w-full h-full flex items-center justify-center bg-gray-900">
        {isVideoCall ? (
          <video ref={remoteVideoRef} className="w-full h-full object-cover" autoPlay playsInline />
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-16 w-16 text-white" />
            </div>
            <p className="text-white text-xl">{partnerName}</p>
            <p className="text-white/70">Appel audio en cours</p>
          </div>
        )}
      </div>

      {/* Local Video - Picture in Picture (only for video calls) */}
      {isVideoCall && (
        <div className="absolute top-20 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white/30">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />

          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-black flex items-center justify-center">
              <VideoOff className="h-8 w-8 text-white" />
            </div>
          )}
        </div>
      )}

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md rounded-full p-3">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? 'secondary' : 'destructive'}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Video Toggle (only for video calls) */}
          {isVideoCall && (
            <Button
              variant={isVideoEnabled ? 'secondary' : 'destructive'}
              size="lg"
              className="rounded-full w-14 h-14"
              onClick={toggleVideo}
            >
              {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
            </Button>
          )}

          {/* End Call */}
          <Button
            variant="destructive"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={endCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* Chat */}
          <Button
            variant="secondary"
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => toast({ title: 'Chat', description: 'Retour au chat...' })}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Settings */}
      <div className="absolute bottom-8 right-4 z-10">
        <Button
          variant="secondary"
          size="sm"
          className="rounded-full bg-black/50 backdrop-blur-md border-white/30"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default WebRTCVideoCall;
