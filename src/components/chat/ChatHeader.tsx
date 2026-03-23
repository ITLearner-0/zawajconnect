import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Video, X, User } from 'lucide-react';
import { ChatMatch } from '@/hooks/useChatMatch';

interface ChatHeaderProps {
  match: ChatMatch;
  isOnline: boolean;
  onClose?: () => void;
  onCall?: (isVideo: boolean) => void;
}

export const ChatHeader = ({ match, isOnline, onClose, onCall }: ChatHeaderProps) => {
  return (
    <div style={{ backgroundColor: 'var(--color-bg-card)', borderBottom: '1px solid var(--color-border-default)' }}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={match.other_user.avatar_url || undefined} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80">
                <User className="h-5 w-5 text-primary-foreground" />
              </AvatarFallback>
            </Avatar>
            {isOnline && (
              <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-success rounded-full border-2 border-background"></div>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{match.other_user.full_name}</h3>
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className="text-xs bg-primary/10 text-primary border-primary/20"
              >
                {match.match_score}% compatible
              </Badge>
              <span className="text-xs text-muted-foreground">
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onCall && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={() => onCall(false)}
                title="Appel audio"
              >
                <Phone className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:bg-primary/10"
                onClick={() => onCall(true)}
                title="Appel vidéo"
              >
                <Video className="h-4 w-4" />
              </Button>
            </>
          )}
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
