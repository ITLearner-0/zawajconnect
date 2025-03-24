
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { PhoneOff, Mic, MicOff, Video, VideoOff } from 'lucide-react';

interface VideoChatProps {
  participantId: string;
  onEndCall: () => void;
}

const VideoChat = ({ participantId, onEndCall }: VideoChatProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  // Initialize video chat when component mounts
  useEffect(() => {
    const startVideoChat = async () => {
      try {
        setIsConnecting(true);
        console.log('Starting video chat with participant:', participantId);
        
        // For demo purposes, we're just getting the local stream
        // In a real app, you'd implement WebRTC peer connections
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setLocalStream(stream);
        
        // Set the stream to the video element
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // In a real app, you'd connect to the other participant here
        // For demo, we'll create a mock remote stream (just a copy)
        setTimeout(() => {
          setRemoteStream(stream);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
          setIsConnecting(false);
        }, 1500);
      } catch (error) {
        console.error('Error accessing media devices:', error);
        setIsConnecting(false);
      }
    };
    
    startVideoChat();
    
    // Cleanup function
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [participantId]);
  
  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };
  
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };
  
  const handleEndCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    onEndCall();
  };

  return (
    <div className="flex flex-col h-full bg-gray-900">
      <div className="flex-grow p-4 relative">
        {/* Remote video (full size) */}
        <div className="w-full h-full bg-black rounded-lg overflow-hidden flex items-center justify-center">
          {isConnecting ? (
            <div className="text-white flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mb-4"></div>
              <p>Connecting to {participantId}...</p>
            </div>
          ) : (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          )}
        </div>
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-1/4 aspect-video bg-gray-800 rounded-lg overflow-hidden border-2 border-white">
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      
      {/* Controls */}
      <div className="p-4 bg-gray-800 flex items-center justify-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isMuted ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          onClick={toggleMute}
        >
          {isMuted ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-red-500 text-white h-14 w-14"
          onClick={handleEndCall}
        >
          <PhoneOff className="h-6 w-6" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          className={`rounded-full ${isVideoOff ? 'bg-red-500 text-white' : 'bg-white text-gray-800'}`}
          onClick={toggleVideo}
        >
          {isVideoOff ? <VideoOff className="h-5 w-5" /> : <Video className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};

export default VideoChat;
