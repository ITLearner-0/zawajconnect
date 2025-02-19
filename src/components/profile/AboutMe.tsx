
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";

interface AboutMeProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AboutMe = ({ formData, handleChange }: AboutMeProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-primary">About Me</h2>
    <div className="space-y-2">
      <Label htmlFor="aboutMe">Tell us about yourself</Label>
      <textarea
        id="aboutMe"
        name="aboutMe"
        value={formData.aboutMe}
        onChange={handleChange}
        placeholder="Share more about yourself, your interests, and what you're looking for"
        className="w-full min-h-[150px] px-3 py-2 rounded-md border border-input bg-background"
      />
    </div>
  </div>
);

export default AboutMe;
