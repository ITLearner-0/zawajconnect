
import React from "react";
import { Label } from "@/components/ui/label";

interface PracticeLevelFilterProps {
  selectedLevels: string[];
  toggleLevel: (level: string) => void;
}

const PRACTICE_LEVELS = ["Beginner", "Intermediate", "Advanced", "Very Practicing"];

const PracticeLevelFilter: React.FC<PracticeLevelFilterProps> = ({ 
  selectedLevels, 
  toggleLevel 
}) => {
  return (
    <div className="space-y-3">
      <Label>Practice Level</Label>
      <div className="flex flex-wrap gap-2">
        {PRACTICE_LEVELS.map(level => (
          <button
            key={level}
            className={`px-3 py-1 rounded-full text-sm ${
              selectedLevels.includes(level)
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            }`}
            onClick={() => toggleLevel(level)}
          >
            {level}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PracticeLevelFilter;
