
import { Json } from "@/integrations/supabase/types";

export interface Answer {
  value: number;
  isBreaker: boolean;
  breakerThreshold?: number;
}

export interface CompatibilityResultData {
  answers: Json;
  score: number;
  dealbreakers: Json;
  preferences: Json;
  user_id: string;
}
