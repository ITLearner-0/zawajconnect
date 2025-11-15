import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  MapPin,
  Calendar,
  Quote,
  ChevronLeft,
  ChevronRight,
  Star,
  TrendingUp,
} from 'lucide-react';

interface SuccessStory {
  id: string;
  names: string;
  location: string;
  marriageDate: string;
  story: string;
  avatar: string;
  matchScore: number;
  testimonial: string;
  categories: string[];
}

const SuccessStories = () => {
  const [currentStory, setCurrentStory] = useState(0);

  const stories: SuccessStory[] = [
    {
      id: '1',
      names: 'Ahmed & Fatima',
      location: 'Paris, France',
      marriageDate: 'Juin 2024',
      story:
        "Nous nous sommes rencontrés grâce à l'algorithme de compatibilité. Nos valeurs islamiques communes et notre vision de la famille nous ont rapprochés immédiatement.",
      avatar: 'AF',
      matchScore: 94,
      testimonial:
        "Barakallahu fik ! Cette plateforme a changé nos vies. Nous avons trouvé plus qu'un partenaire, nous avons trouvé notre moitié de dine.",
      categories: ['Mariage', 'Compatibilité'],
    },
    {
      id: '2',
      names: 'Omar & Aicha',
      location: 'Lyon, France',
      marriageDate: 'Mars 2024',
      story:
        "Après des années de recherche, nous avons découvert cette plateforme. L'approche respectueuse des valeurs islamiques nous a mis en confiance.",
      avatar: 'OA',
      matchScore: 91,
      testimonial:
        'Alhamdulillah ! Nous recommandons cette plateforme à tous nos amis célibataires. Le processus est sérieux et respectueux.',
      categories: ['Valeurs', 'Respect'],
    },
    {
      id: '3',
      names: 'Youssef & Maryam',
      location: 'Marseille, France',
      marriageDate: 'Août 2024',
      story:
        'La vérification des profils nous a rassurés. Nous avons pu échanger en toute confiance et construire une relation solide avant le mariage.',
      avatar: 'YM',
      matchScore: 88,
      testimonial:
        "Qu'Allah bénisse cette initiative ! C'est exactement ce dont la communauté musulmane avait besoin.",
      categories: ['Confiance', 'Sécurité'],
    },
    {
      id: '4',
      names: 'Ibrahim & Khadija',
      location: 'Toulouse, France',
      marriageDate: 'Octobre 2024',
      story:
        "L'accompagnement par des conseillers matrimoniaux nous a aidés à mieux nous comprendre et à préparer notre union.",
      avatar: 'IK',
      matchScore: 92,
      testimonial:
        "Subhanallah ! Nous n'aurions jamais imaginé trouver notre partenaire idéal si facilement. Merci pour ce service exceptionnel !",
      categories: ['Accompagnement', 'Préparation'],
    },
  ];

  const nextStory = () => {
    setCurrentStory((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentStory((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStoryData = stories[currentStory];

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-emerald/5 via-cream/20 to-sage/10">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="h-16 w-16 bg-gradient-to-br from-gold to-emerald rounded-full flex items-center justify-center mx-auto mb-6">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-foreground mb-4">Histoires de Réussite</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Découvrez comment des couples musulmans ont trouvé l'amour et fondé leurs familles
              grâce à notre plateforme
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Story Card */}
            <div className="lg:col-span-2">
              <Card className="h-full animate-slide-up card-hover bg-gradient-to-br from-white/90 to-cream/40">
                {currentStoryData && (
                  <CardContent className="p-8">
                    {/* Story Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                          <span className="text-xl font-bold text-white">
                            {currentStoryData.avatar}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-foreground">
                            {currentStoryData.names}
                          </h3>
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {currentStoryData.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {currentStoryData.marriageDate}
                            </div>
                          </div>
                        </div>
                      </div>
                      <Badge className="bg-emerald/10 text-emerald border-emerald/20 flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        {currentStoryData.matchScore}% Match
                      </Badge>
                    </div>

                    {/* Story Content */}
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-3">Notre Histoire</h4>
                        <p className="text-muted-foreground leading-relaxed">
                          {currentStoryData.story}
                        </p>
                      </div>

                      {/* Testimonial */}
                      <div className="bg-gradient-to-r from-gold/10 to-emerald/10 rounded-lg p-6">
                        <Quote className="h-6 w-6 text-gold mb-3" />
                        <blockquote className="text-foreground italic leading-relaxed mb-3">
                          "{currentStoryData.testimonial}"
                        </blockquote>
                        <p className="text-sm text-muted-foreground">- {currentStoryData.names}</p>
                      </div>

                      {/* Categories */}
                      <div className="flex flex-wrap gap-2">
                        {currentStoryData.categories.map((category, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="bg-sage/10 text-sage-dark"
                          >
                            {category}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex items-center justify-between mt-8">
                      <Button
                        variant="outline"
                        onClick={prevStory}
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Précédent
                      </Button>

                      <div className="flex gap-2">
                        {stories.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentStory(index)}
                            className={`h-2 w-8 rounded-full transition-all ${
                              index === currentStory ? 'bg-emerald' : 'bg-muted-foreground/30'
                            }`}
                          />
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        onClick={nextStory}
                        className="flex items-center gap-2"
                      >
                        Suivant
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>

            {/* Statistics Sidebar */}
            <div className="space-y-6">
              <Card className="animate-slide-up card-hover" style={{ animationDelay: '0.2s' }}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Heart className="h-5 w-5 text-emerald" />
                    Nos Résultats
                  </h4>
                  <div className="space-y-4">
                    {[
                      { label: 'Mariages Célébrés', value: '1,247', icon: Heart },
                      { label: 'Couples Heureux', value: '892', icon: Star },
                      { label: 'Taux de Réussite', value: '87%', icon: TrendingUp },
                    ].map((stat, index) => (
                      <div key={stat.label} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <stat.icon className="h-4 w-4 text-gold" />
                          <span className="text-sm text-muted-foreground">{stat.label}</span>
                        </div>
                        <span className="font-bold text-foreground">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="animate-slide-up card-hover" style={{ animationDelay: '0.4s' }}>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-foreground mb-4">Rejoignez-les !</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Commencez votre propre histoire d'amour islamique aujourd'hui.
                  </p>
                  <Button className="w-full bg-gradient-to-r from-emerald to-emerald-light text-white hover:shadow-lg hover:scale-105 transition-all">
                    Créer Mon Profil
                  </Button>
                </CardContent>
              </Card>

              {/* Islamic Prayer */}
              <Card
                className="animate-slide-up card-hover bg-gradient-to-br from-gold/10 to-emerald/10 border-gold/20"
                style={{ animationDelay: '0.6s' }}
              >
                <CardContent className="p-6 text-center">
                  <Quote className="h-6 w-6 text-gold mx-auto mb-3" />
                  <p className="text-sm italic text-muted-foreground mb-2">
                    "Rabbana hab lana min azwajina wa dhurriyyatina qurrata a'yun"
                  </p>
                  <p className="text-xs text-gold">
                    "Seigneur, donne-nous, en nos épouses et nos descendants, la joie des yeux"
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStories;
