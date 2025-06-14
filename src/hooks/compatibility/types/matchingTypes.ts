
export interface MatchingFilters {
  ageRange?: [number, number];
  gender?: string;
  location?: string;
  religiousLevel?: string[];
  minCompatibilityScore?: number;
  verifiedOnly?: boolean;
}

export interface UserResultWithProfile {
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
    email_verified: boolean | null;
    phone_verified: boolean | null;
    id_verified: boolean | null;
    is_visible: boolean;
  };
}
