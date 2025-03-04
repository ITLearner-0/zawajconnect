
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Mic, MicOff, Shield } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface VideoChatProps {
  participantId: string;
  waliPresent: boolean;
  onEndCall: () => void;
}

const VideoChat: React.FC<VideoChatProps> = ({
  participantId,
  waliPresent,
  onEndCall,
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Mock video call connection
    // In a real app, this would be replaced with WebRTC or a video chat API

    // Simulate connection delay
    const timer = setTimeout(() => {
      setIsConnected(true);
      toast({
        title: "Call Connected",
        description: waliPresent 
          ? "Call is being supervised by a wali" 
          : "Wali supervision is pending",
      });
      
      // If local camera exists
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .then((stream) => {
            if (localVideoRef.current) {
              localVideoRef.current.srcObject = stream;
            }
            
            // Mock remote video - in a real app this would be the peer's stream
            if (remoteVideoRef.current) {
              // Just for demonstration - in a real app, this would be the remote stream
              setTimeout(() => {
                if (remoteVideoRef.current) {
                  remoteVideoRef.current.srcObject = stream;
                }
              }, 1000);
            }
          })
          .catch((err) => {
            console.error("Error accessing camera:", err);
            toast({
              title: "Camera Error",
              description: "Unable to access your camera. Please check permissions.",
              variant: "destructive",
            });
          });
      }
      
      // Start call duration timer
      const durationInterval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(durationInterval);
    }, 2000);
    
    return () => {
      clearTimeout(timer);
      
      // Clean up video streams
      if (localVideoRef.current && localVideoRef.current.srcObject) {
        const stream = localVideoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [waliPresent]);

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach(track => {
        track.enabled = isMuted; // Toggle the current state
      });
    }
  };

  const handleEndCall = () => {
    // Clean up video streams
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    
    onEndCall();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Video call header */}
      <div className="p-4 flex justify-between items-center bg-gray-800">
        <div>
          <h2 className="font-semibold">Video Call</h2>
          <div className="text-sm text-gray-400">
            {isConnected ? `Connected • ${formatDuration(callDuration)}` : "Connecting..."}
          </div>
        </div>
        
        {waliPresent && (
          <div className="flex items-center text-green-400">
            <Shield className="h-4 w-4 mr-1" />
            <span className="text-sm">Wali Supervised</span>
          </div>
        )}
      </div>
      
      {/* Video area */}
      <div className="flex-1 relative">
        {/* Remote video (big) */}
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Local video (small overlay) */}
        <div className="absolute bottom-4 right-4 w-1/4 max-w-[200px] aspect-video rounded-lg overflow-hidden border-2 border-white shadow-lg">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Loading indicator */}
        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto"></div>
              <p className="mt-4">Connecting to call...</p>
            </div>
          </div>
        )}
      </div>
      
      {/* Call controls */}
      <div className="p-4 bg-gray-800 flex justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-gray-700'}`}
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="destructive"
          size="icon"
          className="rounded-full"
          onClick={handleEndCall}
        >
          <PhoneOff className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
