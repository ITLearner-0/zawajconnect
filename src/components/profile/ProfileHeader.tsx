import React from 'react';
import { Link } from 'react-router-dom';
import { Edit, ShieldCheck, Users } from 'lucide-react';
import { VerificationStatus } from '@/types/profile';
import { ZAvatar } from '@/components/ui/ZAvatar';
import { ZBadge } from '@/components/ui/ZBadge';
import { ZButton } from '@/components/ui/ZButton';

interface ProfileHeaderProps {
  userEmail?: string | null;
  userId?: string | null;
  hasCompatibilityResults?: boolean;
  onSignOut: () => void | Promise<void>;
  verificationStatus?: VerificationStatus;
  waliActive?: boolean;
  fullName?: string;
  avatarUrl?: string;
  location?: string;
  age?: number | string;
  profession?: string;
  profileViews?: number;
  favoritesCount?: number;
  completionScore?: number;
}

const ProfileHeader = ({
  fullName,
  avatarUrl,
  verificationStatus,
  waliActive = false,
  location,
  age,
  profession,
  profileViews = 0,
  favoritesCount = 0,
  completionScore = 0,
}: ProfileHeaderProps) => {
  const isVerified =
    verificationStatus &&
    [verificationStatus.email, verificationStatus.phone, verificationStatus.id].filter(Boolean)
      .length >= 2;

  const trustScore = verificationStatus
    ? [verificationStatus.email, verificationStatus.phone, verificationStatus.id, verificationStatus.wali]
        .filter(Boolean).length * 25
    : 0;

  return (
    <div className="space-y-3">
      {/* Card 1 — Banner + Avatar + Nom + Badges */}
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
            Profil {completionScore}% complété
          </ZBadge>
          <Link
            to="/profile/edit"
            className="inline-flex items-center text-xs px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(255,255,255,0.15)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.3)',
            }}
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Link>
        </div>

        {/* Avatar + nom + badges — avatar chevauche le banner */}
        <div className="flex items-center gap-4 px-5 pb-5" style={{ marginTop: -40 }}>
          <div
            className="flex-shrink-0"
            style={{
              border: '3px solid var(--color-bg-card)',
              borderRadius: '50%',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <ZAvatar src={avatarUrl} name={fullName} size="xl" />
          </div>

          <div className="pt-10 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                className="text-[17px] font-medium truncate"
                style={{ color: 'var(--color-text-primary)' }}
              >
                {fullName ?? 'Nom non renseigné'}
              </h1>
              {isVerified && (
                <ZBadge variant="success">
                  <ShieldCheck className="h-3 w-3" />
                  Vérifié
                </ZBadge>
              )}
              {waliActive && (
                <ZBadge variant="info">
                  <Users className="h-3 w-3" />
                  Wali actif
                </ZBadge>
              )}
            </div>

            <p className="text-[13px] mt-0.5 flex gap-3 flex-wrap" style={{ color: 'var(--color-text-muted)' }}>
              {location && <span>📍 {location}</span>}
              {age && <span>{age} ans</span>}
              {profession && <span>{profession}</span>}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 — Stats bar SÉPARÉE */}
      <div
        className="rounded-2xl"
        style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)' }}
      >
        <div className="grid grid-cols-3">
          <div className="flex flex-col items-center justify-center py-3">
            <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {profileViews}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Vues du profil
            </span>
          </div>
          <div
            className="flex flex-col items-center justify-center py-3"
            style={{ borderLeft: '1px solid var(--color-border-default)', borderRight: '1px solid var(--color-border-default)' }}
          >
            <span className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {favoritesCount}
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Favoris reçus
            </span>
          </div>
          <div className="flex flex-col items-center justify-center py-3">
            <span className="text-base font-semibold" style={{ color: 'var(--color-primary)' }}>
              {trustScore}%
            </span>
            <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
              Score de confiance
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
