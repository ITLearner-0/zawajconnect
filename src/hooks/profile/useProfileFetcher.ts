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

        console.log("Fetching profile for user:", userId);

        // Get user email
        const email = await getUserEmail();
        setUserEmail(email);

        // Fetch profile data with validated UUID
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error("Error fetching profile:", profileError);
          setError(profileError.message);
          return;
        }

        if (!profile) {
          // New user - create default profile
          console.log("No profile found, creating new profile for user:", userId);
          setIsNewUser(true);
          
          const { error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              first_name: '',
              last_name: '',
              privacy_settings: DEFAULT_PRIVACY_SETTINGS,
              is_visible: true
            });
          
          if (createError) {
            console.error("Error creating new profile:", createError);
            setError(createError.message);
            return;
          }

          // Set default data for new user
          const defaultFormData: ProfileFormData = {
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
          };
          
          console.log("Setting default form data for new user:", defaultFormData);
          setProfileData(defaultFormData);
          setPrivacySettings(DEFAULT_PRIVACY_SETTINGS);
          setBlockedUsers([]);
          setIsAccountVisible(true);
        } else {
          // Existing user - map database data to form data
          console.log("Found existing profile:", profile);
          
          const mappedData: ProfileFormData = {
            fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            age: profile.birth_date || '',
            gender: profile.gender || '',
            location: profile.location || '',
            education: profile.education_level || '',
            occupation: profile.occupation || '',
            religiousLevel: profile.religious_practice_level || '',
            familyBackground: '',
            aboutMe: profile.about_me || '',
            prayerFrequency: profile.prayer_frequency || '',
            polygamyStance: profile.polygamy_stance || '',
            waliName: profile.wali_name || '',
            waliRelationship: profile.wali_relationship || '',
            waliContact: profile.wali_contact || '',
            profilePicture: profile.profile_picture || '',
            gallery: profile.gallery || []
          };

          console.log("Mapped profile data:", mappedData);
          setProfileData(mappedData);
          setIsNewUser(false);

          // Set verification status
          setVerificationStatus({
            email: profile.email_verified || false,
            phone: profile.phone_verified || false,
            id: profile.id_verified || false,
            wali: profile.wali_verified || false
          });

          // Set privacy settings with fallback to defaults
          const privacyData = profile.privacy_settings as PrivacySettings || DEFAULT_PRIVACY_SETTINGS;
          setPrivacySettings(privacyData);

          // Set blocked users
          setBlockedUsers(profile.blocked_users || []);
          
          // Set account visibility
          setIsAccountVisible(profile.is_visible !== false);
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
