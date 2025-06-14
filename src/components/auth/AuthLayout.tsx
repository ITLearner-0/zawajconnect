
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import AuthHeader from "./AuthHeader";

interface AuthLayoutProps {
  children: React.ReactNode;
  isSignUp: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isSignUp }) => {
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
            {children}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
