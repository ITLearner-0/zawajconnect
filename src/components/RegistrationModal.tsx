import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, User, BookOpen, Check } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    age: '',
    city: '',
    profession: '',
    practiceLevel: '',
    prayerFrequency: '',
    hijabWearing: '',
    islamicEducation: '',
    agePreference: '',
    locationPreference: '',
    educationPreference: '',
    bio: ''
  });

  const totalSteps = 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1);
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
    onClose();
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Informations Personnelles</h3>
        <p className="text-muted-foreground">Parlez-nous de vous</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName" className="text-foreground">Prénom *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Votre prénom"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="age" className="text-foreground">Âge *</Label>
          <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionnez votre âge" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 43 }, (_, i) => i + 18).map(age => (
                <SelectItem key={age} value={age.toString()}>{age} ans</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-foreground">Ville *</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Paris, Lyon, Marseille..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="profession" className="text-foreground">Profession</Label>
          <Input
            id="profession"
            value={formData.profession}
            onChange={(e) => handleInputChange('profession', e.target.value)}
            placeholder="Votre profession"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Pratique Religieuse</h3>
        <p className="text-muted-foreground">Aidez-nous à vous matcher avec des profils compatibles</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-foreground">Niveau de pratique *</Label>
          <Select value={formData.practiceLevel} onValueChange={(value) => handleInputChange('practiceLevel', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionnez votre niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="practicing">Pratiquant(e)</SelectItem>
              <SelectItem value="very-practicing">Très pratiquant(e)</SelectItem>
              <SelectItem value="learning">En apprentissage</SelectItem>
              <SelectItem value="moderate">Modéré(e)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Fréquence des prières *</Label>
          <Select value={formData.prayerFrequency} onValueChange={(value) => handleInputChange('prayerFrequency', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choisissez une option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5-times">5 fois par jour</SelectItem>
              <SelectItem value="regularly">Régulièrement</SelectItem>
              <SelectItem value="sometimes">Parfois</SelectItem>
              <SelectItem value="learning">J'apprends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Port du hijab (pour les sœurs)</Label>
          <Select value={formData.hijabWearing} onValueChange={(value) => handleInputChange('hijabWearing', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Sélectionnez une option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="always">Toujours</SelectItem>
              <SelectItem value="most-times">La plupart du temps</SelectItem>
              <SelectItem value="sometimes">Parfois</SelectItem>
              <SelectItem value="not-applicable">Non applicable</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Éducation islamique</Label>
          <Select value={formData.islamicEducation} onValueChange={(value) => handleInputChange('islamicEducation', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Votre niveau d'études islamiques" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Connaissances de base</SelectItem>
              <SelectItem value="intermediate">Niveau intermédiaire</SelectItem>
              <SelectItem value="advanced">Niveau avancé</SelectItem>
              <SelectItem value="scholar">Études approfondies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-4">
          <Heart className="h-6 w-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-foreground">Vos Préférences</h3>
        <p className="text-muted-foreground">Décrivez votre partenaire idéal</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-foreground">Âge souhaité</Label>
          <Select value={formData.agePreference} onValueChange={(value) => handleInputChange('agePreference', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Tranche d'âge préférée" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="18-25">18-25 ans</SelectItem>
              <SelectItem value="25-30">25-30 ans</SelectItem>
              <SelectItem value="30-35">30-35 ans</SelectItem>
              <SelectItem value="35-40">35-40 ans</SelectItem>
              <SelectItem value="40+">40+ ans</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Localisation préférée</Label>
          <Input
            value={formData.locationPreference}
            onChange={(e) => handleInputChange('locationPreference', e.target.value)}
            placeholder="Région, ville ou pays"
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-foreground">Niveau d'éducation souhaité</Label>
          <Select value={formData.educationPreference} onValueChange={(value) => handleInputChange('educationPreference', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Niveau d'études préféré" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Peu importe</SelectItem>
              <SelectItem value="high-school">Lycée</SelectItem>
              <SelectItem value="bachelor">License/Bachelor</SelectItem>
              <SelectItem value="master">Master</SelectItem>
              <SelectItem value="phd">Doctorat</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="bio" className="text-foreground">Présentez-vous</Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Parlez de vous, vos passions, vos objectifs..."
            className="mt-1 min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formData.bio.length}/500 caractères
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-foreground">
            Rejoignez Notre Communauté
          </DialogTitle>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            {Array.from({ length: totalSteps }, (_, i) => (
              <div key={i} className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  step > i + 1 
                    ? 'bg-emerald text-white' 
                    : step === i + 1 
                    ? 'bg-emerald text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-1 w-12 mx-2 rounded-full transition-all ${
                    step > i + 1 ? 'bg-emerald' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-1 mt-2">
            <Badge variant="outline" className="text-xs">
              Étape {step} sur {totalSteps}
            </Badge>
          </div>
        </DialogHeader>

        <div className="mt-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        <div className="flex justify-between mt-8 pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={step === 1}
            className="px-6"
          >
            Précédent
          </Button>
          
          {step < totalSteps ? (
            <Button 
              onClick={handleNext}
              className="bg-gradient-to-r from-emerald to-emerald-light text-white px-6"
            >
              Suivant
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-emerald to-emerald-light text-white px-6"
            >
              Créer Mon Profil
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;