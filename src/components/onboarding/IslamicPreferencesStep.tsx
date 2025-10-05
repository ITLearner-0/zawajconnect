import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Heart, 
  MapPin, 
  Book, 
  User, 
  Users,
  CheckCircle,
  Info
} from 'lucide-react';

interface IslamicPreferences {
  prayer_frequency: string;
  quran_reading: string;
  hijab_preference: string;
  beard_preference: string;
  sect: string;
  madhab: string;
  halal_diet: boolean;
  smoking: string;
  desired_partner_sect: string;
  importance_of_religion: string;
}

interface IslamicPreferencesStepProps {
  preferences: IslamicPreferences;
  onPreferencesChange: (preferences: IslamicPreferences) => void;
  gender: string;
  className?: string;
}

const IslamicPreferencesStep = ({ 
  preferences, 
  onPreferencesChange, 
  gender,
  className = "" 
}: IslamicPreferencesStepProps) => {

  const updatePreference = (key: keyof IslamicPreferences, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value
    });
  };

  const prayerOptions = [
    { value: "five_times", label: "5 fois par jour", icon: "🕌" },
    { value: "regularly", label: "Régulièrement", icon: "🤲" },
    { value: "sometimes", label: "Parfois", icon: "⭐" },
    { value: "rarely", label: "Rarement", icon: "🌙" },
    { value: "never", label: "Jamais", icon: "❌" }
  ];

  const quranOptions = [
    { value: "daily", label: "Quotidiennement", icon: "📖" },
    { value: "weekly", label: "Hebdomadairement", icon: "📚" },
    { value: "monthly", label: "Mensuellement", icon: "📜" },
    { value: "occasionally", label: "Occasionnellement", icon: "📋" },
    { value: "rarely", label: "Rarement", icon: "📄" }
  ];

  const sectOptions = [
    { value: "sunni", label: "Sunnite" },
    { value: "shia", label: "Chiite" },
    { value: "other", label: "Autre" },
    { value: "prefer_not_say", label: "Préfère ne pas dire" }
  ];

  const madhabOptions = [
    { value: "hanafi", label: "Hanafi" },
    { value: "maliki", label: "Maliki" },
    { value: "shafi", label: "Chafi'i" },
    { value: "hanbali", label: "Hanbali" },
    { value: "other", label: "Autre" },
    { value: "none", label: "Aucune préférence" }
  ];

  const importanceOptions = [
    { value: "very_important", label: "Très important", color: "bg-emerald" },
    { value: "important", label: "Important", color: "bg-blue-500" },
    { value: "somewhat", label: "Assez important", color: "bg-gold" },
    { value: "not_very", label: "Peu important", color: "bg-orange-500" }
  ];

  const smokingOptions = [
    { value: "never", label: "Jamais", color: "bg-emerald" },
    { value: "socially", label: "Socialement", color: "bg-gold" },
    { value: "regularly", label: "Régulièrement", color: "bg-orange-500" }
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center space-y-2 mb-8">
        <div className="flex justify-center">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">Préférences islamiques</h2>
        <p className="text-muted-foreground">
          Vos pratiques et valeurs religieuses nous aident à trouver des personnes compatibles
        </p>
      </div>

      {/* Religious Practices */}
      <Card className="bg-gradient-to-br from-emerald/5 to-emerald-light/5 border-emerald/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-emerald" />
            <span>Pratiques religieuses</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base font-medium mb-3 block">
              Fréquence de prière *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {prayerOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreference('prayer_frequency', option.value)}
                  className={`p-3 rounded-lg border-2 transition-all text-left hover:shadow-sm ${
                    preferences.prayer_frequency === option.value
                      ? 'border-emerald bg-emerald/10 shadow-sm'
                      : 'border-muted hover:border-emerald/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{option.icon}</span>
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  {preferences.prayer_frequency === option.value && (
                    <CheckCircle className="w-4 h-4 text-emerald mt-1 ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">
              Lecture du Coran
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {quranOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreference('quran_reading', option.value)}
                  className={`p-3 rounded-lg border transition-all text-left hover:shadow-sm ${
                    preferences.quran_reading === option.value
                      ? 'border-emerald bg-emerald/10'
                      : 'border-muted hover:border-emerald/50'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <span>{option.icon}</span>
                    <span className="text-sm">{option.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Religious Identity */}
      <Card className="bg-gradient-to-br from-blue-50/50 to-blue-100/50 border-blue-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span>Identité religieuse</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="sect">Secte *</Label>
              <Select 
                value={preferences.sect} 
                onValueChange={(value) => updatePreference('sect', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre secte" />
                </SelectTrigger>
                <SelectContent>
                  {sectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="madhab">École juridique (Madhab)</Label>
              <Select 
                value={preferences.madhab} 
                onValueChange={(value) => updatePreference('madhab', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez votre madhab" />
                </SelectTrigger>
                <SelectContent>
                  {madhabOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-base font-medium mb-3 block">
              Importance de la religion *
            </Label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {importanceOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updatePreference('importance_of_religion', option.value)}
                  className={`p-3 rounded-lg border transition-all text-center hover:shadow-sm ${
                    preferences.importance_of_religion === option.value
                      ? 'border-emerald bg-emerald/10'
                      : 'border-muted hover:border-emerald/50'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full ${option.color} mx-auto mb-2`}></div>
                  <span className="text-sm font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>Préférences personnelles</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Appearance preferences based on gender */}
          {gender === 'female' && (
            <div>
              <Label htmlFor="hijab">Port du hijab</Label>
              <Select 
                value={preferences.hijab_preference} 
                onValueChange={(value) => updatePreference('hijab_preference', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Votre préférence" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="always">Toujours</SelectItem>
                  <SelectItem value="sometimes">Parfois</SelectItem>
                  <SelectItem value="planning_to">Prévoit de le porter</SelectItem>
                  <SelectItem value="never">Ne porte pas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {gender === 'male' && (
            <div>
              <Label htmlFor="beard">Port de la barbe</Label>
              <Select 
                value={preferences.beard_preference} 
                onValueChange={(value) => updatePreference('beard_preference', value)}
              >
              <SelectTrigger>
                <SelectValue placeholder="Votre préférence" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full_beard">Barbe complète</SelectItem>
                <SelectItem value="trimmed_beard">Barbe taillée</SelectItem>
                <SelectItem value="goatee">Bouc</SelectItem>
                <SelectItem value="mustache_only">Moustache seulement</SelectItem>
                <SelectItem value="clean_shaven">Rasé de près</SelectItem>
                <SelectItem value="beardless">Imberbe</SelectItem>
                <SelectItem value="not_applicable">Non applicable</SelectItem>
              </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-base font-medium mb-3 block">
                Tabagisme
              </Label>
              <div className="space-y-2">
                {smokingOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updatePreference('smoking', option.value)}
                    className={`w-full p-3 rounded-lg border transition-all text-left hover:shadow-sm ${
                      preferences.smoking === option.value
                        ? 'border-emerald bg-emerald/10'
                        : 'border-muted hover:border-emerald/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option.label}</span>
                      <div className={`w-3 h-3 rounded-full ${option.color}`}></div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3 p-4 bg-muted/30 rounded-lg">
              <Checkbox
                id="halal_diet"
                checked={preferences.halal_diet}
                onCheckedChange={(checked) => updatePreference('halal_diet', checked)}
              />
              <div className="flex-1">
                <Label htmlFor="halal_diet" className="text-sm font-medium cursor-pointer">
                  Régime alimentaire halal
                </Label>
                <p className="text-xs text-muted-foreground">
                  Je consomme uniquement de la nourriture halal
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Partner Preferences */}
      <Card className="bg-gradient-to-br from-pink-50/50 to-rose-100/50 border-pink-200/50">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-pink-600" />
            <span>Préférences pour votre futur(e) partenaire</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="desired_partner_sect">Secte préférée du partenaire</Label>
            <Select 
              value={preferences.desired_partner_sect} 
              onValueChange={(value) => updatePreference('desired_partner_sect', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucune préférence particulière" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Aucune préférence</SelectItem>
                <SelectItem value="sunni">Sunnite</SelectItem>
                <SelectItem value="shia">Chiite</SelectItem>
                <SelectItem value="same_sect">Identique à la mienne</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Info Note */}
      <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm">
          <p className="font-medium text-blue-900 mb-1">
            Confidentialité et respect
          </p>
          <p className="text-blue-700">
            Vos préférences religieuses sont privées et ne seront utilisées que pour améliorer la compatibilité. 
            Vous pouvez les modifier à tout moment dans vos paramètres.
          </p>
        </div>
      </div>
    </div>
  );
};

export default IslamicPreferencesStep;