
import { useState, useEffect } from 'react';
import { DatabaseProfile } from '@/types/profile';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { supabase } from '@/integrations/supabase/client';

// Import refactored components
import ProfileCardHeader from './card/ProfileCardHeader';
import ProfileCardActions from './card/ProfileCardActions';
import WaliContactDialog from './card/WaliContactDialog';
import WaliRequestDialog from './card/WaliRequestDialog';
import { useProfileInteractions } from './card/useProfileInteractions';

interface ProfileCardProps {
  profile: DatabaseProfile;
}

const ProfileCard = ({ profile }: ProfileCardProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Get current user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setCurrentUserId(data.session.user.id);
      }
    };
    getCurrentUser();
  }, []);
  
  // Use the extracted profile interactions hook
  const {
    dialogOpen,
    setDialogOpen,
    waliRequestDialogOpen,
    setWaliRequestDialogOpen,
    requestType,
    handleMessage,
    handleVideoCall,
    handleContactWali
  } = useProfileInteractions(profile);

  return (
    <IslamicPattern variant="border" className="bg-white rounded-lg shadow-lg p-6">
      <ProfileCardHeader profile={profile} />
      
      <ProfileCardActions 
        profile={profile}
        onMessageRequest={handleMessage}
        onVideoCallRequest={handleVideoCall}
        onWaliContactRequest={handleContactWali}
      />
      
      {/* Wali Contact Dialog */}
      <WaliContactDialog 
        profile={profile} 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
      />
      
      {/* Wali Request Dialog */}
      <WaliRequestDialog 
        profile={profile}
        open={waliRequestDialogOpen}
        onOpenChange={setWaliRequestDialogOpen}
        requestType={requestType}
        currentUserId={currentUserId}
      />
    </IslamicPattern>
  );
};

export default ProfileCard;
