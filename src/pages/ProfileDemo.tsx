/**
 * Profile Redesign Demo Page
 *
 * Demonstrates all Phase 1 components with realistic data.
 * This page showcases the new "Hero Profile" layout and design system.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  BookOpen,
  Briefcase,
  Users,
  Camera,
  FileText,
  TrendingUp,
  Eye,
  MessageCircle,
  Award,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// New redesigned components
import {
  HeroProfileSection,
  ProfileSidebar,
  ProfileSection,
  InfoGrid,
  SectionContent,
  SectionText,
  StatCard,
  StatItem,
  ProgressItem,
  CircularProgress,
  MetricRow,
  ComparisonBar,
  // Phase 2: Content Sections
  AboutMeSection,
  IslamicPreferencesSection,
  EducationCareerSection,
  WaliInfoSection,
  PhotoGallerySection,
} from '@/components/profile/redesign';

import { DatabaseProfile } from '@/types/profile';
import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';

/**
 * Demo Profile Data
 */
const demoProfile: DatabaseProfile = {
  id: '00000000-0000-0000-0000-000000000001', // Valid UUID for demo
  first_name: 'Amira',
  last_name: 'Hassan',
  gender: 'female',
  birth_date: '1995-03-15',
  location: 'Paris, France',
  education_level: 'Master',
  occupation: 'Software Engineer',
  religious_practice_level: 'Practicing',
  prayer_frequency: '5 times daily',
  bio:
    "Assalamu alaikum! Je suis une développeuse passionnée qui aime apprendre et partager ses connaissances. Je cherche quelqu'un qui partage mes valeurs islamiques et qui souhaite construire une famille basée sur la foi, le respect et l'amour.\n\nJ'aime lire, voyager et découvrir de nouvelles cultures. Je suis très proche de ma famille et j'accorde une grande importance aux liens familiaux.",
  wali_name: 'Ahmed Hassan',
  wali_relationship: 'Père',
  wali_contact: '+33 6 12 34 56 78',
  profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  gallery: [
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  ],
  email_verified: true,
  phone_verified: true,
  id_verified: true,
  wali_verified: true,
  is_visible: true,
  is_verified: true,
  privacy_settings: {
    profileVisibilityLevel: 2,
    showAge: true,
    showLocation: true,
    showOccupation: true,
    allowNonMatchMessages: false,
  },
  blocked_users: [],
  content_flags: [],
  moderation_status: 'approved',
  created_at: '2024-01-15T10:00:00Z',
  updated_at: '2024-11-24T15:30:00Z',
};

const ProfileDemo = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'own' | 'other'>('own');

  const isOwnProfile = viewMode === 'own';

  // Mock stats - Based on demoProfile data which is complete
  const completionStats = {
    overall: 100,
    basicInfo: 100,
    photos: 100,
    islamicPrefs: 100,
    compatibility: 100,
  };

  const profileStats = {
    views: 1247,
    likes: 89,
    messages: 34,
  };

  // Mock Islamic preferences
  const islamicPrefs = {
    prayer_frequency: '5 fois par jour',
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
    company: 'Tech Startup',
    years_of_experience: 5,
    education_institution: 'Université Paris-Saclay',
    languages: ['Français', 'Anglais', 'Arabe'],
  };

  const handleMessage = () => {
    console.log('Message clicked');
  };

  const handleVideoCall = () => {
    console.log('Video call clicked');
  };

  const handleContactWali = () => {
    console.log('Contact wali clicked');
  };

  const handleEdit = () => {
    // Scroll to the About Me section
    const aboutSection = document.querySelector('[data-section="about-me"]');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Show an alert to indicate this is a demo
    setTimeout(() => {
      alert('💡 Ceci est une démo. En mode réel, cela vous permettrait de modifier toutes les sections de votre profil.');
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Demo Controls */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-white rounded-lg border-2 border-emerald-200 p-6 shadow-md"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                🎨 Profile Redesign Demo - Phase 1 & 2
              </h1>
              <p className="text-gray-600">
                Découvrez le nouveau design "Hero Profile" avec toutes les sections de contenu
              </p>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <Button
                variant={isOwnProfile ? 'default' : 'outline'}
                onClick={() => setViewMode('own')}
                className={isOwnProfile ? 'bg-emerald-500 hover:bg-emerald-600' : ''}
              >
                Mon Profil
              </Button>
              <Button
                variant={!isOwnProfile ? 'default' : 'outline'}
                onClick={() => setViewMode('other')}
                className={!isOwnProfile ? 'bg-rose-500 hover:bg-rose-600' : ''}
              >
                Profil d'un autre
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/profile/user-1')}
                className="bg-blue-50 hover:bg-blue-100 border-blue-300"
              >
                🚀 Phase 3: ProfileView
              </Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Retour
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="profile">Profil Complet</TabsTrigger>
            <TabsTrigger value="hero">Hero Section</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="components">Composants</TabsTrigger>
          </TabsList>

          {/* Tab 1: Full Profile */}
          <TabsContent value="profile" className="space-y-6">
            {/* Hero Section */}
            <HeroProfileSection
              profile={demoProfile}
              isOwnProfile={isOwnProfile}
              completionPercentage={completionStats.overall}
              verificationScore={95}
              onEdit={handleEdit}
            />

            {/* Main Layout: Sidebar + Content */}
            <div className="grid lg:grid-cols-[320px_1fr] gap-6">
              {/* Sidebar */}
              <ProfileSidebar
                profile={demoProfile}
                isOwnProfile={isOwnProfile}
                completionStats={completionStats}
                profileStats={profileStats}
                onMessage={handleMessage}
                onVideoCall={handleVideoCall}
                onContactWali={handleContactWali}
              />

              {/* Main Content */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-6"
              >
                {/* About Me Section - Using new component */}
                <motion.div variants={staggerItem} data-section="about-me">
                  <AboutMeSection
                    profile={demoProfile}
                    isOwnProfile={isOwnProfile}
                  />
                </motion.div>

                {/* Islamic Preferences Section - Using new component */}
                <motion.div variants={staggerItem}>
                  <IslamicPreferencesSection
                    profile={demoProfile}
                    isOwnProfile={isOwnProfile}
                    islamicPrefs={islamicPrefs}
                  />
                </motion.div>

                {/* Education & Career Section - Using new component */}
                <motion.div variants={staggerItem}>
                  <EducationCareerSection
                    profile={demoProfile}
                    isOwnProfile={isOwnProfile}
                    additionalInfo={additionalInfo}
                  />
                </motion.div>

                {/* Photo Gallery Section - Using new component */}
                <motion.div variants={staggerItem}>
                  <PhotoGallerySection
                    profile={demoProfile}
                    isOwnProfile={isOwnProfile}
                  />
                </motion.div>

                {/* Family & Wali Section - Using new component */}
                <motion.div variants={staggerItem}>
                  <WaliInfoSection
                    profile={demoProfile}
                    isOwnProfile={isOwnProfile}
                    onContactWali={handleContactWali}
                  />
                </motion.div>

                {/* Profile Completion Tips */}
                {isOwnProfile && (
                  <motion.div variants={staggerItem}>
                    <div className={`p-6 rounded-lg border-2 ${
                      completionStats.overall >= 100
                        ? 'bg-emerald-50 border-emerald-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}>
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
                              Un profil complet augmente vos chances de trouver des matches compatibles de 300% !
                            </p>
                            <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                              {completionStats.basicInfo < 100 && (
                                <li>Complétez vos informations de base ({completionStats.basicInfo}%)</li>
                              )}
                              {completionStats.photos < 100 && (
                                <li>Ajoutez plus de photos à votre profil ({completionStats.photos}%)</li>
                              )}
                              {completionStats.islamicPrefs < 100 && (
                                <li>Renseignez vos préférences islamiques ({completionStats.islamicPrefs}%)</li>
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
          </TabsContent>

          {/* Tab 2: Hero Section Demo */}
          <TabsContent value="hero" className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">HeroProfileSection Component</h2>
              <p className="text-gray-600 mb-6">
                Section hero moderne avec photo de couverture, avatar overlay, et statistiques rapides.
              </p>
              <HeroProfileSection
                profile={demoProfile}
                isOwnProfile={isOwnProfile}
                completionPercentage={completionStats.overall}
                verificationScore={95}
                onEdit={handleEdit}
              />
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Photo de couverture avec pattern islamique
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Avatar avec badge de vérification
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  3 statistiques rapides (Complétion, Vérifié, Actif)
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Bouton d'édition conditionnel
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Animations Framer Motion fluides
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  Responsive (mobile/desktop)
                </li>
              </ul>
            </div>
          </TabsContent>

          {/* Tab 3: Statistics Demo */}
          <TabsContent value="stats" className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">StatCard Components</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard
                  icon={Eye}
                  label="Vues du Profil"
                  value="1.2K"
                  color="emerald"
                  trend={{ value: 12, label: 'vs semaine dernière' }}
                />
                <StatCard
                  icon={Heart}
                  label="Likes Reçus"
                  value="89"
                  color="rose"
                  trend={{ value: -3, label: 'vs semaine dernière' }}
                />
                <StatCard
                  icon={MessageCircle}
                  label="Messages"
                  value="34"
                  color="gold"
                  trend={{ value: 8, label: 'vs semaine dernière' }}
                />
              </div>
            </div>

            {/* Stat Items */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">StatItem Components</h2>
              <div className="grid grid-cols-3 gap-8">
                <StatItem icon={TrendingUp} label="Score" value="85%" color="emerald" size="lg" />
                <StatItem icon={Award} label="Badges" value="12" color="gold" size="lg" />
                <StatItem icon={Users} label="Matches" value="23" color="rose" size="lg" />
              </div>
            </div>

            {/* Progress Items */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">ProgressItem Components</h2>
              <div className="space-y-4">
                <ProgressItem
                  label="Informations de base"
                  percentage={95}
                  color="emerald"
                  icon={FileText}
                />
                <ProgressItem label="Photos" percentage={80} color="gold" icon={Camera} />
                <ProgressItem
                  label="Préférences islamiques"
                  percentage={90}
                  color="rose"
                  icon={Heart}
                />
                <ProgressItem
                  label="Test de compatibilité"
                  percentage={75}
                  color="sage"
                  icon={TrendingUp}
                />
              </div>
            </div>

            {/* Circular Progress */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">CircularProgress Component</h2>
              <div className="flex justify-around items-center">
                <CircularProgress percentage={85} size={120} color="emerald" label="Complétion" />
                <CircularProgress percentage={95} size={120} color="gold" label="Vérifié" />
                <CircularProgress percentage={75} size={120} color="rose" label="Compatibilité" />
              </div>
            </div>

            {/* Metric Rows */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">MetricRow Components</h2>
              <div className="space-y-2">
                <MetricRow icon={Eye} label="Vues du profil" value="1,247" color="sage" />
                <MetricRow icon={Heart} label="Likes reçus" value="89" color="rose" />
                <MetricRow icon={MessageCircle} label="Messages" value="34" color="emerald" />
                <MetricRow icon={Award} label="Badges gagnés" value="12" color="gold" />
              </div>
            </div>

            {/* Comparison Bar */}
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">ComparisonBar Component</h2>
              <div className="space-y-6">
                <ComparisonBar
                  label="Taux de réponse"
                  leftValue={75}
                  rightValue={60}
                  leftLabel="Vous"
                  rightLabel="Moyenne"
                  leftColor="emerald"
                  rightColor="sage"
                />
                <ComparisonBar
                  label="Activité hebdomadaire"
                  leftValue={42}
                  rightValue={28}
                  leftLabel="Vous"
                  rightLabel="Moyenne"
                  leftColor="gold"
                  rightColor="sage"
                />
              </div>
            </div>
          </TabsContent>

          {/* Tab 4: Individual Components */}
          <TabsContent value="components" className="space-y-6">
            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">ProfileSection Component</h2>
              <p className="text-gray-600 mb-4">
                Section collapsible réutilisable avec icône, titre, badge optionnel, et actions.
              </p>

              <div className="space-y-4">
                <ProfileSection
                  icon={Heart}
                  title="Section avec Badge"
                  accentColor="emerald"
                  badge={
                    <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                      Nouveau
                    </Badge>
                  }
                >
                  <SectionContent>
                    <p className="text-gray-700">
                      Ceci est un exemple de section avec un badge. Le badge peut afficher des statuts,
                      des compteurs, ou toute autre information pertinente.
                    </p>
                  </SectionContent>
                </ProfileSection>

                <ProfileSection
                  icon={Briefcase}
                  title="Section avec Couleur Gold"
                  accentColor="gold"
                  defaultOpen={false}
                >
                  <SectionContent>
                    <p className="text-gray-700">
                      Cette section utilise la couleur d'accent "gold" et est fermée par défaut.
                    </p>
                  </SectionContent>
                </ProfileSection>

                <ProfileSection
                  icon={Users}
                  title="Section Non-Collapsible"
                  accentColor="rose"
                  collapsible={false}
                >
                  <SectionContent>
                    <p className="text-gray-700">
                      Cette section est toujours ouverte (collapsible=false).
                    </p>
                  </SectionContent>
                </ProfileSection>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border">
              <h2 className="text-xl font-semibold mb-4">Design System Colors</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="h-20 bg-emerald-500 rounded-lg shadow-md" />
                  <p className="text-sm font-medium text-center">Emerald</p>
                  <p className="text-xs text-gray-600 text-center">Actions principales</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-gold-500 rounded-lg shadow-md" />
                  <p className="text-sm font-medium text-center">Gold</p>
                  <p className="text-xs text-gray-600 text-center">Premium, badges</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-rose-500 rounded-lg shadow-md" />
                  <p className="text-sm font-medium text-center">Rose</p>
                  <p className="text-xs text-gray-600 text-center">Engagement</p>
                </div>
                <div className="space-y-2">
                  <div className="h-20 bg-sage-500 rounded-lg shadow-md" />
                  <p className="text-sm font-medium text-center">Sage</p>
                  <p className="text-xs text-gray-600 text-center">Neutralité</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfileDemo;
