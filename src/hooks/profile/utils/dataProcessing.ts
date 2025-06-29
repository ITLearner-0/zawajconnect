
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

export const processLanguages = (languages: string | string[] | undefined): string[] | undefined => {
  if (!languages) return undefined;
  
  if (typeof languages === 'string') {
    const trimmed = languages.trim();
    if (trimmed) {
      const languageList = trimmed.split(',');
      const processedLanguages: string[] = [];
      
      for (const lang of languageList) {
        if (typeof lang === 'string') {
          const trimmedLang = lang.trim();
          if (trimmedLang.length > 0) {
            processedLanguages.push(trimmedLang);
          }
        }
      }
      
      return processedLanguages.length > 0 ? processedLanguages : undefined;
    }
  } else if (Array.isArray(languages)) {
    const processedLanguages: string[] = [];
    
    for (const lang of languages) {
      if (typeof lang === 'string' && lang != null) {
        const trimmedLang = lang.trim();
        if (trimmedLang.length > 0) {
          processedLanguages.push(trimmedLang);
        }
      }
    }
    
    return processedLanguages.length > 0 ? processedLanguages : undefined;
  }
  
  return undefined;
};

export const processGallery = (gallery: string[] | undefined) => {
  if (!gallery || !Array.isArray(gallery)) return undefined;
  
  return gallery.filter((url): url is string => {
    return url != null && typeof url === 'string' && url.trim().length > 0;
  });
};
