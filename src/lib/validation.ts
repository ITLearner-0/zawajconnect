import { z } from 'zod';

// Common validation schemas
export const emailSchema = z
  .string()
  .trim()
  .email({ message: 'Adresse email invalide' })
  .max(255, { message: "L'email ne peut pas dépasser 255 caractères" });

export const passwordSchema = z
  .string()
  .min(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  .max(128, { message: 'Le mot de passe ne peut pas dépasser 128 caractères' })
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre',
  });

export const nameSchema = z
  .string()
  .trim()
  .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
    message: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets',
  });

// Contact form validation
export const contactFormSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  subject: z
    .string()
    .trim()
    .min(5, { message: 'Le sujet doit contenir au moins 5 caractères' })
    .max(200, { message: 'Le sujet ne peut pas dépasser 200 caractères' }),
  message: z
    .string()
    .trim()
    .min(10, { message: 'Le message doit contenir au moins 10 caractères' })
    .max(2000, { message: 'Le message ne peut pas dépasser 2000 caractères' }),
});

// Invitation accept form validation
export const invitationAuthSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().optional(),
    fullName: nameSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.confirmPassword && data.password !== data.confirmPassword) {
        return false;
      }
      return true;
    },
    {
      message: 'Les mots de passe ne correspondent pas',
      path: ['confirmPassword'],
    }
  );

// Registration modal validation
export const registrationStep1Schema = z.object({
  firstName: nameSchema,
  age: z
    .string()
    .min(1, { message: "L'âge est requis" })
    .refine(
      (val) => {
        const age = parseInt(val);
        return age >= 18 && age <= 80;
      },
      { message: "L'âge doit être entre 18 et 80 ans" }
    ),
  city: z
    .string()
    .trim()
    .min(2, { message: 'La ville doit contenir au moins 2 caractères' })
    .max(100, { message: 'La ville ne peut pas dépasser 100 caractères' }),
  profession: z
    .string()
    .trim()
    .max(100, { message: 'La profession ne peut pas dépasser 100 caractères' })
    .optional(),
});

export const registrationStep2Schema = z.object({
  practiceLevel: z.string().min(1, { message: 'Le niveau de pratique est requis' }),
  prayerFrequency: z.string().min(1, { message: 'La fréquence des prières est requise' }),
  hijabWearing: z.string().optional(),
  islamicEducation: z.string().optional(),
});

export const registrationStep3Schema = z.object({
  agePreference: z.string().optional(),
  locationPreference: z
    .string()
    .trim()
    .max(200, { message: 'La localisation ne peut pas dépasser 200 caractères' })
    .optional(),
  educationPreference: z.string().optional(),
  bio: z
    .string()
    .trim()
    .max(500, { message: 'La bio ne peut pas dépasser 500 caractères' })
    .optional(),
});

// Profile update validation
export const profileUpdateSchema = z.object({
  full_name: nameSchema.optional(),
  age: z.number().min(18).max(80).optional(),
  bio: z
    .string()
    .trim()
    .max(1000, { message: 'La bio ne peut pas dépasser 1000 caractères' })
    .optional(),
  profession: z
    .string()
    .trim()
    .max(100, { message: 'La profession ne peut pas dépasser 100 caractères' })
    .optional(),
  location: z
    .string()
    .trim()
    .max(200, { message: 'La localisation ne peut pas dépasser 200 caractères' })
    .optional(),
  interests: z
    .array(z.string().max(50))
    .max(10, { message: "Maximum 10 centres d'intérêt" })
    .optional(),
});

// Message validation
export const messageSchema = z
  .string()
  .trim()
  .min(1, { message: 'Le message ne peut pas être vide' })
  .max(1000, { message: 'Le message ne peut pas dépasser 1000 caractères' })
  .refine(
    (message) => {
      // Block potential XSS attempts
      const dangerousPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /<iframe\b/gi,
        /<object\b/gi,
        /<embed\b/gi,
      ];

      return !dangerousPatterns.some((pattern) => pattern.test(message));
    },
    {
      message: 'Le message contient du contenu non autorisé',
    }
  );

// URL validation helper
export const safeUrlSchema = z
  .string()
  .url({ message: 'URL invalide' })
  .refine(
    (url) => {
      const allowedProtocols = ['http:', 'https:'];
      const urlObj = new URL(url);
      return allowedProtocols.includes(urlObj.protocol);
    },
    {
      message: 'Seuls les liens HTTP et HTTPS sont autorisés',
    }
  );

// Helper function to sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  // Basic HTML sanitization - in production, consider using DOMPurify
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
};

// Helper function to encode for external URLs (WhatsApp, etc.)
export const encodeForExternalUrl = (text: string): string => {
  return encodeURIComponent(text.slice(0, 200)); // Limit length for URLs
};

// Family member validation schema
const validRelationships = [
  'father',
  'mother',
  'brother',
  'sister',
  'uncle',
  'aunt',
  'grandfather',
  'grandmother',
  'guardian',
] as const;

export const familyMemberSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Le nom doit contenir au moins 2 caractères' })
    .max(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, {
      message: 'Le nom ne peut contenir que des lettres, espaces, apostrophes et tirets',
    }),
  email: emailSchema,
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, { message: 'Format de téléphone invalide (ex: +33612345678)' })
    .optional()
    .or(z.literal('')),
  relationship: z.string().refine((val) => validRelationships.includes(val as any), {
    message: 'Veuillez sélectionner une relation valide',
  }),
  isWali: z.boolean().optional(),
});
