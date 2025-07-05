
import React, { useState } from "react";
import { Link } from "react-router-dom";
import SignUpForm from "@/components/auth/SignUpForm";
import SignInForm from "@/components/auth/SignInForm";
import AuthLayout from "@/components/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Shield } from "lucide-react";

const Auth: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const { loading, signUp, signIn } = useAuth();

  const handleSignUp = async (data: any) => {
    try {
      const result = await signUp(data);
      if (result) {
        console.log("Sign up successful");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const handleSignIn = async (data: any) => {
    try {
      const result = await signIn(data);
      if (result) {
        console.log("Sign in successful");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  return (
    <AuthLayout isSignUp={isSignUp}>
      <div className="space-y-6">
        {isSignUp ? (
          <SignUpForm loading={loading} onSubmit={handleSignUp} />
        ) : (
          <SignInForm loading={loading} onSubmit={handleSignIn} />
        )}

        <div className="text-center space-y-4">
            <Button
              variant="ghost"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200"
            >
              {isSignUp
                ? "Vous avez déjà un compte ? Connectez-vous"
                : "Pas de compte ? Inscrivez-vous"}
            </Button>

          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Êtes-vous un tuteur ou wali ?
            </p>
            <Button
              asChild
              variant="outline"
              className="w-full border-islamic-gold text-islamic-gold hover:bg-islamic-gold hover:text-white"
            >
              <Link to="/wali/setup" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                S'inscrire comme Wali/Tuteur
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Auth;
