
import { UserAnswers, UserPreferences } from "./validationTypes";
import { PaginationOptions } from "./paginationTypes";

export interface MatchingFilters {
  ageRange?: [number, number];
  gender?: string;
  location?: string;
  religiousLevel?: string[];
  minCompatibilityScore?: number;
  verifiedOnly?: boolean;
  pagination?: PaginationOptions;
}

export interface ValidatedProfileData {
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
}

export interface UserResultWithProfile {
  user_id: string;
  answers: UserAnswers;
  preferences: UserPreferences;
  profiles: ValidatedProfileData;
}
