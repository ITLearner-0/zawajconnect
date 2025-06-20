
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileFormData } from "@/types/profile";

interface ReligiousSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof ProfileFormData, value: string) => void;
}

const ReligiousSection: React.FC<ReligiousSectionProps> = ({ formData, handleChange, handleSelectChange }) => {
  const religiousLevels = [
    { value: "tres_pratiquant", label: "Très pratiquant" },
    { value: "pratiquant", label: "Pratiquant" },
    { value: "modere", label: "Modéré" },
    { value: "peu_pratiquant", label: "Peu pratiquant" },
    { value: "en_apprentissage", label: "En apprentissage" }
  ];

  const prayerFrequencies = [
    { value: "5_fois", label: "5 fois par jour" },
    { value: "irregulier", label: "Irrégulier" },
    { value: "vendredi", label: "Vendredi seulement" },
    { value: "occasions", label: "Lors d'occasions spéciales" },
    { value: "rarement", label: "Rarement" }
  ];

  const polygamyOptionsForMen = [
    { value: "oui", label: "Oui, je souhaite pratiquer la polygamie" },
    { value: "peut_etre", label: "Peut-être, selon les circonstances" },
    { value: "non", label: "Non, je préfère la monogamie" }
  ];

  const polygamyOptionsForWomen = [
    { value: "accepte", label: "J'accepte la polygamie" },
    { value: "conditionnelle", label: "J'accepte sous certaines conditions" },
    { value: "refuse", label: "Je refuse la polygamie" }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pratique Religieuse</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="religiousLevel">Niveau de Pratique Religieuse</Label>
          <Select value={formData.religiousLevel || ""} onValueChange={(value) => handleSelectChange("religiousLevel", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre niveau de pratique" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              {religiousLevels.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prayerFrequency">Fréquence de Prière</Label>
          <Select value={formData.prayerFrequency || ""} onValueChange={(value) => handleSelectChange("prayerFrequency", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre fréquence de prière" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              {prayerFrequencies.map((frequency) => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Question sur la polygamie selon le genre */}
      {formData.gender && (
        <div className="space-y-2">
          <Label htmlFor="polygamyStance">
            {formData.gender === "male" 
              ? "Souhaitez-vous pratiquer la polygamie ?" 
              : "Acceptez-vous la polygamie ?"}
          </Label>
          <Select value={formData.polygamyStance || ""} onValueChange={(value) => handleSelectChange("polygamyStance", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder={
                formData.gender === "male" 
                  ? "Sélectionnez votre position sur la polygamie" 
                  : "Sélectionnez votre position sur la polygamie"
              } />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              {(formData.gender === "male" ? polygamyOptionsForMen : polygamyOptionsForWomen).map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="familyBackground">Contexte Familial</Label>
        <Input
          id="familyBackground"
          name="familyBackground"
          value={formData.familyBackground || ""}
          onChange={handleChange}
          placeholder="Décrivez votre contexte familial"
          className="w-full"
        />
      </div>
    </div>
  );
};

export default ReligiousSection;
