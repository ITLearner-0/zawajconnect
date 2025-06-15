
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ReligiousSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const ReligiousSection: React.FC<ReligiousSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  const handleSelectChange = (field: string, value: string) => {
    handleChange(field, value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="religiousLevel">Niveau de Pratique Religieuse</Label>
        <Select value={formData.religiousLevel || ""} onValueChange={(value) => handleSelectChange("religiousLevel", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez votre niveau" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="very-practicing">Très pratiquant</SelectItem>
            <SelectItem value="practicing">Pratiquant</SelectItem>
            <SelectItem value="moderately-practicing">Modérément pratiquant</SelectItem>
            <SelectItem value="learning">Apprend l'Islam</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="prayerFrequency">Fréquence de Prière</Label>
        <Select value={formData.prayerFrequency || ""} onValueChange={(value) => handleSelectChange("prayerFrequency", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez la fréquence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="five-daily">Cinq fois par jour</SelectItem>
            <SelectItem value="regular">Régulière mais pas les cinq</SelectItem>
            <SelectItem value="sometimes">Parfois</SelectItem>
            <SelectItem value="learning">Apprend à prier</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="familyBackground">Contexte Familial</Label>
        <Textarea
          id="familyBackground"
          name="familyBackground"
          value={formData.familyBackground || ""}
          onChange={handleInputChange}
          placeholder="Partagez votre contexte familial"
          className="min-h-[100px]"
        />
      </div>
    </div>
  );
};

export default ReligiousSection;
