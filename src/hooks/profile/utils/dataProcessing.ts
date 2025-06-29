
import { ProfileFormData } from '@/types/profile';

export const processFullName = (fullName: string | undefined) => {
  const name = fullName || '';
  const nameParts = name.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  return { firstName, lastName };
};

export const processBirthDate = (age: string | undefined) => {
  let birthDate = null;
  const ageValue = age;
  
  if (ageValue && typeof ageValue === 'string' && ageValue.trim() !== '') {
    const trimmedAge = ageValue.trim();
    if (trimmedAge.includes('-')) {
      // If age is already a date format, use it directly
      birthDate = trimmedAge;
    } else if (!isNaN(Number(trimmedAge))) {
      // If age is a number, convert to a birth year
      const currentYear = new Date().getFullYear();
      const birthYear = currentYear - parseInt(trimmedAge, 10);
      birthDate = `${birthYear}-01-01`;
    }
  }
  
  return birthDate;
};

export const processLanguages = (languages: string | string[] | undefined) => {
  if (!languages) return undefined;
  
  if (typeof languages === 'string') {
    const trimmed = languages.trim();
    if (trimmed) {
      return trimmed.split(',')
        .map(lang => lang.trim())
        .filter(lang => lang.length > 0);
    }
  } else if (Array.isArray(languages)) {
    return languages.filter((lang): lang is string => {
      return lang != null && typeof lang === 'string' && lang.trim().length > 0;
    });
  }
  
  return undefined;
};

export const processGallery = (gallery: string[] | undefined) => {
  if (!gallery || !Array.isArray(gallery)) return undefined;
  
  return gallery.filter((url): url is string => {
    return url != null && typeof url === 'string' && url.trim().length > 0;
  });
};
