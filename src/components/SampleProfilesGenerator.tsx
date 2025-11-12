import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Users, Sparkles } from 'lucide-react';

const sampleProfiles = [
  {
    full_name: "Aisha Rahman",
    age: 26,
    gender: "female",
    location: "Paris, France",
    education: "Master en Sciences Politiques",
    profession: "Consultante",
    bio: "Passionnée par les voyages et la lecture du Coran. Je cherche quelqu'un qui partage mes valeurs islamiques et ma curiosité pour le monde.",
    looking_for: "Un homme pratiquant, bienveillant et ambitieux pour construire ensemble une famille pieuse.",
    interests: ["Lecture", "Voyages", "Cuisine", "Photographie", "Bénévolat"],
    islamic_prefs: {
      prayer_frequency: "5_times_daily",
      quran_reading: "daily",
      hijab_preference: "always",
      sect: "sunni",
      madhab: "maliki",
      halal_diet: true,
      smoking: "never",
      importance_of_religion: "very_important"
    }
  },
  {
    full_name: "Omar Benali",
    age: 29,
    gender: "male",
    location: "Lyon, France",
    education: "Ingénieur Informatique",
    profession: "Développeur Senior",
    bio: "Développeur passionné et pratiquant assidu. J'aime équilibrer technologie et spiritualité dans ma vie quotidienne.",
    looking_for: "Une épouse pieuse et éduquée pour fonder une famille selon les préceptes islamiques.",
    interests: ["Technologie", "Sports", "Lecture", "Randonnée", "Cuisine"],
    islamic_prefs: {
      prayer_frequency: "5_times_daily",
      quran_reading: "daily",
      beard_preference: "full_beard",
      sect: "sunni",
      madhab: "hanafi",
      halal_diet: true,
      smoking: "never",
      importance_of_religion: "extremely_important"
    }
  },
  {
    full_name: "Khadija Alami",
    age: 24,
    gender: "female",
    location: "Marseille, France",
    education: "Docteure en Médecine",
    profession: "Médecin Interne",
    bio: "Jeune médecin dévouée à aider les autres. La médecine et ma foi sont mes deux piliers dans la vie.",
    looking_for: "Un homme éduqué et comprenant l'importance de mon travail et de ma foi.",
    interests: ["Médecine", "Littérature", "Musique", "Jardinage", "Charity"],
    islamic_prefs: {
      prayer_frequency: "5_times_daily",
      quran_reading: "weekly",
      hijab_preference: "sometimes",
      sect: "sunni",
      madhab: "shafi",
      halal_diet: true,
      smoking: "never",
      importance_of_religion: "very_important"
    }
  },
  {
    full_name: "Youssef Nasri",
    age: 31,
    gender: "male",
    location: "Toulouse, France",
    education: "MBA Finance",
    profession: "Analyste Financier",
    bio: "Analyste financier avec une passion pour l'entrepreneuriat. Je crois en l'équilibre entre réussite professionnelle et spiritualité.",
    looking_for: "Une femme ambitieuse et pieuse pour partager les joies et défis de la vie.",
    interests: ["Finance", "Entrepreneuriat", "Sports", "Voyage", "Histoire islamique"],
    islamic_prefs: {
      prayer_frequency: "5_times_daily",
      quran_reading: "daily",
      beard_preference: "trimmed_beard",
      sect: "sunni",
      madhab: "hanbali",
      halal_diet: true,
      smoking: "never",
      importance_of_religion: "very_important"
    }
  },
  {
    full_name: "Fatima Khalil",
    age: 27,
    gender: "female",
    location: "Nice, France",
    education: "Master Marketing",
    profession: "Chef de Projet Marketing",
    bio: "Créative et organisée, j'adore développer des campagnes innovantes. Ma foi guide mes décisions personnelles et professionnelles.",
    looking_for: "Un homme respectueux et pratiquant pour construire une belle histoire ensemble.",
    interests: ["Marketing", "Art", "Mode", "Wellness", "Éducation islamique"],
    islamic_prefs: {
      prayer_frequency: "5_times_daily",
      quran_reading: "daily",
      hijab_preference: "always",
      sect: "sunni",
      madhab: "maliki",
      halal_diet: true,
      smoking: "never",
      importance_of_religion: "extremely_important"
    }
  }
];

const SampleProfilesGenerator = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const generateSampleProfiles = async () => {
    setLoading(true);
    
    try {
      for (const profile of sampleProfiles) {
        // Create a user ID (in real app this would be done through auth)
        const userId = crypto.randomUUID();
        
        // Insert profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            full_name: profile.full_name,
            age: profile.age,
            gender: profile.gender,
            location: profile.location,
            education: profile.education,
            profession: profile.profession,
            bio: profile.bio,
            looking_for: profile.looking_for,
            interests: profile.interests,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.full_name)}&background=10b981&color=fff&size=200`
          });

        if (profileError) {
          console.error('Profile error:', profileError);
          continue;
        }

        // Insert Islamic preferences
        const { error: prefsError } = await supabase
          .from('islamic_preferences')
          .insert({
            user_id: userId,
            ...profile.islamic_prefs
          });

        if (prefsError) {
          console.error('Prefs error:', prefsError);
        }

        // Insert verification data
        await supabase
          .from('user_verifications')
          .insert({
            user_id: userId,
            email_verified: true,
            verification_score: Math.floor(Math.random() * 40) + 60 // 60-100
          });

        // Insert user settings
        await supabase
          .from('user_settings')
          .insert({
            user_id: userId,
            age_min: Math.max(18, profile.age - 5),
            age_max: Math.min(50, profile.age + 8),
            search_distance: 100
          });

        // Small delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      toast({
        title: "Profils créés !",
        description: "Les profils d'exemple ont été ajoutés avec succès.",
      });

    } catch (error) {
      console.error('Error creating sample profiles:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer les profils d'exemple.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-dashed border-2 border-emerald/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald">
          <Sparkles className="h-5 w-5" />
          Mode Démonstration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Ajoutez des profils d'exemple pour tester les fonctionnalités de matching et de navigation.
        </p>
        <Button 
          onClick={generateSampleProfiles}
          disabled={loading}
          className="bg-emerald hover:bg-emerald-dark text-white"
        >
          <Users className="h-4 w-4 mr-2" />
          {loading ? "Création en cours..." : "Créer des profils d'exemple"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SampleProfilesGenerator;