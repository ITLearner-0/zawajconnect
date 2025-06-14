
// Runtime validation schemas and types
export interface AnswerValue {
  value: number;
  weight?: number;
  isBreaker?: boolean;
  breakerThreshold?: number;
}

export interface UserAnswers {
  [questionId: string]: AnswerValue;
}

export interface UserPreferences {
  categories: Array<{
    category: string;
    weight: number;
  }>;
  dealbreakers?: string[];
  minCompatibilityScore?: number;
}

export interface ValidatedCompatibilityResult {
  user_id: string;
  answers: UserAnswers;
  preferences: UserPreferences;
  score: number;
  dealbreakers?: string[];
}

// Question type discriminated unions
export type QuestionType = 'scale' | 'choice' | 'boolean' | 'range';

export interface BaseQuestion {
  id: number;
  question: string;
  category: string;
  weight: number;
  isBreaker: boolean;
  description?: string;
}

export interface ScaleQuestion extends BaseQuestion {
  type: 'scale';
  min: number;
  max: number;
  step?: number;
}

export interface ChoiceQuestion extends BaseQuestion {
  type: 'choice';
  options: Array<{
    value: string;
    label: string;
    score: number;
  }>;
}

export interface BooleanQuestion extends BaseQuestion {
  type: 'boolean';
  trueValue: number;
  falseValue: number;
}

export interface RangeQuestion extends BaseQuestion {
  type: 'range';
  min: number;
  max: number;
  optimalRange: [number, number];
}

export type TypedQuestion = ScaleQuestion | ChoiceQuestion | BooleanQuestion | RangeQuestion;

// Validation error types
export class ValidationError extends Error {
  constructor(message: string, public field: string, public value: unknown) {
    super(message);
    this.name = 'ValidationError';
  }
}
