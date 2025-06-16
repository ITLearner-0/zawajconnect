
import { Button } from "@/components/ui/button";
import { Heart, Users, Shield, Sparkles, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SmoothScrollButton from "./SmoothScrollButton";

const EnhancedHeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 border-2 border-rose-300 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-16 h-16 border-2 border-pink-300 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 left-32 w-12 h-12 border-2 border-rose-400 rounded-full animate-pulse delay-2000"></div>
      </div>

      <div className="container mx-auto px-4 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-rose-800 dark:text-rose-100 mb-6 leading-tight">
            Trouvez votre{" "}
            <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
              âme sœur
            </span>
            <br />
            selon les valeurs islamiques
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-rose-600 dark:text-rose-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Plateforme de rencontres halal avec supervision Wali, 
            compatibilité religieuse et respect des traditions islamiques
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10 text-rose-700 dark:text-rose-300">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <span className="font-semibold">10,000+ Membres</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              <span className="font-semibold">500+ Mariages</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="font-semibold">100% Halal</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Commencer maintenant
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => navigate('/demo')}
              className="border-2 border-rose-400 text-rose-700 hover:bg-rose-50 dark:text-rose-300 dark:border-rose-500 dark:hover:bg-rose-900 px-8 py-3 text-lg font-semibold"
            >
              Découvrir la démo
            </Button>
          </div>

          {/* Quick Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/matches')}
              className="text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900"
            >
              Correspondances
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/resources')}
              className="text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900"
            >
              Ressources
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/support')}
              className="text-rose-600 hover:bg-rose-100 dark:text-rose-300 dark:hover:bg-rose-900"
            >
              Support
            </Button>
          </div>

          {/* Scroll Button */}
          <SmoothScrollButton 
            targetSection="features" 
            className="mx-auto animate-bounce"
          >
            <ChevronDown className="h-6 w-6 text-rose-400" />
          </SmoothScrollButton>
        </div>
      </div>
    </section>
  );
};

export default EnhancedHeroSection;
