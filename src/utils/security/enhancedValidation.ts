import DOMPurify from 'dompurify';
import { z } from 'zod';

// Enhanced input validation schemas
export const profileValidationSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(100, 'First name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters'),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(100, 'Last name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters'),

  aboutMe: z.string().max(5000, 'About me must be less than 5000 characters').optional(),

  email: z.string().email('Invalid email format').optional(),

  location: z.string().max(100, 'Location must be less than 100 characters').optional(),

  occupation: z.string().max(100, 'Occupation must be less than 100 characters').optional(),
});

export const messageValidationSchema = z.object({
  content: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message must be less than 2000 characters'),

  conversationId: z.string().uuid('Invalid conversation ID'),
});

// Enhanced XSS protection
export const sanitizeHtml = (input: string): string => {
  if (!input) return '';

  // Configure DOMPurify with strict settings
  const cleanHtml = DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    SANITIZE_DOM: true,
  });

  return cleanHtml;
};

// Enhanced text sanitization
export const sanitizeText = (input: string): string => {
  if (!input) return '';

  // Remove potential script injections and normalize whitespace
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

// Phone number validation
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
};

/**
 * @deprecated Supabase uses parameterized queries which prevent SQL injection.
 * Do NOT rely on string sanitization for database security.
 * Use Supabase's built-in query builder instead.
 */
export const sanitizeForDatabase = (input: string): string => {
  if (!input) return '';
  return input;
};

// Content moderation checks
export const checkForInappropriateContent = (
  text: string
): {
  isAppropriate: boolean;
  reasons: string[];
} => {
  const inappropriatePatterns = [
    /\b(spam|scam|fraud)\b/gi,
    /\b(explicit|inappropriate|offensive)\b/gi,
    // Add more patterns as needed
  ];

  const reasons: string[] = [];

  for (const pattern of inappropriatePatterns) {
    if (pattern.test(text)) {
      reasons.push(`Content matches inappropriate pattern: ${pattern.source}`);
    }
  }

  return {
    isAppropriate: reasons.length === 0,
    reasons,
  };
};

// Rate limiting helper
export const createRateLimitKey = (userId: string, action: string): string => {
  return `rate_limit:${userId}:${action}`;
};
