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

const MatchingPreferencesPanel = ({ onRunMatching, analyzing, loading }: MatchingPreferencesPanelProps) => {
  const { 
    preferences, 
    loading: prefsLoading, 
    saving, 
    updatePreferences, 
    savePreferences 
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Moteur IA de Compatibilité Islamique
          </div>
          <div className="flex items-center gap-2">
            {saving && (
              <Badge variant="secondary" className="animate-pulse">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Sauvegarde...
              </Badge>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={savePreferences}
              disabled={saving}
            >
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Poids Islamique ({preferences.weight_islamic}%)
            </label>
            <input
              type="range"
              min="20"
              max="60"
              value={preferences.weight_islamic}
              onChange={(e) => handleSliderChange('weight_islamic', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>20%</span>
              <span>60%</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Poids Culturel ({preferences.weight_cultural}%)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={preferences.weight_cultural}
              onChange={(e) => handleSliderChange('weight_cultural', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">
              Poids Personnalité ({preferences.weight_personality}%)
            </label>
            <input
              type="range"
              min="10"
              max="50"
              value={preferences.weight_personality}
              onChange={(e) => handleSliderChange('weight_personality', parseInt(e.target.value))}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>10%</span>
              <span>50%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">
              Compatibilité minimum: {preferences.min_compatibility}%
            </label>
            <input
              type="range"
              min="50"
              max="90"
              value={preferences.min_compatibility}
              onChange={(e) => handleSliderChange('min_compatibility', parseInt(e.target.value))}
              className="w-32 h-2 bg-muted rounded-lg appearance-none cursor-pointer"
            />
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={preferences.family_approval_required}
                onChange={(e) => handleCheckboxChange('family_approval_required', e.target.checked)}
                className="rounded"
              />
              Approbation famille requise
            </label>

            <Button 
              onClick={onRunMatching} 
              disabled={loading}
              className="bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
            >
              {analyzing ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analyse IA en cours...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Lancer l'IA Matching
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchingPreferencesPanel;