
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
    last_name?: string;
    gender: string;
    location?: string;
    birth_date: string;
    religious_practice_level?: string;
    education_level?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    id_verified?: boolean;
    is_visible: boolean;
  };
}
