
import { useState } from 'react';
import { DatabaseProfile } from '@/types/profile';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { Mail, Bookmark, Video, UserCheck } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface ProfileCardProps {
  profile: DatabaseProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const handleMessage = () => {
    // Redirect to messages page for this user
    navigate(`/messages/${profile.id}`);
    toast({
      title: "Starting conversation",
      description: `You're about to message ${profile.first_name}.`,
    });
  };
  
  const handleVideoCall = () => {
    // Future implementation will use actual video call
    toast({
      title: "Video call requested",
      description: `Video call request sent to ${profile.first_name}.`,
    });
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
    </IslamicPattern>
  );
};

export default ProfileCard;
