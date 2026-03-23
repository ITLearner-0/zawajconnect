import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import { ArrowLeft, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dummyProfiles } from '@/data/profiles';
import { supabase } from '@/integrations/supabase/client';

// Import the refactored components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileQuote from '@/components/profile/ProfileQuote';
import StandardLoadingState from '@/components/ui/StandardLoadingState';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
        console.log('Current user ID:', session.user.id);
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        console.log('No profile ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      console.log('Fetching profile with ID:', id);

      try {
        // First check if this is a demo profile
        const demoProfile = dummyProfiles.find((p) => p.id === id);

        if (demoProfile) {
          console.log('Found demo profile:', demoProfile);
          setProfile(demoProfile);
          setLoading(false);
          return;
        }

        console.log('Not a demo profile, checking database...');

        // Check if the UUID is valid format
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(id)) {
          console.error('Invalid UUID format:', id);
          toast({
            title: 'Erreur',
            description: "Format d'identifiant de profil invalide.",
            variant: 'destructive',
          });
          setProfile(null);
          setLoading(false);
          return;
        }

        // First, let's check if the profile exists at all (ignoring visibility)
        console.log('Checking if profile exists in database...');
        const { data: profileCheck, error: checkError } = await supabase
          .from('profiles')
          .select('id, is_visible, full_name')
          .eq('id', id)
          .single();

        if (checkError) {
          console.error('Error checking profile existence:', checkError);
          if (checkError.code === 'PGRST116') {
            console.log('Profile does not exist in database');
            toast({
              title: 'Profil introuvable',
              description: "Ce profil n'existe pas ou a été supprimé.",
              variant: 'destructive',
            });
          } else {
            console.error('Database error:', checkError);
            toast({
              title: 'Erreur',
              description: 'Erreur lors de la vérification du profil.',
              variant: 'destructive',
            });
          }
          setProfile(null);
          setLoading(false);
          return;
        }

        console.log('Profile check result:', profileCheck);

        const profileCheckAny = profileCheck as any;
        if (!profileCheckAny.is_visible) {
          console.log('Profile exists but is not visible');
          toast({
            title: 'Profil non disponible',
            description: "Ce profil n'est pas visible publiquement.",
            variant: 'destructive',
          });
          setProfile(null);
          setLoading(false);
          return;
        }

        // Now fetch the full profile data
        console.log('Fetching full profile data...');
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('is_visible', true)
          .single();

        if (error) {
          console.error('Error fetching full profile data:', error);
          toast({
            title: 'Erreur',
            description: 'Erreur lors de la récupération des données du profil.',
            variant: 'destructive',
          });
          setProfile(null);
          setLoading(false);
          return;
        }

        if (profileData) {
          // Convert database profile to DatabaseProfile format
          const profileDataAny = profileData as any;
          const formattedProfile: DatabaseProfile = {
            id: profileData.id,
            full_name: profileDataAny.full_name || '',
            gender: profileData.gender || '',
            location: profileData.location || '',
            education_level: profileDataAny.education_level || '',
            occupation: profileDataAny.occupation || '',
            religious_practice_level: profileDataAny.religious_practice_level || '',
            birth_date: profileDataAny.birth_date || '',
            bio: profileDataAny.bio || '',
            prayer_frequency: profileDataAny.prayer_frequency || '',
            wali_name: profileDataAny.wali_name || '',
            wali_relationship: profileDataAny.wali_relationship || '',
            wali_contact: profileDataAny.wali_contact || '',
            profile_picture: profileDataAny.profile_picture || '',
            gallery: profileDataAny.gallery || [],
            email_verified: profileDataAny.email_verified || false,
            phone_verified: profileDataAny.phone_verified || false,
            id_verified: profileDataAny.id_verified || false,
            wali_verified: profileDataAny.wali_verified || false,
            is_visible: profileDataAny.is_visible || false,
            is_verified: profileDataAny.is_verified || false,
            privacy_settings: profileDataAny.privacy_settings || {
              profileVisibilityLevel: 1,
              showAge: true,
              showLocation: true,
              showOccupation: true,
              allowNonMatchMessages: true,
            },
            blocked_users: profileDataAny.blocked_users || [],
            content_flags: [],
            moderation_status: 'approved',
            last_moderation_date: profileDataAny.last_moderation_date ?? undefined,
            created_at: profileData.created_at || '',
            updated_at: profileData.updated_at || '',
          };

          console.log('Successfully formatted profile:', formattedProfile);
          setProfile(formattedProfile);
        } else {
          console.log('No profile data returned');
          setProfile(null);
        }
      } catch (error) {
        console.error('Unexpected error fetching profile:', error);
        toast({
          title: 'Erreur',
          description: "Une erreur inattendue s'est produite lors du chargement du profil.",
          variant: 'destructive',
        });
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [id, toast]);

  const handleEditMyProfile = () => {
    navigate('/profile');
  };

  const handleSignOut = () => {
    navigate('/');
    toast({
      title: 'Déconnecté',
      description: 'Vous avez été déconnecté avec succès.',
    });
  };

  // Check if this is the current user's own profile
  const isOwnProfile = currentUserId === id;

  return (
    <div className="min-h-screen py-8" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="container mx-auto px-4 max-w-4xl">
        <StandardLoadingState
          loading={loading}
          loadingText="Chargement du profil..."
          error={!profile && !loading ? 'Profil introuvable' : null}
          emptyState={
            !profile && !loading
              ? {
                  title: 'Profil Introuvable',
                  description:
                    "Nous n'avons pas pu trouver le profil que vous recherchez. Il a peut-être été supprimé ou n'est plus visible.",
                  action: {
                    label: 'Parcourir les Profils',
                    onClick: () => navigate('/nearby'),
                  },
                }
              : undefined
          }
        >
          {profile && (
            <>
              <ProfileHeader onSignOut={handleSignOut} />

              {/* Add Edit Profile button if viewing own profile */}
              {isOwnProfile && (
                <div className="mb-6 text-center">
                  <Button
                    onClick={handleEditMyProfile}
                    style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Modifier Mon Profil
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 space-y-6">
                  <ProfileCard profile={profile} />
                  {id && <BadgeShowcase userId={id} maxBadges={5} />}
                </div>

                <div className="md:col-span-2">
                  <ProfileDetails profile={profile} />
                  <ProfileQuote />
                </div>
              </div>
            </>
          )}
        </StandardLoadingState>
      </div>
    </div>
  );
};

export default UserProfile;
