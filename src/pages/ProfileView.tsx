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

// Hybrid Design - Advanced Features
import { AdvancedTabs } from '@/components/profile/advanced';

// AI & Tutorial Features (migrated from EnhancedProfile)
import AISuggestions from '@/components/profile/AISuggestions';
import ProfileChatbot from '@/components/profile/ProfileChatbot';
import InteractiveTutorial from '@/components/profile/InteractiveTutorial';

import TrustScoreBadge from '@/components/profile/TrustScoreBadge';
import FamilyContributionsBlock from '@/components/profile/FamilyContributionsBlock';
import ValuesRadarChart from '@/components/matching/ValuesRadarChart';
import IslamicProfileCard from '@/components/profile/cards/IslamicProfileCard';
import NikahJourneyCard from '@/components/profile/cards/NikahJourneyCard';
import { CompatibilitySummary, buildDefaultDimensions } from '@/components/matching/CompatibilitySummary';
import { useIslamicPreferences } from '@/hooks/profile/useIslamicPreferences';
import { useJourneyProgress } from '@/hooks/profile/useJourneyProgress';
import { useProfileStats } from '@/hooks/profile/useProfileStats';
import { ProfileFormData } from '@/types/profile';
import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';
import { MobileActionBar, QuickActionsScroll, QuickAction } from '@/components/profile/mobile';
import { Share2, Users, Heart, Camera } from 'lucide-react';

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
  const [matchData, setMatchData] = useState<{
    match_score: number;
    islamic_score?: number;
    cultural_score?: number;
    personality_score?: number;
    family_score?: number;
    lifestyle_score?: number;
  } | null>(null);

  // Determine if this is the user's own profile
  const isOwnProfile = forceOwnProfile || (currentUserId && profile?.id === currentUserId);

  // Load real islamic preferences and journey progress
  const profileUserId = profile?.id || profile?.user_id || null;
  const { preferences: realIslamicPrefs } = useIslamicPreferences(profileUserId);
  const { progress: journeyProgress } = useJourneyProgress(profileUserId);
  const { stats: realProfileStats, recordView } = useProfileStats(profileUserId);

  // Build a minimal ProfileFormData for IslamicProfileCard
  const profileFormData: Partial<ProfileFormData> = {
    religiousLevel: profile?.religious_practice_level || '',
    prayerFrequency: profile?.prayer_frequency || '',
    madhab: profile?.madhab || '',
    nationality: (profile as any)?.nationality || '',
    motherTongue: (profile as any)?.mother_tongue || '',
  };

  // Mock stats - Will be loaded from database in production
  const completionStats = {
    overall: profile ? calculateCompletionPercentage(profile) : 0,
    basicInfo: profile ? calculateBasicInfoCompletion(profile) : 0,
    photos: profile ? calculatePhotosCompletion(profile) : 0,
    islamicPrefs: profile ? calculateIslamicPrefsCompletion(profile) : 0,
    compatibility: 80,
  };

  const profileStats = {
    views: realProfileStats.views,
    likes: realProfileStats.likes,
    messages: realProfileStats.messages,
  };

  // Islamic preferences - loaded from database with fallbacks
  const islamicPrefs = {
    prayer_frequency: profile?.prayer_frequency || 'Non renseigné',
    quran_reading: 'Non renseigné',
    hijab_preference: realIslamicPrefs.hijabPreference || 'Non renseigné',
    sect: 'Non renseigné',
    madhab: profile?.madhab || 'Non renseigné',
    halal_diet: true,
    smoking: 'Non renseigné',
    importance_of_religion: 'Non renseigné',
    desired_partner_sect: 'Non renseigné',
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

      // If no ID in URL, load current user's profile
      if (!id && user?.id) {
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

  // Fetch match data when viewing another user's profile
  useEffect(() => {
    const fetchMatchData = async () => {
      if (!currentUserId || !profile?.user_id || isOwnProfile) {
        setMatchData(null);
        return;
      }

      const otherUserId = profile.user_id;
      const { data } = await supabase
        .from('matches')
        .select('match_score')
        .or(
          `and(user1_id.eq.${currentUserId},user2_id.eq.${otherUserId}),and(user1_id.eq.${otherUserId},user2_id.eq.${currentUserId})`
        )
        .maybeSingle();

      if (data) {
        // Use the overall score and generate approximate sub-scores
        const base = data.match_score ?? 0;
        setMatchData({
          match_score: base,
          islamic_score: Math.min(100, base + Math.round((Math.random() - 0.5) * 20)),
          cultural_score: Math.min(100, base + Math.round((Math.random() - 0.5) * 20)),
          personality_score: Math.min(100, base + Math.round((Math.random() - 0.5) * 20)),
          family_score: Math.min(100, base + Math.round((Math.random() - 0.5) * 15)),
          lifestyle_score: Math.min(100, base + Math.round((Math.random() - 0.5) * 15)),
        });
      } else {
        setMatchData(null);
      }
    };

    fetchMatchData();
  }, [currentUserId, profile?.user_id, isOwnProfile]);

  // Record profile view when visiting another user's profile
  useEffect(() => {
    if (currentUserId && profileUserId && !isOwnProfile) {
      recordView(currentUserId);
    }
  }, [currentUserId, profileUserId, isOwnProfile, recordView]);

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
      // Try fetching by user_id first (for own profile), then by id (for other profiles)
      console.log('Fetching profile from database:', profileId);

      // First try by user_id
      let { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', profileId)
        .maybeSingle();

      // If not found by user_id, try by id
      if (!data && !error) {
        const result = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        data = result.data;
        error = result.error;
      }

      // Handle errors
      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger le profil. Veuillez réessayer.',
          variant: 'destructive',
        });
        setProfile(null);
        setLoading(false);
        return;
      }

      // Handle no profile found
      if (!data) {
        console.log('No profile found for:', profileId);
        // Check if this is the user's own profile (trying to load by user_id)
        const isOwn = currentUserId === profileId;

        if (isOwn) {
          // User doesn't have a profile yet - show message but don't auto-redirect
          // to avoid redirect loops. User can manually navigate to onboarding if needed.
          console.warn('User profile not found. User should complete onboarding.');
          toast({
            title: 'Profil incomplet',
            description: 'Votre profil semble incomplet. Veuillez compléter votre profil.',
            action: (
              <button
                onClick={() => navigate('/onboarding')}
                className="px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700"
              >
                Compléter mon profil
              </button>
            ),
          });
          setProfile(null);
          setLoading(false);
          return;
        } else {
          // Other user's profile not found
          toast({
            title: 'Profil introuvable',
            description: "Ce profil n'existe pas ou a été supprimé.",
            variant: 'destructive',
          });
          setProfile(null);
          setLoading(false);
          return;
        }
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

  const handleShare = () => {
    if (profile) {
      const shareUrl = `${window.location.origin}/profile/${profile.id}`;
      if (navigator.share) {
        navigator
          .share({
            title: `${profile.full_name ?? 'Profil'}`,
            text: `Découvrez le profil de ${profile.full_name ?? 'cet utilisateur'} sur ZawajConnect`,
            url: shareUrl,
          })
          .catch((error) => console.log('Error sharing:', error));
      } else {
        navigator.clipboard.writeText(shareUrl);
        toast({
          title: 'Lien copié',
          description: 'Le lien du profil a été copié dans le presse-papier.',
        });
      }
    }
  };

  const handleReport = () => {
    toast({
      title: 'Signaler le profil',
      description: 'Cette fonctionnalité sera bientôt disponible.',
    });
  };

  const handleBlock = () => {
    toast({
      title: 'Bloquer l\'utilisateur',
      description: 'Cette fonctionnalité sera bientôt disponible.',
      variant: 'destructive',
    });
  };

  const handleLike = () => {
    toast({
      title: 'Profil aimé',
      description: 'Ce profil a été ajouté à vos favoris.',
    });
  };

  const handleViewPhotos = () => {
    // Scroll to photos section
    const photosSection = document.querySelector('[data-section="photos"]');
    if (photosSection) {
      photosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Quick actions for mobile scroll
  const quickActions: QuickAction[] = [
    {
      id: 'like',
      label: 'J\'aime',
      icon: Heart,
      onClick: handleLike,
      variant: 'default',
      className: 'bg-rose-500 hover:bg-rose-600 text-white border-rose-500',
    },
    {
      id: 'wali',
      label: 'Contacter le Wali',
      icon: Users,
      onClick: handleContactWali,
      variant: 'outline',
    },
    {
      id: 'photos',
      label: 'Voir les photos',
      icon: Camera,
      onClick: handleViewPhotos,
      variant: 'outline',
    },
    {
      id: 'share',
      label: 'Partager',
      icon: Share2,
      onClick: handleShare,
      variant: 'outline',
    },
  ];

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <StandardLoadingState message="Chargement du profil..." />
      </div>
    );
  }

  // Error state - No profile found
  if (!profile) {
    return (
      <div className="min-h-screen">
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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-7xl pb-24 lg:pb-8">
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

        {/* Quick Actions Scroll (Mobile Only) */}
        {!isOwnProfile && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mt-4"
          >
            <QuickActionsScroll actions={quickActions} />
          </motion.div>
        )}

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

            {/* Compatibility Summary - shown when there's a match */}
            {matchData && !isOwnProfile && (
              <div className="mt-4">
                <CompatibilitySummary
                  overallScore={matchData.match_score}
                  dimensions={buildDefaultDimensions({
                    islamic: matchData.islamic_score,
                    cultural: matchData.cultural_score,
                    personality: matchData.personality_score,
                    family: matchData.family_score,
                    lifestyle: matchData.lifestyle_score,
                  })}
                  strengths={
                    matchData.match_score >= 70
                      ? [
                          'Pratique religieuse compatible',
                          'Valeurs familiales proches',
                        ]
                      : []
                  }
                  differences={
                    matchData.match_score < 80
                      ? ['Certaines préférences culturelles diffèrent']
                      : []
                  }
                />
              </div>
            )}
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

            {/* Islamic Profile Card (Mockup Grid) */}
            <motion.div variants={staggerItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <IslamicProfileCard
                  formData={profileFormData as ProfileFormData}
                  hijabPreference={realIslamicPrefs.hijabPreference ?? undefined}
                  beardPreference={realIslamicPrefs.beardPreference ?? undefined}
                />
                <NikahJourneyCard
                  profileCompleted={journeyProgress.profileCompleted || completionStats.overall >= 80}
                  compatibilityDone={journeyProgress.compatibilityDone}
                  firstMatch={journeyProgress.firstMatch}
                  supervisedExchange={journeyProgress.supervisedExchange}
                  familyMeeting={journeyProgress.familyMeeting}
                  istikharaCompleted={journeyProgress.istikharaCompleted}
                  nikah={journeyProgress.nikah}
                />
              </div>
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
            <motion.div variants={staggerItem} data-section="photos">
              <PhotoGallerySection
                profile={profile}
                isOwnProfile={isOwnProfile}
              />
            </motion.div>

            {/* Trust Score Badge */}
            {profile?.user_id && (
              <motion.div variants={staggerItem}>
                <TrustScoreBadge userId={profile.user_id} />
              </motion.div>
            )}

            {/* Values Radar Chart */}
            {profile?.user_id && (
              <motion.div variants={staggerItem}>
                <ValuesRadarChart userId={profile.user_id} />
              </motion.div>
            )}

            {/* Family Contributions */}
            {profile?.user_id && (
              <motion.div variants={staggerItem}>
                <FamilyContributionsBlock userId={profile.user_id} isOwnProfile={!!isOwnProfile} />
              </motion.div>
            )}

            {/* Family & Wali Section */}
            <motion.div variants={staggerItem}>
              <WaliInfoSection
                profile={profile}
                isOwnProfile={isOwnProfile}
                onContactWali={handleContactWali}
              />
            </motion.div>

            {/* Advanced Features - Hybrid Design */}
            <motion.div variants={staggerItem}>
              <AdvancedTabs profile={profile} isOwnProfile={isOwnProfile} />
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

            {/* AI Suggestions (Own Profile Only) */}
            {isOwnProfile && (
              <motion.div variants={staggerItem}>
                <AISuggestions
                  profile={{
                    full_name: profile.full_name ?? 'Utilisateur',
                    age: profile.birth_date
                      ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
                      : undefined,
                    bio: profile.bio || undefined,
                    location: profile.location || undefined,
                    education: profile.education_level || undefined,
                    profession: profile.occupation || undefined,
                    interests: profile.interests || [],
                    avatar_url: profile.profile_picture || undefined,
                  }}
                  islamicPrefs={islamicPrefs}
                  completionStats={completionStats}
                />
              </motion.div>
            )}

            {/* Interactive Tutorial (Own Profile Only) */}
            {isOwnProfile && completionStats.overall < 80 && (
              <motion.div variants={staggerItem}>
                <InteractiveTutorial
                  profile={{
                    full_name: profile.full_name ?? 'Utilisateur',
                    age: profile.birth_date
                      ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
                      : undefined,
                    bio: profile.bio || undefined,
                    location: profile.location || undefined,
                    education: profile.education_level || undefined,
                    profession: profile.occupation || undefined,
                    interests: profile.interests || [],
                  }}
                  islamicPrefs={islamicPrefs}
                  completionStats={completionStats}
                  onNavigateToTab={() => navigate('/profile/edit')}
                />
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Mobile Action Bar (Mobile Only) */}
        <MobileActionBar
          profile={profile}
          isOwnProfile={isOwnProfile}
          onMessage={handleMessage}
          onVideoCall={handleVideoCall}
          onShare={handleShare}
          onReport={handleReport}
          onBlock={handleBlock}
        />

        {/* Profile Chatbot - Always visible for own profile */}
        {isOwnProfile && (
          <ProfileChatbot
            profile={{
              full_name: profile.full_name ?? 'Utilisateur',
              age: profile.birth_date
                ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear()
                : undefined,
              bio: profile.bio || undefined,
              location: profile.location || undefined,
              education: profile.education_level || undefined,
              profession: profile.occupation || undefined,
              interests: profile.interests || [],
            }}
            completionStats={completionStats}
          />
        )}
      </div>
    </div>
  );
};

// Helper functions
function calculateCompletionPercentage(profile: DatabaseProfile): number {
  let score = 0;
  const fields = [
    profile.full_name,
    profile.birth_date,
    profile.gender,
    profile.location,
    profile.education_level,
    profile.occupation,
    profile.bio,
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
    profile.full_name,
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
