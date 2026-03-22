import { motion } from 'framer-motion';
import { Edit, Cake, MapPin, CheckCircle, TrendingUp, Shield, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import VerificationBadge from '@/components/VerificationBadge';
import { DatabaseProfile } from '@/types/profile';
import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';

interface HeroProfileSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  completionPercentage?: number;
  verificationScore?: number;
  onEdit?: () => void;
}

/**
 * Hero Profile Section Component
 *
 * Modern, eye-catching profile header with cover photo, avatar overlay,
 * and quick stats. Designed for maximum visual impact.
 */
const HeroProfileSection = ({
  profile,
  isOwnProfile,
  completionPercentage = 0,
  verificationScore = 0,
  onEdit,
}: HeroProfileSectionProps) => {
  // Calculate age from birth_date
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Get initials for avatar fallback
  const getInitials = (fullName: string): string => {
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.charAt(0)?.toUpperCase() || '';
    const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0)?.toUpperCase() : '';
    return `${first}${last}` || '?';
  };

  // Get activity status
  const getActivityStatus = (): string => {
    // In real implementation, check last_active timestamp
    return 'En ligne';
  };

  const age = calculateAge(profile.birth_date);
  const fullName = profile.full_name ?? 'Utilisateur';
  const initials = getInitials(profile.full_name ?? '');

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <Card className="overflow-hidden border-0 shadow-xl">
        {/* Cover Photo with Islamic Pattern */}
        <div className="relative h-32 sm:h-48 bg-gradient-to-br from-emerald-500 via-emerald-400 to-gold-400">
          <IslamicPattern
            variant="geometric"
            className="absolute inset-0 opacity-20 text-white"
          />

          {/* Edit Button (for own profile) */}
          {isOwnProfile && onEdit && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-4 right-4"
            >
              <Button
                onClick={onEdit}
                className="bg-white/90 hover:bg-white text-gray-900 shadow-lg touch-manipulation min-h-[44px]"
                size="sm"
              >
                <Edit className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Modifier</span>
              </Button>
            </motion.div>
          )}
        </div>

        {/* Profile Content */}
        <div className="relative px-6 pb-6">
          {/* Avatar & Info Section */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-12 sm:-mt-16">
            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
              className="relative"
            >
              <Avatar className="h-24 w-24 sm:h-32 sm:w-32 border-4 border-white shadow-xl ring-2 ring-emerald-100">
                <AvatarImage
                  src={profile.profile_picture}
                  alt={fullName}
                  className="object-cover"
                />
                <AvatarFallback className="text-2xl font-semibold bg-gradient-to-br from-emerald-100 to-gold-100 text-emerald-700">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Verification Badge Overlay */}
              <div className="absolute -bottom-2 -right-2">
                <VerificationBadge
                  verificationScore={verificationScore}
                />
              </div>
            </motion.div>

            {/* Name & Location */}
            <motion.div
              className="flex-1 sm:ml-4 mt-2 sm:mt-0"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              <motion.div
                variants={staggerItem}
                className="flex items-center gap-2 flex-wrap"
              >
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {fullName || 'Utilisateur'}
                </h1>
                {profile.is_verified && (
                  <CheckCircle className="h-6 w-6 text-emerald-500 flex-shrink-0" />
                )}
              </motion.div>

              <motion.div
                variants={staggerItem}
                className="flex items-center gap-4 mt-2 text-gray-600 flex-wrap"
              >
                {age > 0 && (
                  <>
                    <span className="flex items-center gap-1">
                      <Cake className="h-4 w-4" />
                      <span className="text-sm font-medium">{age} ans</span>
                    </span>
                    {profile.location && <span className="text-gray-400">•</span>}
                  </>
                )}
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-medium">{profile.location}</span>
                  </span>
                )}
              </motion.div>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200"
          >
            <StatItem
              icon={TrendingUp}
              label="Complétion"
              value={`${completionPercentage}%`}
              color="emerald"
              index={0}
            />
            <StatItem
              icon={Shield}
              label="Vérifié"
              value={`${verificationScore}%`}
              color="gold"
              index={1}
            />
            <StatItem
              icon={Activity}
              label="Statut"
              value={getActivityStatus()}
              color="rose"
              index={2}
            />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

// ============================================================================
// StatItem Sub-component
// ============================================================================

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  color: 'emerald' | 'gold' | 'rose';
  index: number;
}

const StatItem = ({ icon: Icon, label, value, color, index }: StatItemProps) => {
  const colorClasses = {
    emerald: {
      icon: 'text-emerald-600',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
    },
    gold: {
      icon: 'text-gold-600',
      bg: 'bg-gold-50',
      text: 'text-gold-700',
    },
    rose: {
      icon: 'text-rose-600',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
    },
  };

  const classes = colorClasses[color];

  return (
    <motion.div
      variants={staggerItem}
      whileHover={{ scale: 1.05, y: -2 }}
      className="text-center"
    >
      <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${classes.bg} mb-2`}>
        <Icon className={`h-5 w-5 ${classes.icon}`} />
      </div>
      <div className={`text-lg font-bold ${classes.text}`}>
        {value}
      </div>
      <div className="text-xs text-gray-500 uppercase tracking-wide">
        {label}
      </div>
    </motion.div>
  );
};

export default HeroProfileSection;
