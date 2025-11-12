import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileFormData } from '@/types/profile';
import { FieldTooltip, TooltipProvider } from '@/components/ui/tooltip';
import { fieldTooltips } from '@/utils/profileTooltips';

interface BasicInformationProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const BasicInformation = ({ formData, handleChange }: BasicInformationProps) => (
  <div className="space-y-4">
    <h2 id="basic-info-heading" className="text-xl font-semibold text-primary">
      Basic Information
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="fullName">Full Name</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.fullName} />
          </TooltipProvider>
        </div>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          aria-required="true"
          aria-describedby="fullName-description"
        />
        <p id="fullName-description" className="sr-only">
          Your legal first and last name as it appears on official documents
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="age">Age</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.age} />
          </TooltipProvider>
        </div>
        <Input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="Your age"
          aria-required="true"
          min="18"
          max="120"
          aria-describedby="age-description"
        />
        <p id="age-description" className="sr-only">
          Your current age in years. Must be at least 18.
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="gender">Gender</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.gender} />
          </TooltipProvider>
        </div>
        <select
          id="gender"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
          aria-required="true"
          aria-describedby="gender-description"
        >
          <option value="">Select gender</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        <p id="gender-description" className="sr-only">
          Please select your gender
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="location">Location</Label>
          <TooltipProvider>
            <FieldTooltip text={fieldTooltips.location} />
          </TooltipProvider>
        </div>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="City, Country"
          aria-required="true"
          aria-describedby="location-description"
        />
        <p id="location-description" className="sr-only">
          Your current city and country of residence
        </p>
      </div>
    </div>
  </div>
);

export default BasicInformation;
