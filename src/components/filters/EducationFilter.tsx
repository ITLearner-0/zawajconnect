
import React from "react";
import { Label } from "@/components/ui/label";

interface EducationFilterProps {
  selectedLevels: string[];
  toggleLevel: (level: string) => void;
}

const EDUCATION_LEVELS = ["High School", "Bachelor's", "Master's", "PhD", "Islamic Studies"];

const EducationFilter: React.FC<EducationFilterProps> = ({ 
  selectedLevels, 
  toggleLevel 
}) => {
  return (
    <div className="space-y-3">
      <Label>Education</Label>
      <div className="flex flex-wrap gap-2">
        {EDUCATION_LEVELS.map(level => (
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

export default EducationFilter;
