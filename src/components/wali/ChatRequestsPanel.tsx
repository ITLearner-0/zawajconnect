
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatRequest } from '@/types/wali';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { CheckCircle, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ChatRequestsPanelProps {
  chatRequests: ChatRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onAddNote: (id: string, note: string) => void;
}

const ChatRequestsPanel: React.FC<ChatRequestsPanelProps> = ({ 
  chatRequests, 
  onApprove, 
  onReject,
  onAddNote
}) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState<ChatRequest | null>(null);
  const [note, setNote] = useState('');
  
  const filteredRequests = chatRequests.filter(request => {
    if (activeTab === 'pending') return request.status === 'pending';
    if (activeTab === 'approved') return request.status === 'approved';
    if (activeTab === 'rejected') return request.status === 'rejected';
    return true;
  });
  
  const handleNoteSubmit = () => {
    if (selectedRequest && note.trim()) {
      onAddNote(selectedRequest.id, note);
      setNote('');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Chat Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="pending" className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Pending
              {chatRequests.filter(r => r.status === 'pending').length > 0 && (
                <span className="ml-2 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {chatRequests.filter(r => r.status === 'pending').length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="approved" className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved
            </TabsTrigger>
            <TabsTrigger value="rejected" className="flex items-center">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab}>
            {chatRequests.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No Chat Requests Available</h3>
                <p className="text-muted-foreground">
                  Chat requests will appear here when users request permission to communicate.
                </p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab} chat requests
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequests.map(request => (
                  <div key={request.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar>
                          <AvatarImage 
                            src={request.requester_profile?.profile_image || 
                                `https://api.dicebear.com/7.x/initials/svg?seed=${request.requester_profile?.first_name || ''} ${request.requester_profile?.last_name || ''}`} 
                          />
                          <AvatarFallback>
                            {request.requester_profile?.first_name?.[0] || ''}
                            {request.requester_profile?.last_name?.[0] || ''}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-medium">
                            {request.requester_profile?.first_name} {request.requester_profile?.last_name}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Requested {formatDistanceToNow(new Date(request.requested_at), { addSuffix: true })}
                          </p>
                          {request.message && (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="mt-1 h-7 text-xs">
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  View Message
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Request Message</DialogTitle>
                                </DialogHeader>
                                <div className="mt-4 p-4 bg-muted rounded-md">
                                  {request.message}
                                </div>
                              </DialogContent>
                            </Dialog>
                          )}
                        </div>
                      </div>
                      
                      {request.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600"
                            onClick={() => onReject(request.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => onApprove(request.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </div>
                      )}
                      
                      {request.status === 'approved' && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                          Approved
                        </span>
                      )}
                      
                      {request.status === 'rejected' && (
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
                          Rejected
                        </span>
                      )}
                    </div>
                    
                    {request.wali_notes && (
                      <div className="mt-3 text-sm bg-muted p-2 rounded">
                        <span className="font-medium">Your notes:</span> {request.wali_notes}
                      </div>
                    )}
                    
                    {request.status === 'pending' && (
                      <div className="mt-3">
                        <Textarea
                          placeholder="Add notes about this request..."
                          value={selectedRequest?.id === request.id ? note : ''}
                          onChange={(e) => {
                            setSelectedRequest(request);
                            setNote(e.target.value);
                          }}
                          className="text-sm"
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={handleNoteSubmit}
                            disabled={!note.trim() || selectedRequest?.id !== request.id}
                          >
                            Save Note
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ChatRequestsPanel;
