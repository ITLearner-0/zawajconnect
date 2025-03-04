
import { Json } from "@/integrations/supabase/types";

export interface Answer {
  value: number;
  isBreaker: boolean;
  breakerThreshold?: number;
  weight?: number; // User can assign custom weights
}

export interface CompatibilityResultData {
  answers: Json;
  score: number;
  dealbreakers: Json;
  preferences: Json;
  user_id: string;
}

export interface CompatibilityMatch {
  userId: string;
  score: number;
  profileData?: any;
  matchDetails?: {
    strengths: string[];
    differences: string[];
    dealbreakers?: string[];
  };
}

export interface WeightedCategory {
  category: string;
  weight: number;
  userScore?: number;
  matchScore?: number;
}
