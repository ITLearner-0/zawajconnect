
import { Label } from "@/components/ui/label";
import { ProfileFormData } from "@/types/profile";

interface ReligiousBackgroundProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const ReligiousBackground = ({ formData, handleChange }: ReligiousBackgroundProps) => (
  <div className="space-y-4">
    <h2 className="text-xl font-semibold text-primary">Religious Background</h2>
    <div className="grid grid-cols-1 gap-4">
      <div className="space-y-2">
        <Label htmlFor="religiousLevel">Religious Practice Level</Label>
        <select
          id="religiousLevel"
          name="religiousLevel"
          value={formData.religiousLevel}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">Select level</option>
          <option value="very-practicing">Very practicing</option>
          <option value="practicing">Practicing</option>
          <option value="moderately-practicing">Moderately practicing</option>
          <option value="learning">Learning more about Islam</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="prayerFrequency">Prayer Frequency</Label>
        <select
          id="prayerFrequency"
          name="prayerFrequency"
          value={formData.prayerFrequency}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="five-daily">Five times daily</option>
          <option value="regular">Regular but not all five</option>
          <option value="sometimes">Sometimes</option>
          <option value="learning">Learning to pray</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="familyBackground">Family Background</Label>
        <textarea
          id="familyBackground"
          name="familyBackground"
          value={formData.familyBackground}
          onChange={handleChange}
          placeholder="Share about your family background"
          className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
        />
      </div>
    </div>
  </div>
);

export default ReligiousBackground;
