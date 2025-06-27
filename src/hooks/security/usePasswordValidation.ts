
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PasswordValidationResult {
  score: number;
  maxScore: number;
  isStrong: boolean;
  issues: string[];
}

export const usePasswordValidation = () => {
  const [validationResult, setValidationResult] = useState<PasswordValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validatePasswordStrength = useCallback(async (password: string): Promise<PasswordValidationResult> => {
    setIsValidating(true);
    
    try {
      // Use the database function for server-side validation
      const { data, error } = await supabase.rpc('validate_password_strength', {
        password: password
      });

      if (error) {
        console.error('Password validation error:', error);
        // Fallback to client-side validation
        return clientSideValidation(password);
      }

      const result = data as PasswordValidationResult;
      setValidationResult(result);
      return result;
    } catch (error) {
      console.error('Password validation failed:', error);
      return clientSideValidation(password);
    } finally {
      setIsValidating(false);
    }
  }, []);

  const clientSideValidation = (password: string): PasswordValidationResult => {
    let score = 0;
    const issues: string[] = [];

    if (password.length < 8) {
      issues.push('Password must be at least 8 characters long');
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(password)) {
      issues.push('Password must contain at least one uppercase letter');
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(password)) {
      issues.push('Password must contain at least one lowercase letter');
    } else {
      score += 1;
    }

    if (!/[0-9]/.test(password)) {
      issues.push('Password must contain at least one number');
    } else {
      score += 1;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      issues.push('Password must contain at least one special character');
    } else {
      score += 1;
    }

    return {
      score,
      maxScore: 5,
      isStrong: score >= 4,
      issues
    };
  };

  return {
    validatePasswordStrength,
    validationResult,
    isValidating
  };
};
