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
        Religious Background
      </h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="religiousLevel">Religious Practice Level</Label>
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
            <option value="">Select level</option>
            <option value="very-practicing">Very practicing</option>
            <option value="practicing">Practicing</option>
            <option value="moderately-practicing">Moderately practicing</option>
            <option value="learning">Learning more about Islam</option>
          </select>
          <p id="religiousLevel-description" className="sr-only">
            How you would describe your level of religious practice
          </p>
        </div>

        <MadhabField value={formData.madhab || ''} onChange={handleMadhabChange} />

        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="prayerFrequency">Prayer Frequency</Label>
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
            <option value="five-daily">Five times daily</option>
            <option value="regular">Regular but not all five</option>
            <option value="sometimes">Sometimes</option>
            <option value="learning">Learning to pray</option>
          </select>
          <p id="prayerFrequency-description" className="sr-only">
            How frequently you perform prayers
          </p>
        </div>
        <div className="space-y-2">
          <div className="flex items-center">
            <Label htmlFor="familyBackground">Family Background</Label>
            <TooltipProvider>
              <FieldTooltip content={fieldTooltips.familyBackground} />
            </TooltipProvider>
          </div>
          <textarea
            id="familyBackground"
            name="familyBackground"
            value={formData.familyBackground}
            onChange={handleChange}
            placeholder="Share about your family background"
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
