
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, PrivacySettings, VerificationStatus } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { executeSql } from '@/utils/database/core';

// Default privacy settings to use when none are available
const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1,
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true
};

export const useProfileData = (userId?: string | null) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: false,
    phone: false,
    id: false
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isAccountVisible, setIsAccountVisible] = useState(true);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get user email from auth session
        const { data: { session } } = await supabase.auth.getSession();
        setUserEmail(session?.user?.email || null);

        // Get profile data without using .single() to avoid errors with empty results
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId);

        if (error) {
          setError(error.message);
          console.error("Supabase error fetching profile:", error);
          return;
        }

        // Check if we have data before proceeding
        if (data && data.length > 0) {
          const profile = data[0];
          
          // Map database fields to ProfileFormData
          const profileFormData: ProfileFormData = {
            fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            age: profile.birth_date || '',
            gender: profile.gender || '',
            location: profile.location || '',
            education: profile.education_level || '',
            occupation: profile.occupation || '',
            religiousLevel: profile.religious_practice_level || '',
            familyBackground: profile.about_me || '', // If family_background doesn't exist, use about_me as fallback
            aboutMe: profile.about_me || '',
            prayerFrequency: profile.prayer_frequency || '',
            waliName: profile.wali_name || '',
            waliRelationship: profile.wali_relationship || '',
            waliContact: profile.wali_contact || '',
          };
          setProfileData(profileFormData);
          
          // Set verification status - using is_verified for email verification
          setVerificationStatus({
            email: !!profile.is_verified,
            phone: false, // Use appropriate field in your schema
            id: false, // Use appropriate field in your schema
          });
          
          // Set privacy settings with fallback to default
          setPrivacySettings(profile.privacy_settings as PrivacySettings || DEFAULT_PRIVACY_SETTINGS);
          
          // Set blocked users
          setBlockedUsers(profile.blocked_users || []);
          
          // Set account visibility
          setIsAccountVisible(profile.is_visible !== false);
          
          // Determine if user is new based on data completeness
          setIsNewUser(!profile.first_name || !profile.last_name || !profile.gender);
        } else {
          // Create a new profile if none exists
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              privacy_settings: DEFAULT_PRIVACY_SETTINGS,
              blocked_users: [],
              is_visible: true
            });
            
          if (insertError) {
            console.error("Error creating new profile:", insertError);
          }
          
          setProfileData(null); // No profile data found
          setIsNewUser(true);
        }
      } catch (err: any) {
        setError(err.message);
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId, toast]);

  // Function to update profile data
  const updateProfileData = async (newProfileData: ProfileFormData) => {
    setLoading(true);
    setError(null);

    try {
      // Destructure fullName into first_name and last_name
      const [first_name, ...lastNameParts] = newProfileData.fullName.split(' ');
      const last_name = lastNameParts.join(' ');

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: first_name,
          last_name: last_name,
          birth_date: newProfileData.age,
          gender: newProfileData.gender,
          location: newProfileData.location,
          education_level: newProfileData.education,
          occupation: newProfileData.occupation,
          religious_practice_level: newProfileData.religiousLevel,
          about_me: newProfileData.aboutMe,
          prayer_frequency: newProfileData.prayerFrequency,
          wali_name: newProfileData.waliName || null,
          wali_relationship: newProfileData.waliRelationship || null,
          wali_contact: newProfileData.waliContact || null,
        })
        .eq('id', userId);

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

      // Update local state with new data
      setProfileData(newProfileData);
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
    profileData,
    loading,
    error,
    updateProfileData,
    isNewUser,
    userEmail,
    formData: profileData,
    verificationStatus,
    userId,
    privacySettings,
    blockedUsers,
    isAccountVisible
  };
};
