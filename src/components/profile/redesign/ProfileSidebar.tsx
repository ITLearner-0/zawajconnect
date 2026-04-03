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
import { Progress } from '@/components/ui/progress';
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
      className="space-y-4"
    >
      {/* Action Buttons (for other profiles) */}
      {!isOwnProfile && (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="hidden lg:block">
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
          >
            <motion.div variants={staggerItem} className="space-y-3">
              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <button
                  onClick={onMessage}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
                >
                  <Heart className="h-4 w-4" />
                  Envoyer un Message
                </button>
              </motion.div>

              <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                <button
                  onClick={onVideoCall}
                  className="w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: 'transparent',
                    color: 'var(--color-text-primary)',
                    border: '1px solid var(--color-border-default)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <Video className="h-4 w-4" />
                  Appel Vidéo
                </button>
              </motion.div>

              {profile.wali_name && (
                <motion.div variants={buttonVariants} whileHover="hover" whileTap="tap">
                  <button
                    onClick={onContactWali}
                    className="w-full py-2.5 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'transparent',
                      color: 'var(--color-text-primary)',
                      border: '1px solid var(--color-border-default)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <Users className="h-4 w-4" />
                    Contacter le Wali
                  </button>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Progress Card (for own profile) */}
      {isOwnProfile && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div
            className="rounded-2xl p-5"
            style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
          >
            <h3 className="text-base font-semibold flex items-center gap-2 mb-4" style={{ color: 'var(--color-text-primary)' }}>
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
              Progression du Profil
            </h3>

            <div className="space-y-3">
              <ProgressItem label="Infos de base" percentage={completionStats.basicInfo} color="primary" icon={Sparkles} />
              <ProgressItem label="Photos" percentage={completionStats.photos} color="warning" icon={Camera} />
              <ProgressItem label="Préférences" percentage={completionStats.islamicPrefs} color="info" icon={Heart} />

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-border-default)' }}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Score Global</span>
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--color-primary-light)',
                      color: 'var(--color-primary)',
                    }}
                  >
                    {completionStats.overall}%
                  </span>
                </div>
                <Progress value={completionStats.overall} className="h-2.5" />
                <p className="text-xs mt-2" style={{ color: 'var(--color-text-muted)' }}>
                  {getCompletionMessage(completionStats.overall)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
        >
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Statistiques
          </h3>

          <div className="space-y-2">
            <StatRow icon={Eye} label="Vues du profil" value={formatNumber(profileStats.views)} />
            <StatRow icon={Heart} label="Likes reçus" value={formatNumber(profileStats.likes)} />
            <StatRow icon={MessageCircle} label="Messages" value={formatNumber(profileStats.messages)} />
          </div>
        </div>
      </motion.div>

      {/* Badge Showcase */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
        >
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Badges
          </h3>
          <BadgeShowcase userId={profile.id} maxBadges={6} />
        </div>
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
  color: 'primary' | 'warning' | 'info';
  icon: React.ElementType;
}

export const ProgressItem = ({ label, percentage, color, icon: Icon }: ProgressItemProps) => {
  const colorMap = {
    primary: { var: 'var(--color-primary)', bg: 'var(--color-primary-light)' },
    warning: { var: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
    info: { var: 'var(--color-info)', bg: 'var(--color-info-bg)' },
  };

  const c = colorMap[color];

  return (
    <motion.div whileHover={{ scale: 1.02 }} className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded" style={{ backgroundColor: c.bg }}>
            <Icon className="h-3 w-3" style={{ color: c.var }} />
          </div>
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
        </div>
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>{percentage}%</span>
      </div>
      <div className="w-full rounded-full h-2 overflow-hidden" style={{ backgroundColor: 'var(--color-bg-subtle)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ backgroundColor: c.var }}
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
      className="flex items-center justify-between py-2 px-3 rounded-lg transition-colors"
      style={{ backgroundColor: 'transparent' }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-bg-subtle)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: 'var(--color-primary-light)' }}>
          <Icon className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
        </div>
        <span className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{label}</span>
      </div>
      <span className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
    </motion.div>
  );
};

// ============================================================================
// Helper Functions
// ============================================================================

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
