import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit, ShieldCheck, Users } from 'lucide-react';
import { VerificationStatus } from '@/types/profile';

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

/** Stat cell rendered in the bottom bar of the header */
const StatCell = ({
  value,
  label,
  valueColor,
  className = '',
}: {
  value: string | number;
  label: string;
  valueColor?: string;
  className?: string;
}) => (
  <div className={`flex flex-col items-center justify-center py-3 ${className}`}>
    <span className="text-base font-semibold" style={valueColor ? { color: valueColor } : undefined}>
      {value}
    </span>
    <span className="text-[11px] text-muted-foreground">{label}</span>
  </div>
);

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

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(/\s+/);
    return parts.map((p) => p.charAt(0).toUpperCase()).slice(0, 2).join('');
  };

  return (
    <div className="rounded-lg overflow-hidden border border-border/40 bg-card shadow-sm">
      {/* Banner — vert sauge doux */}
      <div
        className="flex items-end px-5 pb-3 gap-2"
        style={{ height: 100, background: '#EAF3DE', borderBottom: '0.5px solid var(--border)' }}
      >
        <Badge className="ml-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs">
          Profil {completionScore}% complété
        </Badge>
        <Button variant="outline" size="sm" asChild className="h-8 text-xs">
          <Link to="/profile/edit">
            <Edit className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Link>
        </Button>
      </div>

      {/* Avatar + nom + badges — chevauchant le banner */}
      <div className="flex items-end gap-4 px-5 pb-4" style={{ marginTop: -38 }}>
        <Avatar className="h-[72px] w-[72px] border-[3px] border-white shadow-md flex-shrink-0">
          <AvatarImage src={avatarUrl} alt={fullName ?? ''} />
          <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700">
            {getInitials(fullName)}
          </AvatarFallback>
        </Avatar>

        <div className="pt-10 flex-1 min-w-0">
          {/* Nom + badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-[17px] font-medium text-foreground truncate">
              {fullName ?? 'Nom non renseigné'}
            </h1>
            {isVerified && (
              <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] px-1.5 py-0 h-5">
                <ShieldCheck className="h-3 w-3 mr-0.5" />
                Vérifié
              </Badge>
            )}
            {waliActive && (
              <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 text-[10px] px-1.5 py-0 h-5">
                <Users className="h-3 w-3 mr-0.5" />
                Wali actif
              </Badge>
            )}
          </div>

          {/* Localisation + âge + profession */}
          <p className="text-[13px] text-muted-foreground mt-0.5 flex gap-3 flex-wrap">
            {location && <span>📍 {location}</span>}
            {age && <span>{age} ans</span>}
            {profession && <span>{profession}</span>}
          </p>
        </div>
      </div>

      {/* Stats bar — 3 colonnes avec séparateurs */}
      <div className="grid grid-cols-3" style={{ borderTop: '0.5px solid var(--border)' }}>
        <StatCell value={profileViews} label="Vues du profil" />
        <StatCell
          value={favoritesCount}
          label="Favoris reçus"
          className="border-x border-border/40"
        />
        <StatCell value={`${trustScore}%`} label="Score de confiance" valueColor="#27500A" />
      </div>
    </div>
  );
};

export default ProfileHeader;
