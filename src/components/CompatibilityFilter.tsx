import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Heart, Filter, RotateCcw } from 'lucide-react';

interface CompatibilityFilterProps {
  onFilterChange: (filters: CompatibilityFilters) => void;
}

interface CompatibilityFilters {
  minCompatibilityScore: number;
  religiousImportance: string[];
  economicAutonomy: string[];
  careerFamily: string[];
  familyOriented: boolean | null;
}

const CompatibilityFilter = ({ onFilterChange }: CompatibilityFilterProps) => {
  const [filters, setFilters] = useState<CompatibilityFilters>({
    minCompatibilityScore: 50,
    religiousImportance: [],
    economicAutonomy: [],
    careerFamily: [],
    familyOriented: null
  });

  const religiousOptions = [
    { value: 'very_important', label: 'Très important' },
    { value: 'important', label: 'Important' },
    { value: 'somewhat_important', label: 'Assez important' }
  ];

  const economicAutonomyOptions = [
    { value: 'financial_independence', label: 'Indépendance financière' },
    { value: 'shared_finances', label: 'Finances partagées' },
    { value: 'traditional_roles', label: 'Rôles traditionnels' }
  ];

  const careerFamilyOptions = [
    { value: 'career_focused', label: 'Axé sur la carrière' },
    { value: 'family_focused', label: 'Axé sur la famille' },
    { value: 'balanced_approach', label: 'Approche équilibrée' }
  ];

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleReligiousChange = (value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      religiousImportance: checked 
        ? [...prev.religiousImportance, value]
        : prev.religiousImportance.filter(item => item !== value)
    }));
  };

  const handleEconomicAutonomyChange = (value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      economicAutonomy: checked 
        ? [...prev.economicAutonomy, value]
        : prev.economicAutonomy.filter(item => item !== value)
    }));
  };

  const handleCareerFamilyChange = (value: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      careerFamily: checked 
        ? [...prev.careerFamily, value]
        : prev.careerFamily.filter(item => item !== value)
    }));
  };

  const resetFilters = () => {
    setFilters({
      minCompatibilityScore: 50,
      religiousImportance: [],
      economicAutonomy: [],
      careerFamily: [],
      familyOriented: null
    });
  };

  const getCompatibilityColor = (score: number) => {
    if (score >= 80) return 'text-emerald';
    if (score >= 60) return 'text-gold';
    return 'text-orange-600';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-emerald" />
          Filtres de Compatibilité
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Compatibility Score Filter */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Score de compatibilité minimum</Label>
            <Badge 
              className={`${getCompatibilityColor(filters.minCompatibilityScore)} bg-transparent border`}
            >
              {filters.minCompatibilityScore}%+
            </Badge>
          </div>
          <Slider
            value={[filters.minCompatibilityScore]}
            onValueChange={([value]) => setFilters(prev => ({ ...prev, minCompatibilityScore: value }))}
            min={0}
            max={100}
            step={5}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>

        {/* Religious Importance */}
        <div className="space-y-3">
          <Label>Importance de la religion</Label>
          <div className="space-y-2">
            {religiousOptions.map(option => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`religious-${option.value}`}
                  checked={filters.religiousImportance.includes(option.value)}
                  onChange={(e) => handleReligiousChange(option.value, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label 
                  htmlFor={`religious-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Economic Autonomy */}
        <div className="space-y-3">
          <Label>Autonomie économique</Label>
          <div className="space-y-2">
            {economicAutonomyOptions.map(option => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`economic-${option.value}`}
                  checked={filters.economicAutonomy.includes(option.value)}
                  onChange={(e) => handleEconomicAutonomyChange(option.value, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label 
                  htmlFor={`economic-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Career vs Family */}
        <div className="space-y-3">
          <Label>Carrière vs Famille</Label>
          <div className="space-y-2">
            {careerFamilyOptions.map(option => (
              <div key={option.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`career-${option.value}`}
                  checked={filters.careerFamily.includes(option.value)}
                  onChange={(e) => handleCareerFamilyChange(option.value, e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label 
                  htmlFor={`career-${option.value}`}
                  className="text-sm cursor-pointer"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Family Oriented */}
        <div className="space-y-3">
          <Label>Orienté famille</Label>
          <Select 
            value={filters.familyOriented === null ? 'any' : filters.familyOriented.toString()}
            onValueChange={(value) => {
              const boolValue = value === 'any' ? null : value === 'true';
              setFilters(prev => ({ ...prev, familyOriented: boolValue }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Toute préférence" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Toute préférence</SelectItem>
              <SelectItem value="true">Oui, orienté famille</SelectItem>
              <SelectItem value="false">Pas nécessairement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Active Filters Summary */}
        {(filters.religiousImportance.length > 0 || 
          filters.economicAutonomy.length > 0 || 
          filters.careerFamily.length > 0 ||
          filters.minCompatibilityScore > 50 ||
          filters.familyOriented !== null) && (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Filtres actifs:</Label>
            <div className="flex flex-wrap gap-1">
              {filters.minCompatibilityScore > 50 && (
                <Badge variant="secondary" className="text-xs">
                  Score ≥{filters.minCompatibilityScore}%
                </Badge>
              )}
              {filters.religiousImportance.map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {religiousOptions.find(opt => opt.value === item)?.label}
                </Badge>
              ))}
              {filters.economicAutonomy.map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {economicAutonomyOptions.find(opt => opt.value === item)?.label}
                </Badge>
              ))}
              {filters.careerFamily.map(item => (
                <Badge key={item} variant="secondary" className="text-xs">
                  {careerFamilyOptions.find(opt => opt.value === item)?.label}
                </Badge>
              ))}
              {filters.familyOriented !== null && (
                <Badge variant="secondary" className="text-xs">
                  {filters.familyOriented ? 'Orienté famille' : 'Pas orienté famille'}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={resetFilters}
          className="w-full"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Réinitialiser les filtres
        </Button>
      </CardContent>
    </Card>
  );
};

export default CompatibilityFilter;