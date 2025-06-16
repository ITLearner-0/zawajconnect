
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";
import { FieldTooltip, TooltipProvider } from "@/components/ui/tooltip";
import { fieldTooltips } from "@/utils/profileTooltips";

interface ReligiousBackgroundProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ReligiousBackground = ({ formData, handleChange }: ReligiousBackgroundProps) => (
  <div className="space-y-4">
    <h2 id="religious-background-heading" className="text-xl font-semibold text-primary">Pratique Religieuse</h2>
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="religiousLevel">Niveau de Pratique Religieuse</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.religiousLevel} />
          </TooltipProvider>
        </div>
        <select
          id="religiousLevel"
          name="religiousLevel"
          value={formData.religiousLevel}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
          aria-describedby="religiousLevel-description"
        >
          <option value="">Sélectionnez le niveau</option>
          <option value="very-practicing">Très pratiquant</option>
          <option value="practicing">Pratiquant</option>
          <option value="moderately-practicing">Modérément pratiquant</option>
          <option value="learning">Apprend l'Islam</option>
        </select>
        <p id="religiousLevel-description" className="sr-only">
          Comment vous décrivez votre niveau de pratique religieuse
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="prayerFrequency">Fréquence de Prière</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.prayerFrequency} />
          </TooltipProvider>
        </div>
        <select
          id="prayerFrequency"
          name="prayerFrequency"
          value={formData.prayerFrequency}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
          aria-describedby="prayerFrequency-description"
        >
          <option value="five-daily">Cinq fois par jour</option>
          <option value="regular">Régulièrement mais pas les cinq</option>
          <option value="sometimes">Parfois</option>
          <option value="learning">Apprend à prier</option>
        </select>
        <p id="prayerFrequency-description" className="sr-only">
          À quelle fréquence vous effectuez vos prières
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="familyBackground">Contexte Familial</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.familyBackground} />
          </TooltipProvider>
        </div>
        <textarea
          id="familyBackground"
          name="familyBackground"
          value={formData.familyBackground}
          onChange={handleChange}
          placeholder="Partagez des informations sur votre contexte familial"
          className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
          aria-describedby="familyBackground-description"
        />
        <p id="familyBackground-description" className="sr-only">
          Informations sur le contexte culturel et religieux de votre famille
        </p>
      </div>
    </div>
  </div>
);

export default ReligiousBackground;
