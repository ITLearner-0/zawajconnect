
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importation du fichier de traduction français uniquement
import translationFR from './locales/fr/translation.json';

// Les ressources contenant seulement les traductions françaises
const resources = {
  fr: {
    translation: translationFR
  }
};

i18next
  // Passe i18n à react-i18next
  .use(initReactI18next)
  // Initialisation de i18next
  .init({
    resources,
    lng: 'fr', // Force French language
    fallbackLng: 'fr',
    debug: process.env.NODE_ENV === 'development',
    
    interpolation: {
      escapeValue: false, // non nécessaire pour React
    }
  });

export default i18next;
