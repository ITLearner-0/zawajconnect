
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";

interface EducationCareerProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EducationCareer = ({ formData, handleChange }: EducationCareerProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-primary">Education & Career</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="education">Education Level</Label>
        <Input
          id="education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Highest education achieved"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="occupation">Occupation</Label>
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
