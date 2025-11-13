
import { useState, useEffect, useRef } from 'react';
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
  
  // Use ref to track if we've already fetched for this userId
  const fetchedUserIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no userId or already fetched for this userId
    if (!userId || fetchedUserIdRef.current === userId) return;
    
    const fetchProfile = async () => {
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
        fetchedUserIdRef.current = userId; // Mark as fetched

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
          
          const { error: createError } = await (supabase as any)
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
            fullName: `${(profile as any).first_name || ''} ${(profile as any).last_name || ''}`.trim(),
            age: (profile as any).birth_date || '',
            gender: (profile as any).gender || '',
            location: (profile as any).location || '',
            education: (profile as any).education_level || '',
            occupation: (profile as any).occupation || '',
            religiousLevel: (profile as any).religious_practice_level || '',
            familyBackground: '',
            aboutMe: (profile as any).about_me || '',
            prayerFrequency: (profile as any).prayer_frequency || '',
            polygamyStance: (profile as any).polygamy_stance || '',
            waliName: (profile as any).wali_name || '',
            waliRelationship: (profile as any).wali_relationship || '',
            waliContact: (profile as any).wali_contact || '',
            profilePicture: (profile as any).profile_picture || '',
            gallery: (profile as any).gallery || []
          };

          console.log("Mapped profile data:", mappedData);
          setProfileData(mappedData);
          setIsNewUser(false);

          // Set verification status
          setVerificationStatus({
            email: (profile as any).email_verified || false,
            phone: (profile as any).phone_verified || false,
            id: (profile as any).id_verified || false,
            wali: (profile as any).wali_verified || false
          });

          // Set privacy settings with fallback to defaults
          const privacyData = (profile as any).privacy_settings as PrivacySettings || DEFAULT_PRIVACY_SETTINGS;
          setPrivacySettings(privacyData);

          // Set blocked users
          setBlockedUsers((profile as any).blocked_users || []);
          
          // Set account visibility
          setIsAccountVisible((profile as any).is_visible !== false);
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
