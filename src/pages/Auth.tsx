
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthActions } from "@/hooks/auth/useAuthActions";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import SignUpForm from "@/components/auth/SignUpForm";
import SignInForm from "@/components/auth/SignInForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { toast } from "sonner";
import { SignInData, SignUpData } from "@/types/auth";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const shouldSignUp = searchParams.get('signup') === 'true';
  const preselectedGender = searchParams.get('gender');
  
  const [isSignUp, setIsSignUp] = useState(shouldSignUp);
  const { t } = useTranslation();
  const { loading, signUp, signIn } = useAuthActions();
  const { user, loading: authLoading } = useAuth();
  
  // Handle auth redirects
  useAuthRedirect({ user, loading: authLoading });

  // Set signup mode based on URL parameters
  useEffect(() => {
    if (shouldSignUp) {
      setIsSignUp(true);
    }
  }, [shouldSignUp]);

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
    <AuthLayout isSignUp={isSignUp}>
      {isSignUp ? (
        <SignUpForm
          loading={loading}
          onSubmit={handleSignUp}
          preselectedGender={preselectedGender}
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
    </AuthLayout>
  );
};

export default Auth;
