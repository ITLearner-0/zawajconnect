
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ProfileFormData } from "@/types/profile";

interface AboutSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ formData, handleChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="aboutMe">À Propos de Moi</Label>
        <Textarea
          id="aboutMe"
          name="aboutMe"
          value={formData.aboutMe || ""}
          onChange={handleChange}
          placeholder="Parlez-nous de vous..."
          rows={4}
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
};

export default AboutSection;
