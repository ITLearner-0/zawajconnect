
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useProfileUpdater = (userId?: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to update profile data
  const updateProfileData = async (newProfileData: ProfileFormData) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is not available. Please log in again.",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Destructure fullName into first_name and last_name
      const [first_name, ...lastNameParts] = newProfileData.fullName.split(' ');
      const last_name = lastNameParts.join(' ');

      // Prepare update data, preserving existing values
      const updateData: any = {
        first_name: first_name || '',
        last_name: last_name || '',
        birth_date: newProfileData.age || null,
        gender: newProfileData.gender || null,
        location: newProfileData.location || null,
        education_level: newProfileData.education || null,
        occupation: newProfileData.occupation || null,
        religious_practice_level: newProfileData.religiousLevel || null,
        about_me: newProfileData.aboutMe || null,
        prayer_frequency: newProfileData.prayerFrequency || null,
        wali_name: newProfileData.waliName || null,
        wali_relationship: newProfileData.waliRelationship || null,
        wali_contact: newProfileData.waliContact || null,
        profile_picture: newProfileData.profilePicture || null,
        gallery: newProfileData.gallery || []
      };

      // Use upsert to handle both insert and update
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ id: userId, ...updateData }, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();

      if (error) {
        setError(error.message);
        console.error("Supabase error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      console.log("Profile updated successfully:", data);
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      return true;
    } catch (err: any) {
      setError(err.message);
      console.error("Error updating profile:", err);
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfileData,
    loading,
    error
  };
};
