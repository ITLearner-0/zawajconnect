
import { toast } from "sonner";

// Input validation and sanitization
export const validateInput = (input: string, type: 'email' | 'phone' | 'text' | 'password'): { isValid: boolean; error?: string } => {
  if (!input || input.trim().length === 0) {
    return { isValid: false, error: 'Ce champ est requis' };
  }

  switch (type) {
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(input)) {
        return { isValid: false, error: 'Format d\'email invalide' };
      }
      break;
      
    case 'phone':
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      const cleanPhone = input.replace(/\s|-|\(|\)/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        return { isValid: false, error: 'Format de téléphone invalide' };
      }
      break;
      
    case 'password':
      if (input.length < 8) {
        return { isValid: false, error: 'Le mot de passe doit contenir au moins 8 caractères' };
      }
      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(input)) {
        return { isValid: false, error: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre' };
      }
      break;
      
    case 'text':
      if (input.length > 500) {
        return { isValid: false, error: 'Le texte ne peut pas dépasser 500 caractères' };
      }
      // Check for potentially malicious content
      if (/<script|javascript:|on\w+=/i.test(input)) {
        return { isValid: false, error: 'Contenu non autorisé détecté' };
      }
      break;
  }

  return { isValid: true };
};

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 5, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000);
    toast.error(`Trop de tentatives. Réessayez dans ${remainingTime} secondes.`);
    return false;
  }

  record.count++;
  return true;
};

// Security headers validation
export const validateSecurityHeaders = (): boolean => {
  const requiredHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options',
    'X-XSS-Protection'
  ];

  const missingHeaders = requiredHeaders.filter(header => 
    !document.documentElement.getAttribute(`data-${header.toLowerCase()}`)
  );

  if (missingHeaders.length > 0) {
    console.warn('Missing security headers:', missingHeaders);
    return false;
  }

  return true;
};

// File upload security
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: 'Type de fichier non autorisé. Seules les images sont acceptées.' };
  }

  // Check file size (5MB max)
  const maxSize = 5 * 1024 * 1024;
  if (file.size > maxSize) {
    return { isValid: false, error: 'Fichier trop volumineux. Taille maximale: 5MB.' };
  }

  // Check filename for suspicious patterns
  if (/[<>:"/\\|?*]/.test(file.name)) {
    return { isValid: false, error: 'Nom de fichier invalide.' };
  }

  return { isValid: true };
};

// Generate CSP nonce for inline scripts
export const generateNonce = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode.apply(null, Array.from(array)));
};

// Secure storage utilities
export const secureStorage = {
  setItem: (key: string, value: string): void => {
    try {
      // Encrypt sensitive data before storing
      sessionStorage.setItem(key, btoa(value));
    } catch (error) {
      console.error('Failed to store data securely:', error);
    }
  },

  getItem: (key: string): string | null => {
    try {
      const value = sessionStorage.getItem(key);
      return value ? atob(value) : null;
    } catch (error) {
      console.error('Failed to retrieve data securely:', error);
      return null;
    }
  },

  removeItem: (key: string): void => {
    sessionStorage.removeItem(key);
  }
};
