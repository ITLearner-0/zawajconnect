import { z } from 'zod';

// UUID validation schema
export const uuidSchema = z.string().uuid();

// Profile validation schemas
export const profileUpdateSchema = z.object({
  first_name: z.string().min(1).max(50).optional(),
  last_name: z.string().min(1).max(50).optional(),
  birth_date: z.string().datetime().optional(),
  gender: z.enum(['male', 'female']).optional(),
  location: z.string().max(100).optional(),
  education_level: z.string().max(100).optional(),
  occupation: z.string().max(100).optional(),
  religious_practice_level: z.string().max(50).optional(),
  bio: z.string().max(1000).optional(),
  prayer_frequency: z.string().max(50).optional(),
  polygamy_stance: z.enum(['oui', 'non', 'ouvert']).optional(),
  wali_name: z.string().max(100).optional(),
  wali_relationship: z.string().max(50).optional(),
  wali_contact: z.string().max(100).optional(),
  profile_picture: z.string().url().optional().or(z.literal('')),
  gallery: z.array(z.string().url()).max(10).optional(),
});

// Message validation schema
export const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  conversation_id: uuidSchema,
  attachments: z.array(z.string().url()).max(5).optional(),
});

// Conversation validation schema
export const conversationSchema = z.object({
  participants: z.array(uuidSchema).min(2).max(10),
  wali_supervised: z.boolean().optional(),
  encryption_enabled: z.boolean().optional(),
});

// Chat request validation schema
export const chatRequestSchema = z.object({
  recipient_id: uuidSchema,
  message: z.string().max(500).optional(),
  request_type: z.enum(['direct', 'wali_supervised']).optional(),
  suggested_time: z.string().datetime().optional(),
});

// Validation helper functions
export const validateUuid = (id: string): boolean => {
  try {
    uuidSchema.parse(id);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeInput = (input: string): string => {
  // Basic HTML sanitization - remove script tags and dangerous content
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

export const validateProfileUpdate = (data: any) => {
  return profileUpdateSchema.safeParse(data);
};

export const validateMessage = (data: any) => {
  return messageSchema.safeParse(data);
};

export const validateConversation = (data: any) => {
  return conversationSchema.safeParse(data);
};

export const validateChatRequest = (data: any) => {
  return chatRequestSchema.safeParse(data);
};
