import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Search, MessageSquare, Heart } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    number: "01",
    title: "Inscription Respectueuse",
    description: "Créez votre profil avec vos informations religieuses, personnelles et familiales. Chaque profil est vérifié pour garantir des intentions sincères.",
    features: ["Vérification d'identité", "Validation religieuse", "Approbation familiale"]
  },
  {
    icon: Search,
    number: "02", 
    title: "Recherche Guidée",
    description: "Trouvez des profils compatibles selon vos critères islamiques : niveau de pratique, origines, projets de vie et valeurs partagées.",
    features: ["Critères religieux", "Compatibilité familiale", "Objectifs matrimoniaux"]
  },
  {
    icon: MessageSquare,
    number: "03",
    title: "Communication Halal",
    description: "Échangez dans le respect avec possibilité d'inclure un Wali ou un membre de la famille dans les conversations importantes.",
    features: ["Messages supervisés", "Inclusion du Wali", "Respect de la Haya"]
  },
  {
    icon: Heart,
    number: "04",
    title: "Union Bénie",
    description: "Progressez vers le mariage avec l'accompagnement de vos familles et le respect complet des traditions islamiques.",  
    features: ["Accompagnement familial", "Préparation au mariage", "Suivi post-union"]
  }
];

const ProcessSection = () => {
  return (
    <section id="processus" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Un Processus <span className="text-emerald">Respectueux</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chaque étape de votre parcours matrimonial est conçue pour honorer 
            les valeurs islamiques et impliquer votre famille.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            const isEven = index % 2 === 1;
            
            return (
              <div key={index} className={`flex ${isEven ? 'lg:flex-row-reverse' : 'flex-row'} gap-6`}>
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald to-emerald-light flex items-center justify-center shadow-lg">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-gold text-white text-sm font-bold flex items-center justify-center">
                      {step.number}
                    </div>
                  </div>
                </div>
                
                <Card className="flex-1 shadow-soft hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                    <p className="text-muted-foreground mb-4 leading-relaxed">{step.description}</p>
                    
                    <div className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center text-sm">
                          <div className="w-2 h-2 rounded-full bg-emerald mr-3"></div>
                          <span className="text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-cream to-sage/20 rounded-2xl p-8">
          <h3 className="text-2xl font-bold mb-4 text-foreground">
            Prêt à commencer votre parcours ?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Rejoignez des milliers de musulmans qui ont trouvé leur moitié dans le respect des valeurs islamiques.
          </p>
          <Button size="lg" className="bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-dark hover:to-emerald text-white">
            <Heart className="mr-2 h-5 w-5" />
            Créer mon profil
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;