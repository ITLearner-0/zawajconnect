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

/** Color for match score badge */
function matchScoreColor(score: number) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-gray-100 text-gray-600 border-gray-200';
}

export const MatchCard = ({ match, statusBadge, onViewProfile, onStartChat }: MatchCardProps) => {
  const verificationScore = match.verification_score ?? 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative h-16 w-16 flex-shrink-0">
            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <span className="text-lg text-primary-foreground font-bold">
                {match.other_user?.full_name?.charAt(0) || '?'}
              </span>
            </div>
            {/* Match score ring overlay */}
            <div
              className={`absolute -bottom-1 -right-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${matchScoreColor(match.match_score)}`}
            >
              {match.match_score}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{match.other_user?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{match.other_user?.age} ans</p>
              </div>
              {statusBadge}
            </div>

            {/* Details */}
            <div className="space-y-1 mb-2">
              {match.other_user?.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.other_user.location}</span>
                </div>
              )}

              {match.other_user?.profession && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Briefcase className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{match.other_user.profession}</span>
                </div>
              )}
            </div>

            {/* Compatibility bar + Trust score */}
            <div className="flex items-center gap-3 mb-2">
              {/* Compatibility bar */}
              <div className="flex items-center gap-1.5 flex-1">
                <Percent className="h-3 w-3 text-emerald-500 flex-shrink-0" />
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      match.match_score >= 80
                        ? 'bg-emerald-500'
                        : match.match_score >= 60
                          ? 'bg-amber-500'
                          : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(match.match_score, 100)}%` }}
                  />
                </div>
              </div>

              {/* Trust mini badge */}
              {verificationScore > 0 && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ShieldCheck
                    className={`h-3 w-3 ${
                      verificationScore >= 75
                        ? 'text-emerald-500'
                        : verificationScore >= 50
                          ? 'text-amber-500'
                          : 'text-gray-400'
                    }`}
                  />
                  <span className="text-[10px] text-muted-foreground font-medium">
                    {verificationScore}%
                  </span>
                </div>
              )}
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
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
                className="flex-1"
              >
                <Eye className="h-3 w-3 mr-1" />
                Profil
              </Button>
              <Button
                size="sm"
                onClick={() => onStartChat(match.id)}
                disabled={match.conversation_status === 'ended'}
                className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
              >
                <MessageCircle className="h-3 w-3 mr-1" />
                Message
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
