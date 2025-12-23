import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./i18n/en.json";
import ar from "./i18n/ar.json";

const savedLanguage = localStorage.getItem("i18nextLng") || "en";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar }
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: { escapeValue: false }
});

export default i18n;
