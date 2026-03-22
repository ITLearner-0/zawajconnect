import { Label } from '@/components/ui/label';
import { ProfileFormData } from '@/types/profile';
import { FieldTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { fieldTooltips } from '@/utils/profileTooltips';

interface AboutMeProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const AboutMe = ({ formData, handleChange }: AboutMeProps) => (
  <div className="space-y-4">
    <h2
      id="about-me-heading"
      className="text-xl font-semibold text-islamic-teal dark:text-islamic-cream"
    >
      À Propos de Moi
    </h2>
    <div className="space-y-2">
      <div className="flex items-center">
        <Label htmlFor="aboutMe" className="text-islamic-burgundy dark:text-islamic-cream/90">
          Parlez-nous de vous
        </Label>
        <TooltipProvider>
          <FieldTooltip content={fieldTooltips.aboutMe} />
        </TooltipProvider>
      </div>
      <textarea
        id="aboutMe"
        name="aboutMe"
        value={formData.aboutMe}
        onChange={handleChange}
        placeholder="Partagez-en plus sur vous-même, vos intérêts et ce que vous recherchez"
        className="w-full min-h-[150px] px-3 py-2 rounded-md border border-islamic-teal/30 bg-white dark:bg-islamic-darkCard/80 dark:border-islamic-darkTeal/30 dark:text-islamic-cream"
        aria-describedby="aboutMe-description"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>Minimum 50 caractères</span>
        <span className={formData.aboutMe && formData.aboutMe.length >= 50 ? 'text-green-600' : 'text-gray-500'}>
          {formData.aboutMe ? formData.aboutMe.length : 0} / 50
        </span>
      </div>
      <p id="aboutMe-description" className="sr-only">
        Décrivez-vous, vos intérêts, hobbies, valeurs et ce que vous recherchez chez un partenaire
      </p>
    </div>
  </div>
);

export default AboutMe;
