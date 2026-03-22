import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import { Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WaliRequestDialogProps {
  profile: DatabaseProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestType: 'message' | 'video' | null;
  currentUserId: string | null;
}

const WaliRequestDialog = ({
  profile,
  open,
  onOpenChange,
  requestType,
  currentUserId,
}: WaliRequestDialogProps) => {
  const { toast } = useToast();
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaliRequest = async () => {
    if (!currentUserId) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to send a request.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the wali ID from the profile's wali information
      const { data: waliData, error: waliError } = await supabase
        .from('wali_profiles' as any)
        .select('id')
        .eq('user_id', profile.id)
        .single();

      if (waliError) {
        console.error('Error finding wali:', waliError);
        throw new Error('Could not find the wali information');
      }

      const waliId = (waliData as any)?.id;

      // Create a chat request in the database
      const { error: requestError } = await supabase.from('chat_requests' as any).insert({
        requester_id: currentUserId,
        recipient_id: profile.id,
        wali_id: waliId,
        status: 'pending',
        message: requestMessage,
        request_type: requestType,
      } as any);

      if (requestError) {
        console.error('Error creating request:', requestError);
        throw new Error('Failed to send request to wali');
      }

      toast({
        title: 'Request sent',
        description: `Your ${requestType} request has been sent to ${profile.full_name}'s wali.`,
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting request:', error);
      toast({
        title: 'Request failed',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setRequestMessage('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Permission from Wali</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-sm text-muted-foreground">
            To {requestType === 'message' ? 'message' : 'video call'} {profile.full_name}, you need
            permission from her wali ({profile.wali_name}).
          </p>

          <div className="bg-accent/20 p-4 rounded-md">
            <p className="text-sm mb-2">
              Please include a message to the wali explaining your intentions:
            </p>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              rows={4}
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
              placeholder={`Assalamu alaikum, I would like to ${requestType === 'message' ? 'have a conversation' : 'schedule a video call'} with ${profile.full_name}...`}
            />

            <div className="flex items-center mt-4">
              <Calendar className="h-4 w-4 mr-2 text-islamic-teal" />
              <p className="text-sm text-muted-foreground">
                The wali can approve, reject, or suggest an alternative time.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button
            onClick={handleWaliRequest}
            disabled={isSubmitting || !requestMessage.trim()}
            className="bg-islamic-teal hover:bg-islamic-teal/80 text-white"
          >
            {isSubmitting ? 'Sending...' : 'Send Request'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaliRequestDialog;
