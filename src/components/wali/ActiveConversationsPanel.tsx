
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  EyeOff, 
  MessageSquare, 
  MessagesSquare, 
  Users
} from 'lucide-react';

interface Conversation {
  id: string;
  participants: string[];
  created_at: string;
  last_message_at?: string;
  supervisionId: string;
  supervisionStarted: string;
  supervisionLevel: 'active' | 'passive' | 'minimal';
  profiles: any;
}

interface ActiveConversationsPanelProps {
  conversations: Conversation[];
  onStartSupervision: (conversationId: string, level?: 'active' | 'passive' | 'minimal') => void;
  onEndSupervision: (supervisionId: string, conversationId: string) => void;
  loading?: boolean;
}

const ActiveConversationsPanel: React.FC<ActiveConversationsPanelProps> = ({
  conversations,
  onStartSupervision,
  onEndSupervision,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessagesSquare className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">No Active Supervisions</h3>
        <p className="text-muted-foreground mt-2">
          You're not currently supervising any conversations.
        </p>
      </div>
    );
  }

  const getSupervisionBadge = (level: string) => {
    switch (level) {
      case 'active':
        return <Badge className="bg-green-600">Active</Badge>;
      case 'passive':
        return <Badge className="bg-blue-600">Passive</Badge>;
      case 'minimal':
        return <Badge className="bg-yellow-600">Minimal</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => {
        // Extract participant names
        const participantNames = conversation.participants.map(id => {
          const profile = conversation.profiles?.find((p: any) => p.id === id);
          return profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User';
        }).join(' & ');
        
        return (
          <Card key={conversation.id}>
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                  <h3 className="font-medium">{participantNames}</h3>
                </div>
                {getSupervisionBadge(conversation.supervisionLevel)}
              </div>
              
              <div className="text-sm text-muted-foreground mb-3 flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" /> 
                Supervising since {formatDistanceToNow(new Date(conversation.supervisionStarted), { addSuffix: true })}
              </div>
              
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onStartSupervision(conversation.id)}
                >
                  View Messages
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => onEndSupervision(conversation.supervisionId, conversation.id)}
                >
                  <EyeOff className="h-4 w-4 mr-1" />
                  End Supervision
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ActiveConversationsPanel;
