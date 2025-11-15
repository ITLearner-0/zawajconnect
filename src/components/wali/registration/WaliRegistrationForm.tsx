import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useWaliRegistration } from '@/hooks/wali';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Upload, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

const registrationSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z
    .string()
    .trim()
    .email('Adresse email invalide')
    .max(255, "L'email ne peut pas dépasser 255 caractères"),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{7,14}$/, 'Numéro de téléphone invalide')
    .optional()
    .or(z.literal('')),
  relationship_to_user: z
    .string()
    .trim()
    .min(10, 'Veuillez décrire votre relation avec les membres (minimum 10 caractères)')
    .max(500, 'La description ne peut pas dépasser 500 caractères'),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

export const WaliRegistrationForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { createRegistration } = useWaliRegistration(user?.id);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [proofDocument, setProofDocument] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    id: number;
    proof: number;
  }>({ id: 0, proof: 0 });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return 'Le fichier ne doit pas dépasser 5MB';
    }
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return 'Seuls les fichiers PDF, JPG, JPEG et PNG sont acceptés';
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'proof') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      e.target.value = '';
      return;
    }

    if (type === 'id') {
      setIdDocument(file);
    } else {
      setProofDocument(file);
    }
  };

  const uploadDocument = async (
    file: File,
    type: 'id' | 'proof',
    userId: string
  ): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${type}_${Date.now()}.${fileExt}`;
    const filePath = `wali-documents/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Erreur lors de l'upload: ${uploadError.message}`);
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from('documents').getPublicUrl(filePath);

    return publicUrl;
  };

  const onSubmit = async (data: RegistrationFormData) => {
    if (!user) {
      toast.error('Vous devez être connecté pour soumettre une inscription');
      return;
    }

    if (!idDocument) {
      toast.error("Veuillez fournir une pièce d'identité");
      return;
    }

    if (!proofDocument) {
      toast.error('Veuillez fournir une preuve de relation');
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload ID document
      setUploadProgress({ id: 30, proof: 0 });
      const idUrl = await uploadDocument(idDocument, 'id', user.id);

      // Upload proof document
      setUploadProgress({ id: 100, proof: 30 });
      const proofUrl = await uploadDocument(proofDocument, 'proof', user.id);

      setUploadProgress({ id: 100, proof: 100 });

      // Create registration
      await createRegistration({
        user_id: user.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone || undefined,
        relationship_to_user: data.relationship_to_user,
        id_document_url: idUrl,
        proof_of_relationship_url: proofUrl,
        status: 'pending',
      });

      toast.success('Inscription soumise avec succès', {
        description: 'Votre demande sera examinée par notre équipe',
      });

      navigate('/wali-dashboard');
    } catch (error) {
      console.error('Error submitting registration:', error);
      toast.error('Erreur lors de la soumission', {
        description: error instanceof Error ? error.message : 'Veuillez réessayer',
      });
    } finally {
      setIsSubmitting(false);
      setUploadProgress({ id: 0, proof: 0 });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Inscription Wali</CardTitle>
        <CardDescription>
          Remplissez ce formulaire pour devenir un Wali (tuteur) et superviser les membres de votre
          famille
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informations Personnelles</h3>

            <div className="space-y-2">
              <Label htmlFor="full_name">
                Nom Complet <span className="text-destructive">*</span>
              </Label>
              <Input
                id="full_name"
                {...register('full_name')}
                placeholder="Votre nom complet"
                disabled={isSubmitting}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="votre.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Téléphone (optionnel)</Label>
              <Input
                id="phone"
                type="tel"
                {...register('phone')}
                placeholder="+33 6 12 34 56 78"
                disabled={isSubmitting}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship">
                Relation avec les membres <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="relationship"
                {...register('relationship_to_user')}
                placeholder="Décrivez votre relation avec les membres que vous souhaitez superviser (ex: père de..., frère de...)"
                rows={4}
                disabled={isSubmitting}
              />
              {errors.relationship_to_user && (
                <p className="text-sm text-destructive">{errors.relationship_to_user.message}</p>
              )}
            </div>
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documents de Vérification</h3>
            <p className="text-sm text-muted-foreground">
              Formats acceptés: PDF, JPG, PNG (max 5MB par fichier)
            </p>

            {/* ID Document */}
            <div className="space-y-2">
              <Label htmlFor="id_document">
                Pièce d'Identité <span className="text-destructive">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="id_document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'id')}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('id_document')?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {idDocument ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                      {idDocument.name}
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Télécharger la pièce d'identité
                    </>
                  )}
                </Button>
              </div>
              {uploadProgress.id > 0 && uploadProgress.id < 100 && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress.id}%` }}
                  />
                </div>
              )}
            </div>

            {/* Proof Document */}
            <div className="space-y-2">
              <Label htmlFor="proof_document">
                Preuve de Relation <span className="text-destructive">*</span>
              </Label>
              <p className="text-xs text-muted-foreground">
                Livret de famille, certificat de naissance, ou tout document officiel prouvant votre
                relation
              </p>
              <div className="flex items-center gap-2">
                <Input
                  id="proof_document"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => handleFileChange(e, 'proof')}
                  disabled={isSubmitting}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById('proof_document')?.click()}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  {proofDocument ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                      {proofDocument.name}
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Télécharger la preuve de relation
                    </>
                  )}
                </Button>
              </div>
              {uploadProgress.proof > 0 && uploadProgress.proof < 100 && (
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${uploadProgress.proof}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Soumission en cours...
                </>
              ) : (
                'Soumettre la demande'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
