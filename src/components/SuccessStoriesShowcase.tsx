import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { 
  Heart, 
  Calendar, 
  MapPin, 
  Star, 
  Quote,
  Users,
  Gift,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format, differenceInMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface SuccessStory {
  id: string;
  couple_names: string;
  match_date: string;
  wedding_date?: string;
  story_text: string;
  couple_photo?: string;
  location: string;
  match_score: number;
  relationship_duration_months: number;
  tags: string[];
  featured: boolean;
  verification_status: 'verified' | 'pending' | 'unverified';
  testimonial_quote: string;
  created_at: string;
}

const SuccessStoriesShowcase = () => {
  const { toast } = useToast();
  const [stories, setStories] = useState<SuccessStory[]>([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total_marriages: 0,
    success_rate: 0,
    average_time_to_match: 0,
    countries_represented: 0
  });

  // Sample success stories (in a real app, these would come from your database)
  const sampleStories: SuccessStory[] = [
    {
      id: '1',
      couple_names: 'Ahmed & Fatima',
      match_date: '2023-09-15',
      wedding_date: '2024-02-14',
      story_text: 'Nous nous sommes rencontrés grâce à cette merveilleuse plateforme qui respecte nos valeurs islamiques. Le processus de supervision familiale nous a mis en confiance dès le début. Après 6 mois de discussions respectueuses et de rencontres chaperonnées, nous avons décidé de nous marier. Aujourd\'hui, nous sommes heureux parents et remercions Allah pour cette belle rencontre.',
      couple_photo: '',
      location: 'Paris, France',
      match_score: 92,
      relationship_duration_months: 5,
      tags: ['Supervision familiale', 'Mariage traditionnel', 'Paris'],
      featured: true,
      verification_status: 'verified',
      testimonial_quote: 'Cette plateforme a changé notre vie. La supervision familiale et le respect des valeurs islamiques nous ont donné confiance.',
      created_at: '2024-03-01'
    },
    {
      id: '2',
      couple_names: 'Omar & Aisha',
      match_date: '2023-06-20',
      wedding_date: '2023-12-10',
      story_text: 'En tant que professionnels occupés, nous cherchions une solution moderne mais respectueuse de nos traditions. L\'algorithme de compatibilité a parfaitement fonctionné - nous partagions les mêmes valeurs, objectifs de vie et pratiques religieuses. Nos familles se sont rencontrées après seulement 3 mois et ont donné leur bénédiction. Nous organisons maintenant notre Hajj ensemble.',
      couple_photo: '',
      location: 'London, UK',
      match_score: 89,
      relationship_duration_months: 6,
      tags: ['Professionnels', 'International', 'Hajj'],
      featured: true,
      verification_status: 'verified',
      testimonial_quote: 'L\'algorithme de compatibilité est impressionnant. Nous étions faits l\'un pour l\'autre !',
      created_at: '2024-01-15'
    },
    {
      id: '3',
      couple_names: 'Youssef & Khadija',
      match_date: '2023-03-10',
      wedding_date: '2023-08-25',
      story_text: 'Après des années de recherche infructueuse, nous avions perdu espoir. Cette plateforme nous a redonné foi en notre quête. Le système de vérification nous a rassurés sur l\'authenticité des profils. Notre rencontre s\'est faite en présence de nos familles respectives, selon la Sunnah. Aujourd\'hui, nous attendons notre premier enfant, Alhamdulillah.',
      couple_photo: '',
      location: 'Casablanca, Maroc',
      match_score: 95,
      relationship_duration_months: 5,
      tags: ['Deuxième chance', 'Famille nombreuse', 'Maroc'],
      featured: true,
      verification_status: 'verified',
      testimonial_quote: 'Nous avions perdu espoir, mais cette plateforme nous a redonné foi en notre recherche.',
      created_at: '2023-12-20'
    },
    {
      id: '4',
      couple_names: 'Ibrahim & Maryam',
      match_date: '2023-07-05',
      wedding_date: '2024-01-20',
      story_text: 'Vivant dans des pays différents, nous pensions que la distance serait un obstacle. Mais notre compatibilité était si forte que nos familles ont organisé des rencontres virtuelles puis physiques. Le processus d\'immigration s\'est bien passé et nous vivons maintenant ensemble en Allemagne. La plateforme nous a permis de dépasser les frontières géographiques.',
      couple_photo: '',
      location: 'Berlin, Allemagne',
      match_score: 87,
      relationship_duration_months: 6,
      tags: ['International', 'Immigration', 'Europe'],
      featured: false,
      verification_status: 'verified',
      testimonial_quote: 'La distance n\'était plus un problème grâce aux outils de communication respectueux de la plateforme.',
      created_at: '2024-02-10'
    }
  ];

  useEffect(() => {
    loadSuccessStories();
    loadStats();
  }, []);

  const loadSuccessStories = async () => {
    setLoading(true);
    try {
      // In a real app, you would fetch from your success_stories table
      // For demo purposes, we'll use the sample data
      setStories(sampleStories);
    } catch (error) {
      console.error('Error loading success stories:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les histoires de réussite",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // In a real app, you would calculate these from your database
      setStats({
        total_marriages: 1247,
        success_rate: 89,
        average_time_to_match: 4.2,
        countries_represented: 45
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const nextStory = () => {
    setCurrentStoryIndex((prev) => (prev + 1) % stories.length);
  };

  const prevStory = () => {
    setCurrentStoryIndex((prev) => (prev - 1 + stories.length) % stories.length);
  };

  const currentStory = stories[currentStoryIndex];

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-muted rounded"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/10 to-gold/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-dark">
            Histoires de Réussite
          </CardTitle>
          <p className="text-muted-foreground text-lg">
            Découvrez comment notre plateforme a aidé des couples musulmans à trouver l'amour selon les valeurs islamiques
          </p>
        </CardHeader>
      </Card>

      {/* Success Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Heart className="h-8 w-8 text-emerald mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald">{stats.total_marriages.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Mariages Célébrés</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Star className="h-8 w-8 text-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-gold">{stats.success_rate}%</div>
            <div className="text-sm text-muted-foreground">Taux de Réussite</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Calendar className="h-8 w-8 text-sage mx-auto mb-2" />
            <div className="text-2xl font-bold text-sage">{stats.average_time_to_match}</div>
            <div className="text-sm text-muted-foreground">Mois Moyens</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
             <MapPin className="h-8 w-8 text-accent mx-auto mb-2" />
             <div className="text-2xl font-bold text-accent">{stats.countries_represented}</div>
            <div className="text-sm text-muted-foreground">Pays Représentés</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Story */}
      {currentStory && (
        <Card className="overflow-hidden shadow-xl">
          <div className="relative">
            {/* Story Navigation */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={prevStory}
                className="rounded-full p-2 bg-white/80 hover:bg-white/90"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={nextStory}
                className="rounded-full p-2 bg-white/80 hover:bg-white/90"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Story Image Placeholder */}
            <div className="h-64 bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center">
              <div className="text-center">
                <Heart className="h-16 w-16 text-emerald/60 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-emerald-dark">{currentStory.couple_names}</h3>
                <p className="text-muted-foreground">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  {currentStory.location}
                </p>
              </div>
            </div>
          </div>

          <CardContent className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Story Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-3xl font-bold text-foreground">
                    {currentStory.couple_names}
                  </h2>
                  <div className="flex items-center gap-2">
                    {currentStory.verification_status === 'verified' && (
                      <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                        ✓ Vérifié
                      </Badge>
                    )}
                    {currentStory.featured && (
                      <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                        ⭐ En Vedette
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Rencontre: {format(new Date(currentStory.match_date), 'MMMM yyyy', { locale: fr })}</span>
                  </div>
                  {currentStory.wedding_date && (
                    <div className="flex items-center gap-1">
                      <Gift className="h-4 w-4" />
                      <span>Mariage: {format(new Date(currentStory.wedding_date), 'MMMM yyyy', { locale: fr })}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Quote className="h-6 w-6 text-gold flex-shrink-0 mt-1" />
                    <blockquote className="text-lg italic text-foreground">
                      "{currentStory.testimonial_quote}"
                    </blockquote>
                  </div>
                  
                  <p className="text-muted-foreground leading-relaxed">
                    {currentStory.story_text}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {currentStory.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Story Stats */}
              <div className="space-y-4">
                <Card className="border-emerald/20 bg-emerald/5">
                  <CardContent className="p-4 space-y-4">
                    <h3 className="font-semibold text-emerald-dark">Statistiques du Couple</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Score de compatibilité</span>
                        <span className="font-bold text-emerald">{currentStory.match_score}%</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Durée avant mariage</span>
                        <span className="font-bold">{currentStory.relationship_duration_months} mois</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Localisation</span>
                        <span className="font-medium text-sm">{currentStory.location}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-gold/20 bg-gold/5">
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="h-8 w-8 text-gold mx-auto mb-2" />
                    <h4 className="font-semibold text-gold-dark mb-2">Partagez Votre Histoire</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Vous aussi vous avez trouvé l'amour grâce à notre plateforme ?
                    </p>
                    <Button className="w-full bg-gold hover:bg-gold-dark text-primary-foreground">
                      Raconter Notre Histoire
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Story Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {stories.filter((_, index) => index !== currentStoryIndex).slice(0, 4).map((story, index) => (
          <Card 
            key={story.id} 
            className="cursor-pointer hover:shadow-lg transition-all duration-300"
            onClick={() => setCurrentStoryIndex(stories.findIndex(s => s.id === story.id))}
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{story.couple_names}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{story.location}</span>
                    {story.verification_status === 'verified' && (
                      <Badge className="bg-emerald/10 text-emerald border-emerald/20 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {story.match_score}% compatible
                </Badge>
              </div>
              
              <blockquote className="text-sm italic text-muted-foreground line-clamp-3 mb-4">
                "{story.testimonial_quote}"
              </blockquote>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {differenceInMonths(new Date(story.wedding_date || story.match_date), new Date(story.match_date))} mois
                </span>
                <span>
                  {format(new Date(story.match_date), 'MMM yyyy', { locale: fr })}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Call to Action */}
      <Card className="border-emerald/20 bg-gradient-to-r from-emerald/10 to-gold/10">
        <CardContent className="p-8 text-center">
          <Heart className="h-12 w-12 text-emerald mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-emerald-dark mb-4">
            Votre Histoire Commence Maintenant
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Rejoignez les milliers de couples qui ont trouvé l'amour grâce à notre plateforme 
            respectueuse des valeurs islamiques. Votre âme sœur vous attend peut-être.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
              Commencer Mon Profil
            </Button>
            <Button variant="outline" className="border-emerald text-emerald hover:bg-emerald hover:text-white">
              Découvrir la Plateforme
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuccessStoriesShowcase;