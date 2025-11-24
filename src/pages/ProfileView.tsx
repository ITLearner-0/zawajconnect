/**
 * ProfileView - Unified Profile Page
 * Phase 3: Full Page Integration
 *
 * This page replaces EnhancedProfile, UserProfile, and ProfilePage.
 * It displays both own profile and other users' profiles using the new redesigned components.
 */

import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { dummyProfiles } from '@/data/profiles';
import { DatabaseProfile } from '@/types/profile';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

// Phase 1 & 2 Components
import {
  HeroProfileSection,
  ProfileSidebar,
  AboutMeSection,
  IslamicPreferencesSection,
  EducationCareerSection,
  WaliInfoSection,
  PhotoGallerySection,
} from '@/components/profile/redesign';

import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';

interface ProfileViewProps {
  /** If true, shows the current user's own profile */
  isOwnProfile?: boolean;
}

const ProfileView = ({ isOwnProfile: forceOwnProfile }: ProfileViewProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Determine if this is the user's own profile
  const isOwnProfile = forceOwnProfile || (currentUserId && profile?.id === currentUserId);

  // Mock stats - Will be loaded from database in production
  const completionStats = {
    overall: profile ? calculateCompletionPercentage(profile) : 0,
    basicInfo: profile ? calculateBasicInfoCompletion(profile) : 0,
    photos: profile ? calculatePhotosCompletion(profile) : 0,
    islamicPrefs: profile ? calculateIslamicPrefsCompletion(profile) : 0,
    compatibility: 80,
  };

  const profileStats = {
    views: 1247,
    likes: 89,
    messages: 34,
  };

  // Mock Islamic preferences - Will be loaded from database
  const islamicPrefs = {
    prayer_frequency: profile?.prayer_frequency || 'Non renseigné',
    quran_reading: 'Quotidienne',
    hijab_preference: 'Oui',
    sect: 'Sunnite',
    madhab: 'Maliki',
    halal_diet: true,
    smoking: 'Non',
    importance_of_religion: 'Très importante',
    desired_partner_sect: 'Sunnite',
  };

  // Mock additional education/career info
  const additionalInfo = {
    field: 'Technologie',
    company: profile?.occupation || 'Non renseigné',
    years_of_experience: 5,
    education_institution: profile?.education_level || 'Non renseigné',
    languages: ['Français', 'Anglais', 'Arabe'],
  };

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };

    getCurrentUser();
  }, []);

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      // If isOwnProfile is forced and we have a user, load their profile
      if (forceOwnProfile && user?.id) {
        await loadProfileById(user.id);
        return;
      }

      // Otherwise, load profile by URL param
      if (!id) {
        setLoading(false);
        return;
      }

      await loadProfileById(id);
    };

    fetchProfile();
  }, [id, forceOwnProfile, user]);

  const loadProfileById = async (profileId: string) => {
    setLoading(true);

    try {
      // First check if this is a demo profile
      const demoProfile = dummyProfiles.find((p) => p.id === profileId);

      if (demoProfile) {
        console.log('Found demo profile:', demoProfile);
        setProfile(demoProfile);
        setLoading(false);
        return;
      }

      // Check if the UUID is valid format
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(profileId)) {
        console.error('Invalid UUID format:', profileId);
        toast({
          title: 'Erreur',
          description: "Format d'identifiant de profil invalide.",
          variant: 'destructive',
        });
        setProfile(null);
        setLoading(false);
        return;
      }

      // Fetch from database
      console.log('Fetching profile from database:', profileId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        if (error.code === 'PGRST116') {
          toast({
            title: 'Profil introuvable',
            description: "Ce profil n'existe pas ou a été supprimé.",
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Erreur',
            description: 'Impossible de charger le profil. Veuillez réessayer.',
            variant: 'destructive',
          });
        }
        setProfile(null);
        setLoading(false);
        return;
      }

      // Check visibility (if not own profile)
      const isOwn = currentUserId === profileId;
      if (!isOwn && !data.is_visible) {
        toast({
          title: 'Profil privé',
          description: "Ce profil n'est pas visible publiquement.",
          variant: 'destructive',
        });
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(data as DatabaseProfile);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur inattendue est survenue.',
        variant: 'destructive',
      });
      setProfile(null);
      setLoading(false);
    }
  };

  const handleMessage = () => {
    if (profile) {
      navigate(`/messages?userId=${profile.id}`);
    }
  };

  const handleVideoCall = () => {
    if (profile) {
      navigate(`/video-call/${profile.id}`);
    }
  };

  const handleContactWali = () => {
    toast({
      title: 'Contacter le Wali',
      description: 'Cette fonctionnalité sera bientôt disponible.',
    });
  };

  const handleEdit = () => {
    navigate('/profile/edit');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex items-center justify-center">
        <StandardLoadingState message="Chargement du profil..." />
      </div>
    );
  }

  // Error state - No profile found
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-12 text-center shadow-lg"
          >
            <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ArrowLeft className="h-8 w-8 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Profil introuvable</h1>
            <p className="text-gray-600 mb-6">
              Le profil que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button onClick={() => navigate('/discover')}>
              Découvrir d'autres profils
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
        </motion.div>

        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <HeroProfileSection
            profile={profile}
            isOwnProfile={isOwnProfile}
            completionPercentage={completionStats.overall}
            verificationScore={calculateVerificationScore(profile)}
            onEdit={handleEdit}
          />
        </motion.div>

        {/* Main Layout: Sidebar + Content */}
        <div className="grid lg:grid-cols-[320px_1fr] gap-6 mt-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProfileSidebar
              profile={profile}
              isOwnProfile={isOwnProfile}
              completionStats={completionStats}
              profileStats={profileStats}
              onMessage={handleMessage}
              onVideoCall={handleVideoCall}
              onContactWali={handleContactWali}
            />
          </motion.div>

          {/* Main Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {/* About Me Section */}
            <motion.div variants={staggerItem} data-section="about-me">
              <AboutMeSection
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </motion.div>

            {/* Islamic Preferences Section */}
            <motion.div variants={staggerItem}>
              <IslamicPreferencesSection
                profile={profile}
                isOwnProfile={isOwnProfile}
                islamicPrefs={islamicPrefs}
              />
            </motion.div>

            {/* Education & Career Section */}
            <motion.div variants={staggerItem}>
              <EducationCareerSection
                profile={profile}
                isOwnProfile={isOwnProfile}
                additionalInfo={additionalInfo}
              />
            </motion.div>

            {/* Photo Gallery Section */}
            <motion.div variants={staggerItem}>
              <PhotoGallerySection
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </motion.div>

            {/* Family & Wali Section */}
            <motion.div variants={staggerItem}>
              <WaliInfoSection
                profile={profile}
                isOwnProfile={isOwnProfile}
                onContactWali={handleContactWali}
              />
            </motion.div>

            {/* Profile Completion Tips */}
            {isOwnProfile && (
              <motion.div variants={staggerItem}>
                <div
                  className={`p-6 rounded-lg border-2 ${
                    completionStats.overall >= 100
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  {completionStats.overall >= 100 ? (
                    <div className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-semibold text-emerald-800 mb-1">
                          Félicitations ! Votre profil est complet
                        </h3>
                        <p className="text-sm text-emerald-700">
                          Vous avez rempli toutes les sections de votre profil. Un profil complet
                          augmente considérablement vos chances de trouver des matches compatibles et
                          inspire confiance aux autres utilisateurs.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800 mb-2">
                          Conseil pour améliorer votre profil
                        </h3>
                        <p className="text-sm text-blue-700 mb-3">
                          Un profil complet augmente vos chances de trouver des matches compatibles de
                          300% !
                        </p>
                        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                          {completionStats.basicInfo < 100 && (
                            <li>Complétez vos informations de base ({completionStats.basicInfo}%)</li>
                          )}
                          {completionStats.photos < 100 && (
                            <li>Ajoutez plus de photos à votre profil ({completionStats.photos}%)</li>
                          )}
                          {completionStats.islamicPrefs < 100 && (
                            <li>
                              Renseignez vos préférences islamiques ({completionStats.islamicPrefs}%)
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Helper functions
function calculateCompletionPercentage(profile: DatabaseProfile): number {
  let score = 0;
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.birth_date,
    profile.gender,
    profile.location,
    profile.education_level,
    profile.occupation,
    profile.about_me,
    profile.religious_practice_level,
    profile.prayer_frequency,
  ];

  fields.forEach((field) => {
    if (field) score += 10;
  });

  return Math.min(score, 100);
}

function calculateBasicInfoCompletion(profile: DatabaseProfile): number {
  let score = 0;
  const fields = [
    profile.first_name,
    profile.last_name,
    profile.birth_date,
    profile.gender,
    profile.location,
  ];

  fields.forEach((field) => {
    if (field) score += 20;
  });

  return Math.min(score, 100);
}

function calculatePhotosCompletion(profile: DatabaseProfile): number {
  const hasProfilePic = !!profile.profile_picture;
  const galleryCount = profile.gallery?.length || 0;

  let score = 0;
  if (hasProfilePic) score += 50;
  score += Math.min(galleryCount * 10, 50);

  return Math.min(score, 100);
}

function calculateIslamicPrefsCompletion(profile: DatabaseProfile): number {
  let score = 0;
  const fields = [
    profile.religious_practice_level,
    profile.prayer_frequency,
  ];

  fields.forEach((field) => {
    if (field) score += 50;
  });

  return Math.min(score, 100);
}

function calculateVerificationScore(profile: DatabaseProfile): number {
  let score = 0;
  if (profile.email_verified) score += 25;
  if (profile.phone_verified) score += 25;
  if (profile.id_verified) score += 25;
  if (profile.wali_verified) score += 25;
  return score;
}

export default ProfileView;
