
import React from "react";
import { CardHeader } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface AuthHeaderProps {
  isSignUp: boolean;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ isSignUp }) => {
  const { t } = useTranslation();

  return (
    <CardHeader>
      <h1 className="text-2xl font-bold text-center">
        {isSignUp ? t("auth.createAccount") : t("auth.welcomeBack")}
      </h1>
      <p className="text-center text-gray-600 dark:text-gray-300">
        {isSignUp ? t("auth.signUpToFind") : t("auth.signInToContinue")}
      </p>
    </CardHeader>
  );
};

export default AuthHeader;
