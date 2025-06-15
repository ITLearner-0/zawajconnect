
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface BasicInfoSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (field: string, value: string) => {
    handleChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom Complet</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleInputChange}
            placeholder="Entrez votre nom complet"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age || ""}
            onChange={handleInputChange}
            placeholder="Votre âge"
            min="18"
            max="120"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Genre</Label>
          <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez votre genre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="female">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ""}
            onChange={handleInputChange}
            placeholder="Ville, Pays"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
