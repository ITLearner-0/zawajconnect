
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight, Play, ChevronDown, LogIn, Crown } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import HeroStats from "./HeroStats";
import SmoothScrollButton from "./SmoothScrollButton";

const EnhancedHeroSection = () => {
  return (
    <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-200 dark:from-rose-900 dark:via-pink-900 dark:to-rose-800">
      {/* Simplified Background Pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-20">
        <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.2),transparent_70%)]"></div>
      </div>
      
      {/* Navigation */}
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
      
      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto pt-20">
        {/* Arabic text and translation */}
        <div className="text-center mb-8">
          <div className="text-xl md:text-2xl font-arabic text-rose-700 dark:text-rose-300 mb-3 leading-relaxed">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
          <div className="text-sm md:text-base text-rose-600 dark:text-rose-400 italic mb-6">
            Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
          </div>
        </div>
        
        {/* Main tagline */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-100 font-serif leading-tight">
          SE MARIER DE MANIÈRE
          <span className="block bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-300 dark:to-pink-200 bg-clip-text text-transparent">
            LÉGIFÉRÉE
          </span>
        </h1>
        
        <p className="text-lg md:text-xl mb-8 text-rose-700 dark:text-rose-200 max-w-3xl mx-auto leading-relaxed">
          Une plateforme de mariage construite sur les valeurs islamiques, 
          vous guidant vers une union bénie et harmonieuse.
        </p>
        
        {/* Stats Section */}
        <div className="mb-10">
          <HeroStats />
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
          >
            <Link to="/auth?signup=true&gender=female" className="flex items-center gap-2">
              INSCRIPTION FEMME
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
          
          <div className="text-rose-600 dark:text-rose-300 text-sm font-medium">OU</div>
          
          <Button 
            asChild 
            variant="outline" 
            size="lg" 
            className="border-2 border-rose-500 text-rose-600 bg-white/80 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/50 dark:hover:bg-rose-800/50 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
          >
            <Link to="/auth?signup=true&gender=male" className="flex items-center gap-2">
              INSCRIPTION HOMME
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            asChild 
            variant="ghost"
            size="sm"
            className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30"
          >
            <Link to="/demo" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Voir la Démo
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="ghost"
            size="sm"
            className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30 border border-rose-300 dark:border-rose-600"
          >
            <Link to="/auth" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Déjà membre ? Se connecter
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <SmoothScrollButton 
        targetSection="trust"
        variant="ghost"
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-rose-600 dark:text-rose-300 animate-bounce p-2"
      >
        <div className="flex flex-col items-center">
          <div className="w-6 h-10 border-2 border-rose-400 dark:border-rose-300 rounded-full flex justify-center relative">
            <div className="w-1 h-3 bg-rose-400 dark:bg-rose-300 rounded-full mt-2 animate-pulse"></div>
          </div>
          <ChevronDown className="h-4 w-4 mt-2" />
          <p className="text-xs mt-1 font-medium">Découvrir</p>
        </div>
      </SmoothScrollButton>
    </header>
  );
};

export default EnhancedHeroSection;
