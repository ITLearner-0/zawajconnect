import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Users, CheckCircle, AlertTriangle } from 'lucide-react';
import {
  FamilyVerificationService,
  VerificationDocument,
} from '@/services/wali/familyVerification';
import { useToast } from '@/hooks/use-toast';

interface FamilyVerificationFormProps {
  wali_id: string;
  managed_user_id: string;
  onVerificationSubmitted: () => void;
}

const FamilyVerificationForm: React.FC<FamilyVerificationFormProps> = ({
  wali_id,
  managed_user_id,
  onVerificationSubmitted,
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    relationship_type: '',
    verification_method: '',
    verification_notes: '',
    witness_contacts: [''],
    community_references: [''],
  });
  const [documents, setDocuments] = useState<VerificationDocument[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await FamilyVerificationService.submitVerification({
        wali_id,
        managed_user_id,
        relationship_type: formData.relationship_type,
        verification_method: formData.verification_method,
        documents,
        witness_contacts: formData.witness_contacts.filter((contact) => contact.trim()),
        community_references: formData.community_references.filter((ref) => ref.trim()),
        verification_notes: formData.verification_notes,
      });

      if (result.success) {
        toast({
          title: 'Vérification soumise',
          description: 'Votre demande de vérification familiale a été soumise avec succès.',
        });
        onVerificationSubmitted();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de la soumission',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur inattendue s'est produite",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addWitnessContact = () => {
    setFormData((prev) => ({
      ...prev,
      witness_contacts: [...prev.witness_contacts, ''],
    }));
  };

  const updateWitnessContact = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      witness_contacts: prev.witness_contacts.map((contact, i) => (i === index ? value : contact)),
    }));
  };

  const addCommunityReference = () => {
    setFormData((prev) => ({
      ...prev,
      community_references: [...prev.community_references, ''],
    }));
  };

  const updateCommunityReference = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      community_references: prev.community_references.map((ref, i) => (i === index ? value : ref)),
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Vérification de la Relation Familiale
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              La vérification de votre relation familiale est essentielle pour maintenir la sécurité
              et l'authenticité de la plateforme.
            </AlertDescription>
          </Alert>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label htmlFor="relationship">Type de Relation *</Label>
            <Select
              value={formData.relationship_type}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, relationship_type: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez votre relation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="father">Père</SelectItem>
                <SelectItem value="brother">Frère</SelectItem>
                <SelectItem value="uncle">Oncle</SelectItem>
                <SelectItem value="grandfather">Grand-père</SelectItem>
                <SelectItem value="other">Autre parent masculin</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Verification Method */}
          <div className="space-y-2">
            <Label htmlFor="method">Méthode de Vérification *</Label>
            <Select
              value={formData.verification_method}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, verification_method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisissez une méthode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="document">Documents officiels</SelectItem>
                <SelectItem value="witness">Témoins de confiance</SelectItem>
                <SelectItem value="community">Références communautaires</SelectItem>
                <SelectItem value="self_declaration">Déclaration personnelle</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Witness Contacts */}
          {formData.verification_method === 'witness' && (
            <div className="space-y-3">
              <Label>Contacts des Témoins</Label>
              {formData.witness_contacts.map((contact, index) => (
                <Input
                  key={index}
                  value={contact}
                  onChange={(e) => updateWitnessContact(index, e.target.value)}
                  placeholder="Nom et contact du témoin"
                />
              ))}
              <Button type="button" variant="outline" onClick={addWitnessContact}>
                Ajouter un Témoin
              </Button>
            </div>
          )}

          {/* Community References */}
          {formData.verification_method === 'community' && (
            <div className="space-y-3">
              <Label>Références Communautaires</Label>
              {formData.community_references.map((reference, index) => (
                <Input
                  key={index}
                  value={reference}
                  onChange={(e) => updateCommunityReference(index, e.target.value)}
                  placeholder="Nom et contact de la référence"
                />
              ))}
              <Button type="button" variant="outline" onClick={addCommunityReference}>
                Ajouter une Référence
              </Button>
            </div>
          )}

          {/* Document Upload */}
          {formData.verification_method === 'document' && (
            <div className="space-y-3">
              <Label>Documents Justificatifs</Label>
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertDescription>
                  Vous pouvez télécharger: certificats de naissance, livret de famille, carte
                  d'identité, etc.
                </AlertDescription>
              </Alert>
              <Button type="button" variant="outline" className="w-full">
                <Upload className="mr-2 h-4 w-4" />
                Télécharger des Documents
              </Button>
            </div>
          )}

          {/* Verification Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes Additionnelles</Label>
            <Textarea
              id="notes"
              value={formData.verification_notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, verification_notes: e.target.value }))
              }
              placeholder="Informations supplémentaires pour aider à la vérification..."
              rows={4}
            />
          </div>

          {/* Declaration */}
          <div className="flex items-start space-x-2">
            <Checkbox id="declaration" />
            <Label htmlFor="declaration" className="text-sm leading-5">
              Je certifie que toutes les informations fournies sont exactes et que je suis bien le
              wali légal de cette personne selon les principes islamiques.
            </Label>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting || !formData.relationship_type || !formData.verification_method}
          >
            {isSubmitting ? 'Soumission...' : 'Soumettre la Vérification'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FamilyVerificationForm;
