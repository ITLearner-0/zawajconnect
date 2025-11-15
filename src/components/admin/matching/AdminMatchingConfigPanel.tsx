import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Save,
  Play,
  RefreshCw,
  Settings,
  BarChart3,
  TrendingUp,
  Sliders,
  Trash2,
} from 'lucide-react';
import {
  useMatchingAlgorithmConfig,
  type MatchingAlgorithmConfig,
  type AlgorithmWeights,
  type AlgorithmThresholds,
  type AlgorithmFilters,
} from '@/hooks/useMatchingAlgorithmConfig';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const defaultWeights: AlgorithmWeights = {
  religious: 35,
  values: 25,
  lifestyle: 20,
  personality: 15,
  family: 5,
};

const defaultThresholds: AlgorithmThresholds = {
  minCompatibility: 60,
  dealbreakerThreshold: 70,
  strongMatchThreshold: 85,
};

const defaultFilters: AlgorithmFilters = {
  requireVerified: false,
  maxDistance: null,
  ageRange: null,
};

export default function AdminMatchingConfigPanel() {
  const {
    configs,
    activeConfig,
    loading,
    saving,
    saveConfig,
    activateConfig,
    deleteConfig,
    refreshConfigs,
  } = useMatchingAlgorithmConfig();

  const [currentConfig, setCurrentConfig] = useState<MatchingAlgorithmConfig>({
    config_name: 'Nouvelle Configuration',
    config_version: '1.0',
    weights: defaultWeights,
    thresholds: defaultThresholds,
    filters: defaultFilters,
    is_active: false,
  });

  const [simulatedScore, setSimulatedScore] = useState<number>(75);

  useEffect(() => {
    if (activeConfig) {
      setCurrentConfig(activeConfig);
    }
  }, [activeConfig]);

  // Real-time simulation when weights change
  useEffect(() => {
    const totalWeight = Object.values(currentConfig.weights).reduce((a, b) => a + b, 0);
    const normalizedScore =
      totalWeight > 0
        ? Math.round(
            ((currentConfig.weights.religious * 0.9 +
              currentConfig.weights.values * 0.85 +
              currentConfig.weights.lifestyle * 0.8 +
              currentConfig.weights.personality * 0.75 +
              currentConfig.weights.family * 0.85) /
              totalWeight) *
              100
          )
        : 0;
    setSimulatedScore(Math.min(100, normalizedScore));
  }, [currentConfig.weights]);

  const updateWeight = (dimension: keyof AlgorithmWeights, value: number) => {
    setCurrentConfig((prev) => ({
      ...prev,
      weights: {
        ...prev.weights,
        [dimension]: value,
      },
    }));
  };

  const updateThreshold = (key: keyof AlgorithmThresholds, value: number) => {
    setCurrentConfig((prev) => ({
      ...prev,
      thresholds: {
        ...prev.thresholds,
        [key]: value,
      },
    }));
  };

  const updateFilter = (key: keyof AlgorithmFilters, value: any) => {
    setCurrentConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    await saveConfig(currentConfig);
  };

  const handleActivate = async (configId: string) => {
    await activateConfig(configId);
  };

  const handleDelete = async (configId: string) => {
    await deleteConfig(configId);
  };

  const totalWeight = Object.values(currentConfig.weights).reduce((a, b) => a + b, 0);
  const isWeightValid = totalWeight === 100;

  const getScoreColor = (score: number) => {
    if (score >= currentConfig.thresholds.strongMatchThreshold) return 'text-green-600';
    if (score >= currentConfig.thresholds.minCompatibility) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= currentConfig.thresholds.strongMatchThreshold) return 'Match Excellent';
    if (score >= currentConfig.thresholds.minCompatibility) return 'Match Acceptable';
    return 'Match Faible';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration de l'Algorithme de Matching
              </CardTitle>
              <CardDescription>
                Ajustez les poids, seuils et filtres pour optimiser la qualité des matchs
              </CardDescription>
            </div>
            {activeConfig && (
              <Badge variant="default" className="gap-1">
                <Play className="h-3 w-3" />
                Active: {activeConfig.config_name}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="weights" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="weights">
                <Sliders className="h-4 w-4 mr-2" />
                Poids
              </TabsTrigger>
              <TabsTrigger value="thresholds">
                <BarChart3 className="h-4 w-4 mr-2" />
                Seuils
              </TabsTrigger>
              <TabsTrigger value="filters">
                <Settings className="h-4 w-4 mr-2" />
                Filtres
              </TabsTrigger>
              <TabsTrigger value="preview">
                <TrendingUp className="h-4 w-4 mr-2" />
                Prévisualisation
              </TabsTrigger>
            </TabsList>

            <TabsContent value="weights" className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Poids par Dimension</h3>
                  <Badge variant={isWeightValid ? 'default' : 'destructive'}>
                    Total: {totalWeight}%
                  </Badge>
                </div>

                {!isWeightValid && (
                  <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                    ⚠️ La somme des poids doit être égale à 100%
                  </div>
                )}

                {(Object.keys(currentConfig.weights) as Array<keyof AlgorithmWeights>).map(
                  (dimension) => {
                    const weight = currentConfig.weights[dimension] ?? 0;
                    return (
                      <div key={dimension} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize">{dimension}</Label>
                          <span className="text-sm font-medium">{weight}%</span>
                        </div>
                        <Slider
                          value={[weight]}
                          onValueChange={(value) => updateWeight(dimension, value[0] ?? 0)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    );
                  }
                )}
              </div>
            </TabsContent>

            <TabsContent value="thresholds" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Seuils de Compatibilité</h3>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Compatibilité Minimale</Label>
                    <span className="text-sm font-medium">
                      {currentConfig.thresholds.minCompatibility ?? 60}%
                    </span>
                  </div>
                  <Slider
                    value={[currentConfig.thresholds.minCompatibility ?? 60]}
                    onValueChange={(value) => updateThreshold('minCompatibility', value[0] ?? 60)}
                    max={100}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Score minimum pour afficher un match à l'utilisateur
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Seuil Dealbreaker</Label>
                    <span className="text-sm font-medium">
                      {currentConfig.thresholds.dealbreakerThreshold ?? 70}%
                    </span>
                  </div>
                  <Slider
                    value={[currentConfig.thresholds.dealbreakerThreshold ?? 70]}
                    onValueChange={(value) =>
                      updateThreshold('dealbreakerThreshold', value[0] ?? 70)
                    }
                    max={100}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Score minimum requis sur les questions critiques
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Match Excellent</Label>
                    <span className="text-sm font-medium">
                      {currentConfig.thresholds.strongMatchThreshold ?? 85}%
                    </span>
                  </div>
                  <Slider
                    value={[currentConfig.thresholds.strongMatchThreshold ?? 85]}
                    onValueChange={(value) =>
                      updateThreshold('strongMatchThreshold', value[0] ?? 85)
                    }
                    max={100}
                    step={1}
                  />
                  <p className="text-xs text-muted-foreground">
                    Score pour marquer un match comme excellent
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Filtres Appliqués</h3>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Profils Vérifiés Uniquement</Label>
                    <p className="text-xs text-muted-foreground">
                      Ne montrer que les profils vérifiés
                    </p>
                  </div>
                  <Switch
                    checked={currentConfig.filters.requireVerified}
                    onCheckedChange={(checked) => updateFilter('requireVerified', checked)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Distance Maximale (km)</Label>
                  <Input
                    type="number"
                    placeholder="Illimité"
                    value={currentConfig.filters.maxDistance || ''}
                    onChange={(e) =>
                      updateFilter('maxDistance', e.target.value ? parseInt(e.target.value) : null)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tranche d'Âge</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={currentConfig.filters.ageRange?.[0] || ''}
                      onChange={(e) =>
                        updateFilter('ageRange', [
                          e.target.value ? parseInt(e.target.value) : 18,
                          currentConfig.filters.ageRange?.[1] || 65,
                        ])
                      }
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={currentConfig.filters.ageRange?.[1] || ''}
                      onChange={(e) =>
                        updateFilter('ageRange', [
                          currentConfig.filters.ageRange?.[0] || 18,
                          e.target.value ? parseInt(e.target.value) : 65,
                        ])
                      }
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Prévisualisation en Temps Réel</h3>

                <Card className="bg-muted/50">
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className={`text-6xl font-bold ${getScoreColor(simulatedScore)}`}>
                          {simulatedScore}%
                        </div>
                        <p className="text-lg font-medium mt-2">{getScoreLabel(simulatedScore)}</p>
                      </div>

                      <Progress value={simulatedScore} className="h-3" />

                      <div className="grid grid-cols-2 gap-4 mt-6">
                        {(Object.keys(currentConfig.weights) as Array<keyof AlgorithmWeights>).map(
                          (dimension) => {
                            const weight = currentConfig.weights[dimension];
                            const contribution = (weight / totalWeight) * simulatedScore;

                            return (
                              <div key={dimension} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="capitalize">{dimension}</span>
                                  <span className="font-medium">{Math.round(contribution)}%</span>
                                </div>
                                <Progress value={contribution} className="h-2" />
                              </div>
                            );
                          }
                        )}
                      </div>

                      <div className="border-t pt-4 mt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Sera affiché?</span>
                          <Badge
                            variant={
                              simulatedScore >= currentConfig.thresholds.minCompatibility
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {simulatedScore >= currentConfig.thresholds.minCompatibility
                              ? 'Oui'
                              : 'Non'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Qualité du match</span>
                          <Badge
                            variant={
                              simulatedScore >= currentConfig.thresholds.strongMatchThreshold
                                ? 'default'
                                : simulatedScore >= currentConfig.thresholds.minCompatibility
                                  ? 'secondary'
                                  : 'destructive'
                            }
                          >
                            {getScoreLabel(simulatedScore)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 mt-6">
            <Input
              placeholder="Nom de la configuration"
              value={currentConfig.config_name}
              onChange={(e) =>
                setCurrentConfig((prev) => ({ ...prev, config_name: e.target.value }))
              }
              className="flex-1"
            />
            <Button onClick={handleSave} disabled={saving || !isWeightValid} className="gap-2">
              <Save className="h-4 w-4" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configurations Sauvegardées</CardTitle>
          <CardDescription>Gérez vos configurations d'algorithme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucune configuration sauvegardée
              </p>
            ) : (
              configs.map((config) => (
                <Card key={config.id} className={config.is_active ? 'border-primary' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{config.config_name}</h4>
                          {config.is_active && (
                            <Badge variant="default" className="gap-1">
                              <Play className="h-3 w-3" />
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Version {config.config_version}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!config.is_active && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => config.id && handleActivate(config.id)}
                            disabled={saving}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Activer
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setCurrentConfig(config)}
                        >
                          Éditer
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="destructive" disabled={config.is_active}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer la configuration?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Cette action est irréversible. La configuration sera définitivement
                                supprimée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => config.id && handleDelete(config.id)}
                                className="bg-destructive text-destructive-foreground"
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
