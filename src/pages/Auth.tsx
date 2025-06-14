
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import SignUpForm from "@/components/auth/SignUpForm";
import SignInForm from "@/components/auth/SignInForm";
import AuthHeader from "@/components/auth/AuthHeader";
import { toast } from "sonner";
import { SignInData, SignUpData } from "@/types/auth";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { t } = useTranslation();
  const { loading, signUp, signIn } = useAuthActions();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/profile");
    }
  }, [user, navigate]);

  const handleSignIn = async (data: SignInData) => {
    try {
      const success = await signIn(data);
      if (!success) {
        console.log("Sign in failed");
      }
    } catch (error) {
      console.error("Unexpected error during sign in:", error);
      toast(t("auth.loginError"), {
        description: t("auth.unexpectedError")
      });
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    try {
      const success = await signUp(data);
      if (success) {
        // Switch to sign in if signup is successful
        setIsSignUp(false);
      }
    } catch (error) {
      console.error("Unexpected error during registration:", error);
      toast(t("auth.registrationError"), {
        description: t("auth.unexpectedError")
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-between mb-4">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
        <Card className="shadow-2xl border border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
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
                className="text-sm text-rose-600 dark:text-rose-300 hover:underline transition-colors"
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
