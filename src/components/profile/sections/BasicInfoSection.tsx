import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProfileFormData } from '@/types/profile';

interface BasicInfoSectionProps {
  formData: ProfileFormData;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (field: keyof ProfileFormData, value: string) => void;
}

const BasicInfoSection: React.FC<BasicInfoSectionProps> = ({
  formData,
  handleChange,
  handleSelectChange,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Informations de Base</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Nom Complet</Label>
          <Input
            id="fullName"
            name="fullName"
            value={formData.fullName || ''}
            onChange={handleChange}
            placeholder="Votre nom complet"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="age">Âge</Label>
          <Input
            id="age"
            name="age"
            type="number"
            value={formData.age || ''}
            onChange={handleChange}
            placeholder="Votre âge"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">Genre</Label>
          <Select
            value={formData.gender || ''}
            onValueChange={(value) => handleSelectChange('gender', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez votre genre" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              <SelectItem value="male">Homme</SelectItem>
              <SelectItem value="female">Femme</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">Localisation</Label>
          <Input
            id="location"
            name="location"
            value={formData.location || ''}
            onChange={handleChange}
            placeholder="Votre ville/région"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="nationality">Nationalité</Label>
          <Input
            id="nationality"
            name="nationality"
            value={formData.nationality || ''}
            onChange={handleChange}
            placeholder="Ex: Française, Marocaine..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="motherTongue">Langue maternelle</Label>
          <Input
            id="motherTongue"
            name="motherTongue"
            value={formData.motherTongue || ''}
            onChange={handleChange}
            placeholder="Ex: Arabe, Français..."
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="hasChildren">Enfants</Label>
          <Select
            value={formData.hasChildren || ''}
            onValueChange={(value) => handleSelectChange('hasChildren', value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Avez-vous des enfants ?" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 border shadow-lg z-50">
              <SelectItem value="no">Non</SelectItem>
              <SelectItem value="yes_living_together">Oui, vivent avec moi</SelectItem>
              <SelectItem value="yes_not_living_together">Oui, ne vivent pas avec moi</SelectItem>
              <SelectItem value="prefer_not_to_say">Préfère ne pas dire</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="familyBackground">Contexte Familial</Label>
        <Textarea
          id="familyBackground"
          name="familyBackground"
          value={formData.familyBackground || ''}
          onChange={handleChange}
          placeholder="Décrivez votre contexte familial"
          rows={6}
          className="min-h-[200px] w-full resize-vertical"
        />
        <p className="text-sm text-muted-foreground">
          Décrivez votre famille, vos valeurs familiales et votre environnement
        </p>
      </div>
    </div>
  );
};

export default BasicInfoSection;
