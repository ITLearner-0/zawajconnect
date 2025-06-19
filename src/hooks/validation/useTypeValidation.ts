
import { useState, useCallback } from 'react';
import { StrictFormValidation } from '@/types/strictTypes';

/**
 * Hook for managing type-safe form validation
 */
export const useTypeValidation = <T extends Record<string, any>>() => {
  const [validation, setValidation] = useState<StrictFormValidation<T>>({
    isValid: true,
    errors: {},
    warnings: {}
  });

  const validateField = useCallback(<K extends keyof T>(
    field: K,
    value: T[K],
    validator: (value: T[K]) => string | null
  ) => {
    const error = validator(value);
    
    setValidation(prev => ({
      ...prev,
      errors: {
        ...prev.errors,
        [field]: error || undefined
      },
      isValid: !error && Object.keys(prev.errors).filter(k => k !== field).length === 0
    }));

    return !error;
  }, []);

  const validateAll = useCallback((
    data: T,
    validators: Partial<Record<keyof T, (value: any) => string | null>>
  ) => {
    const errors: Partial<Record<keyof T, string>> = {};
    
    Object.entries(validators).forEach(([field, validator]) => {
      if (validator) {
        const error = validator(data[field as keyof T]);
        if (error) {
          errors[field as keyof T] = error;
        }
      }
    });

    const isValid = Object.keys(errors).length === 0;
    
    setValidation({
      isValid,
      errors,
      warnings: {}
    });

    return isValid;
  }, []);

  const clearValidation = useCallback(() => {
    setValidation({
      isValid: true,
      errors: {},
      warnings: {}
    });
  }, []);

  const addWarning = useCallback(<K extends keyof T>(field: K, warning: string) => {
    setValidation(prev => ({
      ...prev,
      warnings: {
        ...prev.warnings,
        [field]: warning
      }
    }));
  }, []);

  return {
    validation,
    validateField,
    validateAll,
    clearValidation,
    addWarning,
    hasErrors: !validation.isValid,
    getFieldError: (field: keyof T) => validation.errors[field],
    getFieldWarning: (field: keyof T) => validation.warnings[field]
  };
};
