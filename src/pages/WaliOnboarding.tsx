import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Loader2, CheckCircle, Eye, MessageCircle, Bell, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import PhotoUpload from '@/components/PhotoUpload';

interface ProfileData {
  full_name: string;
  phone: string;
  avatar_url: string;
}

const WaliOnboarding = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    avatar_url: '',
  });

  // Check for invitation token from URL or sessionStorage
  const token = searchParams.get('token') || sessionStorage.getItem('pending_invitation_token');

  useEffect(() => {
    // Store token ONLY if it comes from URL
    const urlToken = searchParams.get('token');
    if (urlToken && !sessionStorage.getItem('pending_invitation_token')) {
      sessionStorage.setItem('pending_invitation_token', urlToken);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if profile is already complete - if yes, redirect immediately
    const checkExistingProfile = async () => {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('user_id', user.id)
          .maybeSingle();

        // Check if user is already a Wali
        const { data: familyMember } = await supabase
          .from('family_members')
          .select('id')
          .eq('invited_user_id', user.id)
          .eq('is_wali', true)
          .eq('invitation_status', 'accepted')
          .maybeSingle();

        // If profile is complete and user is already a Wali, redirect
        if (profile?.full_name && profile.full_name.trim().length > 0 && familyMember) {
          console.log(
            '✅ Profile already complete and user is Wali, clearing token and redirecting'
          );
          sessionStorage.removeItem('pending_invitation_token');
          navigate('/family-supervision', { replace: true });
          return;
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    checkExistingProfile();

    // Load user data from metadata or existing profile
    const loadUserData = async () => {
      try {
        // Try to get full name from metadata first
        const metadataName = user.user_metadata?.full_name;

        // Check if profile already exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('full_name, phone, avatar_url')
          .eq('user_id', user.id)
          .maybeSingle();

        setProfileData({
          full_name: existingProfile?.full_name || metadataName || '',
          phone: existingProfile?.phone || '',
          avatar_url: existingProfile?.avatar_url || '',
        });
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      // Update profile with minimal information
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone || null,
          avatar_url: profileData.avatar_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // If token is present, accept the invitation
      if (token) {
        const { data, error: invitationError } = await supabase.rpc('accept_family_invitation', {
          p_invitation_token: token,
          p_invited_user_id: user.id,
        });

        if (invitationError) {
          console.error('Error accepting invitation:', invitationError);
          toast({
            title: 'Profil créé',
            description:
              "Votre profil a été créé mais l'acceptation de l'invitation a échoué. Veuillez réessayer depuis votre espace de supervision.",
            variant: 'default',
          });
        } else if (data === false) {
          // Invitation token is invalid or expired
          toast({
            title: 'Profil créé',
            description:
              "Le lien d'invitation est invalide ou expiré. Contactez la personne qui vous a invité.",
            variant: 'default',
          });
        } else {
          // Success - clear the stored token
          sessionStorage.removeItem('pending_invitation_token');
          toast({
            title: 'Invitation acceptée',
            description: 'Vous avez été ajouté comme Wali avec succès.',
          });
        }
      }

      // Always clear the token after processing, success or failure
      sessionStorage.removeItem('pending_invitation_token');

      toast({
        title: 'Profil Wali créé avec succès',
        description: 'Bienvenue dans votre espace de supervision familiale',
      });

      // Redirect to family supervision
      navigate('/family-supervision');
    } catch (error) {
      console.error('Error creating Wali profile:', error);
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Impossible de créer le profil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 flex items-center justify-center">
      <div className="container mx-auto max-w-2xl">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl">Créez votre Profil Wali</CardTitle>
            <p className="text-muted-foreground">
              Complétez votre profil pour commencer à superviser les interactions matrimoniales
            </p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Photo Upload */}
              <div className="flex justify-center">
                <PhotoUpload
                  currentPhotoUrl={profileData.avatar_url}
                  onPhotoUpdate={(url) => setProfileData((prev) => ({ ...prev, avatar_url: url }))}
                />
              </div>

              {/* Full Name */}
              <div>
                <Label htmlFor="full_name" className="text-sm font-medium">
                  Nom complet *
                </Label>
                <Input
                  id="full_name"
                  type="text"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="mt-1"
                  required
                  disabled={loading}
                  maxLength={100}
                  placeholder="Votre nom complet"
                />
              </div>

              {/* Phone (Optional) */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  Téléphone (optionnel)
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="mt-1"
                  disabled={loading}
                  maxLength={20}
                  placeholder="+33 6 12 34 56 78"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Pour faciliter la communication avec les personnes que vous supervisez
                </p>
              </div>

              {/* Information Section */}
              <div className="bg-gradient-to-r from-emerald/5 to-gold/5 p-6 rounded-lg border border-emerald/10">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-emerald" />
                  Votre rôle de Wali
                </h3>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Eye className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Supervision des profils</p>
                      <p className="text-muted-foreground">
                        Consultez et approuvez les profils potentiels
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Approbation des matches</p>
                      <p className="text-muted-foreground">
                        Validez les correspondances avant toute communication
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bell className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Notifications en temps réel</p>
                      <p className="text-muted-foreground">
                        Soyez informé de toutes les activités importantes
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <BookOpen className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Guidance islamique</p>
                      <p className="text-muted-foreground">
                        Accompagnez selon les principes islamiques
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" className="w-full" disabled={loading || !profileData.full_name}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Créer mon Espace Wali
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                En continuant, vous acceptez de superviser les interactions matrimoniales selon les
                principes islamiques de respect et de guidance.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WaliOnboarding;
