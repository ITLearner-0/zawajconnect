
import React, { useState } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import { ChatRequest } from '@/types/wali';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Check, X, MessageCircle, VideoIcon, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

interface ChatRequestsPanelProps {
  chatRequests: ChatRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
  loading?: boolean;
}

const ChatRequestsPanel: React.FC<ChatRequestsPanelProps> = ({
  chatRequests,
  onApprove,
  onReject,
  onAddNote,
  loading = false
}) => {
  const [selectedRequest, setSelectedRequest] = useState<ChatRequest | null>(null);
  const [note, setNote] = useState('');
  const [showNoteDialog, setShowNoteDialog] = useState(false);

  const handleNoteSubmit = () => {
    if (selectedRequest && note.trim()) {
      onAddNote(selectedRequest.id, note);
      setShowNoteDialog(false);
    }
  };

  const openNoteDialog = (request: ChatRequest) => {
    setSelectedRequest(request);
    setNote(request.wali_notes || '');
    setShowNoteDialog(true);
  };

  const pendingRequests = chatRequests.filter(req => req.status === 'pending');
  const otherRequests = chatRequests.filter(req => req.status !== 'pending');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (chatRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <MessageCircle className="h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium">No Chat Requests</h3>
        <p className="text-muted-foreground mt-2">
          You currently don't have any chat requests to manage.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {pendingRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Pending Requests</h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10">
                        {request.requester_profile?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <div>
                          <span className="font-medium">
                            {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                          </span>
                          <Badge className="ml-2" variant={request.request_type === 'video' ? 'destructive' : 'outline'}>
                            {request.request_type === 'video' ? (
                              <div className="flex items-center">
                                <VideoIcon className="h-3 w-3 mr-1" />
                                Video Call
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Message
                              </div>
                            )}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">
                        {request.message || "No message provided"}
                      </p>
                      
                      <div className="flex justify-between items-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openNoteDialog(request)}
                        >
                          Add Note
                        </Button>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onReject(request.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => onApprove(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      {otherRequests.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-4">Recent Requests</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            {otherRequests.slice(0, 4).map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-primary/10">
                        {request.requester_profile?.first_name?.[0] || "U"}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="font-medium text-sm">
                          {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                        </span>
                        <Badge variant={request.status === 'approved' ? 'success' : 'secondary'} className="text-xs">
                          {request.status === 'approved' ? 'Approved' : 'Rejected'}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mb-1">
                        {format(new Date(request.requested_at), 'MMM d, yyyy')}
                      </div>
                      
                      {request.wali_notes && (
                        <p className="text-xs bg-muted p-2 rounded mt-2">
                          <span className="font-medium">Note:</span> {request.wali_notes}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
      
      <Dialog open={showNoteDialog} onOpenChange={setShowNoteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Note to Request</DialogTitle>
          </DialogHeader>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add your notes about this request..."
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNoteDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleNoteSubmit}>
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatRequestsPanel;
