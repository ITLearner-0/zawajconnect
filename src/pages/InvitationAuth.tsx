import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function InvitationAuth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { signUp, signIn } = useAuth();
  const [isSignUp, setIsSignUp] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error("Token d'invitation manquant");
      navigate('/');
    }
  }, [token, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    try {
      let userId;

      if (isSignUp) {
        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        if (error) {
          toast.error(error.message);
          return;
        }

        // Get the newly created user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Erreur lors de la création du compte');
          return;
        }
        userId = user.id;
      } else {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          toast.error(error.message);
          return;
        }

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Erreur lors de la connexion');
          return;
        }
        userId = user.id;
      }

      // Accept the family invitation
      const { data: success, error: invitationError } = await supabase.rpc(
        'accept_family_invitation',
        {
          p_invitation_token: token,
          p_invited_user_id: userId,
        }
      );

      if (invitationError || !success) {
        toast.error("Erreur lors de l'acceptation de l'invitation");
        return;
      }

      toast.success('Invitation acceptée avec succès !');
      navigate('/family-access');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">🕌 Invitation familiale</CardTitle>
          <p className="text-center text-muted-foreground">
            Vous avez été invité(e) à superviser un membre de votre famille sur ZawajConnect
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6">
            <Button
              variant={isSignUp ? 'default' : 'outline'}
              onClick={() => setIsSignUp(true)}
              className="flex-1"
            >
              Créer un compte
            </Button>
            <Button
              variant={!isSignUp ? 'default' : 'outline'}
              onClick={() => setIsSignUp(false)}
              className="flex-1"
            >
              Se connecter
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="fullName">Nom complet</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Traitement...' : "Accepter l'invitation"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
