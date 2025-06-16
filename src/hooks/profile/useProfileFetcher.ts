
import { useState, useEffect } from 'react';
import { ProfileFormData, PrivacySettings, VerificationStatus } from '@/types/profile';
import { useToast } from '@/hooks/use-toast';
import { DEFAULT_PRIVACY_SETTINGS } from './constants/defaultSettings';
import { fetchProfileFromDb, createNewProfile, getUserEmail } from './utils/profileDbUtils';
import { ProfileFetcherResult, ProfileFetcherOptions } from './types/profileFetcher';

export const useProfileFetcher = (userId?: string | null): ProfileFetcherResult => {
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
        const email = await getUserEmail();
        setUserEmail(email);

        // Get profile data
        const { data, error } = await fetchProfileFromDb(userId);

        if (error) {
          setError(error.message);
          console.error("Supabase error fetching profile:", error);
          return;
        }

        // Check if we have data before proceeding
        if (data && data.length > 0) {
          const profile = data[0];
          
          // Map database fields to ProfileFormData, preserving all existing data
          const profileFormData: ProfileFormData = {
            fullName: `${profile.first_name || ''} ${profile.last_name || ''}`.trim(),
            age: profile.birth_date || '',
            gender: profile.gender || '',
            location: profile.location || '',
            education: profile.education_level || '',
            occupation: profile.occupation || '',
            religiousLevel: profile.religious_practice_level || '',
            familyBackground: profile.about_me || '',
            aboutMe: profile.about_me || '',
            prayerFrequency: profile.prayer_frequency || '',
            waliName: profile.wali_name || '',
            waliRelationship: profile.wali_relationship || '',
            waliContact: profile.wali_contact || '',
            profilePicture: profile.profile_picture || '',
            gallery: profile.gallery || []
          };
          setProfileData(profileFormData);
          
          // Set verification status
          setVerificationStatus({
            email: !!profile.is_verified,
            phone: !!profile.phone_verified,
            id: !!profile.id_verified,
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
          const { error: insertError } = await createNewProfile(userId);
            
          if (insertError) {
            console.error("Error creating new profile:", insertError);
          }
          
          // Set default empty profile data
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
            waliName: '',
            waliRelationship: '',
            waliContact: '',
            profilePicture: '',
            gallery: []
          });
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

  return {
    profileData,
    loading,
    error,
    isNewUser,
    userEmail,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
  };
};
