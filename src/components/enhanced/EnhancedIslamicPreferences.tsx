import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Moon, 
  Book, 
  Heart, 
  Users, 
  Utensils, 
  Shirt, 
  MapPin, 
  Clock,
  Star,
  Shield,
  Home
} from 'lucide-react';

interface IslamicPreferences {
  sect: string;
  madhab: string;
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  halal_diet: boolean;
  importance_of_religion: string;
  desired_partner_sect: string;
  smoking: string;
}

interface EnhancedIslamicPreferencesProps {
  onComplete?: (preferences: IslamicPreferences) => void;
  embedded?: boolean;
}

const EnhancedIslamicPreferences = ({ onComplete, embedded = false }: EnhancedIslamicPreferencesProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<IslamicPreferences>({
    sect: '',
    madhab: '',
    prayer_frequency: '',
    quran_reading: '',
    hijab_preference: '',
    beard_preference: '',
    halal_diet: true,
    importance_of_religion: '',
    desired_partner_sect: '',
    smoking: ''
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentSection, setCurrentSection] = useState('basic');

  useEffect(() => {
    if (user) {
      loadPreferences();
    }
  }, [user]);

  const loadPreferences = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('islamic_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error loading Islamic preferences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos préférences islamiques",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('islamic_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences islamiques ont été mises à jour",
      });

      if (onComplete) {
        onComplete(preferences);
      }
    } catch (error) {
      console.error('Error saving Islamic preferences:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder vos préférences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = <K extends keyof IslamicPreferences>(
    key: K, 
    value: IslamicPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const getCompletionPercentage = () => {
    const totalFields = Object.keys(preferences).length;
    const filledFields = Object.values(preferences).filter(value => 
      value !== '' && value !== null && value !== undefined
    ).length;
    return (filledFields / totalFields) * 100;
  };

  const sections = [
    { 
      id: 'basic', 
      title: 'Fondamentaux', 
      icon: Moon,
      fields: ['sect', 'madhab', 'prayer_frequency', 'quran_reading', 'importance_of_religion']
    },
    { 
      id: 'lifestyle', 
      title: 'Style de Vie', 
      icon: Utensils,
      fields: ['halal_diet', 'smoking', 'hijab_preference', 'beard_preference']
    },
    { 
      id: 'family', 
      title: 'Famille & Mariage', 
      icon: Home,
      fields: ['desired_partner_sect']
    }
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des préférences...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentSectionData = sections.find(s => s.id === currentSection);
  const SectionIcon = currentSectionData?.icon || Moon;

  return (
    <div className={embedded ? 'space-y-6' : 'min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4'}>
      <div className={`container mx-auto ${embedded ? 'max-w-full' : 'max-w-4xl'}`}>
        <Card className={embedded ? '' : 'shadow-lg'}>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
                <SectionIcon className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl mb-2">Préférences Islamiques Détaillées</CardTitle>
            <p className="text-muted-foreground mb-4">
              Configurez vos préférences islamiques pour des matches plus compatibles
            </p>
            
            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progression</span>
                <span>{Math.round(getCompletionPercentage())}% complété</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-emerald to-gold h-2 rounded-full transition-all duration-300"
                  style={{ width: `${getCompletionPercentage()}%` }}
                />
              </div>
            </div>
          </CardHeader>

          <CardContent>
            {/* Section Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {sections.map(section => {
                const Icon = section.icon;
                const sectionFields = section.fields;
                const completedFields = sectionFields.filter(field => {
                  const value = preferences[field as keyof IslamicPreferences];
                  return value !== '' && value !== null && value !== undefined;
                }).length;
                
                return (
                  <Button
                    key={section.id}
                    variant={currentSection === section.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentSection(section.id)}
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{section.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {completedFields}/{sectionFields.length}
                    </Badge>
                  </Button>
                );
              })}
            </div>

            {/* Section Content */}
            <div className="space-y-6">
              {currentSection === 'basic' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Moon className="h-4 w-4 text-primary" />
                        Confession Islamique
                      </Label>
                      <Select value={preferences.sect} onValueChange={(value) => updatePreference('sect', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sunni">Sunnite</SelectItem>
                          <SelectItem value="shia">Chiite</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                          <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-secondary" />
                        École Juridique (Madhab)
                      </Label>
                      <Select value={preferences.madhab} onValueChange={(value) => updatePreference('madhab', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hanafi">Hanafi</SelectItem>
                          <SelectItem value="maliki">Maliki</SelectItem>
                          <SelectItem value="shafii">Shafi'i</SelectItem>
                          <SelectItem value="hanbali">Hanbali</SelectItem>
                          <SelectItem value="salafi">Salafi</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                          <SelectItem value="not_specific">Pas spécifique</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Fréquence de Prière
                      </Label>
                      <Select value={preferences.prayer_frequency} onValueChange={(value) => updatePreference('prayer_frequency', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5_times_daily">5 fois par jour</SelectItem>
                          <SelectItem value="often">Souvent</SelectItem>
                          <SelectItem value="sometimes">Parfois</SelectItem>
                          <SelectItem value="fridays_only">Vendredis seulement</SelectItem>
                          <SelectItem value="occasionally">Occasionnellement</SelectItem>
                          <SelectItem value="rarely">Rarement</SelectItem>
                          <SelectItem value="never">Jamais</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Book className="h-4 w-4 text-secondary" />
                        Lecture du Coran
                      </Label>
                      <Select value={preferences.quran_reading} onValueChange={(value) => updatePreference('quran_reading', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Quotidiennement</SelectItem>
                          <SelectItem value="weekly">Hebdomadaire</SelectItem>
                          <SelectItem value="monthly">Mensuelle</SelectItem>
                          <SelectItem value="occasionally">Occasionnellement</SelectItem>
                          <SelectItem value="rarely">Rarement</SelectItem>
                          <SelectItem value="learning">En apprentissage</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-primary" />
                      Importance de la Religion dans votre Vie
                    </Label>
                    <Select value={preferences.importance_of_religion} onValueChange={(value) => updatePreference('importance_of_religion', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="very_important">Très important</SelectItem>
                          <SelectItem value="important">Important</SelectItem>
                          <SelectItem value="somewhat_important">Assez important</SelectItem>
                          <SelectItem value="not_important">Peu important</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {currentSection === 'lifestyle' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Utensils className="h-4 w-4 text-primary" />
                        Régime Halal
                      </Label>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={preferences.halal_diet}
                          onCheckedChange={(checked) => updatePreference('halal_diet', checked)}
                        />
                        <span className="text-sm">Je suis un régime halal strict</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-secondary" />
                        Position sur le Tabac
                      </Label>
                      <Select value={preferences.smoking} onValueChange={(value) => updatePreference('smoking', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="never">Jamais</SelectItem>
                          <SelectItem value="occasionally">Occasionnellement</SelectItem>
                          <SelectItem value="regularly">Régulièrement</SelectItem>
                          <SelectItem value="trying_to_quit">Essaie d'arrêter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Shirt className="h-4 w-4 text-primary" />
                        Préférence Hijab
                      </Label>
                      <Select value={preferences.hijab_preference} onValueChange={(value) => updatePreference('hijab_preference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="always">Toujours</SelectItem>
                          <SelectItem value="most_times">La plupart du temps</SelectItem>
                          <SelectItem value="sometimes">Parfois</SelectItem>
                          <SelectItem value="never">Jamais</SelectItem>
                          <SelectItem value="not_applicable">Non applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-secondary" />
                        Préférence Barbe
                      </Label>
                      <Select value={preferences.beard_preference} onValueChange={(value) => updatePreference('beard_preference', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full_beard">Barbe complète</SelectItem>
                          <SelectItem value="trimmed_beard">Barbe taillée</SelectItem>
                          <SelectItem value="goatee">Bouc</SelectItem>
                          <SelectItem value="mustache_only">Moustache seulement</SelectItem>
                          <SelectItem value="clean_shaven">Rasé</SelectItem>
                          <SelectItem value="not_applicable">Non applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {currentSection === 'family' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-emerald" />
                      Préférence de Confession du Partenaire
                    </Label>
                    <Select value={preferences.desired_partner_sect} onValueChange={(value) => updatePreference('desired_partner_sect', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choisir..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same_sect">Même confession que moi</SelectItem>
                        <SelectItem value="sunni">Sunnite</SelectItem>
                        <SelectItem value="shia">Chiite</SelectItem>
                        <SelectItem value="any">Peu importe</SelectItem>
                        <SelectItem value="open_discussion">Ouvert à la discussion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {/* Additional sections would be implemented similarly */}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => {
                  const currentIndex = sections.findIndex(s => s.id === currentSection);
                  if (currentIndex > 0) {
                    setCurrentSection(sections[currentIndex - 1].id);
                  }
                }}
                disabled={sections.findIndex(s => s.id === currentSection) === 0}
              >
                Section Précédente
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={savePreferences}
                  disabled={saving}
                >
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </Button>
                
                {sections.findIndex(s => s.id === currentSection) < sections.length - 1 ? (
                  <Button
                    onClick={() => {
                      const currentIndex = sections.findIndex(s => s.id === currentSection);
                      setCurrentSection(sections[currentIndex + 1].id);
                    }}
                  >
                    Section Suivante
                  </Button>
                ) : (
                  <Button
                    onClick={savePreferences}
                    disabled={saving}
                    className="bg-primary hover:bg-primary/80"
                  >
                    {saving ? 'Finalisation...' : 'Terminer'}
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedIslamicPreferences;