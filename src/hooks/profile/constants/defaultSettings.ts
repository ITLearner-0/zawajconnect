
import { PrivacySettings } from "@/types/profile";

// Default privacy settings to use when none are available
export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profileVisibilityLevel: 1,
  showAge: true,
  showLocation: true,
  showOccupation: true,
  allowNonMatchMessages: true
};
