
import { z } from 'zod';
import DOMPurify from 'dompurify';

// Enhanced input validation schemas
export const messageValidationSchema = z.object({
  content: z.string()
    .min(1, 'Le message ne peut pas être vide')
    .max(1000, 'Le message ne peut pas dépasser 1000 caractères')
    .refine(content => !/<script|javascript:|on\w+=/i.test(content), 'Contenu non autorisé'),
  conversationId: z.string().uuid('ID de conversation invalide')
});

export const profileValidationSchema = z.object({
  fullName: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  age: z.string()
    .min(1, 'L\'âge est requis')
    .refine(age => {
      const ageNum = parseInt(age);
      return ageNum >= 18 && ageNum <= 100;
    }, 'L\'âge doit être entre 18 et 100 ans'),
  location: z.string()
    .min(2, 'La localisation doit contenir au moins 2 caractères')
    .max(100, 'La localisation ne peut pas dépasser 100 caractères')
});

// Enhanced text sanitization
export const sanitizeText = (text: string): string => {
  // First pass with DOMPurify
  const cleaned = DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional custom sanitization
  return cleaned
    .replace(/[<>'"]/g, '') // Remove remaining dangerous characters
    .trim();
};

// Content appropriateness checking
export const checkForInappropriateContent = (content: string): { isAppropriate: boolean; reason?: string } => {
  const inappropriatePatterns = [
    /\b(spam|scam|fraud)\b/i,
    /\b(hate|violence|threat)\b/i,
    /\b(explicit|adult|nsfw)\b/i
  ];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(content)) {
      return { isAppropriate: false, reason: 'Contenu inapproprié détecté' };
    }
  }

  return { isAppropriate: true };
};

// Advanced XSS protection
export const preventXSS = (input: string): string => {
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>/gi
  ];

  let sanitized = input;
  xssPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
};

// SQL injection prevention
export const preventSQLInjection = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION)\b)/i,
    /(--|\/\*|\*\/|;)/,
    /(\bOR\b|\bAND\b).*?=.*?=/i
  ];

  return !sqlPatterns.some(pattern => pattern.test(input));
};
