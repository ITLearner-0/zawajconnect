import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  Eye, 
  MessageCircle,
  Clock,
  Heart,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { invitationAuthSchema } from '@/lib/validation';
import { z } from 'zod';

interface FamilyInvitation {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  invitation_status: string;
  invitation_sent_at: string;
  inviter: {
    full_name: string;
    age: number;
    location: string;
    profession: string;
  };
}

const InvitationAccept = () => {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [invitation, setInvitation] = useState<FamilyInvitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      validateInvitation();
    } else {
      setLoading(false);
      toast({
        title: "Lien invalide",
        description: "Le lien d'invitation est manquant ou invalide",
        variant: "destructive"
      });
    }
  }, [token]);

  useEffect(() => {
    const handleAuthenticatedUser = async () => {
      if (!user || !invitation || !token) return;

      // Check if user has completed onboarding (Walis only need full_name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      // If profile is incomplete, redirect to Wali onboarding with token
      if (!profile?.full_name) {
        console.log('🔄 [ONBOARDING] Redirecting to Wali onboarding first');
        // Store token in sessionStorage to accept after onboarding
        sessionStorage.setItem('pending_invitation_token', token);
        navigate('/wali-onboarding');
        return;
      }

      // Profile is complete, accept invitation
      acceptInvitation();
    };

    handleAuthenticatedUser();
  }, [user, invitation, token]);

  const validateInvitation = async () => {
    if (!token) return;

    try {
      console.log('🔍 [VALIDATION] Validating invitation with token:', token);
      
      // First, check if invitation exists (any status)
      const { data: existingInvitation, error: checkError } = await supabase
        .from('family_members')
        .select('invitation_status')
        .eq('invitation_token', token)
        .maybeSingle();

      if (checkError) {
        console.error('❌ [VALIDATION] Database error:', checkError);
        throw new Error('Erreur lors de la récupération de l\'invitation');
      }

      // Check if invitation was already accepted
      if (existingInvitation?.invitation_status === 'accepted') {
        console.warn('⚠️ [VALIDATION] Invitation already accepted:', token);
        throw new Error('Cette invitation a déjà été acceptée. Vous ne pouvez pas l\'utiliser à nouveau.');
      }

      // Now get the full pending invitation
      const { data: invitationData, error: invitationError } = await supabase
        .from('family_members')
        .select('*')
        .eq('invitation_token', token)
        .eq('invitation_status', 'pending')
        .not('invitation_sent_at', 'is', null)
        .maybeSingle();

      console.log('📋 [VALIDATION] Invitation query result:', { 
        hasData: !!invitationData, 
        error: invitationError,
        data: invitationData 
      });

      if (invitationError) {
        console.error('❌ [VALIDATION] Database error:', invitationError);
        throw new Error('Erreur lors de la récupération de l\'invitation');
      }

      if (!invitationData) {
        console.warn('⚠️ [VALIDATION] No pending invitation found for token:', token);
        throw new Error('Invitation non trouvée ou expirée');
      }

      // Then get the inviter's profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('full_name, age, location, profession')
        .eq('user_id', invitationData.user_id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching inviter profile:', profileError);
      }

      const data = {
        ...invitationData,
        inviter: profileData || { full_name: 'Unknown', age: 0, location: 'Unknown', profession: 'Unknown' }
      };

      // Check if invitation is expired (30 days for better UX)
      if (!data.invitation_sent_at) {
        throw new Error('Invitation invalide - date manquante');
      }
      
      const sentAt = new Date(data.invitation_sent_at);
      const now = new Date();
      const diffDays = (now.getTime() - sentAt.getTime()) / (1000 * 3600 * 24);

      if (diffDays > 30) {
        throw new Error('Cette invitation a expiré (valide 30 jours)');
      }

      setInvitation({
        ...data,
        inviter: data.inviter || { full_name: 'Unknown', age: 0, location: 'Unknown', profession: 'Unknown' }
      } as FamilyInvitation);

      if (!user) {
        setNeedsAuth(true);
      }
    } catch (error) {
      console.error('Error validating invitation:', error);
      toast({
        title: "Invitation invalide",
        description: error instanceof Error ? error.message : "Impossible de valider l'invitation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const acceptInvitation = async () => {
    if (!user || !invitation || !token) return;

    setProcessing(true);
    try {
      // First check if invitation is already accepted
      const { data: existingInvitation } = await supabase
        .from('family_members')
        .select('invitation_status, invited_user_id')
        .eq('invitation_token', token)
        .single();

      // If already accepted by this user, just redirect
      if (existingInvitation?.invitation_status === 'accepted' && 
          existingInvitation?.invited_user_id === user.id) {
        console.log('✅ [INVITATION] Already accepted by this user, redirecting...');
        toast({
          title: "Invitation déjà acceptée",
          description: "Vous avez déjà accepté cette invitation. Redirection vers votre espace...",
        });
        navigate('/family-supervision');
        return;
      }

      // Try to accept the invitation
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        p_invitation_token: token,
        p_invited_user_id: user.id
      });

      if (error || !data) {
        // Check if it was just accepted
        const { data: recheckInvitation } = await supabase
          .from('family_members')
          .select('invitation_status')
          .eq('invitation_token', token)
          .single();

        if (recheckInvitation?.invitation_status === 'accepted') {
          toast({
            title: "Invitation acceptée",
            description: "L'invitation a été acceptée avec succès",
          });
          navigate('/family-supervision');
          return;
        }

        throw new Error('Impossible d\'accepter l\'invitation');
      }

      toast({
        title: "Invitation acceptée !",
        description: `Vous supervisez maintenant ${invitation.inviter.full_name}`,
      });

      // Redirect to family supervision dashboard
      navigate('/family-supervision');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'accepter l'invitation",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invitation) return;

    // Clear previous errors
    setFormErrors({});

    // Validate form data
    try {
      const validatedData = invitationAuthSchema.parse({
        email: authForm.email,
        password: authForm.password,
        confirmPassword: authMode === 'signup' ? authForm.confirmPassword : undefined,
        fullName: authMode === 'signup' ? authForm.fullName : undefined
      });

      setProcessing(true);
      
      if (authMode === 'signup') {
        const { error } = await signUp(
          validatedData.email, 
          validatedData.password, 
          validatedData.fullName || invitation.full_name,
          {
            user_type: 'wali',
            invitation_token: token || '',
            supervised_user_id: invitation.user_id
          }
        );
        if (error) throw error;

        // Store token for later acceptance after onboarding
        sessionStorage.setItem('pending_invitation_token', token || '');

        toast({
          title: "Compte Wali créé",
          description: "Bienvenue ! Complétez votre profil en 3 étapes rapides.",
        });
        
        // Redirect to Wali onboarding
        navigate('/wali-onboarding');
      } else {
        const { error } = await signIn(validatedData.email, validatedData.password);
        if (error) throw error;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        const errors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path.length > 0) {
            errors[issue.path[0] as string] = issue.message;
          }
        });
        setFormErrors(errors);
        
        toast({
          title: "Données invalides",
          description: "Veuillez corriger les erreurs dans le formulaire",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Erreur d'authentification",
          description: error instanceof Error ? error.message : "Erreur lors de l'authentification",
          variant: "destructive"
        });
      }
    } finally {
      setProcessing(false);
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      'father': 'Père',
      'mother': 'Mère',
      'brother': 'Frère',
      'sister': 'Sœur',
      'uncle': 'Oncle',
      'aunt': 'Tante',
      'cousin': 'Cousin/Cousine',
      'wali': 'Wali',
      'family_friend': 'Ami de la famille',
      'other': 'Autre'
    };
    return labels[relationship] || relationship;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-emerald" />
          <p className="text-muted-foreground">Validation de l'invitation...</p>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invitation Invalide</h2>
            <p className="text-muted-foreground mb-4">
              Cette invitation n'est plus valide ou a expiré.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Retour à l'accueil
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (needsAuth && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
        <div className="container mx-auto max-w-md">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">
                Authentification Requise
              </CardTitle>
              <p className="text-sm text-muted-foreground text-center">
                Vous devez vous connecter ou créer un compte pour accepter cette invitation
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 mb-6">
                <Button
                  variant={authMode === 'signin' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('signin')}
                  className="w-full"
                >
                  Connexion
                </Button>
                <Button
                  variant={authMode === 'signup' ? 'default' : 'outline'}
                  onClick={() => setAuthMode('signup')}
                  className="w-full"
                >
                  Inscription
                </Button>
              </div>

              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email *
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className={`mt-1 ${formErrors.email ? 'border-red-500' : ''}`}
                    required
                    disabled={processing}
                    maxLength={255}
                  />
                  {formErrors.email && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">{formErrors.email}</span>
                    </div>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-medium">
                      Nom complet
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className={`mt-1 ${formErrors.fullName ? 'border-red-500' : ''}`}
                      placeholder={invitation.full_name}
                      disabled={processing}
                      maxLength={100}
                    />
                    {formErrors.fullName && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">{formErrors.fullName}</span>
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <Label htmlFor="password" className="text-sm font-medium">
                    Mot de passe *
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className={`mt-1 ${formErrors.password ? 'border-red-500' : ''}`}
                    required
                    disabled={processing}
                    maxLength={128}
                  />
                  {formErrors.password && (
                    <div className="flex items-center gap-1 mt-1">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      <span className="text-sm text-red-500">{formErrors.password}</span>
                    </div>
                  )}
                  {authMode === 'signup' && !formErrors.password && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 8 caractères avec majuscule, minuscule et chiffre
                    </p>
                  )}
                </div>

                {authMode === 'signup' && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-medium">
                      Confirmer le mot de passe *
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className={`mt-1 ${formErrors.confirmPassword ? 'border-red-500' : ''}`}
                      required
                      disabled={processing}
                      maxLength={128}
                    />
                    {formErrors.confirmPassword && (
                      <div className="flex items-center gap-1 mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                        <span className="text-sm text-red-500">{formErrors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={processing}>
                  {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {authMode === 'signin' ? 'Se connecter' : 'Créer un compte'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Invitation à la Supervision Familiale</CardTitle>
            <p className="text-muted-foreground">
              Vous avez été invité à superviser les interactions matrimoniales selon les principes islamiques
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Invitation Details */}
            <div className="bg-gradient-to-r from-emerald/5 to-gold/5 p-6 rounded-lg border border-emerald/10">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald" />
                Détails de l'invitation
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Personne à superviser</label>
                  <p className="font-semibold">{invitation.inviter.full_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Votre rôle</label>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{getRelationshipLabel(invitation.relationship)}</span>
                    {invitation.is_wali && (
                      <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                        <Shield className="h-3 w-3 mr-1" />
                        Wali
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Âge</label>
                  <p className="font-semibold">{invitation.inviter.age} ans</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Localisation</label>
                  <p className="font-semibold">{invitation.inviter.location}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-muted-foreground">Profession</label>
                  <p className="font-semibold">{invitation.inviter.profession}</p>
                </div>
              </div>
            </div>

            {/* Permissions */}
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Vos autorisations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Voir le profil</p>
                    <p className="text-xs text-muted-foreground">Accès aux informations du profil</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Superviser les conversations</p>
                    <p className="text-xs text-muted-foreground">Recevoir des alertes de modération</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Heart className="h-5 w-5 text-pink-500" />
                  <div>
                    <p className="font-medium">Approuver les matches</p>
                    <p className="text-xs text-muted-foreground">Donner votre avis sur les compatibilités</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Shield className="h-5 w-5 text-emerald" />
                  <div>
                    <p className="font-medium">Guidance islamique</p>
                    <p className="text-xs text-muted-foreground">Conseiller selon les valeurs islamiques</p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Islamic Guidance */}
            <div className="bg-gradient-to-r from-gold/5 to-emerald/5 p-4 rounded-lg border border-gold/10">
              <h4 className="font-medium text-sm mb-2 text-emerald">Guidance Islamique</h4>
              <p className="text-sm text-muted-foreground">
                En acceptant cette invitation, vous vous engagez à guider et superviser selon les principes islamiques, 
                en favorisant des relations halal et en préservant la pudeur (haya) et les bonnes mœurs.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={acceptInvitation}
                disabled={processing}
                className="flex-1 bg-emerald hover:bg-emerald-dark"
              >
                {processing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                <CheckCircle className="h-4 w-4 mr-2" />
                Accepter l'invitation
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="flex-1"
              >
                Décliner
              </Button>
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                <Clock className="h-3 w-3 inline mr-1" />
                Invitation envoyée le {new Date(invitation.invitation_sent_at).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationAccept;