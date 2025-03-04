
import React from 'react';
import { ArrowLeft, Video, Flag, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types/profile';
import RetentionSettings from './RetentionSettings';

interface ChatHeaderProps {
  conversation: Conversation;
  currentUserId: string;
  backToList: () => void;
  onStartVideoCall: () => void;
  isWaliSupervised?: boolean;
  showSecuritySettings: boolean;
  setShowSecuritySettings: (show: boolean) => void;
  openReportDialog: () => void;
  retentionPolicy?: any;
  updateRetentionPolicy?: (policy: any) => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  currentUserId,
  backToList,
  onStartVideoCall,
  isWaliSupervised = false,
  showSecuritySettings,
  setShowSecuritySettings,
  openReportDialog,
  retentionPolicy,
  updateRetentionPolicy
}) => {
  const otherParticipant = conversation.profile || { first_name: 'User', last_name: '' };

  return (
    <div className="flex items-center justify-between p-3 border-b">
      <div className="flex items-center">
        <Button variant="ghost" size="sm" onClick={backToList} className="mr-2 md:hidden">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h3 className="font-medium">
            {otherParticipant.first_name} {otherParticipant.last_name}
          </h3>
          {isWaliSupervised && (
            <p className="text-xs text-green-600">Wali supervised</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {/* Security settings button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSecuritySettings(!showSecuritySettings)}
          className={showSecuritySettings ? 'bg-muted' : ''}
        >
          <Lock className="h-4 w-4 mr-1" />
          <span className="hidden md:inline">Security</span>
        </Button>
        
        {/* Retention settings */}
        <RetentionSettings 
          conversationId={conversation.id}
          currentPolicy={retentionPolicy}
          onPolicyChanged={updateRetentionPolicy || (() => {})}
        />
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={openReportDialog}
        >
          <Flag className="h-4 w-4 text-red-500 mr-1" />
          <span className="hidden md:inline">Report</span>
        </Button>
        <Button variant="ghost" size="sm" onClick={onStartVideoCall}>
          <Video className="h-5 w-5" />
          <span className="ml-1 hidden md:inline">Video Call</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
