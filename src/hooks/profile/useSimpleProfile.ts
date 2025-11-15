import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProfileFormData, VerificationStatus, PrivacySettings } from '@/types/profile';
import { useProfileSubmission } from './useProfileSubmission';
import { useAuthSignOut } from './useAuthSignOut';

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1,
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true
};

const DEFAULT_FORM_DATA: ProfileFormData = {
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

export const useSimpleProfile = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>(DEFAULT_FORM_DATA);
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
  
  const { submitProfile } = useProfileSubmission();
  const { handleSignOut } = useAuthSignOut();

  // Get user session and load profile
  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        console.log("Getting user session...");
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw new Error(`Session error: ${sessionError.message}`);
        }

        if (!session?.user?.id) {
          console.log("No authenticated user found");
          if (mounted) {
            setLoading(false);
            setError("No authenticated user found");
          }
          return;
        }

        if (!mounted) return;

        const currentUserId = session.user.id;
        setUserId(currentUserId);
        setUserEmail(session.user.email || null);

        console.log("Loading profile for user:", currentUserId);

        // Fetch profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUserId)
          .maybeSingle();

        if (profileError && profileError.code !== 'PGRST116') {
          throw new Error(`Profile fetch error: ${profileError.message}`);
        }

        if (!mounted) return;

        if (!profile) {
          // Create new profile
          console.log("Creating new profile...");
          setIsNewUser(true);
          
          const { error: createError } = await (supabase as any)
            .from('profiles')
            .insert({
              id: currentUserId,
              first_name: '',
              last_name: '',
              privacy_settings: DEFAULT_PRIVACY_SETTINGS,
              is_visible: true
            });
          
          if (createError) {
            throw new Error(`Profile creation error: ${createError.message}`);
          }

          setFormData(DEFAULT_FORM_DATA);
        } else {
          // Map existing profile
          console.log("Found existing profile:", profile);
          setIsNewUser(false);
          
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

          setFormData(mappedData);
          
          setVerificationStatus({
            email: (profile as any).email_verified || false,
            phone: (profile as any).phone_verified || false,
            id: (profile as any).id_verified || false,
            wali: (profile as any).wali_verified || false
          });

          setPrivacySettings((profile as any).privacy_settings as PrivacySettings || DEFAULT_PRIVACY_SETTINGS);
          setBlockedUsers((profile as any).blocked_users || []);
          setIsAccountVisible((profile as any).is_visible !== false);
        }

        setLoading(false);
      } catch (err: any) {
        console.error("Error loading profile:", err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!userId) {
      console.error("No user ID available");
      return false;
    }
    
    const success = await submitProfile(
      userId, 
      formData, 
      privacySettings,
      (savedData) => {
        setFormData(savedData);
      }
    );
    
    return success;
  };

  const handleVerificationChange = (field: keyof VerificationStatus, value: boolean) => {
    setVerificationStatus(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePrivacySettingsChange = (newSettings: PrivacySettings) => {
    setPrivacySettings(newSettings);
  };

  const toggleAccountVisibility = async () => {
    setIsAccountVisible(prev => !prev);
  };

  const unblockUser = async (userIdToUnblock: string) => {
    setBlockedUsers(prev => prev.filter(id => id !== userIdToUnblock));
  };

  return {
    formData,
    loading,
    error,
    isNewUser,
    userEmail,
    userId,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    handleChange,
    handleVerificationChange,
    handlePrivacySettingsChange,
    handleSubmit,
    handleSignOut,
    toggleAccountVisibility,
    unblockUser,
  };
};