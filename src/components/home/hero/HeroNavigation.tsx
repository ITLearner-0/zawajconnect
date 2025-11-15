import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Crown, LogIn } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import AccessibilityControls from '@/components/AccessibilityControls';
import { LanguageSwitcher } from '@/components/ui/language-switcher';

const HeroNavigation = () => {
  return (
    <nav className="absolute top-0 left-0 right-0 z-20 p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl md:text-3xl font-bold text-rose-800 dark:text-rose-100 font-serif">
          <span className="bg-gradient-to-r from-rose-600 to-pink-500 bg-clip-text text-transparent">
            Nikah Connect
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-purple-600 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-800/30"
          >
            <Link to="/subscription" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Premium
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30"
          >
            <Link to="/auth" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Se Connecter
            </Link>
          </Button>
          <LanguageSwitcher />
          <AccessibilityControls />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default HeroNavigation;
