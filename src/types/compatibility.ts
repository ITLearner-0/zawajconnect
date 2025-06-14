
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
    categoryScores?: Record<string, { score: number; weight: number }>;
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

// Add the missing interfaces
export interface Answer {
  value: number;
  weight?: number;
  isBreaker?: boolean;
  breakerThreshold?: number;
}

export interface CompatibilityResultData {
  user_id: string;
  score: number;
  answers: Record<string, Answer>;
  dealbreakers?: string[];
  preferences?: Array<{ category: string; weight: number }>;
}

// Pagination support for compatibility matches
export interface CompatibilityMatchPage {
  matches: CompatibilityMatch[];
  hasMore: boolean;
  totalCount: number;
  nextCursor?: string;
}
