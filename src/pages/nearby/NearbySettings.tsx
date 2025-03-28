
import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import FilterPanel from "@/components/FilterPanel";
import { FilterCriteria } from "@/utils/location";
import { Filter } from "lucide-react";

interface NearbySettingsProps {
  maxDistance: number;
  setMaxDistance: (distance: number) => void;
  showCompatibility: boolean;
  setShowCompatibility: (show: boolean) => void;
  onApplyFilters: (filters: FilterCriteria) => void;
}

const NearbySettings = ({
  maxDistance,
  setMaxDistance,
  showCompatibility,
  setShowCompatibility,
  onApplyFilters
}: NearbySettingsProps) => {
  return (
    <div className="lg:col-span-1 space-y-6">
      <IslamicPattern variant="card" color="teal" className="overflow-hidden">
        <div className="bg-islamic-teal text-white p-4 flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          <h2 className="text-xl font-medium">Search Filters</h2>
        </div>
        <div className="p-6">
          <FilterPanel onApplyFilters={onApplyFilters} />
        </div>
      </IslamicPattern>
      
      <IslamicPattern variant="gradient" className="p-6 space-y-4">
        <Label className="mb-3 block font-medium text-islamic-teal">Maximum Distance: {maxDistance} km</Label>
        <Slider
          value={[maxDistance]}
          min={1}
          max={100}
          step={1}
          onValueChange={(value) => setMaxDistance(value[0])}
          className="py-4"
        />

        <div className="flex items-center justify-between pt-4 border-t border-islamic-sand">
          <Label htmlFor="showCompatibility" className="text-islamic-blue font-medium">Show Compatibility Scores</Label>
          <Switch
            id="showCompatibility"
            checked={showCompatibility}
            onCheckedChange={setShowCompatibility}
            disabled={!showCompatibility}
          />
        </div>
        
        {!showCompatibility && (
          <div className="text-sm text-islamic-burgundy bg-islamic-burgundy/10 p-3 rounded border border-islamic-burgundy/20 mt-2">
            Take the compatibility test to enable compatibility scoring
          </div>
        )}
      </IslamicPattern>
    </div>
  );
};

export default NearbySettings;
