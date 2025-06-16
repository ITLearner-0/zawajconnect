
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
    <h2 id="education-career-heading" className="text-xl font-semibold text-islamic-teal dark:text-islamic-cream">Éducation et Carrière</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="education" className="text-islamic-burgundy dark:text-islamic-cream/90">Niveau d'Éducation</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.education} />
          </TooltipProvider>
        </div>
        <Input
          id="education"
          name="education"
          value={formData.education}
          onChange={handleChange}
          placeholder="Plus haut niveau d'éducation atteint"
          aria-describedby="education-description"
          className="border-islamic-teal/30 dark:border-islamic-darkTeal/30 dark:bg-islamic-darkCard/80 dark:text-islamic-cream"
        />
        <p id="education-description" className="sr-only">
          Votre plus haut niveau d'éducation complété, comme lycée, licence, master, etc.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="occupation" className="text-islamic-burgundy dark:text-islamic-cream/90">Profession</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.occupation} />
          </TooltipProvider>
        </div>
        <Input
          id="occupation"
          name="occupation"
          value={formData.occupation}
          onChange={handleChange}
          placeholder="Profession actuelle"
          aria-describedby="occupation-description"
          className="border-islamic-teal/30 dark:border-islamic-darkTeal/30 dark:bg-islamic-darkCard/80 dark:text-islamic-cream"
        />
        <p id="occupation-description" className="sr-only">
          Votre titre de poste ou profession actuel
        </p>
      </div>
    </div>
  </div>
);

export default EducationCareer;
