import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Settings,
  Users,
  MessageSquare,
  ScreenShare,
  ScreenShareOff,
  Volume2,
  VolumeX
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  matchId?: string;
  partnerId?: string;
  partnerName?: string;
  onCallEnd?: () => void;
  isIncoming?: boolean;
}

const VideoCall = ({ 
  matchId, 
  partnerId, 
  partnerName = "Partenaire",
  onCallEnd,
  isIncoming = false 
}: VideoCallProps) => {
  const { toast } = useToast();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // Simulated call timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallActive) {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isCallActive]);

  // Initialize media devices
  useEffect(() => {
    if (isCallActive) {
      initializeMedia();
    }
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isCallActive]);

  const initializeMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      setConnectionStatus('connected');
      toast({
        title: "Connexion établie",
        description: "Appel vidéo connecté avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur de connexion",
        description: "Impossible d'accéder à la caméra ou au microphone",
        variant: "destructive"
      });
      setConnectionStatus('disconnected');
    }
  };

  const startCall = () => {
    setIsCallActive(true);
    setCallDuration(0);
    toast({
      title: "Appel démarré",
      description: `Connexion avec ${partnerName}...`
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallDuration(0);
    setConnectionStatus('disconnected');
    
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    toast({
      title: "Appel terminé",
      description: `Appel avec ${partnerName} terminé`
    });
    
    onCallEnd?.();
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
      }
    }
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
          video: true 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = screenStream;
        }
        
        setIsScreenSharing(true);
        toast({
          title: "Partage d'écran activé",
          description: "Votre écran est maintenant partagé"
        });
      } else {
        // Return to camera
        await initializeMedia();
        setIsScreenSharing(false);
        toast({
          title: "Partage d'écran désactivé",
          description: "Retour à la caméra"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de partager l'écran",
        variant: "destructive"
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'bg-green-500';
      case 'connecting': return 'bg-yellow-500';
      case 'disconnected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (isIncoming && !isCallActive) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Video className="h-6 w-6 text-primary" />
            Appel entrant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-12 w-12 text-primary" />
            </div>
            <h3 className="text-lg font-semibold">{partnerName}</h3>
            <p className="text-sm text-muted-foreground">souhaite passer un appel vidéo</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={startCall}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              <Phone className="h-4 w-4 mr-2" />
              Accepter
            </Button>
            <Button 
              variant="destructive" 
              onClick={endCall}
              className="flex-1"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              Décliner
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isCallActive) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6" />
            Appel Vidéo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-16 w-16 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">{partnerName}</h3>
            <p className="text-muted-foreground">Prêt pour un appel vidéo?</p>
          </div>

          <Button onClick={startCall} className="w-full" size="lg">
            <Video className="h-5 w-5 mr-2" />
            Démarrer l'appel vidéo
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black">
      {/* Connection Status & Call Info */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <Badge 
          variant="secondary" 
          className={`${getConnectionStatusColor()} text-white`}
        >
          <div className="w-2 h-2 rounded-full bg-white mr-2" />
          {connectionStatus === 'connected' ? 'Connecté' : 
           connectionStatus === 'connecting' ? 'Connexion...' : 'Déconnecté'}
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

      {/* Remote Video */}
      <video 
        ref={remoteVideoRef}
        className="w-full h-full object-cover"
        autoPlay
        playsInline
        poster="/placeholder.svg"
      />

      {/* Local Video - Picture in Picture */}
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

      {/* Controls */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-md rounded-full p-2">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={toggleAudio}
          >
            {isAudioEnabled ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={toggleVideo}
          >
            {isVideoEnabled ? <Video className="h-6 w-6" /> : <VideoOff className="h-6 w-6" />}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "default" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={toggleScreenShare}
          >
            {isScreenSharing ? <ScreenShareOff className="h-6 w-6" /> : <ScreenShare className="h-6 w-6" />}
          </Button>

          {/* Mute */}
          <Button
            variant={isMuted ? "destructive" : "secondary"}
            size="lg"
            className="rounded-full w-14 h-14"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
          </Button>

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
            onClick={() => toast({ title: "Chat", description: "Fonctionnalité bientôt disponible" })}
          >
            <MessageSquare className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Settings (if needed) */}
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

export default VideoCall;