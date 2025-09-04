import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Video, VideoOff, Mic, MicOff, Phone, PhoneOff, Users, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface VideoCallProps {
  matchId: string;
  isInitiator?: boolean;
  onCallEnd?: () => void;
}

const VideoCall = ({ matchId, isInitiator = false, onCallEnd }: VideoCallProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCallActive, setIsCallActive] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [familyMembersPresent, setFamilyMembersPresent] = useState(false);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isCallActive) {
      durationIntervalRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [isCallActive]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const startCall = async () => {
    try {
      // In a real implementation, you would integrate with a video calling service like Twilio, Agora, or WebRTC
      setIsWaitingForAnswer(true);
      
      // Simulate call setup
      setTimeout(() => {
        setIsWaitingForAnswer(false);
        setIsCallActive(true);
        setCallDuration(0);
        
        toast({
          title: "Appel connecté",
          description: "La conversation vidéo a commencé",
        });
      }, 3000);

      // Get user media for local video
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: isVideoEnabled, 
          audio: isAudioEnabled 
        });
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }
      
    } catch (error) {
      console.error('Error starting call:', error);
      toast({
        title: "Erreur",
        description: "Impossible de démarrer l'appel vidéo",
        variant: "destructive"
      });
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    setIsWaitingForAnswer(false);
    setCallDuration(0);
    
    // Stop local video stream
    if (localVideoRef.current?.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    onCallEnd?.();
    
    toast({
      title: "Appel terminé",
      description: "La conversation vidéo s'est terminée",
    });
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    // In real implementation, toggle video track
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    // In real implementation, toggle audio track
  };

  const toggleFamilyPresence = () => {
    setFamilyMembersPresent(!familyMembersPresent);
    toast({
      title: familyMembersPresent ? "Mode privé activé" : "Membres de famille présents",
      description: familyMembersPresent 
        ? "La conversation est maintenant privée" 
        : "Les membres de famille sont maintenant présents",
    });
  };

  if (!isCallActive && !isWaitingForAnswer) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-emerald" />
            Appel Vidéo Halal
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="bg-gradient-to-r from-emerald/10 to-gold/10 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <Shield className="h-5 w-5 text-emerald mt-0.5" />
              <div>
                <h3 className="font-semibold text-emerald mb-1">Appel Respectueux des Valeurs Islamiques</h3>
                <p className="text-sm text-muted-foreground">
                  Les appels vidéo sont conçus pour respecter la pudeur islamique et encourager la présence familiale.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Possibilité d'inclure les membres de famille</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <span className="text-sm">Vidéo</span>
              <Button
                variant={isVideoEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleVideo}
                className={isVideoEnabled ? "bg-emerald hover:bg-emerald-dark" : ""}
              >
                {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-card rounded-lg border">
              <span className="text-sm">Audio</span>
              <Button
                variant={isAudioEnabled ? "default" : "outline"}
                size="sm"
                onClick={toggleAudio}
                className={isAudioEnabled ? "bg-emerald hover:bg-emerald-dark" : ""}
              >
                {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground">
                <Video className="h-4 w-4 mr-2" />
                Démarrer l'Appel Vidéo
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Démarrer un Appel Vidéo Halal</AlertDialogTitle>
                <AlertDialogDescription>
                  Cet appel sera effectué dans le respect des valeurs islamiques. 
                  Il est recommandé d'avoir un membre de famille présent pendant la conversation.
                  Voulez-vous continuer ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={startCall}
                  className="bg-emerald hover:bg-emerald-dark"
                >
                  Démarrer l'Appel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    );
  }

  if (isWaitingForAnswer) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <div className="animate-pulse mb-4">
            <Video className="h-16 w-16 mx-auto text-emerald" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Appel en cours...</h3>
          <p className="text-muted-foreground mb-6">
            En attente de la réponse de votre interlocuteur
          </p>
          <Button 
            variant="destructive" 
            onClick={endCall}
            className="bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="h-4 w-4 mr-2" />
            Annuler l'Appel
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-emerald" />
            Appel en Cours
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(callDuration)}
            </Badge>
            {familyMembersPresent && (
              <Badge className="bg-emerald hover:bg-emerald-dark text-white">
                <Users className="h-3 w-3 mr-1" />
                Famille Présente
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Video Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-48 bg-muted rounded-lg object-cover"
            />
            <Badge className="absolute bottom-2 left-2 bg-emerald text-white">
              Vous
            </Badge>
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-muted-foreground" />
              </div>
            )}
          </div>
          
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-48 bg-muted rounded-lg object-cover"
            />
            <Badge className="absolute bottom-2 left-2 bg-gold text-foreground">
              Interlocuteur
            </Badge>
            {/* Simulate remote video - in real implementation this would be the remote stream */}
            <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Users className="h-8 w-8 mx-auto mb-2" />
                <span className="text-sm">Vidéo de l'interlocuteur</span>
              </div>
            </div>
          </div>
        </div>

        {/* Call Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isVideoEnabled ? "default" : "secondary"}
            size="lg"
            onClick={toggleVideo}
            className={isVideoEnabled ? "bg-emerald hover:bg-emerald-dark" : ""}
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={isAudioEnabled ? "default" : "secondary"}
            size="lg"
            onClick={toggleAudio}
            className={isAudioEnabled ? "bg-emerald hover:bg-emerald-dark" : ""}
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>
          
          <Button
            variant={familyMembersPresent ? "default" : "outline"}
            size="lg"
            onClick={toggleFamilyPresence}
            className={familyMembersPresent ? "bg-gold hover:bg-gold-dark text-foreground" : "border-gold text-gold hover:bg-gold hover:text-foreground"}
          >
            <Users className="h-5 w-5" />
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                variant="destructive" 
                size="lg"
                className="bg-red-500 hover:bg-red-600"
              >
                <PhoneOff className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Terminer l'Appel</AlertDialogTitle>
                <AlertDialogDescription>
                  Êtes-vous sûr de vouloir terminer cet appel vidéo ?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Continuer l'Appel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={endCall}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Terminer l'Appel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>

        {/* Islamic Reminder */}
        <div className="bg-gradient-to-r from-gold/10 to-emerald/10 rounded-lg p-3">
          <p className="text-xs text-center text-muted-foreground italic">
            "Gardez la pudeur et respectez les limites d'Allah dans vos conversations"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default VideoCall;