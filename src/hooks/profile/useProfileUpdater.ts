
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';

export const useProfileUpdater = (userId?: string | null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const updateProfileData = async (newProfileData: ProfileFormData) => {
    if (!userId) {
      toast({
        title: "Error",
        description: "User ID is not available. Please log in again.",
        variant: "destructive",
      });
      return false;
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      console.error("Invalid UUID provided for profile update:", userId);
      toast({
        title: "Security Error",
        description: "Invalid user identifier provided",
        variant: "destructive",
      });
      return false;
    }
    
    setLoading(true);
    setError(null);

    try {
      // Destructure and sanitize fullName into first_name and last_name
      const fullName = newProfileData.fullName || '';
      const [first_name, ...lastNameParts] = fullName.split(' ');
      const last_name = lastNameParts.join(' ');

      // Prepare update data with proper validation
      const updateData: any = {
        first_name: first_name || null,
        last_name: last_name || null,
        birth_date: newProfileData.age || null,
        gender: newProfileData.gender || null,
        location: newProfileData.location || null,
        education_level: newProfileData.education || null,
        occupation: newProfileData.occupation || null,
        religious_practice_level: newProfileData.religiousLevel || null,
        about_me: newProfileData.aboutMe || null,
        prayer_frequency: newProfileData.prayerFrequency || null,
        polygamy_stance: newProfileData.polygamyStance || null,
        wali_name: newProfileData.waliName || null,
        wali_relationship: newProfileData.waliRelationship || null,
        wali_contact: newProfileData.waliContact || null,
        profile_picture: newProfileData.profilePicture || null,
        gallery: newProfileData.gallery || [],
        updated_at: new Date().toISOString()
      };

      // Remove null/empty values to avoid overwriting with nulls
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === null || updateData[key] === '') {
          delete updateData[key];
        }
      });

      console.log("Updating profile with data:", updateData);

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', userId)
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
