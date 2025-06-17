import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { fetchProfileFromDb, createNewProfile, getUserEmail } from './utils/profileDbUtils';
import { DEFAULT_PRIVACY_SETTINGS } from './constants/defaultSettings';
import { validateUuid } from '@/utils/security/inputValidation';
import { useToast } from '@/hooks/use-toast';

export const useProfileFetcher = (userId?: string | null) => {
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNewUser, setIsNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: false,
    phone: false,
    id: false,
    wali: false
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isAccountVisible, setIsAccountVisible] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      // Critical security fix: Validate UUID before database query
      if (!validateUuid(userId)) {
        console.error("Invalid UUID provided for user profile fetch:", userId);
        setError("Invalid user identifier");
        toast({
          title: "Security Error",
          description: "Invalid user identifier provided",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get user email
        const email = await getUserEmail();
        setUserEmail(email);

        // Fetch profile data with validated UUID
        const { data: profile, error: profileError } = await fetchProfileFromDb(userId);

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          setError(profileError.message);
          return;
        }

        if (!profile || profile.length === 0) {
          // New user - create default profile
          console.log("No profile found, creating new profile for user:", userId);
          setIsNewUser(true);
          
          const { error: createError } = await createNewProfile(userId);
          
          if (createError) {
            console.error("Error creating new profile:", createError);
            setError(createError.message);
            return;
          }

          // Set default data for new user
          setProfileData({
            fullName: '',
            age: '',
            gender: '',
            location: '',
            education: '',
            occupation: '',
            religiousLevel: '',
            familyBackground: '',
            aboutMe: '',
            prayerFrequency: '',
            polygamyStance: '',
            waliName: '',
            waliRelationship: '',
            waliContact: '',
            profilePicture: '',
            gallery: []
          });
          
          setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
          setBlockedUsers([]);
          setIsAccountVisible(true);
        } else {
          // Existing user - map database data to form data
          const profileRecord = profile[0];
          
          const mappedData: ProfileFormData = {
            fullName: `${profileRecord.first_name || ''} ${profileRecord.last_name || ''}`.trim(),
            age: profileRecord.birth_date || '',
            gender: profileRecord.gender || '',
            location: profileRecord.location || '',
            education: profileRecord.education_level || '',
            occupation: profileRecord.occupation || '',
            religiousLevel: profileRecord.religious_practice_level || '',
            familyBackground: '',
            aboutMe: profileRecord.about_me || '',
            prayerFrequency: profileRecord.prayer_frequency || '',
            polygamyStance: profileRecord.polygamy_stance || '',
            waliName: profileRecord.wali_name || '',
            waliRelationship: profileRecord.wali_relationship || '',
            waliContact: profileRecord.wali_contact || '',
            profilePicture: profileRecord.profile_picture || '',
            gallery: profileRecord.gallery || []
          };

          setProfileData(mappedData);
          setIsNewUser(false);

          // Set verification status
          setVerificationStatus({
            email: profileRecord.email_verified || false,
            phone: profileRecord.phone_verified || false,
            id: profileRecord.id_verified || false,
            wali: profileRecord.wali_verified || false
          });

          // Set privacy settings with fallback to defaults
          const privacyData = profileRecord.privacy_settings as PrivacySettings || DEFAULT_PRIVACY_SETTINGS;
          setPrivacySettings(privacyData);

          // Set blocked users
          setBlockedUsers(profileRecord.blocked_users || []);
          
          // Set account visibility
          setIsAccountVisible(profileRecord.is_visible !== false);
        }
      } catch (err: any) {
        console.error("Error in profile fetch:", err);
        setError(err.message);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, toast]);

  return {
    profileData,
    loading,
    error,
    isNewUser,
    userEmail,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible
  };
};
