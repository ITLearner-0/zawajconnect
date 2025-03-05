
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";
import { FieldTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { fieldTooltips } from "@/utils/profileTooltips";

interface AboutMeProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AboutMe = ({ formData, handleChange }: AboutMeProps) => (
  <div className="space-y-4">
    <h2 id="about-me-heading" className="text-xl font-semibold text-islamic-teal dark:text-islamic-cream">About Me</h2>
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="aboutMe" className="text-islamic-burgundy dark:text-islamic-cream/90">Tell us about yourself</Label>
        <TooltipProvider>
          <FieldTooltip text={fieldTooltips.aboutMe} />
        </TooltipProvider>
      </div>
      <textarea
        id="aboutMe"
        name="aboutMe"
        value={formData.aboutMe}
        onChange={handleChange}
        placeholder="Share more about yourself, your interests, and what you're looking for"
        className="w-full min-h-[150px] px-3 py-2 rounded-md border border-islamic-teal/30 bg-white dark:bg-islamic-darkCard/80 dark:border-islamic-darkTeal/30 dark:text-islamic-cream"
        aria-describedby="aboutMe-description"
      />
      <p id="aboutMe-description" className="sr-only">
        Describe yourself, your interests, hobbies, values, and what you're looking for in a partner
      </p>
    </div>
  </div>
);

export default AboutMe;
