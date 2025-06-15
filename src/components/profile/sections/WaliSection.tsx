
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WaliSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const WaliSection: React.FC<WaliSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (field: string, value: string) => {
    handleChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="waliName">Nom du Wali</Label>
        <Input
          id="waliName"
          name="waliName"
          value={formData.waliName || ""}
          onChange={handleInputChange}
          placeholder="Entrez le nom de votre wali"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="waliRelationship">Relation</Label>
        <Select value={formData.waliRelationship || ""} onValueChange={(value) => handleSelectChange("waliRelationship", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la relation" />
          </SelectTrigger>
          <SelectContent>
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
          onChange={handleInputChange}
          placeholder="Numéro de contact du wali"
        />
      </div>
    </div>
  );
};

export default WaliSection;
