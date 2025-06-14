
import { UserAnswers, UserPreferences, AnswerValue, ValidationError } from "../types/validationTypes";
import { logError, logWarning } from "./loggingService";

export function validateAnswerValue(value: unknown, questionId: string): AnswerValue {
  if (!value || typeof value !== 'object') {
    throw new ValidationError('Answer value must be an object', questionId, value);
  }

  const answerValue = value as Record<string, unknown>;

  // Validate required value field
  if (typeof answerValue.value !== 'number') {
    throw new ValidationError('Answer value must be a number', `${questionId}.value`, answerValue.value);
  }

  if (answerValue.value < 0 || answerValue.value > 100) {
    throw new ValidationError('Answer value must be between 0 and 100', `${questionId}.value`, answerValue.value);
  }

  // Validate optional fields
  const result: AnswerValue = {
    value: answerValue.value
  };

  if (answerValue.weight !== undefined) {
    if (typeof answerValue.weight !== 'number' || answerValue.weight <= 0) {
      throw new ValidationError('Weight must be a positive number', `${questionId}.weight`, answerValue.weight);
    }
    result.weight = answerValue.weight;
  }

  if (answerValue.isBreaker !== undefined) {
    if (typeof answerValue.isBreaker !== 'boolean') {
      throw new ValidationError('isBreaker must be a boolean', `${questionId}.isBreaker`, answerValue.isBreaker);
    }
    result.isBreaker = answerValue.isBreaker;
  }

  if (answerValue.breakerThreshold !== undefined) {
    if (typeof answerValue.breakerThreshold !== 'number' || answerValue.breakerThreshold < 0 || answerValue.breakerThreshold > 100) {
      throw new ValidationError('breakerThreshold must be a number between 0 and 100', `${questionId}.breakerThreshold`, answerValue.breakerThreshold);
    }
    result.breakerThreshold = answerValue.breakerThreshold;
  }

  return result;
}

export function validateUserAnswers(answers: unknown): UserAnswers {
  if (!answers || typeof answers !== 'object') {
    throw new ValidationError('Answers must be an object', 'answers', answers);
  }

  const answersObj = answers as Record<string, unknown>;
  const validatedAnswers: UserAnswers = {};

  for (const [questionId, answerValue] of Object.entries(answersObj)) {
    try {
      validatedAnswers[questionId] = validateAnswerValue(answerValue, questionId);
    } catch (error) {
      if (error instanceof ValidationError) {
        logError('validateUserAnswers', error, { questionId, answerValue });
        // Skip invalid answers but log the error
        continue;
      }
      throw error;
    }
  }

  if (Object.keys(validatedAnswers).length === 0) {
    throw new ValidationError('No valid answers found', 'answers', answers);
  }

  return validatedAnswers;
}

export function validateUserPreferences(preferences: unknown): UserPreferences {
  if (!preferences || typeof preferences !== 'object') {
    logWarning('validateUserPreferences', 'Invalid preferences format, using defaults', { preferences });
    return { categories: [] };
  }

  const prefsObj = preferences as Record<string, unknown>;
  const result: UserPreferences = {
    categories: []
  };

  // Validate categories array
  if (Array.isArray(prefsObj.categories)) {
    result.categories = prefsObj.categories
      .filter((cat): cat is { category: string; weight: number } => {
        return cat && 
               typeof cat === 'object' && 
               typeof (cat as any).category === 'string' && 
               typeof (cat as any).weight === 'number' &&
               (cat as any).weight > 0;
      });
  }

  // Validate optional dealbreakers
  if (Array.isArray(prefsObj.dealbreakers)) {
    result.dealbreakers = prefsObj.dealbreakers.filter((item): item is string => typeof item === 'string');
  }

  // Validate optional minCompatibilityScore
  if (typeof prefsObj.minCompatibilityScore === 'number' && 
      prefsObj.minCompatibilityScore >= 0 && 
      prefsObj.minCompatibilityScore <= 100) {
    result.minCompatibilityScore = prefsObj.minCompatibilityScore;
  }

  return result;
}

export function safeValidateUserAnswers(answers: unknown): UserAnswers {
  try {
    return validateUserAnswers(answers);
  } catch (error) {
    logError('safeValidateUserAnswers', error as Error, { answers });
    return {};
  }
}

export function safeValidateUserPreferences(preferences: unknown): UserPreferences {
  try {
    return validateUserPreferences(preferences);
  } catch (error) {
    logError('safeValidateUserPreferences', error as Error, { preferences });
    return { categories: [] };
  }
}
