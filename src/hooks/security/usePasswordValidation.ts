
import { useState, useCallback } from 'react';

interface PasswordStrength {
  score: number;
  level: 'weak' | 'fair' | 'good' | 'strong';
  feedback: string[];
  requirements: {
    length: boolean;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
    noCommon: boolean;
  };
}

const commonPasswords = [
  '123456', 'password', '123456789', '12345678', '12345', '1234567',
  'qwerty', 'abc123', 'password123', 'admin', 'letmein', 'welcome',
  'monkey', '1234567890', 'dragon', 'passw0rd'
];

export const usePasswordValidation = () => {
  const [validationResult, setValidationResult] = useState<PasswordStrength | null>(null);

  const validatePasswordStrength = useCallback((password: string): PasswordStrength => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommon: !commonPasswords.includes(password.toLowerCase())
    };

    let score = 0;
    const feedback: string[] = [];

    // Check requirements
    if (requirements.length) score += 20;
    else feedback.push('Password must be at least 8 characters long');

    if (requirements.uppercase) score += 15;
    else feedback.push('Include at least one uppercase letter');

    if (requirements.lowercase) score += 15;
    else feedback.push('Include at least one lowercase letter');

    if (requirements.numbers) score += 15;
    else feedback.push('Include at least one number');

    if (requirements.symbols) score += 15;
    else feedback.push('Include at least one special character');

    if (requirements.noCommon) score += 20;
    else feedback.push('Avoid common passwords');

    // Additional checks
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Check for patterns
    if (!/(.)\1{2,}/.test(password)) score += 5; // No repeated characters
    else feedback.push('Avoid repeating characters');

    if (!/012|123|234|345|456|567|678|789|890|abc|bcd|cde/.test(password.toLowerCase())) score += 5;
    else feedback.push('Avoid sequential patterns');

    // Determine level
    let level: PasswordStrength['level'] = 'weak';
    if (score >= 80) level = 'strong';
    else if (score >= 60) level = 'good';
    else if (score >= 40) level = 'fair';

    const result: PasswordStrength = {
      score: Math.min(100, score),
      level,
      feedback,
      requirements
    };

    setValidationResult(result);
    return result;
  }, []);

  const generateSecurePassword = useCallback((): string => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    const allChars = lowercase + uppercase + numbers + symbols;
    let password = '';
    
    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];
    
    // Fill the rest randomly (12-16 characters total)
    const remainingLength = 8 + Math.floor(Math.random() * 5);
    for (let i = password.length; i < remainingLength; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }, []);

  return {
    validatePasswordStrength,
    generateSecurePassword,
    validationResult
  };
};
