
import React from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface AboutSectionProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
}

const AboutSection: React.FC<AboutSectionProps> = ({ formData, handleChange }) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleChange(e.target.name, e.target.value);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="aboutMe">À Propos de Moi</Label>
        <Textarea
          id="aboutMe"
          name="aboutMe"
          value={formData.aboutMe || ""}
          onChange={handleInputChange}
          placeholder="Parlez-nous de vous..."
          rows={4}
          className="min-h-[150px]"
        />
      </div>
    </div>
  );
};

export default AboutSection;
