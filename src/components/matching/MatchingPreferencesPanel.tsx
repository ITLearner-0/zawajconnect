import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Save, Loader2 } from 'lucide-react';
import { useMatchingPreferences, MatchingPreferences } from '@/hooks/useMatchingPreferences';

interface MatchingPreferencesPanelProps {
  onRunMatching: () => void;
  analyzing: boolean;
  loading: boolean;
}

const MatchingPreferencesPanel = ({
  onRunMatching,
  analyzing,
  loading,
}: MatchingPreferencesPanelProps) => {
  const {
    preferences,
    loading: prefsLoading,
    saving,
    updatePreferences,
    savePreferences,
  } = useMatchingPreferences();

  const handleSliderChange = (key: keyof MatchingPreferences, value: number) => {
    updatePreferences({ [key]: value });
  };

  const handleCheckboxChange = (key: keyof MatchingPreferences, checked: boolean) => {
    updatePreferences({ [key]: checked });
  };

  if (prefsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-5 w-5 text-primary" />
            Configuration du Matching IA
          </CardTitle>
          <div className="flex items-center gap-2">
            {saving && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Sauvegarde...
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={savePreferences} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Sliders Section */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Pondération des critères
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Poids Islamique</span>
                <Badge variant="secondary" className="font-mono">
                  {preferences.weight_islamic}%
                </Badge>
              </label>
              <input
                type="range"
                min="20"
                max="60"
                value={preferences.weight_islamic}
                onChange={(e) => handleSliderChange('weight_islamic', parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>20%</span>
                <span>60%</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Poids Culturel</span>
                <Badge variant="secondary" className="font-mono">
                  {preferences.weight_cultural}%
                </Badge>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={preferences.weight_cultural}
                onChange={(e) => handleSliderChange('weight_cultural', parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium flex items-center justify-between">
                <span>Poids Personnalité</span>
                <Badge variant="secondary" className="font-mono">
                  {preferences.weight_personality}%
                </Badge>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                value={preferences.weight_personality}
                onChange={(e) => handleSliderChange('weight_personality', parseInt(e.target.value))}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>10%</span>
                <span>50%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium whitespace-nowrap">Compatibilité min:</label>
              <Badge variant="outline" className="font-mono">
                {preferences.min_compatibility}%
              </Badge>
              <input
                type="range"
                min="50"
                max="90"
                value={preferences.min_compatibility}
                onChange={(e) => handleSliderChange('min_compatibility', parseInt(e.target.value))}
                className="w-24 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>

            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.family_approval_required}
                onChange={(e) => handleCheckboxChange('family_approval_required', e.target.checked)}
                className="rounded accent-primary"
              />
              <span className="whitespace-nowrap">Approbation famille</span>
            </label>
          </div>

          <Button
            onClick={onRunMatching}
            disabled={loading}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity shadow-md w-full sm:w-auto"
          >
            {analyzing ? (
              <>
                <Brain className="h-4 w-4 mr-2 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Lancer le Matching
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingPreferencesPanel;
