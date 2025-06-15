
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
    <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4">
      {/* Enhanced Background Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.3),transparent_70%)]"></div>
        {/* Islamic geometric pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e11d48' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }}></div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            {/* Logo placeholder */}
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
      <div className="relative z-10 text-center max-w-6xl mx-auto pt-20">
        {/* Arabic text and translation at the top */}
        <div className="text-center mb-8">
          <div className="text-xl md:text-2xl lg:text-3xl font-arabic text-rose-700 dark:text-rose-300 mb-3 leading-relaxed">
            بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
          </div>
          <div className="text-sm md:text-base lg:text-lg text-rose-600 dark:text-rose-400 italic mb-8">
            Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux
          </div>
        </div>
        
        {/* Site name */}
        <div className="relative mb-8">
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-rose-800 dark:text-rose-100 font-serif tracking-wide">
            <span className="relative inline-block">
              <span className="bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 dark:from-rose-200 dark:via-pink-200 dark:to-rose-300 bg-clip-text text-transparent drop-shadow-sm">
                Nikah
              </span>
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full animate-pulse"></span>
            </span>
            <span className="ml-3 bg-gradient-to-r from-pink-600 via-rose-500 to-pink-500 dark:from-pink-200 dark:via-rose-200 dark:to-pink-300 bg-clip-text text-transparent drop-shadow-sm">
              Connect
            </span>
          </div>
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 rounded-full opacity-60"></div>
        </div>
        
        {/* Main tagline */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-6 text-rose-800 dark:text-rose-100 font-serif leading-tight">
          SE MARIER DE MANIÈRE
          <span className="block bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-300 dark:to-pink-200 bg-clip-text text-transparent animate-title-pulse">
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
        
        {/* Enhanced CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-base border-0"
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
            className="border-2 border-rose-400 text-rose-600 bg-white/50 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-800/50 font-bold px-8 py-4 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-base"
          >
            <Link to="/auth?signup=true&gender=male" className="flex items-center gap-2">
              INSCRIPTION HOMME
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>

        {/* Premium CTA */}
        <div className="flex justify-center mb-8">
          <Button 
            asChild 
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-6 py-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            <Link to="/subscription" className="flex items-center gap-2">
              <Crown className="h-5 w-5" />
              Découvrir Premium
            </Link>
          </Button>
        </div>

        {/* Sign In Button */}
        <div className="flex justify-center mb-8">
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

        {/* Secondary Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
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
          
          <SmoothScrollButton 
            targetSection="features"
            variant="ghost"
            className="text-rose-600 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-800/30"
          >
            En Savoir Plus
          </SmoothScrollButton>
        </div>

        {/* Bottom CTA Section - Ready to Start */}
        <div className="bg-gradient-to-r from-rose-900/10 to-pink-900/10 dark:from-rose-800/20 dark:to-pink-800/20 rounded-2xl p-8 mb-8 backdrop-blur-sm border border-rose-200/20 dark:border-rose-700/20">
          <h3 className="text-xl md:text-2xl font-bold mb-4 text-rose-800 dark:text-rose-200">
            Prêt à commencer votre voyage vers le mariage halal ?
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              asChild 
              size="lg" 
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              <Link to="/auth?signup=true" className="flex items-center gap-2">
                S'inscrire Maintenant
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <SmoothScrollButton 
              targetSection="trust"
              variant="outline"
              size="lg"
              className="border-2 border-rose-400 text-rose-600 bg-white/50 backdrop-blur-sm hover:bg-rose-50 dark:border-rose-300 dark:text-rose-200 dark:bg-rose-900/30 dark:hover:bg-rose-800/50 font-bold px-8 py-3 rounded-full shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              En Savoir Plus
            </SmoothScrollButton>
          </div>
        </div>
      </div>
      
      {/* Enhanced Scroll Indicator */}
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
