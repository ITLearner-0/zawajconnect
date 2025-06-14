
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star, Home } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { Button } from "@/components/ui/button";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/ui/language-switcher";

const NearbyHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { t } = useTranslation();

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 hover:bg-islamic-teal/10 group p-2"
            aria-label="Back to home"
          >
            <Home className="h-4 w-4 text-islamic-teal" />
            {!isMobile && <span>{t('header.home')}</span>}
          </Button>
          <CustomButton
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mr-2 sm:mr-4 hover:bg-islamic-teal/10 group p-2"
            aria-label="Go back"
          >
            <ArrowLeft className="h-4 w-4 text-islamic-teal group-hover:translate-x-[-2px] transition-transform" />
            {!isMobile && <span className="ml-2">{t('header.back')}</span>}
          </CustomButton>
          <h1 className="text-xl sm:text-3xl font-bold text-islamic-teal flex items-center gap-2 font-serif">
            {isMobile ? t('header.nearby') : t('header.findNearbyMatches')}
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-islamic-gold" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <AccessibilityControls />
          <ThemeToggle />
        </div>
      </div>

      <IslamicPattern variant="divider" color="teal" />
    </>
  );
};

export default NearbyHeader;
