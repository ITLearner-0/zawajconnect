import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Heart, Mail, Phone, MapPin, Book, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const RegistrationModal = ({ children }: { children: React.ReactNode }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Informations personnelles
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    location: "",
    
    // Informations religieuses
    practiceLevel: "",
    prayerFrequency: "",
    quranKnowledge: "",
    islamicEducation: "",
    
    // Préférences matrimoniales
    agePreference: "",
    locationPreference: "",
    partnerPracticeLevel: "",
    
    // Informations familiales
    waliName: "",
    waliPhone: "",
    familyApproval: false,
    
    // Engagement
    intentionDeclaration: false,
    termsAccepted: false
  });

  const { toast } = useToast();

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    toast({
      title: "Inscription soumise ✨",
      description: "Votre profil sera examiné sous 24h. Nous vous contacterons bientôt incha'Allah.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-center mb-4">
            Inscription Respectueuse
          </DialogTitle>
          
          {/* Progress Steps */}
          <div className="flex justify-center space-x-2 mb-6">
            {[1, 2, 3, 4].map((step) => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === currentStep 
                    ? 'bg-emerald text-white' 
                    : step < currentStep 
                    ? 'bg-emerald-light text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </DialogHeader>

        {/* Step 1: Informations Personnelles */}
        {currentStep === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald">
                <User className="mr-2 h-5 w-5" />
                Informations Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="Votre prénom"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Votre nom"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="votre.email@example.com"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
                <div>
                  <Label htmlFor="age">Âge *</Label>
                  <Select value={formData.age} onValueChange={(value) => handleInputChange('age', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Votre âge" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 50 }, (_, i) => i + 18).map((age) => (
                        <SelectItem key={age} value={age.toString()}>{age} ans</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="location">Localisation *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="Ville, Pays"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Informations Religieuses */}
        {currentStep === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald">
                <Book className="mr-2 h-5 w-5" />
                Pratique Religieuse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Niveau de pratique *</Label>
                <Select value={formData.practiceLevel} onValueChange={(value) => handleInputChange('practiceLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debutant">Débutant - J'apprends</SelectItem>
                    <SelectItem value="pratiquant">Pratiquant régulier</SelectItem>
                    <SelectItem value="assidu">Très pratiquant</SelectItem>
                    <SelectItem value="savant">Étudiant en sciences islamiques</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Fréquence des prières *</Label>
                <Select value={formData.prayerFrequency} onValueChange={(value) => handleInputChange('prayerFrequency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vos habitudes de prière" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5-daily">5 prières quotidiennes</SelectItem>
                    <SelectItem value="most-daily">La plupart des prières</SelectItem>
                    <SelectItem value="friday">Prière du vendredi régulièrement</SelectItem>
                    <SelectItem value="occasional">Occasionnellement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Connaissance du Coran</Label>
                <Select value={formData.quranKnowledge} onValueChange={(value) => handleInputChange('quranKnowledge', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Votre niveau" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hafiz">Hafiz/Hafiza (mémorisation complète)</SelectItem>
                    <SelectItem value="several-surahs">Plusieurs sourates</SelectItem>
                    <SelectItem value="basic-surahs">Sourates de base</SelectItem>
                    <SelectItem value="learning">En apprentissage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Éducation islamique</Label>
                <Textarea
                  value={formData.islamicEducation}
                  onChange={(e) => handleInputChange('islamicEducation', e.target.value)}
                  placeholder="Décrivez brièvement votre parcours d'apprentissage religieux..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Préférences Matrimoniales */}
        {currentStep === 3 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald">
                <Heart className="mr-2 h-5 w-5" />
                Recherche de Conjoint
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tranche d'âge souhaitée</Label>
                <Select value={formData.agePreference} onValueChange={(value) => handleInputChange('agePreference', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Âge préféré pour votre conjoint" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 ans</SelectItem>
                    <SelectItem value="25-30">25-30 ans</SelectItem>
                    <SelectItem value="30-35">30-35 ans</SelectItem>
                    <SelectItem value="35-40">35-40 ans</SelectItem>
                    <SelectItem value="40+">40 ans et plus</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Localisation préférée</Label>
                <Input
                  value={formData.locationPreference}
                  onChange={(e) => handleInputChange('locationPreference', e.target.value)}
                  placeholder="Même ville, même pays, peu importe..."
                />
              </div>
              
              <div>
                <Label>Niveau de pratique souhaité *</Label>
                <Select value={formData.partnerPracticeLevel} onValueChange={(value) => handleInputChange('partnerPracticeLevel', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Niveau religieux recherché" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="similar">Similaire au mien</SelectItem>
                    <SelectItem value="more-practicing">Plus pratiquant que moi</SelectItem>
                    <SelectItem value="learning-together">Apprendre ensemble</SelectItem>
                    <SelectItem value="flexible">Flexible</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Informations Familiales & Engagement */}
        {currentStep === 4 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-emerald">
                <Users className="mr-2 h-5 w-5" />
                Famille & Engagement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="waliName">Nom du Wali *</Label>
                  <Input
                    id="waliName"
                    value={formData.waliName}
                    onChange={(e) => handleInputChange('waliName', e.target.value)}
                    placeholder="Prénom et nom"
                  />
                </div>
                <div>
                  <Label htmlFor="waliPhone">Téléphone du Wali *</Label>
                  <Input
                    id="waliPhone"
                    value={formData.waliPhone}
                    onChange={(e) => handleInputChange('waliPhone', e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="familyApproval"
                    checked={formData.familyApproval}
                    onCheckedChange={(checked) => handleInputChange('familyApproval', checked as boolean)}
                  />
                  <label htmlFor="familyApproval" className="text-sm leading-5">
                    Ma famille est au courant et approuve ma recherche matrimoniale sur cette plateforme
                  </label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="intentionDeclaration"
                    checked={formData.intentionDeclaration}
                    onCheckedChange={(checked) => handleInputChange('intentionDeclaration', checked as boolean)}
                  />
                  <label htmlFor="intentionDeclaration" className="text-sm leading-5">
                    J'atteste sur l'honneur que mon intention (Niyyah) est pure et que je recherche uniquement le mariage halal
                  </label>
                </div>
                
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="termsAccepted"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) => handleInputChange('termsAccepted', checked as boolean)}
                  />
                  <label htmlFor="termsAccepted" className="text-sm leading-5">
                    J'accepte les conditions d'utilisation et m'engage à respecter les valeurs islamiques de la plateforme
                  </label>
                </div>
              </div>
              
              {/* Islamic Quote */}
              <div className="mt-6 p-4 bg-cream rounded-lg border-l-4 border-emerald">
                <p className="text-sm text-muted-foreground italic mb-2">
                  "Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles"
                </p>
                <p className="text-xs text-emerald font-medium">- Sourate Ar-Rum, verset 21</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Précédent
          </Button>
          
          {currentStep < 4 ? (
            <Button onClick={handleNext} className="bg-emerald hover:bg-emerald-dark">
              Suivant
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit}
              className="bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-dark hover:to-emerald"
              disabled={!formData.familyApproval || !formData.intentionDeclaration || !formData.termsAccepted}
            >
              Soumettre l'inscription
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegistrationModal;