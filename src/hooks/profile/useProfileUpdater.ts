
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { validateUuid, validateProfileUpdate, sanitizeInput } from '@/utils/security/inputValidation';

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

    // Critical security fix: Validate UUID before database operation
    if (!validateUuid(userId)) {
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
      const sanitizedFullName = sanitizeInput(newProfileData.fullName);
      const [first_name, ...lastNameParts] = sanitizedFullName.split(' ');
      const last_name = lastNameParts.join(' ');

      // Prepare update data with validation and sanitization
      const updateData = {
        first_name: sanitizeInput(first_name || ''),
        last_name: sanitizeInput(last_name || ''),
        birth_date: newProfileData.age || null,
        gender: newProfileData.gender || null,
        location: sanitizeInput(newProfileData.location || ''),
        education_level: sanitizeInput(newProfileData.education || ''),
        occupation: sanitizeInput(newProfileData.occupation || ''),
        religious_practice_level: newProfileData.religiousLevel || null,
        about_me: sanitizeInput(newProfileData.aboutMe || ''),
        prayer_frequency: newProfileData.prayerFrequency || null,
        polygamy_stance: newProfileData.polygamyStance || null,
        wali_name: sanitizeInput(newProfileData.waliName || ''),
        wali_relationship: sanitizeInput(newProfileData.waliRelationship || ''),
        wali_contact: sanitizeInput(newProfileData.waliContact || ''),
        profile_picture: newProfileData.profilePicture || null,
        gallery: newProfileData.gallery || []
      };

      // Validate the update data
      const validation = validateProfileUpdate(updateData);
      if (!validation.success) {
        console.error("Profile validation failed:", validation.error);
        toast({
          title: "Validation Error",
          description: "Invalid profile data provided",
          variant: "destructive",
        });
        return false;
      }

      // Use upsert to handle both insert and update with validated UUID
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
