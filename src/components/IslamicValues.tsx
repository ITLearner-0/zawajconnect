import { Card, CardContent } from "@/components/ui/card";
import { Star, Eye, HandHeart, Users, MessageCircle, Lock } from "lucide-react";

const values = [
  {
    icon: Star,
    title: "Niyyah",
    subtitle: "Intention Pure",
    description: "Chaque membre s'engage avec une intention sincère de mariage halal et durable.",
    color: "from-emerald to-emerald-light"
  },
  {
    icon: Eye,
    title: "Haya",
    subtitle: "Modestie",
    description: "Préservation de la pudeur dans toutes les interactions et communications.",
    color: "from-gold to-gold-light"
  },
  {
    icon: HandHeart,
    title: "Transparence",
    subtitle: "Honnêteté",
    description: "Vérité totale concernant la situation personnelle et religieuse.",
    color: "from-sage-dark to-sage"
  },
  {
    icon: Users,
    title: "Implication Familiale",
    subtitle: "Respect du Wali",
    description: "Reconnaissance du rôle essentiel de la famille dans le processus matrimonial.",
    color: "from-emerald-light to-gold-light"
  },
  {
    icon: MessageCircle,
    title: "Communication Halal",
    subtitle: "Respect Mutuel",
    description: "Échanges respectueux sans flirt, focalisés sur la compatibilité matrimoniale.",
    color: "from-gold-light to-emerald-light"
  },
  {
    icon: Lock,
    title: "Protection Privacy",
    subtitle: "Confidentialité",
    description: "Sécurité maximale des données personnelles et religieuses des utilisateurs.",
    color: "from-sage to-emerald"
  }
];

const IslamicValues = () => {
  return (
    <section id="valeurs" className="py-20 bg-gradient-to-b from-background to-cream">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Nos Valeurs <span className="text-emerald">Islamiques</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Chaque aspect de notre plateforme est conçu pour respecter et honorer 
            les principes fondamentaux de l'Islam.
          </p>
          
          {/* Hadith Quote */}
          <div className="mt-8 p-6 bg-card rounded-lg shadow-soft max-w-3xl mx-auto border-l-4 border-emerald">
            <p className="text-muted-foreground italic mb-2">
              "Quand quelqu'un dont vous agréez la religion et le comportement demande votre fille en mariage, 
              mariez-la à lui. Si vous ne le faites pas, il y aura des troubles sur terre et une grande corruption."
            </p>
            <p className="text-sm text-emerald font-medium">- Hadith rapporté par At-Tirmidhi</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {values.map((value, index) => {
            const IconComponent = value.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 shadow-soft animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${value.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-1 text-foreground">{value.title}</h3>
                  <p className="text-emerald font-medium mb-3">{value.subtitle}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Islamic Pattern Decoration */}
        <div className="flex justify-center mt-16">
          <div className="w-32 h-1 bg-gradient-to-r from-transparent via-emerald to-transparent rounded-full"></div>
        </div>
      </div>
    </section>
  );
};

export default IslamicValues;