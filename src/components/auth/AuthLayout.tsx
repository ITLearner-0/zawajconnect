
import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { ArrowLeft, Home } from "lucide-react";
import AuthHeader from "./AuthHeader";

interface AuthLayoutProps {
  children: React.ReactNode;
  isSignUp: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, isSignUp }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-12">
      <div className="container max-w-md mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <Button
            asChild
            variant="ghost"
            className="flex items-center gap-2 text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200"
          >
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              <Home className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
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
