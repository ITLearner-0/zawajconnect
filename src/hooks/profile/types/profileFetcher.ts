
import { ProfileFormData, PrivacySettings, VerificationStatus } from "@/types/profile";

export interface ProfileFetcherResult {
  profileData: ProfileFormData | null;
  loading: boolean;
  error: string | null;
  isNewUser: boolean;
  userEmail: string | null;
  verificationStatus: VerificationStatus;
  privacySettings: PrivacySettings;
  blockedUsers: string[];
  isAccountVisible: boolean;
}

export interface ProfileFetcherOptions {
  userId?: string | null;
}
