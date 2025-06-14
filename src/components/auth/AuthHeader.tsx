
import React from "react";
import { CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  const { t } = useTranslation();

  return (
    <CardHeader className="text-center">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-500 dark:from-rose-300 dark:to-pink-300 bg-clip-text text-transparent mb-2">
        {isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
      </h1>
      <p className="text-rose-600 dark:text-rose-300">
        {isSignUp ? t("auth.signUpToFind") : t("auth.signInToContinue")}
      </p>
    </CardHeader>
  );
};

export default AuthHeader;
