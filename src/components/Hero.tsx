import { Button } from "@/components/ui/button";
import { Heart, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import heroPattern from "@/assets/hero-pattern-optimized.webp";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* ... keep existing code (Background) */}
      <div className="absolute inset-0 z-0">
        <img 
          src={heroPattern} 
          alt="Motifs islamiques élégants" 
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-cream/80" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* ... keep existing code (Bismillah and title) */}
          <div className="mb-8">
            <p className="text-lg text-muted-foreground font-arabic">بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيْمِ</p>
            <p className="text-sm text-muted-foreground mt-2 italic">Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux</p>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
            Trouvez votre
            <span className="bg-gradient-to-r from-emerald to-gold bg-clip-text text-transparent"> moitié</span>
            <br />
            dans le respect de la
            <span className="text-emerald"> Shariah</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Une plateforme matrimoniale moderne qui honore les valeurs islamiques, 
            où chaque rencontre est guidée par la Niyyah et le respect mutuel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in">
            <Button 
              variant="gradient" 
              size="lg" 
              className="animate-pulse-gentle"
              onClick={() => {
                try {
                  navigate('/auth');
                } catch (error) {
                  console.error('Navigation error:', error);
                }
              }}
            >
              <Heart className="mr-2 h-5 w-5" />
              Commencer mon parcours
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-emerald text-emerald hover:bg-emerald hover:text-white"
              onClick={() => {
                try {
                  // Use requestAnimationFrame to avoid forced reflow
                  requestAnimationFrame(() => {
                    const element = document.getElementById('valeurs');
                    if (element) {
                      element.scrollIntoView({ behavior: 'smooth' });
                    }
                  });
                } catch (error) {
                  console.error('Scroll error:', error);
                }
              }}
            >
              Découvrir nos valeurs
            </Button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="text-center p-6 rounded-lg bg-card shadow-soft card-hover animate-fade-in group">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-light to-emerald flex items-center justify-center group-hover:animate-float">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">100% Halal</h3>
              <p className="text-muted-foreground text-sm">Communication respectueuse selon les principes islamiques</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card shadow-soft card-hover animate-fade-in group" style={{animationDelay: '0.1s'}}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-gold-light to-gold flex items-center justify-center group-hover:animate-float">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Implication Familiale</h3>
              <p className="text-muted-foreground text-sm">Respect du rôle du Wali et de la famille</p>
            </div>
            
            <div className="text-center p-6 rounded-lg bg-card shadow-soft card-hover animate-fade-in group" style={{animationDelay: '0.2s'}}>
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-sage-dark to-sage flex items-center justify-center group-hover:animate-float">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Intention Pure</h3>
              <p className="text-muted-foreground text-sm">Uniquement pour le mariage halal et durable</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;