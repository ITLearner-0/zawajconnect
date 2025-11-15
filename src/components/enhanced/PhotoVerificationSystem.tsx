import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFamilySupervision } from '@/hooks/useFamilySupervision';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Camera,
  Upload,
  Check,
  X,
  Eye,
  EyeOff,
  Shield,
  Users,
  Star,
  AlertTriangle,
  FileImage,
  Trash2,
  RotateCcw,
  CheckCircle,
  Clock,
  Heart,
  Settings,
} from 'lucide-react';

interface PhotoUpload {
  id: string;
  url: string;
  file: File;
  status: 'pending' | 'uploaded' | 'processing' | 'approved' | 'rejected';
  verification_status: 'pending' | 'family_approved' | 'admin_approved' | 'rejected';
  rejection_reason?: string;
  is_primary: boolean;
  visibility: 'public' | 'family_only' | 'matches_only';
  islamic_compliance: boolean;
  family_notes?: string;
}

interface VerificationRule {
  id: string;
  name: string;
  description: string;
  required: boolean;
  islamic_guideline: string;
}

interface PhotoVerificationSystemProps {
  onComplete?: () => void;
  maxPhotos?: number;
}

const PhotoVerificationSystem: React.FC<PhotoVerificationSystemProps> = ({
  onComplete,
  maxPhotos = 6,
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { familyMembers, supervisionStatus } = useFamilySupervision();

  const [photos, setPhotos] = useState<PhotoUpload[]>([]);
  const [uploading, setUploading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoUpload | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [rejectionAppeal, setRejectionAppeal] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const verificationRules: VerificationRule[] = [
    {
      id: 'face_visible',
      name: 'Visage clairement visible',
      description: 'Votre visage doit être clairement visible et reconnaissable',
      required: true,
      islamic_guideline: 'Transparence et honnêteté dans la présentation',
    },
    {
      id: 'modest_clothing',
      name: 'Tenue modeste',
      description: 'La tenue doit respecter les principes de pudeur islamique',
      required: true,
      islamic_guideline: 'Respect de la pudeur (Haya) selon les enseignements islamiques',
    },
    {
      id: 'appropriate_setting',
      name: 'Environnement approprié',
      description: 'Photo prise dans un environnement respectable et approprié',
      required: true,
      islamic_guideline: 'Éviter les environnements qui pourraient être mal interprétés',
    },
    {
      id: 'recent_photo',
      name: 'Photo récente',
      description: 'La photo doit dater de moins de 6 mois',
      required: true,
      islamic_guideline: 'Honnêteté dans la représentation actuelle',
    },
    {
      id: 'no_filters',
      name: 'Pas de filtres excessifs',
      description: "Éviter les filtres qui altèrent significativement l'apparence",
      required: false,
      islamic_guideline: 'Sincérité et authenticité dans la présentation',
    },
    {
      id: 'family_appropriate',
      name: 'Approprié pour la famille',
      description: 'Photo que vous seriez fier de montrer à votre famille',
      required: true,
      islamic_guideline: 'Respect des valeurs familiales islamiques',
    },
  ];

  useEffect(() => {
    if (user) {
      loadExistingPhotos();
    }
  }, [user]);

  const loadExistingPhotos = async () => {
    if (!user) return;

    try {
      // Load photos from storage and database
      const { data: profileData } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileData?.avatar_url) {
        // Create a photo object from existing avatar
        const existingPhoto: PhotoUpload = {
          id: 'existing_avatar',
          url: profileData.avatar_url,
          file: null as any,
          status: 'approved',
          verification_status: 'admin_approved',
          is_primary: true,
          visibility: 'matches_only',
          islamic_compliance: true,
        };
        setPhotos([existingPhoto]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (photos.length >= maxPhotos) {
        toast({
          title: 'Limite atteinte',
          description: `Vous ne pouvez télécharger que ${maxPhotos} photos maximum`,
          variant: 'destructive',
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto: PhotoUpload = {
          id: `temp_${Date.now()}_${Math.random()}`,
          url: e.target?.result as string,
          file,
          status: 'pending',
          verification_status: 'pending',
          is_primary: photos.length === 0,
          visibility: 'matches_only',
          islamic_compliance: false,
        };
        setPhotos((prev) => [...prev, newPhoto]);
      };
      reader.readAsDataURL(file);
    });
  };

  const uploadPhoto = async (photo: PhotoUpload) => {
    if (!user || !photo.file) return;

    setUploading(true);
    try {
      const fileExt = photo.file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, photo.file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

      // Update photo status
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photo.id ? { ...p, status: 'uploaded', url: urlData.publicUrl } : p
        )
      );

      // If this is the primary photo, update profile
      if (photo.is_primary) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ avatar_url: urlData.publicUrl })
          .eq('user_id', user.id);

        if (profileError) throw profileError;
      }

      // Submit for family/admin verification if required
      if (supervisionStatus.supervisionRequired) {
        await submitForFamilyVerification(photo.id, urlData.publicUrl);
      } else {
        await submitForAdminVerification(photo.id, urlData.publicUrl);
      }

      toast({
        title: 'Photo téléchargée',
        description: 'Votre photo a été soumise pour vérification',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: 'Erreur de téléchargement',
        description: 'Impossible de télécharger la photo',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const submitForFamilyVerification = async (photoId: string, photoUrl: string) => {
    // Create a notification for family members to review the photo
    const familyReviews = familyMembers
      .filter((fm) => fm.is_wali && fm.can_view_profile)
      .map((fm) => ({
        family_member_id: fm.id,
        content_type: 'photo_verification',
        content_url: photoUrl,
        requires_action: true,
        islamic_compliance_check: true,
      }));

    // In a real implementation, you would insert these into a family_photo_reviews table
    console.log('Submitting for family verification:', familyReviews);
  };

  const submitForAdminVerification = async (photoId: string, photoUrl: string) => {
    // Submit to admin verification queue
    // In a real implementation, this would create an admin verification task
    console.log('Submitting for admin verification:', photoId, photoUrl);
  };

  const deletePhoto = (photoId: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== photoId));
    toast({
      title: 'Photo supprimée',
      description: 'La photo a été retirée de votre profil',
    });
  };

  const setPrimaryPhoto = (photoId: string) => {
    setPhotos((prev) =>
      prev.map((p) => ({
        ...p,
        is_primary: p.id === photoId,
      }))
    );
  };

  const updatePhotoVisibility = (
    photoId: string,
    visibility: 'public' | 'family_only' | 'matches_only'
  ) => {
    setPhotos((prev) => prev.map((p) => (p.id === photoId ? { ...p, visibility } : p)));
  };

  const appealRejection = async (photoId: string) => {
    if (!rejectionAppeal.trim()) {
      toast({
        title: 'Appel requis',
        description: 'Veuillez expliquer pourquoi cette photo devrait être approuvée',
        variant: 'destructive',
      });
      return;
    }

    try {
      // In a real implementation, this would create an appeal record
      console.log('Photo appeal submitted:', photoId, rejectionAppeal);

      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, verification_status: 'pending' } : p))
      );

      setRejectionAppeal('');
      toast({
        title: 'Appel soumis',
        description: 'Votre appel a été soumis pour révision',
      });
    } catch (error) {
      console.error('Error submitting appeal:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de soumettre l'appel",
        variant: 'destructive',
      });
    }
  };

  const getVerificationStatus = (photo: PhotoUpload) => {
    switch (photo.verification_status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-yellow-500',
          bg: 'bg-yellow-50',
          text: 'En attente de vérification',
        };
      case 'family_approved':
        return {
          icon: Users,
          color: 'text-blue-500',
          bg: 'bg-blue-50',
          text: 'Approuvée par la famille',
        };
      case 'admin_approved':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          bg: 'bg-green-50',
          text: "Approuvée par l'administration",
        };
      case 'rejected':
        return { icon: X, color: 'text-red-500', bg: 'bg-red-50', text: 'Rejetée' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50', text: 'Statut inconnu' };
    }
  };

  const calculateComplianceScore = () => {
    const approvedPhotos = photos.filter(
      (p) =>
        p.verification_status === 'admin_approved' || p.verification_status === 'family_approved'
    );
    const totalPhotos = photos.length;
    return totalPhotos > 0 ? Math.round((approvedPhotos.length / totalPhotos) * 100) : 0;
  };

  const complianceScore = calculateComplianceScore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Système de Vérification de Photos
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              Téléchargez des photos respectueuses et conformes aux valeurs islamiques
            </p>
            <Dialog open={showGuidelines} onOpenChange={setShowGuidelines}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Directives
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Directives Islamiques pour les Photos</DialogTitle>
                  <DialogDescription>
                    Respectez ces principes pour une vérification rapide et une présentation
                    authentique
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {verificationRules.map((rule) => (
                    <div key={rule.id} className="border-l-4 border-primary pl-4">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{rule.name}</h4>
                        {rule.required && (
                          <Badge variant="destructive" className="text-xs">
                            Requis
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{rule.description}</p>
                      <p className="text-xs text-primary italic">{rule.islamic_guideline}</p>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {photos.length}/{maxPhotos}
                </p>
                <p className="text-xs text-muted-foreground">Photos</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{complianceScore}%</p>
                <p className="text-xs text-muted-foreground">Conformité</p>
              </div>
            </div>
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={photos.length >= maxPhotos || uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              Ajouter Photo
            </Button>
          </div>
          <Progress value={(photos.length / maxPhotos) * 100} className="mb-2" />
          <p className="text-xs text-muted-foreground text-center">
            {photos.length < maxPhotos
              ? `Vous pouvez ajouter ${maxPhotos - photos.length} photo(s) supplémentaire(s)`
              : 'Limite de photos atteinte'}
          </p>
        </CardContent>
      </Card>

      {/* Islamic Compliance Notice */}
      {supervisionStatus.supervisionRequired && (
        <Alert>
          <Users className="h-4 w-4" />
          <AlertDescription>
            Vos photos seront d'abord examinées par votre famille selon les principes islamiques,
            puis vérifiées par notre équipe de modération.
          </AlertDescription>
        </Alert>
      )}

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => {
          const status = getVerificationStatus(photo);
          const StatusIcon = status.icon;

          return (
            <Card key={photo.id} className="overflow-hidden">
              <div className="relative aspect-square">
                <img src={photo.url} alt="Profile" className="w-full h-full object-cover" />

                {/* Status Overlay */}
                <div className={`absolute top-2 right-2 p-1 rounded-full ${status.bg}`}>
                  <StatusIcon className={`h-4 w-4 ${status.color}`} />
                </div>

                {/* Primary Badge */}
                {photo.is_primary && (
                  <Badge className="absolute top-2 left-2 bg-primary">
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Badge>
                )}

                {/* Actions Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    {!photo.is_primary && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setPrimaryPhoto(photo.id)}
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}
                    <Button size="sm" variant="secondary" onClick={() => setSelectedPhoto(photo)}>
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => deletePhoto(photo.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">{status.text}</p>
                  <Badge
                    variant={photo.visibility === 'public' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {photo.visibility === 'public' && 'Public'}
                    {photo.visibility === 'family_only' && 'Famille'}
                    {photo.visibility === 'matches_only' && 'Matches'}
                  </Badge>
                </div>

                {photo.status === 'pending' && (
                  <Button
                    size="sm"
                    onClick={() => uploadPhoto(photo)}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? 'Téléchargement...' : 'Télécharger'}
                  </Button>
                )}

                {photo.verification_status === 'rejected' && (
                  <div className="space-y-2">
                    <p className="text-xs text-red-600">{photo.rejection_reason}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedPhoto(photo)}
                      className="w-full"
                    >
                      <RotateCcw className="h-4 w-4 mr-1" />
                      Faire appel
                    </Button>
                  </div>
                )}

                {photo.family_notes && (
                  <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                    <p className="font-medium">Note de la famille:</p>
                    <p>{photo.family_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Add Photo Card */}
        {photos.length < maxPhotos && (
          <Card className="border-dashed border-2 hover:border-primary cursor-pointer transition-colors">
            <div
              className="aspect-square flex flex-col items-center justify-center p-6 text-center"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm font-medium mb-2">Ajouter une photo</p>
              <p className="text-xs text-muted-foreground">Respectez les directives islamiques</p>
            </div>
          </Card>
        )}
      </div>

      {/* Photo Settings Dialog */}
      {selectedPhoto && (
        <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Paramètres de la Photo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="aspect-square w-48 mx-auto">
                <img
                  src={selectedPhoto.url}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>

              <div>
                <Label>Visibilité</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['public', 'family_only', 'matches_only'].map((visibility) => (
                    <Button
                      key={visibility}
                      variant={selectedPhoto.visibility === visibility ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updatePhotoVisibility(selectedPhoto.id, visibility as any)}
                    >
                      {visibility === 'public' && 'Public'}
                      {visibility === 'family_only' && 'Famille'}
                      {visibility === 'matches_only' && 'Matches'}
                    </Button>
                  ))}
                </div>
              </div>

              {selectedPhoto.verification_status === 'rejected' && (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm font-medium text-red-800 mb-1">Raison du rejet:</p>
                    <p className="text-sm text-red-600">{selectedPhoto.rejection_reason}</p>
                  </div>

                  <div>
                    <Label htmlFor="appeal">Faire appel de la décision</Label>
                    <Textarea
                      id="appeal"
                      value={rejectionAppeal}
                      onChange={(e) => setRejectionAppeal(e.target.value)}
                      placeholder="Expliquez pourquoi cette photo respecte les directives islamiques..."
                      rows={4}
                    />
                  </div>

                  <Button onClick={() => appealRejection(selectedPhoto.id)} className="w-full">
                    Soumettre l'appel
                  </Button>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Completion Status */}
      {photos.length > 0 && complianceScore >= 80 && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-medium text-green-800">Profil photo conforme !</p>
                <p className="text-sm text-green-600">
                  Vos photos respectent les directives islamiques et sont prêtes pour la
                  vérification.
                </p>
              </div>
            </div>
            {onComplete && (
              <Button onClick={onComplete} className="mt-3 bg-green-600 hover:bg-green-700">
                Continuer vers l'étape suivante
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PhotoVerificationSystem;
