
export interface Answer {
  value: number;
  isBreaker: boolean;
  breakerThreshold?: number;
}

export interface CompatibilityResultData {
  answers: Record<number, Answer>;
  score: number;
  dealbreakers: string[];
  preferences: Array<{
    category: string;
    weight: number;
  }>;
  user_id: string;
}
