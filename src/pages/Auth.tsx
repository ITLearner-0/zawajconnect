
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import SignUpForm from "@/components/auth/SignUpForm";
import SignInForm from "@/components/auth/SignInForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { useToast } from "@/components/ui/use-toast";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useTranslation();
  const { loading, signUp, signIn } = useAuth();
  const { toast } = useToast();

  const handleSignIn = async (data: { email: string; password: string }) => {
    const success = await signIn(data);
    if (!success) {
      toast({
        title: t("auth.loginError"),
        description: t("auth.checkCredentials"),
        variant: "destructive",
      });
    }
  };

  const handleSignUp = async (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    gender: string;
    waliName?: string;
    waliRelationship?: string;
    waliContact?: string;
  }) => {
    const success = await signUp(data);
    if (!success) {
      toast({
        title: t("auth.registrationError"),
        description: t("auth.registrationFailed"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12 dark:from-islamic-darkBg dark:to-islamic-darkCard">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-between mb-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <Card className="shadow-lg dark:bg-islamic-darkCard dark:text-white">
          <AuthHeader isSignUp={isSignUp} />
          <CardContent>
            {isSignUp ? (
              <SignUpForm
                loading={loading}
                onSubmit={handleSignUp}
              />
            ) : (
              <SignInForm
                loading={loading}
                onSubmit={handleSignIn}
              />
            )}
            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-primary hover:underline"
              >
                {isSignUp
                  ? t("auth.alreadyHaveAccount")
                  : t("auth.dontHaveAccount")}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
