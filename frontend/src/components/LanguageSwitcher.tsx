import { useLanguage } from "@/context/LanguageContext";
import { Button } from "@/components/ui/button";

export const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === "en" ? "ar" : "en";
    changeLanguage(newLang);
  };

  return (
    <Button variant="outline" onClick={toggleLanguage}>
      {language === "en" ? "العربية" : "English"}
    </Button>
  );
};
