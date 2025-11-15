import { VideoCallStatus } from '@/types/profile';
import VideoChat from './VideoChat';
import WaliSupervisor from './WaliSupervisor';

interface VideoCallManagerProps {
  videoCallStatus: VideoCallStatus;
  onEndCall: () => void;
  conversationId: string | undefined;
}

const VideoCallManager = ({
  videoCallStatus,
  onEndCall,
  conversationId,
}: VideoCallManagerProps) => {
  if (!videoCallStatus.isActive) return null;

  return (
    <div className="flex flex-col h-full">
      <VideoChat participantId={videoCallStatus.participantId || ''} onEndCall={onEndCall} />
      {videoCallStatus.waliPresent && conversationId && (
        <WaliSupervisor conversationId={conversationId} />
      )}
    </div>
  );
};

export default VideoCallManager;
