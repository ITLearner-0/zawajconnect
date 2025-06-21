
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileFormData } from "@/types/profile";

interface WaliSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectChange: (field: keyof ProfileFormData, value: string) => void;
}

const WaliSection: React.FC<WaliSectionProps> = ({ formData, handleChange, handleSelectChange }) => {
  // Only show Wali section for female users
  if (formData.gender !== "female") {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informations du Wali</h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="waliName">Nom du Wali</Label>
          <Input
            id="waliName"
            name="waliName"
            value={formData.waliName || ""}
            onChange={handleChange}
            placeholder="Entrez le nom de votre wali"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waliRelationship">Relation</Label>
          <Select value={formData.waliRelationship || ""} onValueChange={(value) => handleSelectChange("waliRelationship", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez la relation" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              <SelectItem value="father">Père</SelectItem>
              <SelectItem value="brother">Frère</SelectItem>
              <SelectItem value="uncle">Oncle</SelectItem>
              <SelectItem value="grandfather">Grand-père</SelectItem>
              <SelectItem value="other">Autre parent masculin</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="waliContact">Contact du Wali</Label>
          <Input
            id="waliContact"
            name="waliContact"
            value={formData.waliContact || ""}
            onChange={handleChange}
            placeholder="Numéro de contact du wali"
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default WaliSection;
