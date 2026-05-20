import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr.json';
import mo from './locales/mo.json';
import di from './locales/di.json';
import fu from './locales/fu.json';

const resources = {
  fr: { translation: fr },
  mo: { translation: mo },
  di: { translation: di },
  fu: { translation: fu },
};
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "fr",
    fallbackLng: "fr",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
