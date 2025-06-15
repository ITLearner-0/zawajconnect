
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EducationSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education">Niveau d'Éducation</Label>
          <Input
            id="education"
            name="education"
            value={formData.education || ""}
            onChange={handleInputChange}
            placeholder="Entrez votre niveau d'éducation"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="occupation">Profession</Label>
          <Input
            id="occupation"
            name="occupation"
            value={formData.occupation || ""}
            onChange={handleInputChange}
            placeholder="Entrez votre profession"
          />
        </div>
      </div>
    </div>
  );
};

export default EducationSection;
