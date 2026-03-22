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
      Informations de base
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="fullName">Nom complet</Label>
          <TooltipProvider>
            <FieldTooltip content={fieldTooltips.fullName} />
          </TooltipProvider>
        </div>
        <Input
          id="fullName"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Entrez votre nom complet"
          aria-required="true"
          aria-describedby="fullName-description"
        />
        <p id="fullName-description" className="sr-only">
          Your legal first and last name as it appears on official documents
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="age">Âge</Label>
          <TooltipProvider>
            <FieldTooltip content={fieldTooltips.age} />
          </TooltipProvider>
        </div>
        <Input
          id="age"
          name="age"
          type="number"
          value={formData.age}
          onChange={handleChange}
          placeholder="Votre âge"
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
          <Label htmlFor="gender">Genre</Label>
          <TooltipProvider>
            <FieldTooltip content={fieldTooltips.gender} />
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
          <option value="">Sélectionnez le genre</option>
          <option value="male">Homme</option>
          <option value="female">Femme</option>
        </select>
        <p id="gender-description" className="sr-only">
          Please select your gender
        </p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center">
          <Label htmlFor="location">Localisation</Label>
          <TooltipProvider>
            <FieldTooltip content={fieldTooltips.location} />
          </TooltipProvider>
        </div>
        <Input
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ville, Pays"
          aria-required="true"
          aria-describedby="location-description"
        />
        <p id="location-description" className="sr-only">
          Your current city and country of residence
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="nationality">Nationalité</Label>
        <Input
          id="nationality"
          name="nationality"
          value={formData.nationality || ''}
          onChange={handleChange}
          placeholder="Ex: Franco-marocaine"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="motherTongue">Langue maternelle</Label>
        <Input
          id="motherTongue"
          name="motherTongue"
          value={formData.motherTongue || ''}
          onChange={handleChange}
          placeholder="Ex: Arabe, Français"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maritalStatus">Situation matrimoniale</Label>
        <select
          id="maritalStatus"
          name="maritalStatus"
          value={formData.maritalStatus || ''}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">Sélectionnez</option>
          <option value="celibataire">Célibataire</option>
          <option value="divorce">Divorcé(e)</option>
          <option value="veuf">Veuf/Veuve</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="hasChildren">Enfants</Label>
        <select
          id="hasChildren"
          name="hasChildren"
          value={formData.hasChildren || ''}
          onChange={handleChange}
          className="w-full h-10 px-3 rounded-md border border-input bg-background"
        >
          <option value="">Sélectionnez</option>
          <option value="false">Non</option>
          <option value="true">Oui</option>
        </select>
      </div>
    </div>
  </div>
);

export default BasicInformation;
