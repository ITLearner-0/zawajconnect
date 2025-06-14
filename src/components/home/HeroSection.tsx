
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";

const HeroSection = () => {
  return (
    <header className="relative overflow-hidden min-h-screen flex items-center justify-center px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20 dark:opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,182,193,0.3),transparent_70%)]"></div>
      </div>
      
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-20 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="text-3xl md:text-4xl font-bold text-rose-800 dark:text-rose-100 font-serif">
            Nikah Connect
          </div>
          <div className="flex items-center gap-4">
            <AccessibilityControls />
            <ThemeToggle />
          </div>
        </div>
      </nav>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-rose-800 dark:text-rose-100 font-serif leading-tight">
          SE MARIER DE MANIÈRE
          <span className="block bg-gradient-to-r from-rose-500 to-pink-400 dark:from-rose-300 dark:to-pink-200 bg-clip-text text-transparent">
            LÉGIFÉRÉE
          </span>
        </h1>
        
        <p className="text-lg md:text-xl mb-10 text-rose-700 dark:text-rose-200 max-w-3xl mx-auto leading-relaxed">
          Une plateforme de mariage construite sur les valeurs islamiques, 
          vous guidant vers une union bénie et harmonieuse.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
          <Button 
            asChild 
            size="lg" 
            className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white font-bold px-8 py-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300 text-base border-0"
          >
            <Link to="/auth" className="flex items-center gap-2">
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
            <Link to="/auth" className="flex items-center gap-2">
              INSCRIPTION HOMME
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-rose-600 dark:text-rose-300 animate-bounce">
        <div className="w-6 h-10 border-2 border-rose-400 dark:border-rose-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-rose-400 dark:bg-rose-300 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </header>
  );
};

export default HeroSection;
