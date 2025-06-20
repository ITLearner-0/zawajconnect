
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileFormData } from "@/types/profile";

interface BasicInfoSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleSelectChange: (field: keyof ProfileFormData, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({ formData, handleChange, handleSelectChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informations de Base</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom Complet</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName || ""}
            onChange={handleChange}
            placeholder="Entrez votre nom complet"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age || ""}
            onChange={handleChange}
            placeholder="Votre âge"
            min="18"
            max="120"
            className="w-full"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="gender">Genre</Label>
          <Select value={formData.gender || ""} onValueChange={(value) => handleSelectChange("gender", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre genre" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
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
            onChange={handleChange}
            placeholder="Ville, Pays"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default BasicInfoSection;
