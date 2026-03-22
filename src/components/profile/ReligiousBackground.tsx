import { Label } from '@/components/ui/label';
import { ProfileFormData } from '@/types/profile';
import { FieldTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { fieldTooltips } from '@/utils/profileTooltips';
import MadhabField from './MadhabField';

interface ReligiousBackgroundProps {
  formData: ProfileFormData;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

const ReligiousBackground = ({ formData, handleChange }: ReligiousBackgroundProps) => {
  const handleMadhabChange = (value: string) => {
    const event = {
      target: {
        name: 'madhab',
        value: value,
      },
    } as React.ChangeEvent<HTMLSelectElement>;
    handleChange(event);
  };

  return (
    <div className="space-y-4">
      <h2 id="religious-background-heading" className="text-xl font-semibold text-primary">
        Parcours religieux
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="religiousLevel">Niveau de pratique religieuse</Label>
            <TooltipProvider>
              <FieldTooltip content={fieldTooltips.religiousLevel} />
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
            <option value="learning">En apprentissage</option>
          </select>
          <p id="religiousLevel-description" className="sr-only">
            How you would describe your level of religious practice
          </p>
        </div>

        <MadhabField value={formData.madhab || ''} onChange={handleMadhabChange} />

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="prayerFrequency">Fréquence de prière</Label>
            <TooltipProvider>
              <FieldTooltip content={fieldTooltips.prayerFrequency} />
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
            <option value="five-daily">Cinq prières quotidiennes</option>
            <option value="regular">Régulier mais pas les cinq</option>
            <option value="sometimes">Parfois</option>
            <option value="learning">En apprentissage</option>
          </select>
          <p id="prayerFrequency-description" className="sr-only">
            How frequently you perform prayers
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="familyBackground">Contexte familial</Label>
            <TooltipProvider>
              <FieldTooltip content={fieldTooltips.familyBackground} />
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
            Information about your family's cultural and religious background
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReligiousBackground;
