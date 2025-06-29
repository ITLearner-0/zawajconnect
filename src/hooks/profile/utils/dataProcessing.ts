
import { ProfileFormData } from '@/types/profile';

export const processFullName = (fullName: string | undefined): { firstName: string; lastName: string } => {
  const name = fullName?.trim() || '';
  const nameParts = name.split(' ').filter(part => part.length > 0);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export const processBirthDate = (age: string | undefined): string | null => {
  if (!age || typeof age !== 'string') return null;
  
  const ageValue = age.trim();
  if (!ageValue) return null;
  
  // If age is already a date format, use it directly
  if (ageValue.includes('-')) {
    return ageValue;
  }
  
  // If age is a number, convert to a birth year
  const ageNumber = parseInt(ageValue, 10);
  if (!isNaN(ageNumber) && ageNumber > 0 && ageNumber < 150) {
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - ageNumber;
    return `${birthYear}-01-01`;
  }
  
  return null;
};

export const processLanguages = (languages: string | string[] | undefined): string[] => {
  console.log('Processing languages:', languages, 'Type:', typeof languages);
  
  if (!languages) {
    console.log('No languages provided, returning empty array');
    return [];
  }
  
  let processedLanguages: string[] = [];
  
  try {
    if (typeof languages === 'string') {
      const trimmed = languages.trim();
      if (trimmed) {
        const languageList = trimmed.split(',');
        for (const lang of languageList) {
          const cleanLang = lang.trim();
          if (cleanLang.length > 0) {
            processedLanguages.push(cleanLang);
          }
        }
      }
    } else if (Array.isArray(languages)) {
      for (const lang of languages) {
        if (lang && typeof lang === 'string') {
          const cleanLang = lang.trim();
          if (cleanLang.length > 0) {
            processedLanguages.push(cleanLang);
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing languages:', error);
    return [];
  }
  
  console.log('Processed languages:', processedLanguages);
  return processedLanguages;
};

export const processGallery = (gallery: string[] | undefined): string[] => {
  if (!gallery || !Array.isArray(gallery)) {
    return [];
  }
  
  return gallery.filter((url): url is string => {
    return url != null && typeof url === 'string' && url.trim().length > 0;
  });
};
