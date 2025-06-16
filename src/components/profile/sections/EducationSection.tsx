
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EducationSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const EducationSection: React.FC<EducationSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (value: string) => {
    handleChange("education", value);
  };

  const educationLevels = [
    { value: "brevet", label: "Brevet des collèges" },
    { value: "cap_bep", label: "CAP/BEP" },
    { value: "bac", label: "Baccalauréat" },
    { value: "bac_2", label: "Bac+2 (BTS, DUT, DEUST)" },
    { value: "bac_3", label: "Bac+3 (Licence, Bachelor)" },
    { value: "bac_4", label: "Bac+4 (Maîtrise)" },
    { value: "bac_5", label: "Bac+5 (Master, Ingénieur)" },
    { value: "bac_8", label: "Bac+8 (Doctorat, PhD)" },
    { value: "autre", label: "Autre" }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="education">Niveau d'Éducation</Label>
          <Select value={formData.education || ""} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre niveau d'éducation" />
            </SelectTrigger>
            <SelectContent>
              {educationLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
