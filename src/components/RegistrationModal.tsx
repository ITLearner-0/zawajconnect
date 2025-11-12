import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, User, BookOpen, Check, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  registrationStep1Schema,
  registrationStep2Schema,
  registrationStep3Schema,
} from '@/lib/validation';
import { z } from 'zod';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal = ({ isOpen, onClose }: RegistrationModalProps) => {
  const [step, setStep] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [confirmedAge, setConfirmedAge] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
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
    bio: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const totalSteps = 3;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Clear previous errors
    setFormErrors({});

    // Validate current step before proceeding
    try {
      if (step === 1) {
        registrationStep1Schema.parse({
          firstName: formData.firstName,
          age: formData.age,
          city: formData.city,
          profession: formData.profession,
        });
      } else if (step === 2) {
        registrationStep2Schema.parse({
          practiceLevel: formData.practiceLevel,
          prayerFrequency: formData.prayerFrequency,
          hijabWearing: formData.hijabWearing,
          islamicEducation: formData.islamicEducation,
        });
      }

      if (step < totalSteps) setStep(step + 1);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFormErrors(errors);

        toast({
          title: 'Données invalides',
          description: 'Veuillez corriger les erreurs avant de continuer',
          variant: 'destructive',
        });
      }
    }
  };

  const handlePrevious = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = () => {
    setFormErrors({});
    setAttemptedSubmit(true);

    // Vérifier consentement AVANT validation du formulaire
    if (!agreedToTerms || !confirmedAge) {
      toast({
        title: 'Consentement requis',
        description: 'Vous devez accepter les CGU et confirmer votre âge',
        variant: 'destructive',
      });
      return;
    }

    // Validate final step
    try {
      registrationStep3Schema.parse({
        agePreference: formData.agePreference,
        locationPreference: formData.locationPreference,
        educationPreference: formData.educationPreference,
        bio: formData.bio,
      });

      // If validation passes, proceed with submission
      toast({
        title: 'Profil créé !',
        description: 'Votre profil a été créé avec succès. Bienvenue !',
      });

      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFormErrors(errors);

        toast({
          title: 'Données invalides',
          description: 'Veuillez corriger les erreurs avant de continuer',
          variant: 'destructive',
        });
      }
    }
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
          <Label htmlFor="firstName" className="text-foreground">
            Prénom *
          </Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            placeholder="Votre prénom"
            maxLength={100}
            className={`mt-1 ${formErrors.firstName ? 'border-red-500' : ''}`}
          />
          {formErrors.firstName && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">{formErrors.firstName}</span>
            </div>
          )}
        </div>
        <div>
          <Label htmlFor="age" className="text-foreground">
            Âge *
          </Label>
          <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
            <SelectTrigger className={`mt-1 ${formErrors.age ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Sélectionnez votre âge" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 43 }, (_, i) => i + 18).map((age) => (
                <SelectItem key={age} value={age.toString()}>
                  {age} ans
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.age && (
            <div className="flex items-center gap-1 mt-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-500">{formErrors.age}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city" className="text-foreground">
            Ville *
          </Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            placeholder="Paris, Lyon, Marseille..."
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="profession" className="text-foreground">
            Profession
          </Label>
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
        <p className="text-muted-foreground">
          Aidez-nous à vous matcher avec des profils compatibles
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label className="text-foreground">Niveau de pratique *</Label>
          <Select
            value={formData.practiceLevel}
            onValueChange={(value) => handleInputChange('practiceLevel', value)}
          >
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
          <Select
            value={formData.prayerFrequency}
            onValueChange={(value) => handleInputChange('prayerFrequency', value)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choisissez une option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5_times_daily">5 fois par jour</SelectItem>
              <SelectItem value="often">Régulièrement</SelectItem>
              <SelectItem value="sometimes">Parfois</SelectItem>
              <SelectItem value="learning">J'apprends</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-foreground">Port du hijab (pour les sœurs)</Label>
          <Select
            value={formData.hijabWearing}
            onValueChange={(value) => handleInputChange('hijabWearing', value)}
          >
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
          <Select
            value={formData.islamicEducation}
            onValueChange={(value) => handleInputChange('islamicEducation', value)}
          >
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
          <Select
            value={formData.agePreference}
            onValueChange={(value) => handleInputChange('agePreference', value)}
          >
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
          <Select
            value={formData.educationPreference}
            onValueChange={(value) => handleInputChange('educationPreference', value)}
          >
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
          <Label htmlFor="bio" className="text-foreground">
            Présentez-vous
          </Label>
          <Textarea
            id="bio"
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder="Parlez de vous, vos passions, vos objectifs..."
            className="mt-1 min-h-[100px]"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground mt-1">{formData.bio.length}/500 caractères</p>
        </div>

        {/* Consentement CGU - OBLIGATOIRE */}
        <div className="flex items-start space-x-2 mt-6 p-4 bg-emerald/5 rounded-lg border border-emerald/20">
          <Checkbox
            id="terms-consent"
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
            required
          />
          <Label htmlFor="terms-consent" className="text-sm leading-relaxed cursor-pointer">
            J'ai lu et j'accepte les{' '}
            <a
              href="/terms-of-service"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald underline hover:text-emerald-light font-semibold"
            >
              Conditions d'Utilisation
            </a>{' '}
            et la{' '}
            <a
              href="/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald underline hover:text-emerald-light font-semibold"
            >
              Politique de Confidentialité
            </a>
            . Je m'engage à respecter les valeurs islamiques de ZawajConnect et à n'utiliser cette
            plateforme que dans un objectif matrimonial sérieux et halal.
          </Label>
        </div>

        {/* Confirmation âge - OBLIGATOIRE */}
        <div className="flex items-start space-x-2 mt-4 p-4 bg-gold/5 rounded-lg border border-gold/20">
          <Checkbox
            id="age-consent"
            checked={confirmedAge}
            onCheckedChange={(checked) => setConfirmedAge(checked === true)}
            required
          />
          <Label htmlFor="age-consent" className="text-sm leading-relaxed cursor-pointer">
            Je confirme avoir au moins <strong>18 ans révolus</strong> et être en mesure de
            m'engager dans une démarche matrimoniale sérieuse.
          </Label>
        </div>

        {/* Message d'erreur si pas accepté */}
        {(!agreedToTerms || !confirmedAge) && attemptedSubmit && (
          <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-600 text-sm">
              Vous devez accepter les Conditions d'Utilisation et confirmer votre âge pour créer un
              compte.
            </p>
          </div>
        )}
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
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step > i + 1
                      ? 'bg-emerald text-white'
                      : step === i + 1
                        ? 'bg-emerald text-white'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {step > i + 1 ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div
                    className={`h-1 w-12 mx-2 rounded-full transition-all ${
                      step > i + 1 ? 'bg-emerald' : 'bg-muted'
                    }`}
                  />
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
          <Button variant="outline" onClick={handlePrevious} disabled={step === 1} className="px-6">
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
