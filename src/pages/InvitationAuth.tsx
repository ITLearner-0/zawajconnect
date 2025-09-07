import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Shield, Users, Eye, EyeOff } from 'lucide-react';

const InvitationAuth = () => {
  const [searchParams] = useSearchParams();
  const invitationToken = searchParams.get('invitation');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [invitationDetails, setInvitationDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { signUp, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      navigate('/family-access');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (invitationToken) {
      loadInvitationDetails();
    }
  }, [invitationToken]);

  const loadInvitationDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('full_name, email, relationship, is_wali, user_id, profiles!inner(full_name)')
        .eq('invitation_token', invitationToken)
        .eq('invitation_status', 'pending')
        .single();

      if (error || !data) {
        setError('Invitation invalide ou expirée');
        return;
      }

      setInvitationDetails(data);
      setEmail(data.email || '');
    } catch (error) {
      console.error('Error loading invitation:', error);
      setError('Erreur lors du chargement de l\'invitation');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    try {
      const { error: signUpError } = await signUp(email, password, invitationDetails.full_name);
      
      if (signUpError) {
        setError(translateAuthError(signUpError.message));
      } else {
        // Accept the family invitation after successful signup
        const { data: { user: newUser } } = await supabase.auth.getUser();
        if (newUser) {
          const { data: accepted, error: acceptError } = await supabase
            .rpc('accept_family_invitation', {
              p_invitation_token: invitationToken,
              p_invited_user_id: newUser.id
            });

          if (acceptError || !accepted) {
            console.error('Error accepting invitation:', acceptError);
            toast({
              title: "Compte créé",
              description: "Votre compte a été créé mais l'invitation n'a pas pu être acceptée automatiquement.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Bienvenue !",
              description: "Votre compte a été créé et vous pouvez maintenant superviser.",
            });
          }
        }
        navigate('/family-access');
      }
    } catch (error: any) {
      setError('Une erreur est survenue lors de la création du compte');
    } finally {
      setLoading(false);
    }
  };

  const translateAuthError = (errorMessage: string) => {
    if (errorMessage.includes('User already registered')) {
      return 'Un compte avec cet email existe déjà';
    }
    if (errorMessage.includes('Invalid email')) {
      return 'Adresse email invalide';
    }
    return 'Une erreur est survenue. Veuillez réessayer.';
  };

  if (!invitationToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation non trouvée</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">
              Aucun token d'invitation n'a été fourni.
            </p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-emerald hover:bg-emerald-dark"
            >
              Aller à la page de connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error && !invitationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Invitation invalide</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground mb-4">{error}</p>
            <Button 
              onClick={() => navigate('/auth')}
              className="w-full bg-emerald hover:bg-emerald-dark"
            >
              Aller à la page de connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!invitationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement de l'invitation...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="border-emerald/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Invitation Familiale</CardTitle>
            <CardDescription>
              Créez votre compte pour superviser selon les principes islamiques
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="bg-emerald/10 border border-emerald/20 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-emerald-dark mt-0.5" />
                <div>
                  <p className="font-medium text-emerald-dark mb-1">
                    Invitation de {invitationDetails.profiles?.full_name}
                  </p>
                  <p className="text-sm text-emerald-700 mb-2">
                    Rôle : {invitationDetails.relationship}
                    {invitationDetails.is_wali && ' (Wali)'}
                  </p>
                  <p className="text-sm text-emerald-600">
                    Vous pourrez superviser les interactions selon les valeurs islamiques.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={invitationDetails.full_name}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Créer un mot de passe</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald hover:bg-emerald-dark"
              >
                {loading ? 'Création du compte...' : 'Créer mon compte de supervision'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-4">
              En créant ce compte, vous acceptez de superviser selon les principes islamiques.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InvitationAuth;