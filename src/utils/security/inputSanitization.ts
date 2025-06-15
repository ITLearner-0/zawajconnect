
// Input sanitization utilities for XSS protection
export const sanitizeHtml = (input: string): string => {
  // Basic HTML tag removal and entity encoding
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

export const sanitizeText = (input: string): string => {
  // Remove potential script injections and normalize whitespace
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
    .substring(0, 5000); // Limit length
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email) && email.length <= 254;
};

export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
};

export const sanitizeProfileData = (data: any): any => {
  const sanitized = { ...data };
  
  // Sanitize text fields
  if (sanitized.first_name) sanitized.first_name = sanitizeText(sanitized.first_name);
  if (sanitized.last_name) sanitized.last_name = sanitizeText(sanitized.last_name);
  if (sanitized.about_me) sanitized.about_me = sanitizeText(sanitized.about_me);
  if (sanitized.location) sanitized.location = sanitizeText(sanitized.location);
  if (sanitized.occupation) sanitized.occupation = sanitizeText(sanitized.occupation);
  if (sanitized.education_level) sanitized.education_level = sanitizeText(sanitized.education_level);
  if (sanitized.wali_name) sanitized.wali_name = sanitizeText(sanitized.wali_name);
  if (sanitized.wali_relationship) sanitized.wali_relationship = sanitizeText(sanitized.wali_relationship);
  
  return sanitized;
};

export const validateMessageContent = (content: string): { isValid: boolean; error?: string } => {
  if (!content || content.trim().length === 0) {
    return { isValid: false, error: "Le message ne peut pas être vide" };
  }
  
  if (content.length > 2000) {
    return { isValid: false, error: "Le message est trop long (max 2000 caractères)" };
  }
  
  // Check for potential spam patterns
  const spamPatterns = [
    /(.)\1{10,}/g, // Repeated characters
    /https?:\/\/[^\s]+/gi, // URLs (could be restricted)
    /\b(viagra|casino|lottery|winner)\b/gi // Common spam words
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) {
      return { isValid: false, error: "Le message contient du contenu non autorisé" };
    }
  }
  
  return { isValid: true };
};
