
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import SignUpForm from "@/components/auth/SignUpForm";
import SignInForm from "@/components/auth/SignInForm";
import AuthHeader from "@/components/auth/AuthHeader";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [gender, setGender] = useState("");
  const [waliName, setWaliName] = useState("");
  const [waliRelationship, setWaliRelationship] = useState("");
  const [waliContact, setWaliContact] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const { t } = useTranslation();
  const { loading, signUp, signIn } = useAuth();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Auth form submitted", { isSignUp, email, firstName, lastName, gender });
    
    if (isSignUp) {
      await signUp({
        email,
        password,
        firstName,
        lastName,
        gender,
        waliName,
        waliRelationship,
        waliContact
      });
    } else {
      await signIn({ email, password });
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
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                firstName={firstName}
                setFirstName={setFirstName}
                lastName={lastName}
                setLastName={setLastName}
                gender={gender}
                setGender={setGender}
                waliName={waliName}
                setWaliName={setWaliName}
                waliRelationship={waliRelationship}
                setWaliRelationship={setWaliRelationship}
                waliContact={waliContact}
                setWaliContact={setWaliContact}
                loading={loading}
                onSubmit={handleAuth}
              />
            ) : (
              <SignInForm
                email={email}
                setEmail={setEmail}
                password={password}
                setPassword={setPassword}
                loading={loading}
                onSubmit={handleAuth}
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
