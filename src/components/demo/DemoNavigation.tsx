import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft, User, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { LanguageSwitcher } from '@/components/ui/language-switcher';
import AccessibilityControls from '@/components/AccessibilityControls';
import { useTranslation } from 'react-i18next';

const DemoNavigation = () => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-r from-rose-100/95 via-pink-50/95 to-rose-100/95 dark:from-rose-900/95 dark:via-rose-800/95 dark:to-pink-900/95 backdrop-blur-md border-b border-rose-200 dark:border-rose-700">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo/Brand */}
          <Link to="/" className="relative group">
            <div className="text-2xl md:text-3xl font-bold text-rose-800 dark:text-rose-100 font-serif tracking-wide">
              <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 dark:from-rose-200 dark:via-pink-200 dark:to-rose-300 bg-clip-text text-transparent drop-shadow-sm">
                Nikah
              </span>
              <span className="ml-2 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 dark:from-pink-200 dark:via-rose-200 dark:to-pink-300 bg-clip-text text-transparent drop-shadow-sm">
                Connect
              </span>
            </div>
            <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 rounded-full opacity-60 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
          </Link>

          {/* Demo Badge */}
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-rose-500/10 to-pink-500/10 dark:from-rose-300/10 dark:to-pink-300/10 px-4 py-2 rounded-full border border-rose-300/50 dark:border-rose-600/50">
            <MessageSquare className="h-4 w-4 text-rose-600 dark:text-rose-300" />
            <span className="text-sm font-medium text-rose-700 dark:text-rose-200">
              {t('navigation.demo')}
            </span>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Button
              variant="ghost"
              asChild
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-100 dark:text-rose-300 dark:hover:text-rose-200 dark:hover:bg-rose-800/50"
            >
              <Link to="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                {t('navigation.home')}
              </Link>
            </Button>
            <Button
              variant="ghost"
              asChild
              className="text-rose-700 hover:text-rose-800 hover:bg-rose-100 dark:text-rose-300 dark:hover:text-rose-200 dark:hover:bg-rose-800/50"
            >
              <Link to="/auth">
                <User className="h-4 w-4 mr-2" />
                {t('navigation.signup')}
              </Link>
            </Button>
          </div>

          {/* Mobile Back Button + Controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              asChild
              className="md:hidden border-rose-300 text-rose-700 hover:bg-rose-100 dark:border-rose-600 dark:text-rose-300 dark:hover:bg-rose-800"
            >
              <Link to="/" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                {t('navigation.back')}
              </Link>
            </Button>
            <AccessibilityControls />
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
      </nav>
    </header>
  );
};

export default DemoNavigation;
