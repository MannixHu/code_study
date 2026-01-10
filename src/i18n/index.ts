/**
 * i18n Configuration
 * Internationalization setup using react-i18next
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import translations
import enTranslation from "./locales/en/translation.json";
import zhTranslation from "./locales/zh/translation.json";

// Language resources
const resources = {
  en: {
    translation: enTranslation,
  },
  zh: {
    translation: zhTranslation,
  },
};

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "zh", // Default to Chinese
    supportedLngs: ["en", "zh"],

    interpolation: {
      escapeValue: false, // React already handles escaping
    },

    detection: {
      // Language detection order
      order: ["localStorage", "navigator", "htmlTag"],
      // Cache user language preference
      caches: ["localStorage"],
      // Local storage key
      lookupLocalStorage: "i18nextLng",
    },

    react: {
      useSuspense: true,
    },
  });

export default i18n;

// Export utility functions
export const changeLanguage = (lang: string) => {
  i18n.changeLanguage(lang);
};

export const getCurrentLanguage = () => {
  return i18n.language;
};

export const getSupportedLanguages = () => {
  return [
    { code: "zh", name: "中文", nativeName: "中文" },
    { code: "en", name: "English", nativeName: "English" },
  ];
};
