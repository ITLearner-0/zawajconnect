import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Shield, 
  Users, 
  Sparkles, 
  CheckCircle, 
  Star,
  ArrowRight,
  Clock,
  Target
} from 'lucide-react';

interface OnboardingWelcomeProps {
  onStart: () => void;
  userName?: string;
}

const OnboardingWelcome = ({ onStart, userName }: OnboardingWelcomeProps) => {
  const [currentStep, setCurrentStep] = useState(0);

  const benefits = [
    {
      icon: <Heart className="h-5 w-5" />,
      title: "Compatibilité IA",
      description: "Algorithme intelligent basé sur vos valeurs islamiques",
      color: "from-rose-500 to-pink-500"
    },
    {
      icon: <Shield className="h-5 w-5" />,
      title: "Sécurisé & Halal", 
      description: "Modération automatique et supervision familiale",
      color: "from-emerald-500 to-teal-500"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Communauté Vérifiée",
      description: "Profils authentiques avec vérification d'identité",
      color: "from-blue-500 to-indigo-500"
    }
  ];

  const stats = [
    { value: "2k+", label: "Mariages réussis", icon: <Heart className="h-4 w-4" /> },
    { value: "98%", label: "Satisfaction", icon: <Star className="h-4 w-4" /> },
    { value: "24/7", label: "Support", icon: <Shield className="h-4 w-4" /> }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % benefits.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald to-emerald-light rounded-full mb-6 animate-float">
            <Heart className="h-10 w-10 text-white fill-current" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Bienvenue {userName ? `${userName} ` : ''}sur{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald to-gold">
              ZawajConnect
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Trouvez votre âme sœur grâce à notre plateforme de rencontres islamiques 
            intelligente et respectueuse des valeurs halal.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-white/50 backdrop-blur border-emerald/20 animate-slide-up" style={{ animationDelay: `${index * 200}ms` }}>
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center mb-2 text-emerald">
                    {stat.icon}
                  </div>
                  <div className="font-bold text-lg">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits Carousel */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {benefits.map((benefit, index) => (
              <Card 
                key={index}
                className={`transition-all duration-500 cursor-pointer transform hover:scale-105 animate-slide-up ${
                  index === currentStep ? 'ring-2 ring-emerald/50 shadow-lg' : 'hover:shadow-md'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-12 h-12 bg-gradient-to-r ${benefit.color} rounded-full flex items-center justify-center mx-auto mb-4 text-white`}>
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm">{benefit.description}</p>
                  {index === currentStep && (
                    <div className="mt-4">
                      <Badge className="bg-emerald text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Inclus
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Progress dots */}
          <div className="flex justify-center space-x-2">
            {benefits.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentStep ? 'bg-emerald w-8' : 'bg-emerald/30'
                }`}
                onClick={() => setCurrentStep(index)}
              />
            ))}
          </div>
        </div>

        {/* Quick Setup Preview */}
        <Card className="bg-gradient-to-r from-emerald/10 to-gold/10 border-emerald/20 mb-8 animate-slide-up">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald to-gold rounded-full flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Configuration rapide</h3>
                  <p className="text-sm text-muted-foreground">Seulement 3 minutes pour un profil complet</p>
                </div>
              </div>
              <Badge variant="secondary" className="flex items-center space-x-1">
                <Clock className="h-3 w-3" />
                <span>3 min</span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: 1, title: "Infos de base", time: "30s" },
                { step: 2, title: "Profil détaillé", time: "1min" },
                { step: 3, title: "Préférences islamiques", time: "1min" },
                { step: 4, title: "Objectifs", time: "30s" }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-8 h-8 bg-emerald/20 text-emerald rounded-full flex items-center justify-center text-sm font-semibold mx-auto mb-2">
                    {item.step}
                  </div>
                  <div className="text-xs font-medium">{item.title}</div>
                  <div className="text-xs text-muted-foreground">{item.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center animate-slide-up">
          <Button
            onClick={onStart}
            size="lg"
            className="bg-gradient-to-r from-emerald to-emerald-dark hover:from-emerald-dark hover:to-emerald text-white px-12 py-6 text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Commencer mon profil
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <div className="mt-4 flex items-center justify-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <Shield className="h-4 w-4 text-emerald" />
              <span>100% sécurisé</span>
            </div>
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4 text-emerald" />
              <span>Compatible IA</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingWelcome;