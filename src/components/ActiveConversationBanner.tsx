import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Lock, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ActiveConversationBannerProps {
  matchId?: string;
}

export const ActiveConversationBanner = ({ matchId }: ActiveConversationBannerProps) => {
  const navigate = useNavigate();

  const handleGoToChat = () => {
    if (matchId) {
      navigate(`/chat/${matchId}`);
    } else {
      navigate('/matches');
    }
  };

  return (
    <Alert className="border-primary/50 bg-primary/5 mb-6">
      <Lock className="h-4 w-4 text-primary" />
      <AlertTitle className="text-primary font-semibold">
        Vous êtes actuellement en discussion
      </AlertTitle>
      <AlertDescription className="text-muted-foreground">
        Selon les principes islamiques, vous devez terminer votre échange actuel avant de chercher d'autres profils. 
        Vous pourrez à nouveau liker des profils une fois la conversation clôturée.
      </AlertDescription>
      <Button
        size="sm"
        variant="outline"
        className="mt-3 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
        onClick={handleGoToChat}
      >
        <MessageCircle className="h-4 w-4 mr-2" />
        Accéder à ma conversation
      </Button>
    </Alert>
  );
};
