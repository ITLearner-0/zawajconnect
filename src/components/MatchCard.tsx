import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, MessageCircle, Calendar, MapPin } from 'lucide-react';

interface MatchCardProps {
  match: {
    id: string;
    match_score: number;
    created_at: string;
    conversation_status?: 'not_started' | 'active' | 'ended';
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
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg text-primary-foreground font-bold">
              {match.other_user?.full_name?.charAt(0) || '?'}
            </span>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base truncate">{match.other_user?.full_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {match.other_user?.age} ans
                </p>
              </div>
              <Badge variant="outline" className="border-emerald/50 text-emerald flex-shrink-0">
                {match.match_score}%
              </Badge>
            </div>

            {/* Location */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{match.other_user?.location}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
              <Calendar className="h-3 w-3 flex-shrink-0" />
              <span>
                {new Date(match.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>

            {/* Status Badge */}
            <div className="mb-3">
              {statusBadge}
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
