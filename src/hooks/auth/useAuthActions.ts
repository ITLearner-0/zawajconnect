
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SignUpData, SignInData } from "@/types/auth";
import { signUp } from "@/services/auth/signUp";
import { signIn } from "@/services/auth/signIn";
import { signOut } from "@/services/auth/signOut";

export const useAuthActions = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSignUp = async (data: SignUpData) => {
    setLoading(true);
    try {
      const result = await signUp(data, t);
      if (result) {
        // Redirect to auth page with success message after successful signup
        navigate("/auth?success=signup");
      }
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in handleSignUp:", error);
      setLoading(false);
      return false;
    }
  };

  const handleSignIn = async (data: SignInData) => {
    setLoading(true);
    try {
      const result = await signIn(data, t);
      if (result) {
        navigate("/profile");
      }
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in handleSignIn:", error);
      setLoading(false);
      return false;
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const result = await signOut(t);
      if (result) {
        navigate("/auth");
      }
      setLoading(false);
      return result;
    } catch (error) {
      console.error("Error in handleSignOut:", error);
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut
  };
};
