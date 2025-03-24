
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Eye, MessageCircle, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface FlaggedItem {
  id: string;
  message: {
    id: string;
    content: string;
    sender_id: string;
    created_at: string;
  };
  conversation_id: string;
  flag_reason: string;
  flagged_at: string;
  status: 'pending' | 'resolved';
}

interface MonitoringPanelProps {
  flaggedContent: FlaggedItem[];
  onViewConversation?: (conversationId: string) => void;
  onResolveFlag?: (id: string, notes: string) => void;
  loading?: boolean;
}

const MonitoringPanel: React.FC<MonitoringPanelProps> = ({
  flaggedContent,
  onViewConversation,
  onResolveFlag,
  loading = false
}) => {
  const [selectedItem, setSelectedItem] = useState<FlaggedItem | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const openDetailsDialog = (item: FlaggedItem) => {
    setSelectedItem(item);
    setShowDetailsDialog(true);
  };

  const handleResolve = () => {
    if (selectedItem && onResolveFlag) {
      onResolveFlag(selectedItem.id, '');
      setShowDetailsDialog(false);
    }
  };

  const pendingItems = flaggedContent.filter(item => item.status === 'pending');
  const resolvedItems = flaggedContent.filter(item => item.status === 'resolved');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (flaggedContent.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <CheckCircle2 className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">No Flagged Content</h3>
        <p className="text-muted-foreground mt-2">
          There are currently no flagged messages requiring your attention.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Pending Issues</h3>
          <div className="space-y-4">
            {pendingItems.map((item) => (
              <Card key={item.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <div className="flex items-center">
                      <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                      <h4 className="font-medium">{item.flag_reason}</h4>
                    </div>
                    <Badge variant="destructive">Pending</Badge>
                  </div>
                  
                  <p className="text-sm line-clamp-2 mb-3">
                    {item.message.content}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-3">
                    Flagged {formatDistanceToNow(new Date(item.flagged_at), { addSuffix: true })}
                  </div>
                  
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailsDialog(item)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    
                    {onViewConversation && (
                      <Button
                        size="sm"
                        onClick={() => onViewConversation(item.conversation_id)}
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        View Conversation
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {resolvedItems.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Recently Resolved</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {resolvedItems.slice(0, 4).map((item) => (
              <Card key={item.id} className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex justify-between mb-2">
                    <h4 className="font-medium text-sm">{item.flag_reason}</h4>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Resolved
                    </Badge>
                  </div>
                  
                  <p className="text-xs line-clamp-1 mb-2">
                    {item.message.content}
                  </p>
                  
                  <div className="text-xs text-muted-foreground">
                    Resolved {formatDistanceToNow(new Date(item.flagged_at), { addSuffix: true })}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flagged Message Details</DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4 py-2">
              <div>
                <span className="text-sm font-medium">Reason:</span>
                <div className="flex items-center mt-1">
                  <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                  <span>{selectedItem.flag_reason}</span>
                </div>
              </div>
              
              <div>
                <span className="text-sm font-medium">Message Content:</span>
                <p className="mt-1 p-3 bg-gray-50 rounded-md">
                  {selectedItem.message.content}
                </p>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Sent: {formatDistanceToNow(new Date(selectedItem.message.created_at), { addSuffix: true })}</span>
                <span>Flagged: {formatDistanceToNow(new Date(selectedItem.flagged_at), { addSuffix: true })}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
            
            <div className="flex space-x-2">
              {onViewConversation && selectedItem && (
                <Button 
                  variant="outline"
                  onClick={() => {
                    onViewConversation(selectedItem.conversation_id);
                    setShowDetailsDialog(false);
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  View Conversation
                </Button>
              )}
              
              {onResolveFlag && selectedItem && selectedItem.status === 'pending' && (
                <Button onClick={handleResolve}>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Mark as Resolved
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringPanel;
