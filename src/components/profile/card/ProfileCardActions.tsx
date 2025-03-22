
import { useState } from 'react';
import { DatabaseProfile } from '@/types/profile';
import { Mail, Bookmark, Video, UserCheck } from 'lucide-react';
import CustomButton from '@/components/CustomButton';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface ProfileCardActionsProps {
  profile: DatabaseProfile;
  onWaliContactRequest: () => void;
  onMessageRequest: () => void;
  onVideoCallRequest: () => void;
}

const ProfileCardActions = ({ 
  profile, 
  onWaliContactRequest, 
  onMessageRequest, 
  onVideoCallRequest 
}: ProfileCardActionsProps) => {
  const isWoman = profile.gender === 'Female';
  const hasWali = profile.wali_name && profile.wali_contact;

  return (
    <div className="flex flex-wrap items-center justify-center mt-6 gap-2">
      <CustomButton 
        variant="outline" 
        size="sm" 
        className="flex items-center"
        onClick={onMessageRequest}
      >
        <Mail className="mr-1 h-4 w-4" /> Message
      </CustomButton>
      
      <CustomButton 
        variant="outline" 
        size="sm" 
        className="flex items-center"
        onClick={onVideoCallRequest}
      >
        <Video className="mr-1 h-4 w-4" /> Video Call
      </CustomButton>
      
      {isWoman && (
        <CustomButton 
          variant={hasWali ? "teal" : "outline"} 
          size="sm" 
          className="flex items-center"
          onClick={onWaliContactRequest}
          disabled={!hasWali}
        >
          <UserCheck className="mr-1 h-4 w-4" /> Contact Wali
        </CustomButton>
      )}
      
      <CustomButton variant="outline" size="sm" className="flex items-center">
        <Bookmark className="mr-1 h-4 w-4" /> Save
      </CustomButton>
    </div>
  );
};

export default ProfileCardActions;
