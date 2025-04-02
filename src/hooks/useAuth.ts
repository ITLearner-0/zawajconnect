
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signUp as signUpService } from "@/services/auth/signUp";
import { signIn as signInService } from "@/services/auth/signIn";
import { SignUpData, SignInData } from "@/types/auth";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signUp = async (data: SignUpData) => {
    setLoading(true);
    const result = await signUpService(data, t);
    setLoading(false);
    return result;
  };

  const signIn = async (data: SignInData) => {
    setLoading(true);
    const result = await signInService(data, t);
    if (result) {
      navigate("/profile");
    }
    setLoading(false);
    return result;
  };

  return {
    loading,
    signUp,
    signIn,
    setLoading
  };
};
