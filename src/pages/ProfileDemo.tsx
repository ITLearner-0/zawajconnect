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
} from '@/components/profile/redesign';

import { DatabaseProfile } from '@/types/profile';
import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';

/**
 * Demo Profile Data
 */
const demoProfile: DatabaseProfile = {
  id: 'demo-user-123',
  first_name: 'Amira',
  last_name: 'Hassan',
  gender: 'female',
  birth_date: '1995-03-15',
  location: 'Paris, France',
  education_level: 'Master',
  occupation: 'Software Engineer',
  religious_practice_level: 'Practicing',
  prayer_frequency: '5 times daily',
  about_me:
    "Assalamu alaikum! Je suis une développeuse passionnée qui aime apprendre et partager ses connaissances. Je cherche quelqu'un qui partage mes valeurs islamiques et qui souhaite construire une famille basée sur la foi, le respect et l'amour.\n\nJ'aime lire, voyager et découvrir de nouvelles cultures. Je suis très proche de ma famille et j'accorde une grande importance aux liens familiaux.",
  wali_name: 'Ahmed Hassan',
  wali_relationship: 'Père',
  wali_contact: '+33 6 12 34 56 78',
  profile_picture: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
  gallery: [],
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

  // Mock stats
  const completionStats = {
    overall: 85,
    basicInfo: 95,
    photos: 80,
    islamicPrefs: 90,
    compatibility: 75,
  };

  const profileStats = {
    views: 1247,
    likes: 89,
    messages: 34,
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
    console.log('Edit clicked');
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
                🎨 Profile Redesign Demo - Phase 1
              </h1>
              <p className="text-gray-600">
                Découvrez le nouveau design "Hero Profile" avec le système Islamic Matrimony
              </p>
            </div>

            <div className="flex items-center gap-3">
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
                {/* About Me Section */}
                <motion.div variants={staggerItem}>
                  <ProfileSection
                    icon={FileText}
                    title="À Propos de Moi"
                    accentColor="rose"
                    defaultOpen={true}
                  >
                    <SectionContent>
                      <SectionText>{demoProfile.about_me}</SectionText>
                    </SectionContent>
                  </ProfileSection>
                </motion.div>

                {/* Islamic Preferences Section */}
                <motion.div variants={staggerItem}>
                  <ProfileSection
                    icon={Heart}
                    title="Préférences Islamiques"
                    accentColor="emerald"
                    badge={
                      <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Complété
                      </Badge>
                    }
                  >
                    <SectionContent>
                      <InfoGrid
                        columns={2}
                        items={[
                          { label: 'Pratique religieuse', value: demoProfile.religious_practice_level },
                          { label: 'Prière', value: demoProfile.prayer_frequency },
                          { label: 'Lecture du Coran', value: 'Quotidienne' },
                          { label: 'Madhab', value: 'Maliki' },
                          { label: 'Port du Hijab', value: 'Oui' },
                          { label: 'Régime Halal', value: 'Strictement' },
                        ]}
                      />
                    </SectionContent>
                  </ProfileSection>
                </motion.div>

                {/* Education & Career Section */}
                <motion.div variants={staggerItem}>
                  <ProfileSection
                    icon={Briefcase}
                    title="Éducation & Carrière"
                    accentColor="gold"
                  >
                    <SectionContent>
                      <InfoGrid
                        columns={2}
                        items={[
                          {
                            label: 'Niveau d\'éducation',
                            value: demoProfile.education_level,
                            icon: BookOpen,
                          },
                          {
                            label: 'Profession',
                            value: demoProfile.occupation,
                            icon: Briefcase,
                          },
                          { label: 'Domaine', value: 'Technologie' },
                          { label: 'Expérience', value: '5+ ans' },
                        ]}
                      />
                    </SectionContent>
                  </ProfileSection>
                </motion.div>

                {/* Family & Wali Section */}
                <motion.div variants={staggerItem}>
                  <ProfileSection
                    icon={Users}
                    title="Famille & Wali"
                    accentColor="sage"
                  >
                    <SectionContent>
                      <InfoGrid
                        columns={2}
                        items={[
                          { label: 'Nom du Wali', value: demoProfile.wali_name },
                          { label: 'Relation', value: demoProfile.wali_relationship },
                          { label: 'Contact', value: demoProfile.wali_contact },
                          {
                            label: 'Statut de vérification',
                            value: (
                              <Badge variant="outline" className="border-emerald-500 text-emerald-700">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Vérifié
                              </Badge>
                            ),
                          },
                        ]}
                      />
                    </SectionContent>
                  </ProfileSection>
                </motion.div>
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
