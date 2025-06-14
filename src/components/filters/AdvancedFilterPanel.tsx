
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Target, AlertTriangle } from "lucide-react";
import { AdvancedFilters } from "@/hooks/compatibility/types/advancedFilterTypes";

interface AdvancedFilterPanelProps {
  filters: AdvancedFilters;
  onFiltersChange: (filters: AdvancedFilters) => void;
}

const DEALBREAKER_CATEGORIES = [
  "Religious Practice",
  "Family Values", 
  "Lifestyle",
  "Education & Career",
  "Personal Values"
];

const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({ filters, onFiltersChange }) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const updateLocationFilter = (updates: Partial<typeof filters.location>) => {
    onFiltersChange({
      ...filters,
      location: { ...filters.location, ...updates } as any
    });
  };

  const updateCompatibilityFilter = (updates: Partial<typeof filters.compatibilityScore>) => {
    onFiltersChange({
      ...filters,
      compatibilityScore: { ...filters.compatibilityScore, ...updates } as any
    });
  };

  const updateDealBreakerFilter = (updates: Partial<typeof filters.dealBreakers>) => {
    onFiltersChange({
      ...filters,
      dealBreakers: { ...filters.dealBreakers, ...updates } as any
    });
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lon: longitude });
          updateLocationFilter({ 
            latitude, 
            longitude,
            enabled: true 
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const toggleDealBreakerCategory = (category: string) => {
    const currentCategories = filters.dealBreakers?.categories || [];
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    updateDealBreakerFilter({ categories: newCategories });
  };

  return (
    <div className="space-y-4">
      {/* Location Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            Location Radius
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="location-enabled">Enable location filter</Label>
            <Switch
              id="location-enabled"
              checked={filters.location?.enabled || false}
              onCheckedChange={(enabled) => updateLocationFilter({ enabled })}
            />
          </div>
          
          {filters.location?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Radius: {filters.location?.radiusKm || 50} km</Label>
                <Slider
                  value={[filters.location?.radiusKm || 50]}
                  min={1}
                  max={500}
                  step={5}
                  onValueChange={(value) => updateLocationFilter({ radiusKm: value[0] })}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                className="w-full"
              >
                Use My Current Location
              </Button>
              
              {userLocation && (
                <div className="text-xs text-muted-foreground">
                  Location set: {userLocation.lat.toFixed(4)}, {userLocation.lon.toFixed(4)}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Compatibility Score Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="h-4 w-4" />
            Compatibility Score Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="score-enabled">Enable score filter</Label>
            <Switch
              id="score-enabled"
              checked={filters.compatibilityScore?.enabled || false}
              onCheckedChange={(enabled) => updateCompatibilityFilter({ enabled })}
            />
          </div>
          
          {filters.compatibilityScore?.enabled && (
            <div className="space-y-2">
              <Label>
                Score Range: {filters.compatibilityScore?.minScore || 0}% - {filters.compatibilityScore?.maxScore || 100}%
              </Label>
              <Slider
                value={[filters.compatibilityScore?.minScore || 0, filters.compatibilityScore?.maxScore || 100]}
                min={0}
                max={100}
                step={5}
                onValueChange={(value) => updateCompatibilityFilter({ 
                  minScore: value[0], 
                  maxScore: value[1] 
                })}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Deal-breaker Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4" />
            Deal-breaker Filter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="dealbreaker-enabled">Enable deal-breaker filter</Label>
            <Switch
              id="dealbreaker-enabled"
              checked={filters.dealBreakers?.enabled || false}
              onCheckedChange={(enabled) => updateDealBreakerFilter({ enabled })}
            />
          </div>
          
          {filters.dealBreakers?.enabled && (
            <>
              <div className="space-y-2">
                <Label>Filter Mode</Label>
                <Select
                  value={filters.dealBreakers?.strictMode ? "strict" : "flexible"}
                  onValueChange={(value) => updateDealBreakerFilter({ strictMode: value === "strict" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flexible">Flexible - Allow some deal-breakers</SelectItem>
                    <SelectItem value="strict">Strict - Exclude selected deal-breakers</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Categories to Filter</Label>
                <div className="flex flex-wrap gap-2">
                  {DEALBREAKER_CATEGORIES.map(category => (
                    <Badge
                      key={category}
                      variant={filters.dealBreakers?.categories?.includes(category) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleDealBreakerCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedFilterPanel;
