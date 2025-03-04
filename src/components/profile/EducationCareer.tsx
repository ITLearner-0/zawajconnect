
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";
import { FieldTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { fieldTooltips } from "@/utils/profileTooltips";

interface EducationCareerProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EducationCareer = ({ formData, handleChange }: EducationCareerProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-primary">Education & Career</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="education">Education Level</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.education} />
          </TooltipProvider>
        </div>
        <Input
          id="education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Highest education achieved"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="occupation">Occupation</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.occupation} />
          </TooltipProvider>
        </div>
        <Input
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Current occupation"
        />
      </div>
    </div>
  </div>
);

export default EducationCareer;
