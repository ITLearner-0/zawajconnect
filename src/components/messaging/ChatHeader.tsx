
import React from 'react';
import { ArrowLeft, Video, Flag, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/types/profile';
import RetentionSettings from './RetentionSettings';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

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
  userStatus?: 'online' | 'offline' | 'away' | 'busy';
  lastActive?: string;
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
  updateRetentionPolicy,
  userStatus = 'offline',
  lastActive
}) => {
  const otherParticipant = conversation.profile || { first_name: 'User', last_name: '' };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      case 'offline': 
      default: return 'bg-gray-500';
    }
  };
  
  // Format last active time
  const formatLastActive = (timestamp: string | undefined) => {
    if (!timestamp) return 'Unknown';
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Unknown';
    }
  };

  return (
    <div className="flex items-center justify-between p-3 border-b border-islamic-teal/20 dark:border-islamic-darkTeal/30 bg-islamic-cream/50 dark:bg-islamic-darkCard/50">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={backToList} 
          className="mr-2 md:hidden text-islamic-teal hover:bg-islamic-teal/10 dark:text-islamic-brightGold dark:hover:bg-islamic-brightGold/10"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={`https://api.dicebear.com/7.x/micah/svg?seed=${otherParticipant.first_name} ${otherParticipant.last_name}`} />
          <AvatarFallback>{otherParticipant.first_name?.[0]}{otherParticipant.last_name?.[0]}</AvatarFallback>
        </Avatar>
        
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-islamic-burgundy dark:text-islamic-cream">
              {otherParticipant.first_name} {otherParticipant.last_name}
            </h3>
            <div className={`h-2.5 w-2.5 rounded-full ml-2 ${getStatusColor(userStatus)}`}></div>
          </div>
          
          <div className="flex items-center text-xs text-muted-foreground">
            {isWaliSupervised && (
              <span className="text-green-600 dark:text-green-400 mr-2">Wali supervised</span>
            )}
            {lastActive && (
              <div className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                <span>Last active {formatLastActive(lastActive)}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Security settings button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowSecuritySettings(!showSecuritySettings)}
          className={`border-islamic-teal/20 text-islamic-teal hover:bg-islamic-teal/10 dark:border-islamic-darkTeal/30 dark:text-islamic-brightGold dark:hover:bg-islamic-brightGold/10 ${
            showSecuritySettings ? 'bg-islamic-teal/10 dark:bg-islamic-brightGold/10' : ''
          }`}
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
          className="border-islamic-teal/20 hover:bg-islamic-teal/10 dark:border-islamic-darkTeal/30 dark:hover:bg-islamic-darkTeal/20"
        >
          <Flag className="h-4 w-4 text-red-500 mr-1" />
          <span className="hidden md:inline">Report</span>
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onStartVideoCall}
          className="text-islamic-teal hover:bg-islamic-teal/10 dark:text-islamic-brightGold dark:hover:bg-islamic-brightGold/10"
        >
          <Video className="h-5 w-5" />
          <span className="ml-1 hidden md:inline">Video Call</span>
        </Button>
      </div>
    </div>
  );
};

export default ChatHeader;
