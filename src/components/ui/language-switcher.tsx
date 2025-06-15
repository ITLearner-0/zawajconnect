
import React from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  // Force French language
  React.useEffect(() => {
    if (i18n.language !== 'fr') {
      i18n.changeLanguage('fr');
    }
  }, [i18n]);

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-8 w-8 text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-800/50 rounded-full"
      disabled
    >
      <Globe className="h-4 w-4" />
      <span className="sr-only">Français</span>
    </Button>
  );
}
