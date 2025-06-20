
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormData } from "@/types/profile";

interface AboutSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ formData, handleChange }) => {
  console.log("AboutSection rendering with aboutMe:", formData.aboutMe);
  
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">À Propos de Moi</h3>
      <div className="space-y-2">
        <Label htmlFor="aboutMe">Parlez-nous de vous</Label>
        <Textarea
          id="aboutMe"
          name="aboutMe"
          value={formData.aboutMe || ""}
          onChange={handleChange}
          placeholder="Parlez-nous de vous, vos intérêts et ce que vous recherchez..."
          rows={6}
          className="min-h-[200px] w-full resize-vertical"
        />
        <p className="text-sm text-muted-foreground">
          Minimum 10 caractères requis
        </p>
      </div>
    </div>
  );
};

export default AboutSection;
