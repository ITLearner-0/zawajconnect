
import React from "react";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface AgeRangeFilterProps {
  ageRange: [number, number];
  setAgeRange: (value: [number, number]) => void;
}

const AgeRangeFilter: React.FC<AgeRangeFilterProps> = ({ ageRange, setAgeRange }) => {
  return (
    <div className="space-y-3">
      <Label>Age Range: {ageRange[0]} - {ageRange[1]}</Label>
      <Slider 
        value={ageRange} 
        min={18} 
        max={80} 
        step={1} 
        onValueChange={(value) => setAgeRange(value as [number, number])} 
      />
    </div>
  );
};

export default AgeRangeFilter;
