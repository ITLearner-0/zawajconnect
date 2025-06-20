
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DatabaseProfile } from '@/types/profile';

export const useProfileInteractions = (profile: DatabaseProfile) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [waliRequestDialogOpen, setWaliRequestDialogOpen] = useState(false);
  const [requestType, setRequestType] = useState<'message' | 'video' | null>(null);
  
  const hasWali = profile.wali_name && profile.wali_contact;
  
  const handleMessage = async () => {
    console.log("handleMessage called for profile:", profile.id, "gender:", profile.gender, "hasWali:", hasWali);
    
    if (profile.gender === 'Female' && hasWali) {
      // For female profiles with wali, show the request dialog
      console.log("Showing wali request dialog for messaging");
      setRequestType('message');
      setWaliRequestDialogOpen(true);
    } else {
      // For male profiles or females without wali, direct message
      console.log("Navigating directly to messages with profile ID:", profile.id);
      try {
        navigate(`/messages/${profile.id}`);
        toast({
          title: "Starting conversation",
          description: `You're about to message ${profile.first_name}.`,
        });
      } catch (error) {
        console.error("Navigation error:", error);
        toast({
          title: "Navigation Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive"
        });
      }
    }
  };
  
  const handleVideoCall = async () => {
    console.log("handleVideoCall called for profile:", profile.id);
    
    if (profile.gender === 'Female' && hasWali) {
      // For female profiles with wali, show the request dialog
      setRequestType('video');
      setWaliRequestDialogOpen(true);
    } else {
      // For male profiles or females without wali, direct video call
      console.log("Starting video call with profile ID:", profile.id);
      navigate(`/messages/${profile.id}`);
      toast({
        title: "Video call initiated",
        description: `Starting video call with ${profile.first_name}.`,
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

  return {
    dialogOpen,
    setDialogOpen,
    waliRequestDialogOpen,
    setWaliRequestDialogOpen,
    requestType,
    handleMessage,
    handleVideoCall,
    handleContactWali
  };
};
