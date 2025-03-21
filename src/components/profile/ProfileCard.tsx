
import { useState } from 'react';
import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { Mail, Bookmark, Video, UserCheck, Calendar } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface ProfileCardProps {
  profile: DatabaseProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waliRequestDialogOpen, setWaliRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'message' | 'video' | null>(null);
  const [requestMessage, setRequestMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Determine if the current user is male to enforce wali approval for messaging/video calls with females
  useState(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    };
    getCurrentUser();
  }, []);
  
  const handleMessage = async () => {
    if (profile.gender === 'Female' && hasWali) {
      // For female profiles with wali, show the request dialog
      setRequestType('message');
      setWaliRequestDialogOpen(true);
    } else {
      // For male profiles or females without wali, direct message
      navigate(`/messages/${profile.id}`);
      toast({
        title: "Starting conversation",
        description: `You're about to message ${profile.first_name}.`,
      });
    }
  };
  
  const handleVideoCall = async () => {
    if (profile.gender === 'Female' && hasWali) {
      // For female profiles with wali, show the request dialog
      setRequestType('video');
      setWaliRequestDialogOpen(true);
    } else {
      // For male profiles or females without wali, direct video call
      toast({
        title: "Video call requested",
        description: `Video call request sent to ${profile.first_name}.`,
      });
    }
  };
  
  const handleContactWali = () => {
    if (profile.wali_contact) {
      setDialogOpen(true);
    } else {
      toast({
        title: "Wali information unavailable",
        description: "This profile does not have wali contact information available.",
        variant: "destructive",
      });
    }
  };
  
  const handleWaliRequest = async () => {
    if (!currentUserId) {
      toast({
        title: "Authentication required",
        description: "Please sign in to send a request.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get the wali ID from the profile's wali information
      const { data: waliData, error: waliError } = await supabase
        .from('wali_profiles')
        .select('id')
        .eq('user_id', profile.id)
        .single();
      
      if (waliError) {
        console.error("Error finding wali:", waliError);
        throw new Error("Could not find the wali information");
      }
      
      const waliId = waliData?.id;
      
      // Create a chat request in the database
      const { error: requestError } = await supabase
        .from('chat_requests')
        .insert({
          requester_id: currentUserId,
          recipient_id: profile.id,
          wali_id: waliId,
          status: 'pending',
          message: requestMessage,
          request_type: requestType
        });
      
      if (requestError) {
        console.error("Error creating request:", requestError);
        throw new Error("Failed to send request to wali");
      }
      
      toast({
        title: "Request sent",
        description: `Your ${requestType} request has been sent to ${profile.first_name}'s wali.`,
      });
      
      setWaliRequestDialogOpen(false);
    } catch (error) {
      console.error("Error submitting request:", error);
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setRequestMessage('');
    }
  };
  
  const hasWali = profile.wali_name && profile.wali_contact;
  const isWoman = profile.gender === 'Female';

  return (
    <IslamicPattern variant="border" className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex flex-col items-center text-center">
        <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-islamic-teal/20 mb-4">
          {profile.profile_picture ? (
            <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
          ) : null}
          <AvatarFallback className="bg-islamic-teal text-white text-3xl">
            {profile.first_name[0]}
          </AvatarFallback>
        </Avatar>
        
        <h1 className="text-2xl font-bold text-islamic-blue">
          {profile.first_name} {profile.last_name}
        </h1>
        
        <p className="text-muted-foreground mt-1">{profile.occupation}</p>
        
        <Badge className={`mt-2 ${profile.gender === 'Male' ? 'bg-islamic-blue' : 'bg-islamic-gold'}`}>
          {profile.gender}
        </Badge>

        <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
          <CustomButton 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleMessage}
          >
            <Mail className="mr-1 h-4 w-4" /> Message
          </CustomButton>
          
          <CustomButton 
            variant="outline" 
            size="sm" 
            className="flex items-center"
            onClick={handleVideoCall}
          >
            <Video className="mr-1 h-4 w-4" /> Video Call
          </CustomButton>
          
          {isWoman && (
            <CustomButton 
              variant={hasWali ? "teal" : "outline"} 
              size="sm" 
              className="flex items-center"
              onClick={handleContactWali}
              disabled={!hasWali}
            >
              <UserCheck className="mr-1 h-4 w-4" /> Contact Wali
            </CustomButton>
          )}
          
          <CustomButton variant="outline" size="sm" className="flex items-center">
            <Bookmark className="mr-1 h-4 w-4" /> Save
          </CustomButton>
        </div>
      </div>
      
      {/* Wali Contact Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Wali Contact Information</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              According to Islamic tradition, communication with {profile.first_name} requires wali permission.
            </p>
            
            <div className="bg-accent/20 p-4 rounded-md">
              <h3 className="font-medium">Wali Details:</h3>
              <p><span className="font-medium">Name:</span> {profile.wali_name}</p>
              <p><span className="font-medium">Relationship:</span> {profile.wali_relationship}</p>
              <p><span className="font-medium">Contact:</span> {profile.wali_contact}</p>
            </div>
            
            <div className="flex justify-end gap-2">
              <CustomButton variant="outline" onClick={() => setDialogOpen(false)}>
                Close
              </CustomButton>
              <CustomButton 
                variant="teal" 
                onClick={() => {
                  toast({
                    title: "Wali contact initiated",
                    description: "Contact request sent to the wali.",
                  });
                  setDialogOpen(false);
                }}
              >
                Contact Wali
              </CustomButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Wali Request Dialog */}
      <Dialog open={waliRequestDialogOpen} onOpenChange={setWaliRequestDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Permission from Wali</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              To {requestType === 'message' ? 'message' : 'video call'} {profile.first_name}, 
              you need permission from her wali ({profile.wali_name}).
            </p>
            
            <div className="bg-accent/20 p-4 rounded-md">
              <p className="text-sm mb-2">Please include a message to the wali explaining your intentions:</p>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md" 
                rows={4}
                value={requestMessage}
                onChange={(e) => setRequestMessage(e.target.value)}
                placeholder={`Assalamu alaikum, I would like to ${requestType === 'message' ? 'have a conversation' : 'schedule a video call'} with ${profile.first_name}...`}
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
    </IslamicPattern>
  );
};

export default ProfileCard;
