
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileFormData, VerificationStatus, PrivacySettings } from "@/types/profile";

interface UseProfileDataResult {
  isNewUser: boolean;
  userEmail: string;
  formData: ProfileFormData;
  verificationStatus: VerificationStatus;
  userId: string | null;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
}

const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1, // Moderate by default
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true,
};

export const useProfileData = (): UseProfileDataResult => {
  const [isNewUser, setIsNewUser] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email: false,
    phone: false,
    id: false,
  });
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(DEFAULT_PRIVACY_SETTINGS);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);
  const [isAccountVisible, setIsAccountVisible] = useState<boolean>(true);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    age: "",
    gender: "",
    location: "",
    education: "",
    occupation: "",
    religiousLevel: "",
    familyBackground: "",
    aboutMe: "",
    prayerFrequency: "five-daily",
    waliName: "",
    waliRelationship: "",
    waliContact: "",
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return null;
      }

      setUserEmail(session.user.email || "");
      setUserId(session.user.id);
      
      console.log("Fetching profile for user:", session.user.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      if (profile) {
        console.log("Profile data loaded:", profile);
        setFormData({
          fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          age: profile.birth_date ? String(new Date().getFullYear() - new Date(profile.birth_date).getFullYear()) : "",
          gender: profile.gender || "",
          location: profile.location || "",
          education: profile.education_level || "",
          occupation: profile.occupation || "",
          religiousLevel: profile.religious_practice_level || "",
          familyBackground: "",
          aboutMe: profile.about_me || "",
          prayerFrequency: profile.prayer_frequency || "five-daily",
          waliName: profile.wali_name || "",
          waliRelationship: profile.wali_relationship || "",
          waliContact: profile.wali_contact || "",
        });
        
        // Determine verification status based on is_verified field and verification_document_url
        const isVerified = profile.is_verified || false;
        const verificationDoc = profile.verification_document_url || "";
        
        setVerificationStatus({
          email: session.user.email_confirmed_at !== null,
          phone: isVerified && verificationDoc.startsWith("phone:"),
          id: isVerified && verificationDoc.startsWith("id:"),
        });
        
        // Load privacy settings and account visibility status
        if (profile.privacy_settings) {
          setPrivacySettings(profile.privacy_settings as PrivacySettings);
        }
        
        if (profile.blocked_users) {
          setBlockedUsers(profile.blocked_users as string[] || []);
        } else {
          setBlockedUsers([]);
        }
        
        setIsAccountVisible(profile.is_visible !== false); // Default to true if not defined
        
        // Detect if this is a new user with minimal profile data
        setIsNewUser(
          !profile.first_name || 
          !profile.gender || 
          !profile.location || 
          !profile.religious_practice_level || 
          !profile.about_me
        );
      } else {
        // No profile found, definitely a new user
        setIsNewUser(true);
      }
      
      return profile;
    };

    fetchProfileData();
  }, []);

  return {
    isNewUser,
    userEmail,
    formData,
    verificationStatus,
    userId,
    privacySettings,
    blockedUsers,
    isAccountVisible
  };
};
