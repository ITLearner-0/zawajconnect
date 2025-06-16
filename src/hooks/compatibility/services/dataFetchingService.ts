
import { userResultsService } from "./userResultsService";
import { profileService } from "./profileService";

// Enhanced types that include profile data for proper compatibility checking
export interface ValidatedUserResults {
  answers: Record<string, any>;
  preferences: any;
  profile?: {
    gender?: string;
    polygamy_stance?: string;
  };
}

export interface ValidatedOtherUser {
  user_id: string;
  answers: Record<string, any>;
  preferences: any;
  profiles: {
    first_name: string;
    last_name: string | null;
    gender: string;
    location: string | null;
    birth_date: string;
    religious_practice_level: string | null;
    education_level: string | null;
    email_verified: boolean;
    phone_verified: boolean;
    id_verified: boolean;
    is_visible: boolean;
    polygamy_stance?: string | null;
  };
}

export type { ValidatedProfileData } from "./profileService";

// Re-export functions for backward compatibility
export const fetchUserResults = userResultsService.fetchUserResults.bind(userResultsService);
export const fetchOtherUsers = userResultsService.fetchOtherUsers.bind(userResultsService);
export { profileService as fetchProfiles } from "./profileService";
