import { motion } from 'framer-motion';
import {
  Heart,
  Video,
  Users,
  Eye,
  MessageCircle,
  TrendingUp,
  Camera,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DatabaseProfile } from '@/types/profile';
import { BadgeShowcase } from '@/components/gamification/BadgeShowcase';
import { fadeInRight, staggerContainer, staggerItem, buttonVariants } from '@/styles/animations';

interface ProfileSidebarProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  completionStats?: {
    overall: number;
    basicInfo: number;
    photos: number;
    islamicPrefs: number;
    compatibility: number;
  };
  profileStats?: {
    views: number;
    likes: number;
    messages: number;
  };
  onMessage?: () => void;
  onVideoCall?: () => void;
  onContactWali?: () => void;
}

/**
 * Profile Sidebar Component
 *
 * Displays action buttons, progress tracking, stats, and badges.
 * Adapts based on whether viewing own profile or another user's profile.
 */
const ProfileSidebar = ({
  profile,
  isOwnProfile,
  completionStats = {
    overall: 0,
    basicInfo: 0,
    photos: 0,
    islamicPrefs: 0,
    compatibility: 0,
  },
  profileStats = {
    views: 0,
    likes: 0,
    messages: 0,
  },
  onMessage,
  onVideoCall,
  onContactWali,
}: ProfileSidebarProps) => {
  return (
    <motion.div
      variants={fadeInRight}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Action Buttons (for other profiles) - Hidden on mobile, shown in MobileActionBar instead */}
      {!isOwnProfile && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="hidden lg:block">
          <Card className="p-6">
            <motion.div variants={staggerItem} className="space-y-3">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  onClick={onMessage}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white shadow-md touch-manipulation min-h-[44px]"
                >
                  <Heart className="h-4 w-4 mr-2" />
                  Envoyer un Message
                </Button>
              </motion.div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <Button
                  onClick={onVideoCall}
                  variant="outline"
                  className="w-full border-2 hover:bg-gray-50 touch-manipulation min-h-[44px]"
                >
                  <Video className="h-4 w-4 mr-2" />
                  Appel Vidéo
                </Button>
              </motion.div>

              {profile.wali_name && (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <Button
                    onClick={onContactWali}
                    variant="outline"
                    className="w-full border-2 hover:bg-gray-50 touch-manipulation min-h-[44px]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Contacter le Wali
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </Card>
        </motion.div>
      )}

      {/* Progress Card (for own profile) */}
      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-600" />
                Progression du Profil
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0 space-y-3">
              <ProgressItem
                label="Infos de base"
                percentage={completionStats.basicInfo}
                color="emerald"
                icon={Sparkles}
              />
              <ProgressItem
                label="Photos"
                percentage={completionStats.photos}
                color="gold"
                icon={Camera}
              />
              <ProgressItem
                label="Préférences"
                percentage={completionStats.islamicPrefs}
                color="rose"
                icon={Heart}
              />

              {/* Overall Score */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Score Global</span>
                  <Badge
                    variant="outline"
                    className={getScoreColorClass(completionStats.overall)}
                  >
                    {completionStats.overall}%
                  </Badge>
                </div>
                <Progress
                  value={completionStats.overall}
                  className="h-3"
                />
                <p className="text-xs text-gray-500 mt-2">
                  {getCompletionMessage(completionStats.overall)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Statistiques</CardTitle>
          </CardHeader>

          <CardContent className="p-0 space-y-3">
            <StatRow
              icon={Eye}
              label="Vues du profil"
              value={formatNumber(profileStats.views)}
            />
            <StatRow
              icon={Heart}
              label="Likes reçus"
              value={formatNumber(profileStats.likes)}
            />
            <StatRow
              icon={MessageCircle}
              label="Messages"
              value={formatNumber(profileStats.messages)}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Badge Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-6">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-lg">Badges</CardTitle>
          </CardHeader>

          <CardContent className="p-0">
            <BadgeShowcase userId={profile.id} maxBadges={6} />
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// ProgressItem Sub-component
// ============================================================================

interface ProgressItemProps {
  label: string;
  percentage: number;
  color: 'emerald' | 'gold' | 'rose';
  icon: React.ElementType;
}

export const ProgressItem = ({ label, percentage, color, icon: Icon }: ProgressItemProps) => {
  const colorClasses = {
    emerald: {
      bg: 'bg-emerald-500',
      text: 'text-emerald-600',
      light: 'bg-emerald-100',
    },
    gold: {
      bg: 'bg-gold-500',
      text: 'text-gold-600',
      light: 'bg-gold-100',
    },
    rose: {
      bg: 'bg-rose-500',
      text: 'text-rose-600',
      light: 'bg-rose-100',
    },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="space-y-1"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${classes.light}`}>
            <Icon className={`h-3 w-3 ${classes.text}`} />
          </div>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-semibold text-gray-900">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className={`h-full ${classes.bg}`}
        />
      </div>
    </motion.div>
  );
};

// ============================================================================
// StatRow Sub-component
// ============================================================================

interface StatRowProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
}

const StatRow = ({ icon: Icon, label, value }: StatRowProps) => {
  return (
    <motion.div
      whileHover={{ x: 4 }}
      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-sage-100">
          <Icon className="h-4 w-4 text-sage-600" />
        </div>
        <span className="text-sm text-gray-700">{label}</span>
      </div>
      <span className="text-lg font-semibold text-gray-900">{value}</span>
    </motion.div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

const getScoreColorClass = (percentage: number): string => {
  if (percentage >= 80) return 'border-emerald-500 text-emerald-700';
  if (percentage >= 60) return 'border-gold-500 text-gold-700';
  if (percentage >= 40) return 'border-amber-500 text-amber-700';
  return 'border-rose-500 text-rose-700';
};

const getCompletionMessage = (percentage: number): string => {
  if (percentage >= 90) return 'Excellent ! Votre profil est presque parfait.';
  if (percentage >= 70) return 'Très bien ! Quelques détails à améliorer.';
  if (percentage >= 50) return 'Bon départ ! Continuez à compléter votre profil.';
  return 'Complétez votre profil pour de meilleurs matches.';
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default ProfileSidebar;
