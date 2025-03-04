
export interface CompatibilityQuestion {
  id: string;
  text: string;
  category: string;
  options: {
    value: string;
    label: string;
  }[];
}

export interface CompatibilityAnswer {
  questionId: string;
  answer: string;
  importance: number;
}

export interface CompatibilityMatch {
  userId: string;
  score: number;
  distance?: number;
  matchDetails?: {
    strengths: string[];
    differences: string[];
    dealbreakers?: string[];
  };
  profileData?: {
    first_name: string;
    last_name?: string;
    age?: number;
    location?: string;
    religious_practice_level?: string;
    education_level?: string;
    occupation?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    id_verified?: boolean;
  };
}

export interface FilterCriteria {
  ageRange: [number, number];
  minScore: number;
  religiousLevel: string[];
  verifiedOnly: boolean;
}
