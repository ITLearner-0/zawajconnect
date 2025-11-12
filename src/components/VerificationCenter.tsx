// @ts-nocheck
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, ShieldCheck, ShieldAlert, Upload, Mail, Phone, 
  IdCard, Users, Camera, CheckCircle, AlertCircle, Clock 
} from 'lucide-react';

interface VerificationStatus {
  email_verified: boolean;
  phone_verified: boolean;
  id_verified: boolean;
  family_verified: boolean;
  verification_score: number;
  verification_documents: string[];
  verification_notes?: string;
  verified_at?: string;
}

interface VerificationStep {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  status: 'completed' | 'pending' | 'in_review' | 'rejected';
  points: number;
}

const VerificationCenter = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({
    email_verified: false,
    phone_verified: false,
    id_verified: false,
    family_verified: false,
    verification_score: 0,
    verification_documents: []
  });
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (user) {
      loadVerificationStatus();
    }
  }, [user]);

  const loadVerificationStatus = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setVerificationStatus({
          email_verified: data.email_verified ?? false,
          phone_verified: data.phone_verified ?? false,
          id_verified: data.id_verified ?? false,
          family_verified: data.family_verified ?? false,
          verification_score: data.verification_score ?? 0,
          verified_by: data.verified_by ?? undefined,
          verified_at: data.verified_at ?? undefined,
          verification_documents: data.verification_documents ?? undefined,
          verification_notes: data.verification_notes ?? undefined,
          user_id: data.user_id,
          id: data.id,
          created_at: data.created_at,
          updated_at: data.updated_at
        });
      } else {
        // Create initial verification record
        const { data: newRecord } = await supabase
          .from('user_verifications')
          .insert({
            user_id: user.id,
            email_verified: user.email_confirmed_at !== null
          })
          .select()
          .maybeSingle();

        if (newRecord) {
          setVerificationStatus({
            email_verified: newRecord.email_verified ?? false,
            phone_verified: newRecord.phone_verified ?? false,
            id_verified: newRecord.id_verified ?? false,
            family_verified: newRecord.family_verified ?? false,
            verification_score: newRecord.verification_score ?? 0,
            verified_by: newRecord.verified_by ?? undefined,
            verified_at: newRecord.verified_at ?? undefined,
            verification_documents: newRecord.verification_documents ?? undefined,
            verification_notes: newRecord.verification_notes ?? undefined,
            user_id: newRecord.user_id,
            id: newRecord.id,
            created_at: newRecord.created_at,
            updated_at: newRecord.updated_at
          });
        }
      }
    } catch (error) {
      console.error('Error loading verification status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger le statut de vérification",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendEmailVerification = async () => {
    if (!user?.email) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email
      });

      if (error) throw error;

      toast({
        title: "Email envoyé",
        description: "Vérifiez votre boîte mail et cliquez sur le lien de confirmation",
      });
    } catch (error) {
      console.error('Error sending email verification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'email de vérification",
        variant: "destructive"
      });
    }
  };

  const sendPhoneVerification = async () => {
    if (!phoneNumber) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un numéro de téléphone",
        variant: "destructive"
      });
      return;
    }

    try {
      // In a real app, you would integrate with a phone verification service
      // For now, we'll simulate the process
      setShowPhoneVerification(true);
      toast({
        title: "Code envoyé",
        description: `Un code de vérification a été envoyé au ${phoneNumber}`,
      });
    } catch (error) {
      console.error('Error sending phone verification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code de vérification",
        variant: "destructive"
      });
    }
  };

  const verifyPhoneCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: "Code invalide",
        description: "Veuillez saisir un code à 6 chiffres",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate verification (in real app, verify with service)
      if (!user?.id) return;

      const { error } = await supabase
        .from('user_verifications')
        .update({ 
          phone_verified: true,
          verification_score: verificationStatus.verification_score + 25
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Update profile with phone number
      await supabase
        .from('profiles')
        .update({ phone: phoneNumber })
        .eq('user_id', user.id);

      setVerificationStatus(prev => ({
        ...prev,
        phone_verified: true,
        verification_score: prev.verification_score + 25
      }));

      setShowPhoneVerification(false);
      setVerificationCode('');

      toast({
        title: "Téléphone vérifié",
        description: "Votre numéro de téléphone a été vérifié avec succès",
      });
    } catch (error) {
      console.error('Error verifying phone:', error);
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le téléphone",
        variant: "destructive"
      });
    }
  };

  const uploadDocument = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast({
        title: "Format invalide",
        description: "Seules les images et les PDFs sont acceptés",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10 MB",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Create unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${documentType}-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Update verification documents
      const updatedDocuments = [...verificationStatus.verification_documents, fileName];
      const newScore = documentType === 'id' 
        ? verificationStatus.verification_score + 30
        : verificationStatus.verification_score + 20;

      const { error: updateError } = await supabase
        .from('user_verifications')
        .update({ 
          verification_documents: updatedDocuments,
          verification_score: newScore,
          ...(documentType === 'id' && { id_verified: true }),
          ...(documentType === 'family' && { family_verified: true })
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setVerificationStatus(prev => ({
        ...prev,
        verification_documents: updatedDocuments,
        verification_score: newScore,
        ...(documentType === 'id' && { id_verified: true }),
        ...(documentType === 'family' && { family_verified: true })
      }));

      toast({
        title: "Document téléchargé",
        description: "Votre document est en cours de vérification",
      });
    } catch (error) {
      console.error('Error uploading document:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger le document",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const getVerificationSteps = (): VerificationStep[] => [
    {
      id: 'email',
      title: 'Email',
      description: 'Vérifiez votre adresse email',
      icon: Mail,
      status: verificationStatus.email_verified ? 'completed' : 'pending',
      points: 20
    },
    {
      id: 'phone',
      title: 'Téléphone',
      description: 'Confirmez votre numéro de téléphone',
      icon: Phone,
      status: verificationStatus.phone_verified ? 'completed' : 'pending',
      points: 25
    },
    {
      id: 'identity',
      title: 'Pièce d\'identité',
      description: 'Téléchargez une pièce d\'identité officielle',
      icon: IdCard,
      status: verificationStatus.id_verified ? 'completed' : 'pending',
      points: 30
    },
    {
      id: 'family',
      title: 'Validation familiale',
      description: 'Document confirmant votre situation familiale',
      icon: Users,
      status: verificationStatus.family_verified ? 'completed' : 'pending',
      points: 25
    }
  ];

  const verificationSteps = getVerificationSteps();
  const completedSteps = verificationSteps.filter(step => step.status === 'completed');
  const progress = (verificationStatus.verification_score / 100) * 100;

  const getVerificationBadge = () => {
    const score = verificationStatus.verification_score;
    if (score >= 80) {
      return { 
        label: 'Profil Vérifié', 
        color: 'bg-emerald text-primary-foreground', 
        icon: ShieldCheck 
      };
    } else if (score >= 50) {
      return { 
        label: 'Partiellement Vérifié', 
        color: 'bg-gold text-primary-foreground', 
        icon: Shield 
      };
    } else {
      return { 
        label: 'Non Vérifié', 
        color: 'bg-muted text-muted-foreground', 
        icon: ShieldAlert 
      };
    }
  };

  const badge = getVerificationBadge();
  const BadgeIcon = badge.icon;

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement du statut de vérification...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Verification Score Card */}
      <Card className="border-emerald/20 bg-gradient-to-br from-emerald/5 to-gold/5">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald" />
              <span>Niveau de Vérification</span>
            </div>
            <Badge className={badge.color}>
              <BadgeIcon className="h-3 w-3 mr-1" />
              {badge.label}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progression</span>
                <span>{verificationStatus.verification_score}/100 points</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald">{completedSteps.length}</div>
                <div className="text-muted-foreground">Étapes complétées</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gold">{verificationSteps.length - completedSteps.length}</div>
                <div className="text-muted-foreground">Étapes restantes</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Steps */}
      <div className="grid gap-4">
        {verificationSteps.map((step) => {
          const StepIcon = step.icon;
          const isCompleted = step.status === 'completed';
          
          return (
            <Card 
              key={step.id} 
              className={`transition-colors ${
                isCompleted ? 'border-emerald/20 bg-emerald/5' : 'border-border'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-full ${
                      isCompleted ? 'bg-emerald text-primary-foreground' : 'bg-muted'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <StepIcon className="h-6 w-6" />
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{step.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          +{step.points} points
                        </Badge>
                        {isCompleted && (
                          <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                            ✓ Complété
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mb-4">{step.description}</p>
                      
                      {/* Step-specific content */}
                      {step.id === 'email' && !isCompleted && (
                        <Button onClick={sendEmailVerification} className="bg-emerald hover:bg-emerald-dark">
                          <Mail className="h-4 w-4 mr-2" />
                          Renvoyer l'email de vérification
                        </Button>
                      )}
                      
                      {step.id === 'phone' && !isCompleted && (
                        <div className="space-y-3">
                          {!showPhoneVerification ? (
                            <div className="flex gap-2">
                              <Input
                                placeholder="+33 6 12 34 56 78"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                className="flex-1"
                              />
                              <Button onClick={sendPhoneVerification} className="bg-emerald hover:bg-emerald-dark">
                                <Phone className="h-4 w-4 mr-2" />
                                Envoyer le code
                              </Button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              <Label>Code de vérification (6 chiffres)</Label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="123456"
                                  value={verificationCode}
                                  onChange={(e) => setVerificationCode(e.target.value)}
                                  maxLength={6}
                                  className="flex-1"
                                />
                                <Button onClick={verifyPhoneCode} className="bg-emerald hover:bg-emerald-dark">
                                  Vérifier
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {(step.id === 'identity' || step.id === 'family') && !isCompleted && (
                        <div className="space-y-2">
                          <Label>
                            {step.id === 'identity' 
                              ? 'Carte d\'identité, passeport ou permis de conduire'
                              : 'Document familial (livret de famille, etc.)'
                            }
                          </Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="file"
                              accept="image/*,.pdf"
                              onChange={(e) => uploadDocument(e, step.id)}
                              disabled={uploading}
                              className="flex-1"
                            />
                            <Button disabled={uploading} variant="outline">
                              <Upload className="h-4 w-4 mr-2" />
                              {uploading ? 'Téléchargement...' : 'Télécharger'}
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Formats acceptés: JPG, PNG, PDF. Taille max: 10 MB
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Benefits Card */}
      <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-gold" />
            Avantages de la Vérification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-semibold text-emerald">Confiance et Sécurité</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Profil plus crédible et attractif</li>
                <li>• Augmente vos chances de matches</li>
                <li>• Protège contre les faux profils</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-gold">Avantages Premium</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Badge de vérification visible</li>
                <li>• Priorité dans les suggestions</li>
                <li>• Accès à des fonctionnalités avancées</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationCenter;