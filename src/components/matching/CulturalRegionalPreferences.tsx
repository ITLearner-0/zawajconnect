import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Globe, MapPin, Users, Languages, Heart, Star, Flag, Compass } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface CulturalPreferences {
  cultural_background: string[];
  languages_spoken: string[];
  family_origin: string[];
  cultural_practices: string[];
  regional_preferences: string[];
  max_distance: number;
  willing_to_relocate: boolean;
  family_traditions: string[];
  diaspora_connection: string[];
}

interface CulturalMatch {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  cultural_score: number;
  regional_score: number;
  language_score: number;
  shared_background: string[];
  shared_languages: string[];
  distance_km: number;
  cultural_details: {
    background: string[];
    languages: string[];
    region: string;
    traditions: string[];
  };
}

const CulturalRegionalPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CulturalPreferences>({
    cultural_background: [],
    languages_spoken: [],
    family_origin: [],
    cultural_practices: [],
    regional_preferences: [],
    max_distance: 100,
    willing_to_relocate: false,
    family_traditions: [],
    diaspora_connection: []
  });
  
  const [culturalMatches, setCulturalMatches] = useState<CulturalMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const culturalBackgrounds = [
    'Maghreb (Maroc, Algérie, Tunisie)',
    'Afrique de l\'Ouest',
    'Afrique de l\'Est',
    'Moyen-Orient',
    'Asie du Sud (Pakistan, Inde, Bangladesh)',
    'Asie du Sud-Est',
    'Turquie',
    'Europe (Convertis)',
    'Amérique du Nord',
    'Autres'
  ];

  const languages = [
    'Arabe',
    'Français',
    'Anglais',
    'Berbère (Tamazight)',
    'Turc',
    'Ourdou',
    'Hindi',
    'Bengali',
    'Indonésien',
    'Malais',
    'Persan',
    'Autres'
  ];

  const regionalPreferences = [
    'Paris et région parisienne',
    'Lyon et région',
    'Marseille et région',
    'Lille et région',
    'Toulouse et région',
    'Bordeaux et région',
    'Nantes et région',
    'Strasbourg et région',
    'Montpellier et région',
    'Europe (Union Européenne)',
    'Amérique du Nord',
    'Pays du Golfe',
    'Maghreb',
    'Autres pays musulmans'
  ];

  const culturalPractices = [
    'Fêtes religieuses traditionnelles',
    'Cuisine traditionnelle',
    'Musique et arts traditionnels',
    'Vêtements traditionnels',
    'Langues ancestrales',
    'Traditions familiales',
    'Célébrations communautaires',
    'Arts et littérature'
  ];

  const findCulturalMatches = async () => {
    if (!user) return;
    
    setLoading(true);
    setAnalyzing(true);
    
    try {
      // Simulate cultural matching analysis
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Get current user's gender first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';
      
      // Fetch potential matches (opposite gender only)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, age, location, profession, avatar_url, bio')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .limit(30);

      if (profiles) {
        // Simulate cultural compatibility scoring
        const scoredMatches: CulturalMatch[] = profiles.map(profile => {
          // Simulate cultural data for each profile
          const culturalDetails = {
            background: ['Maghreb (Maroc, Algérie, Tunisie)', 'Europe (Convertis)'].slice(0, Math.floor(Math.random() * 2) + 1),
            languages: ['Français', 'Arabe', 'Anglais'].slice(0, Math.floor(Math.random() * 2) + 1),
            region: profile.location || 'Paris',
            traditions: culturalPractices.slice(0, Math.floor(Math.random() * 4) + 2)
          };

          // Calculate compatibility scores
          const cultural_score = calculateCulturalScore(culturalDetails);
          const regional_score = calculateRegionalScore(profile.location || '');
          const language_score = calculateLanguageScore(culturalDetails.languages);

          // Find shared elements
          const shared_background = preferences.cultural_background.filter(bg => 
            culturalDetails.background.includes(bg)
          );
          const shared_languages = preferences.languages_spoken.filter(lang => 
            culturalDetails.languages.includes(lang)
          );

          // Simulate distance (in real app, would use geolocation)
          const distance_km = Math.floor(Math.random() * 200) + 10;

          return {
            user_id: profile.user_id,
            full_name: profile.full_name || '',
            age: profile.age || 25,
            location: profile.location || '',
            profession: profile.profession || '',
            avatar_url: profile.avatar_url,
            cultural_score,
            regional_score,
            language_score,
            shared_background,
            shared_languages,
            distance_km,
            cultural_details: culturalDetails
          };
        });

        // Filter and sort by cultural compatibility
        const filteredMatches = scoredMatches
          .filter(match => 
            match.distance_km <= preferences.max_distance &&
            (match.cultural_score >= 60 || match.shared_languages.length > 0)
          )
          .sort((a, b) => {
            const aTotal = (a.cultural_score + a.regional_score + a.language_score) / 3;
            const bTotal = (b.cultural_score + b.regional_score + b.language_score) / 3;
            return bTotal - aTotal;
          })
          .slice(0, 15);

        setCulturalMatches(filteredMatches);
        
        toast({
          title: "Analyse culturelle terminée",
          description: `${filteredMatches.length} matches trouvés selon vos préférences culturelles`,
        });
      }
    } catch (error) {
      console.error('Error finding cultural matches:', error);
      toast({
        title: "Erreur",
        description: "Impossible de trouver des matches culturels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const calculateCulturalScore = (details: any): number => {
    let score = 50; // Base score
    
    // Shared cultural background
    const sharedBg = preferences.cultural_background.filter(bg => 
      details.background.includes(bg)
    ).length;
    score += sharedBg * 15;
    
    // Shared traditions
    const sharedTraditions = preferences.family_traditions.filter(tradition => 
      details.traditions.includes(tradition)
    ).length;
    score += sharedTraditions * 8;
    
    return Math.min(100, score);
  };

  const calculateRegionalScore = (location: string): number => {
    if (preferences.regional_preferences.includes(location)) return 95;
    if (location.includes('Paris') && preferences.regional_preferences.includes('Paris et région parisienne')) return 90;
    if (preferences.willing_to_relocate) return 75;
    return 60;
  };

  const calculateLanguageScore = (languages: string[]): number => {
    const sharedLang = preferences.languages_spoken.filter(lang => 
      languages.includes(lang)
    ).length;
    
    if (sharedLang >= 2) return 95;
    if (sharedLang === 1) return 80;
    return 50;
  };

  const updateArrayPreference = (key: keyof CulturalPreferences, value: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600';
    if (score >= 75) return 'text-gold-600';
    if (score >= 65) return 'text-sage-600';
    return 'text-muted-foreground';
  };

  return (
    <div className="space-y-6">
      {/* Cultural Preferences Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Préférences Culturelles et Régionales
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cultural Background */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Flag className="h-4 w-4 text-emerald-600" />
              Origines culturelles recherchées
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {culturalBackgrounds.map(background => (
                <div key={background} className="flex items-center space-x-2">
                  <Checkbox
                    id={`bg-${background}`}
                    checked={preferences.cultural_background.includes(background)}
                    onCheckedChange={(checked) => updateArrayPreference('cultural_background', background, checked as boolean)}
                  />
                  <label htmlFor={`bg-${background}`} className="text-sm">
                    {background}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Languages className="h-4 w-4 text-sage-600" />
              Langues parlées
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {languages.map(language => (
                <div key={language} className="flex items-center space-x-2">
                  <Checkbox
                    id={`lang-${language}`}
                    checked={preferences.languages_spoken.includes(language)}
                    onCheckedChange={(checked) => updateArrayPreference('languages_spoken', language, checked as boolean)}
                  />
                  <label htmlFor={`lang-${language}`} className="text-sm">
                    {language}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Preferences */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gold-600" />
              Préférences régionales
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {regionalPreferences.map(region => (
                <div key={region} className="flex items-center space-x-2">
                  <Checkbox
                    id={`region-${region}`}
                    checked={preferences.regional_preferences.includes(region)}
                    onCheckedChange={(checked) => updateArrayPreference('regional_preferences', region, checked as boolean)}
                  />
                  <label htmlFor={`region-${region}`} className="text-sm">
                    {region}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Distance and Relocation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Distance maximale: {preferences.max_distance} km
              </label>
              <Slider
                value={[preferences.max_distance]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, max_distance: value[0] }))}
                max={500}
                min={10}
                step={10}
                className="w-full"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="relocate"
                checked={preferences.willing_to_relocate}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, willing_to_relocate: checked as boolean }))}
              />
              <label htmlFor="relocate" className="text-sm font-medium">
                Prêt(e) à déménager pour la bonne personne
              </label>
            </div>
          </div>

          {/* Cultural Practices */}
          <div>
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Heart className="h-4 w-4 text-primary" />
              Pratiques culturelles importantes
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {culturalPractices.map(practice => (
                <div key={practice} className="flex items-center space-x-2">
                  <Checkbox
                    id={`practice-${practice}`}
                    checked={preferences.family_traditions.includes(practice)}
                    onCheckedChange={(checked) => updateArrayPreference('family_traditions', practice, checked as boolean)}
                  />
                  <label htmlFor={`practice-${practice}`} className="text-sm">
                    {practice}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Search Button */}
          <Button 
            onClick={findCulturalMatches} 
            disabled={loading}
            className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            size="lg"
          >
            {analyzing ? (
              <>
                <Compass className="h-4 w-4 mr-2 animate-spin" />
                Analyse culturelle en cours...
              </>
            ) : (
              <>
                <Globe className="h-4 w-4 mr-2" />
                Trouver des Matches Culturels
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Cultural Matches Results */}
      {culturalMatches.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Matches Culturels ({culturalMatches.length})</span>
              <Badge variant="secondary">
                <Globe className="h-3 w-3 mr-1" />
                Affinités culturelles
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {culturalMatches.map((match) => (
                <div key={match.user_id} className="border rounded-lg p-4 space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={match.avatar_url} />
                      <AvatarFallback>
                        {match.full_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{match.full_name}</h4>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>{match.age} ans</span>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {match.location}
                            </div>
                            <span>{match.distance_km} km</span>
                          </div>
                        </div>
                      </div>

                      {/* Cultural Scores */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(match.cultural_score)}`}>
                            {match.cultural_score}%
                          </div>
                          <p className="text-xs text-muted-foreground">Culturel</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(match.regional_score)}`}>
                            {match.regional_score}%
                          </div>
                          <p className="text-xs text-muted-foreground">Régional</p>
                        </div>
                        <div className="text-center">
                          <div className={`text-lg font-bold ${getScoreColor(match.language_score)}`}>
                            {match.language_score}%
                          </div>
                          <p className="text-xs text-muted-foreground">Linguistique</p>
                        </div>
                      </div>

                      {/* Shared Elements */}
                      <div className="space-y-2">
                        {match.shared_background.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-emerald-700 mb-1">Origines partagées:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.shared_background.map((bg, index) => (
                                <Badge key={index} variant="secondary" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                                  {bg}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {match.shared_languages.length > 0 && (
                          <div>
                            <p className="text-sm font-medium text-sage-700 mb-1">Langues communes:</p>
                            <div className="flex flex-wrap gap-1">
                              {match.shared_languages.map((lang, index) => (
                                <Badge key={index} variant="outline" className="text-xs text-sage-700 border-sage-300">
                                  {lang}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Cultural Details */}
                      <div className="bg-muted/30 p-3 rounded-lg text-sm">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          <div>
                            <span className="font-medium">Origines:</span> {match.cultural_details.background.join(', ')}
                          </div>
                          <div>
                            <span className="font-medium">Langues:</span> {match.cultural_details.languages.join(', ')}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          Voir profil
                        </Button>
                        <Button size="sm" className="flex-1">
                          Montrer l'intérêt
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {culturalMatches.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-12">
            <Globe className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Découvrez vos Affinités Culturelles</h3>
            <p className="text-muted-foreground mb-4">
              Configurez vos préférences culturelles et régionales pour trouver des personnes partageant vos valeurs et traditions
            </p>
            <p className="text-sm text-muted-foreground">
              Notre système prend en compte les origines, langues, traditions et préférences géographiques
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CulturalRegionalPreferences;