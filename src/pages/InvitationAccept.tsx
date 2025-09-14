import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  XCircle, 
  Shield, 
  Users, 
  Eye, 
  MessageCircle,
  Clock,
  Heart,
  Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyInvitation {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
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
    if (user && invitation) {
      // User is authenticated, try to accept invitation
      acceptInvitation();
    }
  }, [user, invitation]);

  const validateInvitation = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          inviter:profiles!family_members_user_id_fkey(full_name, age, location, profession)
        `)
        .eq('invitation_token', token)
        .eq('invitation_status', 'pending')
        .maybeSingle();

      if (error || !data) {
        throw new Error('Invitation non trouvée ou expirée');
      }

      // Check if invitation is expired (7 days)
      const sentAt = new Date(data.invitation_sent_at);
      const now = new Date();
      const diffDays = (now.getTime() - sentAt.getTime()) / (1000 * 3600 * 24);

      if (diffDays > 7) {
        throw new Error('Cette invitation a expiré');
      }

      setInvitation({
        ...data,
        inviter: data.inviter || { full_name: 'Unknown', age: 0, location: 'Unknown', profession: 'Unknown' }
      } as FamilyInvitation);
      setAuthForm(prev => ({ ...prev, email: data.email }));

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
      const { data, error } = await supabase.rpc('accept_family_invitation', {
        p_invitation_token: token,
        p_invited_user_id: user.id
      });

      if (error || !data) {
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

    setProcessing(true);
    try {
      if (authMode === 'signup') {
        if (authForm.password !== authForm.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }

        const { error } = await signUp(authForm.email, authForm.password, authForm.fullName || invitation.full_name);
        if (error) throw error;

        toast({
          title: "Compte créé",
          description: "Votre compte a été créé. Vérifiez votre email puis revenez accepter l'invitation.",
        });
      } else {
        const { error } = await signIn(authForm.email, authForm.password);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Auth error:', error);
      toast({
        title: "Erreur d'authentification",
        description: error instanceof Error ? error.message : "Erreur lors de l'authentification",
        variant: "destructive"
      });
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
                  <label className="text-sm font-medium mb-1 block">Email</label>
                  <input
                    type="email"
                    value={authForm.email}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    required
                    disabled={processing}
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Nom complet</label>
                    <input
                      type="text"
                      value={authForm.fullName}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      placeholder={invitation.full_name}
                      disabled={processing}
                    />
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-1 block">Mot de passe</label>
                  <input
                    type="password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                    minLength={6}
                    required
                    disabled={processing}
                  />
                </div>

                {authMode === 'signup' && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={authForm.confirmPassword}
                      onChange={(e) => setAuthForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                      className="w-full p-2 border rounded-md"
                      minLength={6}
                      required
                      disabled={processing}
                    />
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