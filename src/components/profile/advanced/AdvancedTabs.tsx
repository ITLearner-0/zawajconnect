/**
 * AdvancedTabs - Hybrid Design Component
 *
 * This component implements the "hybrid option" approach:
 * - Main profile content is visible in scroll (no tabs)
 * - Advanced features (Photos, Analytics, Privacy) are organized in tabs
 * - Only shown for relevant users (own profile or with permissions)
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, BarChart3, Shield, Settings, MessageCircleQuestion } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatabaseProfile } from '@/types/profile';
import PhotoGalleryTab from './PhotoGalleryTab';
import AnalyticsTab from './AnalyticsTab';
import PrivacyTab from './PrivacyTab';
import ProfileAnswersSection from '../ProfileAnswersSection';

interface AdvancedTabsProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
}

const AdvancedTabs = ({ profile, isOwnProfile }: AdvancedTabsProps) => {
  const [activeTab, setActiveTab] = useState('photos');

  // Define which tabs are available based on context
  const tabs = [
    {
      id: 'photos',
      label: 'Galerie Photos',
      icon: Camera,
      showFor: 'all', // Show for everyone
    },
    {
      id: 'questions',
      label: 'Questions du Jour',
      icon: MessageCircleQuestion,
      showFor: 'all', // Show for everyone
    },
    {
      id: 'analytics',
      label: 'Statistiques',
      icon: BarChart3,
      showFor: 'own', // Only for own profile
    },
    {
      id: 'privacy',
      label: 'Confidentialité',
      icon: Shield,
      showFor: 'own', // Only for own profile
    },
  ].filter((tab) => {
    if (tab.showFor === 'all') return true;
    if (tab.showFor === 'own') return isOwnProfile;
    return false;
  });

  if (tabs.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="overflow-hidden border-2 border-sage-200">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Tabs Header */}
          <div className="bg-gradient-to-r from-emerald-50 via-white to-sage-50 border-b border-sage-200">
            <div className="container px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Fonctionnalités Avancées
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {isOwnProfile
                      ? 'Gérez vos photos, consultez vos statistiques et paramétrez votre confidentialité'
                      : 'Découvrez la galerie photos de ce profil'}
                  </p>
                </div>
                <Settings className="h-6 w-6 text-gray-400" />
              </div>

              <TabsList className={`grid w-full ${isOwnProfile ? 'grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'} gap-2 bg-transparent h-auto`}>
                {tabs.map((tab) => (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-emerald-600 data-[state=active]:border-emerald-200 border-2 border-transparent transition-all duration-200 py-3 px-4"
                  >
                    <div className="flex items-center gap-2">
                      <tab.icon className="h-4 w-4" />
                      <span className="font-medium">{tab.label}</span>
                    </div>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>
          </div>

          {/* Tabs Content */}
          <div className="p-6">
            <TabsContent value="photos" className="mt-0">
              <motion.div
                key="photos-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <PhotoGalleryTab profile={profile} isOwnProfile={isOwnProfile} />
              </motion.div>
            </TabsContent>

            <TabsContent value="questions" className="mt-0">
              <motion.div
                key="questions-content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <ProfileAnswersSection
                  userId={profile.user_id}
                  isOwnProfile={isOwnProfile}
                  maxAnswers={5}
                />
              </motion.div>
            </TabsContent>

            {isOwnProfile && (
              <>
                <TabsContent value="analytics" className="mt-0">
                  <motion.div
                    key="analytics-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <AnalyticsTab profile={profile} />
                  </motion.div>
                </TabsContent>

                <TabsContent value="privacy" className="mt-0">
                  <motion.div
                    key="privacy-content"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <PrivacyTab profile={profile} />
                  </motion.div>
                </TabsContent>
              </>
            )}
          </div>
        </Tabs>
      </Card>
    </motion.div>
  );
};

export default AdvancedTabs;
