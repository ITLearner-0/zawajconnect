import { motion } from 'framer-motion';
import { Edit, Cake, MapPin, CheckCircle, TrendingUp, Shield, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ZAvatar } from '@/components/ui/ZAvatar';
import { ZBadge } from '@/components/ui/ZBadge';
import { DatabaseProfile } from '@/types/profile';
import { fadeInUp, staggerContainer, staggerItem } from '@/styles/animations';

interface HeroProfileSectionProps {
  profile: DatabaseProfile;
  isOwnProfile: boolean;
  completionPercentage?: number;
  verificationScore?: number;
  onEdit?: () => void;
}

const HeroProfileSection = ({
  profile,
  isOwnProfile,
  completionPercentage = 0,
  verificationScore = 0,
  onEdit,
}: HeroProfileSectionProps) => {
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

  const getActivityStatus = (): string => {
    return 'En ligne';
  };

  const age = calculateAge(profile.birth_date);
  const fullName = profile.full_name ?? 'Utilisateur';

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-3">
      {/* Card 1 — Banner + Avatar + Name + Badges */}
      <div
        className="rounded-2xl overflow-visible"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
      >
        {/* Banner — emerald */}
        <div
          className="flex items-end px-5 pb-3 gap-2"
          style={{
            height: 100,
            background: 'var(--color-primary)',
            borderRadius: '16px 16px 0 0',
            borderBottom: '1px solid var(--color-primary-border)',
          }}
        >
          <ZBadge variant="success" className="ml-auto">
            Profil {completionPercentage}% complété
          </ZBadge>
          {isOwnProfile && onEdit && (
            <button
              onClick={onEdit}
              className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg"
              style={{
                background: 'rgba(255,255,255,0.15)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Modifier
            </button>
          )}
        </div>

        {/* Avatar + name + badges */}
        <div className="flex items-center gap-4 px-5 pb-5" style={{ marginTop: -40 }}>
          <div
            className="flex-shrink-0"
            style={{
              border: '3px solid var(--color-bg-card)',
              borderRadius: '50%',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ZAvatar src={profile.profile_picture} name={fullName} size="xl" />
          </div>

          <div className="pt-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-[17px] font-medium truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {fullName}
              </h1>
              {profile.is_verified && (
                <ZBadge variant="success">
                  <CheckCircle className="h-3 w-3" />
                  Vérifié
                </ZBadge>
              )}
            </div>

            <p className="text-[13px] mt-0.5 flex gap-3 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
              {profile.location && <span>📍 {profile.location}</span>}
              {age > 0 && <span>{age} ans</span>}
              {profile.occupation && <span>{profile.occupation}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 — Stats bar */}
      <div
        className="rounded-2xl"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
      >
        <div className="grid grid-cols-3">
          <div className="flex flex-col items-center justify-center py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <TrendingUp className="h-4 w-4" style={{ color: 'var(--color-primary)' }} />
            </div>
            <span className="text-base font-semibold" style={{ color: 'var(--color-primary)' }}>
              {completionPercentage}%
            </span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Complétion
            </span>
          </div>
          <div
            className="flex flex-col items-center justify-center py-3"
            style={{ borderLeft: '1px solid var(--color-border-default)', borderRight: '1px solid var(--color-border-default)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <Shield className="h-4 w-4" style={{ color: 'var(--color-warning)' }} />
            </div>
            <span className="text-base font-semibold" style={{ color: 'var(--color-warning)' }}>
              {verificationScore}%
            </span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Vérifié
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="h-4 w-4" style={{ color: 'var(--color-success)' }} />
            </div>
            <span className="text-base font-semibold" style={{ color: 'var(--color-success)' }}>
              {getActivityStatus()}
            </span>
            <span className="text-[11px] uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
              Statut
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default HeroProfileSection;
