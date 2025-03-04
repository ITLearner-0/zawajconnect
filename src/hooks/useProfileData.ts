
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, PrivacySettings, VerificationStatus } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { executeSql } from '@/utils/database';

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
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
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

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (error) {
          setError(error.message);
          console.error("Supabase error fetching profile:", error);
          return;
        }

        if (data) {
          // Map database fields to ProfileFormData
          const profileFormData: ProfileFormData = {
            fullName: `${data.first_name} ${data.last_name}`,
            age: data.birth_date,
            gender: data.gender,
            location: data.location,
            education: data.education_level,
            occupation: data.occupation,
            religiousLevel: data.religious_practice_level,
            familyBackground: data.family_background || '',
            aboutMe: data.about_me,
            prayerFrequency: data.prayer_frequency,
            waliName: data.wali_name || '',
            waliRelationship: data.wali_relationship || '',
            waliContact: data.wali_contact || '',
          };
          setProfileData(profileFormData);
          
          // Set verification status
          setVerificationStatus({
            email: !!data.email_verified,
            phone: !!data.phone_verified,
            id: !!data.id_verified
          });
          
          // Set privacy settings
          setPrivacySettings(data.privacy_settings as PrivacySettings);
          
          // Set blocked users
          setBlockedUsers(data.blocked_users || []);
          
          // Set account visibility
          setIsAccountVisible(data.is_visible !== false);
          
          // Determine if user is new based on data completeness
          setIsNewUser(!data.first_name || !data.last_name || !data.gender);
        } else {
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
