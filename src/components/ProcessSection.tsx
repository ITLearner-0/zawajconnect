import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, UserPlus, Search, Heart, MessageCircle, Users } from 'lucide-react';

interface ProcessStep {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
}

const processSteps: ProcessStep[] = [
  {
    id: 1,
    icon: <UserPlus className="w-8 h-8 text-emerald-500" />,
    title: "Créez Votre Profil",
    description: "Configurez votre profil détaillé avec les préférences islamiques et les informations familiales.",
    details: [
      "Ajoutez vos pratiques et préférences islamiques",
      "Téléchargez des photos vérifiées avec contrôles de confidentialité",
      "Incluez le contexte familial et les attentes",
      "Définissez vos préférences matrimoniales"
    ]
  },
  {
    id: 2,
    icon: <CheckCircle className="w-8 h-8 text-blue-500" />,
    title: "Faites-vous Vérifier",
    description: "Complétez notre processus de vérification multi-étapes pour une communauté de confiance.",
    details: [
      "Vérifiez vos documents d'identité",
      "Confirmez votre téléphone et email",
      "Vérification familiale (optionnelle)",
      "Augmentez la crédibilité de votre profil"
    ]
  },
  {
    id: 3,
    icon: <Search className="w-8 h-8 text-purple-500" />,
    title: "Parcourir & Rechercher",
    description: "Utilisez nos filtres avancés pour trouver des matches compatibles basés sur des critères islamiques.",
    details: [
      "Filtrez par pratiques islamiques et secte",
      "Préférences de lieu et d'éducation",
      "Correspondance du contexte familial",
      "Alignement du mode de vie et des valeurs"
    ]
  },
  {
    id: 4,
    icon: <Heart className="w-8 h-8 text-rose-500" />,
    title: "Exprimer l'Intérêt",
    description: "Montrez votre intérêt pour des profils qui correspondent à vos préférences de manière respectueuse.",
    details: [
      "Envoyez des notifications d'intérêt respectueuses",
      "Voyez qui s'intéresse à vous", 
      "Les matches mutuels débloquent la communication",
      "La famille peut aussi exprimer son intérêt"
    ]
  },
  {
    id: 5,
    icon: <MessageCircle className="w-8 h-8 text-amber-500" />,
    title: "Communiquer Respectueusement",
    description: "Commencez des conversations significatives avec vos matches dans un environnement surveillé.",
    details: [
      "Directives islamiques pour la communication",
      "Un membre de la famille peut rejoindre les conversations",
      "Signalez les comportements inappropriés",
      "Concentrez-vous sur l'apprentissage mutuel"
    ]
  },
  {
    id: 6,
    icon: <Users className="w-8 h-8 text-indigo-500" />,
    title: "Rencontrer les Familles",
    description: "Impliquez les familles dans le processus menant à une union bénie, In Sha Allah.",
    details: [
      "Organisez des présentations familiales",
      "Rencontres matrimoniales traditionnelles",
      "Conseil matrimonial islamique",
      "Assistance à la planification du mariage"
    ]
  }
];

const ProcessSection = () => {
  return (
    <section id="processus" className="py-12 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-6 text-foreground">
            Votre Parcours vers le Mariage
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Suivez notre approche islamique pour trouver votre partenaire de vie. Chaque étape est conçue 
            avec respect, confidentialité et valeurs islamiques au cœur.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {processSteps.map((step) => (
            <Card key={step.id} className="border border-border bg-card">
              <CardContent className="p-8">
                {/* Step Number */}
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                  {step.id}
                </div>

                {/* Icon */}
                <div className="mb-6 p-4 rounded-full bg-muted w-fit">
                  {step.icon}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-4 text-foreground">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {step.description}
                </p>

                {/* Details */}
                <ul className="space-y-2 mb-6">
                  {step.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="flex items-start gap-3 text-sm">
                      <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{detail}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-muted rounded border border-border p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-4">
              Prêt à Commencer Votre Parcours ?
            </h3>
            <p className="text-muted-foreground mb-6">
              Rejoignez des milliers de musulmans qui ont trouvé leurs partenaires de vie grâce à notre plateforme.
            </p>
            <Button 
              size="lg" 
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
            >
              Créez Votre Profil Aujourd'hui
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;