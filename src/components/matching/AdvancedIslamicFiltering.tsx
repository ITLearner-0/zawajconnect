// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Filter, Shield, MapPin, Users, BookOpen, Heart, Star, Moon, Compass } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface IslamicFilters {
  prayer_frequency: string[];
  quran_reading: string[];
  sect: string[];
  madhab: string[];
  hijab_preference: string[];
  beard_preference: string[];
  halal_diet: boolean | null;
  smoking: string[];
  importance_of_religion: string[];
  age_range: [number, number];
  location_distance: number;
  education_level: string[];
  profession_type: string[];
  family_status: string[];
  polygamy_acceptance: boolean | null;
}

interface IslamicPreferences {
  prayer_frequency?: string;
  quran_reading?: string;
  sect?: string;
  madhab?: string;
  hijab_preference?: string;
  beard_preference?: string;
  halal_diet?: boolean;
  smoking?: string;
  importance_of_religion?: string;
}

interface ProfileWithPreferences {
  user_id: string;
  full_name: string;
  age?: number;
  location?: string;
  profession?: string;
  avatar_url?: string;
  bio?: string;
  islamic_preferences?: IslamicPreferences[];
}

interface FilteredProfile {
  user_id: string;
  full_name: string;
  age: number;
  location: string;
  profession: string;
  avatar_url?: string;
  islamic_score: number;
  matching_criteria: string[];
  prayer_frequency?: string;
  quran_reading?: string;
  sect?: string;
  importance_of_religion?: string;
}

const AdvancedIslamicFiltering = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [filters, setFilters] = useState<IslamicFilters>({
    prayer_frequency: [],
    quran_reading: [],
    sect: [],
    madhab: [],
    hijab_preference: [],
    beard_preference: [],
    halal_diet: null,
    smoking: [],
    importance_of_religion: [],
    age_range: [22, 35],
    location_distance: 50,
    education_level: [],
    profession_type: [],
    family_status: [],
    polygamy_acceptance: null
  });
  
  const [filteredProfiles, setFilteredProfiles] = useState<FilteredProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    const count = Object.entries(filters).reduce((acc, [key, value]) => {
      if (key === 'age_range') return acc + (value[0] !== 22 || value[1] !== 35 ? 1 : 0);
      if (key === 'location_distance') return acc + (value !== 50 ? 1 : 0);
      if (Array.isArray(value)) return acc + (value.length > 0 ? 1 : 0);
      if (typeof value === 'boolean') return acc + 1;
      return acc;
    }, 0);
    setActiveFiltersCount(count);
  }, [filters]);

  const applyIslamicFilters = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Get current user's gender first
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';
      
      // Get all Wali user IDs to exclude them from matching
      const { data: waliUsers } = await supabase
        .from('family_members')
        .select('invited_user_id')
        .eq('is_wali', true)
        .eq('invitation_status', 'accepted')
        .not('invited_user_id', 'is', null);

      const waliUserIds = waliUsers?.map(w => w.invited_user_id).filter(Boolean) || [];
      
      // Fetch all profiles (opposite gender only, excluding Walis)
      let profileQuery = supabase
        .from('profiles')
        .select('user_id, full_name, age, location, profession, avatar_url')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender);

      // Exclude Walis if any exist
      if (waliUserIds.length > 0) {
        profileQuery = profileQuery.not('user_id', 'in', `(${waliUserIds.join(',')})`);
      }

      const { data: profilesData } = await profileQuery;

      // Fetch Islamic preferences separately
      const { data: islamicPrefsData } = await supabase
        .from('islamic_preferences')
        .select('*');

      if (!profilesData || !islamicPrefsData) {
        setFilteredProfiles([]);
        return;
      }

      // Join the data manually
      const profiles: ProfileWithPreferences[] = profilesData.map(profile => {
        const userPrefs = islamicPrefsData.filter(pref => pref.user_id === profile.user_id);
        return {
          ...profile,
          islamic_preferences: userPrefs.length > 0 ? userPrefs : undefined
        };
      }).filter(profile => profile.islamic_preferences && profile.islamic_preferences.length > 0);

      if (!profiles) {
        setFilteredProfiles([]);
        return;
      }

        // Apply Islamic filters
        const filtered = profiles.filter(profile => {
          const islamicPrefs = profile.islamic_preferences?.[0] as IslamicPreferences;
          if (!islamicPrefs) return false;

          // Age filter
          if (profile.age && (profile.age < filters.age_range[0] || profile.age > filters.age_range[1])) {
            return false;
          }

          // Prayer frequency filter
          if (filters.prayer_frequency.length > 0 && 
              !filters.prayer_frequency.includes(islamicPrefs.prayer_frequency || '')) {
            return false;
          }

          // Quran reading filter
          if (filters.quran_reading.length > 0 && 
              !filters.quran_reading.includes(islamicPrefs.quran_reading || '')) {
            return false;
          }

          // Sect filter
          if (filters.sect.length > 0 && 
              !filters.sect.includes(islamicPrefs.sect || '')) {
            return false;
          }

          // Madhab filter
          if (filters.madhab.length > 0 && 
              !filters.madhab.includes(islamicPrefs.madhab || '')) {
            return false;
          }

          // Hijab preference filter
          if (filters.hijab_preference.length > 0 && 
              !filters.hijab_preference.includes(islamicPrefs.hijab_preference || '')) {
            return false;
          }

          // Beard preference filter
          if (filters.beard_preference.length > 0 && 
              !filters.beard_preference.includes(islamicPrefs.beard_preference || '')) {
            return false;
          }

          // Halal diet filter
          if (filters.halal_diet !== null && 
              islamicPrefs.halal_diet !== filters.halal_diet) {
            return false;
          }

          // Smoking filter
          if (filters.smoking.length > 0 && 
              !filters.smoking.includes(islamicPrefs.smoking || '')) {
            return false;
          }

          // Importance of religion filter
          if (filters.importance_of_religion.length > 0 && 
              !filters.importance_of_religion.includes(islamicPrefs.importance_of_religion || '')) {
            return false;
          }

          return true;
        });

        // Calculate Islamic compatibility score for each profile
        const scoredProfiles: FilteredProfile[] = filtered.map(profile => {
          const islamicPrefs = profile.islamic_preferences?.[0] as IslamicPreferences;
          const islamic_score = calculateIslamicScore(islamicPrefs);
          const matching_criteria = getMatchingCriteria(islamicPrefs);

          return {
            user_id: profile.user_id,
            full_name: profile.full_name || '',
            age: profile.age || 0,
            location: profile.location || '',
            profession: profile.profession || '',
            avatar_url: profile.avatar_url,
            islamic_score,
            matching_criteria,
            prayer_frequency: islamicPrefs?.prayer_frequency || '',
            quran_reading: islamicPrefs?.quran_reading || '',
            sect: islamicPrefs?.sect || '',
            importance_of_religion: islamicPrefs?.importance_of_religion || ''
          };
        });

      // Sort by Islamic compatibility score
      scoredProfiles.sort((a, b) => b.islamic_score - a.islamic_score);
      
      setFilteredProfiles(scoredProfiles);

      toast({
        title: "Filtres appliqués",
        description: `${scoredProfiles.length} profils correspondent à vos critères islamiques`,
      });

    } catch (error) {
      console.error('Error applying Islamic filters:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'appliquer les filtres islamiques",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateIslamicScore = (islamicPrefs: IslamicPreferences | undefined): number => {
    if (!islamicPrefs) return 0;
    
    let score = 60; // Base score
    
    // Prayer frequency scoring
    const prayerScores = { 'daily': 20, 'often': 15, 'sometimes': 10, 'rarely': 5, 'never': 0 };
    score += prayerScores[islamicPrefs.prayer_frequency as keyof typeof prayerScores] || 0;
    
    // Quran reading scoring
    const quranScores = { 'daily': 15, 'weekly': 12, 'monthly': 8, 'rarely': 4, 'never': 0 };
    score += quranScores[islamicPrefs.quran_reading as keyof typeof quranScores] || 0;
    
    // Halal lifestyle
    if (islamicPrefs.halal_diet) score += 10;
    if (islamicPrefs.smoking === 'never') score += 5;
    
    return Math.min(100, score);
  };

  const getMatchingCriteria = (islamicPrefs: IslamicPreferences | undefined): string[] => {
    const criteria = [];
    
    if (islamicPrefs?.prayer_frequency === 'daily') criteria.push('Prière quotidienne');
    if (islamicPrefs?.quran_reading === 'daily') criteria.push('Lecture quotidienne du Coran');
    if (islamicPrefs?.halal_diet) criteria.push('Alimentation halal');
    if (islamicPrefs?.smoking === 'never') criteria.push('Non-fumeur');
    if (islamicPrefs?.importance_of_religion === 'very_important') criteria.push('Religion très importante');
    
    return criteria;
  };

  const clearAllFilters = () => {
    setFilters({
      prayer_frequency: [],
      quran_reading: [],
      sect: [],
      madhab: [],
      hijab_preference: [],
      beard_preference: [],
      halal_diet: null,
      smoking: [],
      importance_of_religion: [],
      age_range: [22, 35],
      location_distance: 50,
      education_level: [],
      profession_type: [],
      family_status: [],
      polygamy_acceptance: null
    });
    setFilteredProfiles([]);
  };

  const updateArrayFilter = (key: keyof IslamicFilters, value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked 
        ? [...(prev[key] as string[]), value]
        : (prev[key] as string[]).filter(item => item !== value)
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 75) return 'text-gold-600 bg-gold-50 border-gold-200';
    if (score >= 65) return 'text-sage-600 bg-sage-50 border-sage-200';
    return 'text-muted-foreground bg-muted border-border';
  };

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            Filtres Islamiques Avancés
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFiltersCount} actif{activeFiltersCount > 1 ? 's' : ''}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Religious Practice Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Pratique Religieuse
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Prayer Frequency */}
              <div>
                <label className="text-sm font-medium mb-2 block">Fréquence de prière</label>
                <div className="space-y-2">
                  {['daily', 'often', 'sometimes', 'rarely', 'never'].map(freq => (
                    <div key={freq} className="flex items-center space-x-2">
                      <Checkbox
                        id={`prayer-${freq}`}
                        checked={filters.prayer_frequency.includes(freq)}
                        onCheckedChange={(checked) => updateArrayFilter('prayer_frequency', freq, checked as boolean)}
                      />
                      <label htmlFor={`prayer-${freq}`} className="text-sm">
                        {freq === 'daily' ? 'Quotidienne' :
                         freq === 'often' ? 'Souvent' :
                         freq === 'sometimes' ? 'Parfois' :
                         freq === 'rarely' ? 'Rarement' : 'Jamais'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quran Reading */}
              <div>
                <label className="text-sm font-medium mb-2 block">Lecture du Coran</label>
                <div className="space-y-2">
                  {['daily', 'weekly', 'monthly', 'rarely', 'never'].map(freq => (
                    <div key={freq} className="flex items-center space-x-2">
                      <Checkbox
                        id={`quran-${freq}`}
                        checked={filters.quran_reading.includes(freq)}
                        onCheckedChange={(checked) => updateArrayFilter('quran_reading', freq, checked as boolean)}
                      />
                      <label htmlFor={`quran-${freq}`} className="text-sm">
                        {freq === 'daily' ? 'Quotidienne' :
                         freq === 'weekly' ? 'Hebdomadaire' :
                         freq === 'monthly' ? 'Mensuelle' :
                         freq === 'rarely' ? 'Rarement' : 'Jamais'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Islamic School & Sect */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-sage-600" />
              École Islamique & Sect
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sect */}
              <div>
                <label className="text-sm font-medium mb-2 block">Courant islamique</label>
                <div className="space-y-2">
                  {['sunni', 'shia', 'other'].map(sect => (
                    <div key={sect} className="flex items-center space-x-2">
                      <Checkbox
                        id={`sect-${sect}`}
                        checked={filters.sect.includes(sect)}
                        onCheckedChange={(checked) => updateArrayFilter('sect', sect, checked as boolean)}
                      />
                      <label htmlFor={`sect-${sect}`} className="text-sm">
                        {sect === 'sunni' ? 'Sunnite' :
                         sect === 'shia' ? 'Chiite' : 'Autre'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Madhab */}
              <div>
                <label className="text-sm font-medium mb-2 block">École juridique (Madhab)</label>
                <div className="space-y-2">
                  {['hanafi', 'maliki', 'shafi', 'hanbali', 'salafi', 'other'].map(madhab => (
                    <div key={madhab} className="flex items-center space-x-2">
                      <Checkbox
                        id={`madhab-${madhab}`}
                        checked={filters.madhab.includes(madhab)}
                        onCheckedChange={(checked) => updateArrayFilter('madhab', madhab, checked as boolean)}
                      />
                      <label htmlFor={`madhab-${madhab}`} className="text-sm">
                        {madhab.charAt(0).toUpperCase() + madhab.slice(1)}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Lifestyle Filters */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Heart className="h-4 w-4 text-gold-600" />
              Mode de Vie
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Halal Diet */}
              <div>
                <label className="text-sm font-medium mb-2 block">Alimentation halal</label>
                <Select
                  value={filters.halal_diet === null ? '' : filters.halal_diet.toString()}
                  onValueChange={(value) => setFilters(prev => ({ 
                    ...prev, 
                    halal_diet: value === '' ? null : value === 'true' 
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Peu importe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Peu importe</SelectItem>
                    <SelectItem value="true">Obligatoire</SelectItem>
                    <SelectItem value="false">Pas nécessaire</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Smoking */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tabac</label>
                <div className="space-y-2">
                  {['never', 'rarely', 'socially', 'regularly'].map(smoking => (
                    <div key={smoking} className="flex items-center space-x-2">
                      <Checkbox
                        id={`smoking-${smoking}`}
                        checked={filters.smoking.includes(smoking)}
                        onCheckedChange={(checked) => updateArrayFilter('smoking', smoking, checked as boolean)}
                      />
                      <label htmlFor={`smoking-${smoking}`} className="text-sm">
                        {smoking === 'never' ? 'Jamais' :
                         smoking === 'rarely' ? 'Rarement' :
                         smoking === 'socially' ? 'Socialement' : 'Régulièrement'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Importance of Religion */}
              <div>
                <label className="text-sm font-medium mb-2 block">Importance de la religion</label>
                <div className="space-y-2">
                  {['very_important', 'important', 'moderate', 'not_important'].map(importance => (
                    <div key={importance} className="flex items-center space-x-2">
                      <Checkbox
                        id={`importance-${importance}`}
                        checked={filters.importance_of_religion.includes(importance)}
                        onCheckedChange={(checked) => updateArrayFilter('importance_of_religion', importance, checked as boolean)}
                      />
                      <label htmlFor={`importance-${importance}`} className="text-sm">
                        {importance === 'very_important' ? 'Très importante' :
                         importance === 'important' ? 'Importante' :
                         importance === 'moderate' ? 'Modérée' : 'Peu importante'}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Age and Location */}
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-emerald-600" />
              Âge et Localisation
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tranche d'âge: {filters.age_range[0]} - {filters.age_range[1]} ans
                </label>
                <Slider
                  value={filters.age_range}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, age_range: value as [number, number] }))}
                  max={60}
                  min={18}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Distance maximale: {filters.location_distance} km
                </label>
                <Slider
                  value={[filters.location_distance]}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, location_distance: value[0] }))}
                  max={200}
                  min={5}
                  step={5}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={applyIslamicFilters} 
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {loading ? (
                <>
                  <Filter className="h-4 w-4 mr-2 animate-spin" />
                  Application des filtres...
                </>
              ) : (
                <>
                  <Compass className="h-4 w-4 mr-2" />
                  Appliquer les filtres islamiques
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={clearAllFilters}
              disabled={loading}
            >
              Réinitialiser
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filtered Results */}
      {filteredProfiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Profils Correspondants ({filteredProfiles.length})</span>
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Filtres islamiques actifs
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProfiles.map((profile) => (
                <div key={profile.user_id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={profile.avatar_url} />
                    <AvatarFallback>
                      {profile.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{profile.full_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{profile.age} ans</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {profile.location}
                          </div>
                          <span>{profile.profession}</span>
                        </div>
                      </div>
                      
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getScoreColor(profile.islamic_score)}`}>
                        <Shield className="h-3 w-3" />
                        {profile.islamic_score}% islamique
                      </div>
                    </div>
                    
                    {profile.matching_criteria.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {profile.matching_criteria.map((criteria, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {criteria}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      Voir profil
                    </Button>
                    <Button size="sm">
                      Montrer l'intérêt
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {filteredProfiles.length === 0 && !loading && activeFiltersCount > 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Aucun profil trouvé</h3>
            <p className="text-muted-foreground mb-4">
              Aucun profil ne correspond à vos critères islamiques actuels
            </p>
            <Button variant="outline" onClick={clearAllFilters}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedIslamicFiltering;