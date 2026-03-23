import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, Calendar, MapPin, Briefcase, ShieldCheck, Percent } from 'lucide-react';

interface MatchCardProps {
  match: {
    id: string;
    match_score: number;
    created_at: string;
    conversation_status?: 'not_started' | 'active' | 'ended';
    verification_score?: number;
    other_user: {
      user_id: string;
      full_name: string;
      age: number;
      location: string;
      profession?: string;
    };
  };
  statusBadge: React.ReactNode;
  onViewProfile: (userId: string) => void;
  onStartChat: (matchId: string) => void;
}

export const MatchCard = ({ match, statusBadge, onViewProfile, onStartChat }: MatchCardProps) => {
  const verificationScore = match.verification_score ?? 0;

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      style={{
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border-default)',
        borderRadius: '16px',
      }}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 flex-shrink-0">
            <div
              className="h-16 w-16 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <span className="text-lg font-bold text-white">
                {match.other_user?.full_name?.charAt(0) || '?'}
              </span>
            </div>
            {/* Match score ring overlay */}
            <div
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
              style={{
                background: 'var(--color-primary-light)',
                color: 'var(--color-primary)',
                border: '1px solid var(--color-primary-border)',
              }}
            >
              {match.match_score}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-semibold text-base truncate"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {match.other_user?.full_name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {match.other_user?.age} ans
                </p>
              </div>
              {statusBadge}
            </div>

            {/* Details */}
            <div className="space-y-1 mb-2">
              {match.other_user?.location && (
                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.other_user.location}</span>
                </div>
              )}

              {match.other_user?.profession && (
                <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.other_user.profession}</span>
                </div>
              )}
            </div>

            {/* Compatibility bar + Trust score */}
            <div className="flex items-center gap-3 mb-2">
              {/* Compatibility badge */}
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{
                  background: 'var(--color-primary-light)',
                  color: 'var(--color-primary)',
                }}
              >
                <Percent className="h-3 w-3 flex-shrink-0" />
                {match.match_score}%
              </span>

              {/* Trust mini badge */}
              {verificationScore > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ShieldCheck
                    className="h-3 w-3"
                    style={{
                      color: verificationScore >= 75
                        ? 'var(--color-success)'
                        : verificationScore >= 50
                          ? 'var(--color-warning)'
                          : 'var(--color-text-muted)',
                    }}
                  />
                  <span className="text-[10px] font-medium" style={{ color: 'var(--color-text-muted)' }}>
                    {verificationScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>
                {new Date(match.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onViewProfile(match.other_user.user_id)}
                variant="outline"
                className="flex-1 rounded-xl"
                style={{
                  border: '1px solid var(--color-border-default)',
                  color: 'var(--color-text-secondary)',
                }}
              >
                <Eye className="h-3 w-3 mr-1" />
                Voir profil
              </Button>
              <Button
                size="sm"
                onClick={() => onStartChat(match.id)}
                disabled={match.conversation_status === 'ended'}
                className="flex-1 text-sm rounded-xl text-white"
                style={{
                  background: 'var(--color-primary)',
                }}
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Envoyer un message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
