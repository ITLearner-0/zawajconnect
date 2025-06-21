
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EnhancedAdvancedFilters } from "@/types/filters";
import { BookOpen, MessageCircle, Heart, Users } from "lucide-react";

interface EnhancedAdvancedFilterPanelProps {
  filters: EnhancedAdvancedFilters;
  onFiltersChange: (filters: EnhancedAdvancedFilters) => void;
}

const MADHAB_OPTIONS = [
  "Hanafi", "Maliki", "Shafi'i", "Hanbali", "Ja'fari", "Autre"
];

const LANGUAGE_OPTIONS = [
  "Français", "Arabe", "Anglais", "Turc", "Ourdou", "Bengali", "Indonésien", "Malais"
];

const MARITAL_STATUS_OPTIONS = [
  "Célibataire", "Divorcé(e)", "Veuf/Veuve"
];

const POLYGAMY_STANCE_OPTIONS = [
  "Accepte", "Accepte conditionnellement", "N'accepte pas", "Préfère pratiquer", "Indifférent"
];

const EnhancedAdvancedFilterPanel: React.FC<EnhancedAdvancedFilterPanelProps> = ({ 
  filters, 
  onFiltersChange 
}) => {
  const updateMadhabFilter = (updates: Partial<typeof filters.madhab>) => {
    onFiltersChange({
      ...filters,
      madhab: { ...filters.madhab, ...updates } as any
    });
  };

  const updateLanguageFilter = (updates: Partial<typeof filters.languages>) => {
    onFiltersChange({
      ...filters,
      languages: { ...filters.languages, ...updates } as any
    });
  };

  const updateMaritalStatusFilter = (updates: Partial<typeof filters.maritalStatus>) => {
    onFiltersChange({
      ...filters,
      maritalStatus: { ...filters.maritalStatus, ...updates } as any
    });
  };

  const updatePolygamyStanceFilter = (updates: Partial<typeof filters.polygamyStance>) => {
    onFiltersChange({
      ...filters,
      polygamyStance: { ...filters.polygamyStance, ...updates } as any
    });
  };

  const toggleMadhabOption = (madhab: string) => {
    const currentMadhabs = filters.madhab?.madhabs || [];
    const newMadhabs = currentMadhabs.includes(madhab)
      ? currentMadhabs.filter(m => m !== madhab)
      : [...currentMadhabs, madhab];
    
    updateMadhabFilter({ madhabs: newMadhabs });
  };

  const toggleLanguageOption = (language: string) => {
    const currentLanguages = filters.languages?.languages || [];
    const newLanguages = currentLanguages.includes(language)
      ? currentLanguages.filter(l => l !== language)
      : [...currentLanguages, language];
    
    updateLanguageFilter({ languages: newLanguages });
  };

  const toggleMaritalStatusOption = (status: string) => {
    const currentStatuses = filters.maritalStatus?.statuses || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateMaritalStatusFilter({ statuses: newStatuses });
  };

  const togglePolygamyStanceOption = (stance: string) => {
    const currentStances = filters.polygamyStance?.acceptableStances || [];
    const newStances = currentStances.includes(stance)
      ? currentStances.filter(s => s !== stance)
      : [...currentStances, stance];
    
    updatePolygamyStanceFilter({ acceptableStances: newStances });
  };

  return (
    <div className="space-y-4">
      {/* Madhab Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <BookOpen className="h-4 w-4" />
            École Juridique (Madhab)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="madhab-enabled">Filtrer par madhab</Label>
            <Switch
              id="madhab-enabled"
              checked={filters.madhab?.enabled || false}
              onCheckedChange={(enabled) => updateMadhabFilter({ enabled })}
            />
          </div>
          
          {filters.madhab?.enabled && (
            <div className="space-y-2">
              <Label>Madhabs acceptés</Label>
              <div className="flex flex-wrap gap-2">
                {MADHAB_OPTIONS.map(madhab => (
                  <Badge
                    key={madhab}
                    variant={filters.madhab?.madhabs?.includes(madhab) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMadhabOption(madhab)}
                  >
                    {madhab}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            Langues
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="languages-enabled">Filtrer par langues</Label>
            <Switch
              id="languages-enabled"
              checked={filters.languages?.enabled || false}
              onCheckedChange={(enabled) => updateLanguageFilter({ enabled })}
            />
          </div>
          
          {filters.languages?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Langues parlées</Label>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map(language => (
                    <Badge
                      key={language}
                      variant={filters.languages?.languages?.includes(language) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleLanguageOption(language)}
                    >
                      {language}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="prefer-native">Préférer langue maternelle</Label>
                <Switch
                  id="prefer-native"
                  checked={filters.languages?.preferNative || false}
                  onCheckedChange={(preferNative) => updateLanguageFilter({ preferNative })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Marital Status Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            Statut Marital
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="marital-enabled">Filtrer par statut marital</Label>
            <Switch
              id="marital-enabled"
              checked={filters.maritalStatus?.enabled || false}
              onCheckedChange={(enabled) => updateMaritalStatusFilter({ enabled })}
            />
          </div>
          
          {filters.maritalStatus?.enabled && (
            <div className="space-y-2">
              <Label>Statuts acceptés</Label>
              <div className="flex flex-wrap gap-2">
                {MARITAL_STATUS_OPTIONS.map(status => (
                  <Badge
                    key={status}
                    variant={filters.maritalStatus?.statuses?.includes(status) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleMaritalStatusOption(status)}
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Polygamy Stance Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Heart className="h-4 w-4" />
            Position sur la Polygamie
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="polygamy-enabled">Filtrer par position polygamie</Label>
            <Switch
              id="polygamy-enabled"
              checked={filters.polygamyStance?.enabled || false}
              onCheckedChange={(enabled) => updatePolygamyStanceFilter({ enabled })}
            />
          </div>
          
          {filters.polygamyStance?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Positions acceptables</Label>
                <div className="flex flex-wrap gap-2">
                  {POLYGAMY_STANCE_OPTIONS.map(stance => (
                    <Badge
                      key={stance}
                      variant={filters.polygamyStance?.acceptableStances?.includes(stance) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => togglePolygamyStanceOption(stance)}
                    >
                      {stance}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="strict-polygamy">Mode strict</Label>
                <Switch
                  id="strict-polygamy"
                  checked={filters.polygamyStance?.strictMode || false}
                  onCheckedChange={(strictMode) => updatePolygamyStanceFilter({ strictMode })}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedAdvancedFilterPanel;
