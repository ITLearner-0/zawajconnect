import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';

const Chat = () => {
  const { user, subscription } = useAuth();
  const navigate = useNavigate();
  const { matchId: paramMatchId } = useParams<{ matchId?: string }>();
  const [searchParams] = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<string | undefined>(undefined);

  // Get matchId from URL params or search params (must be before any conditional returns)
  const matchIdFromUrl = useMemo(() => {
    return paramMatchId || searchParams.get('matchId') || undefined;
  }, [paramMatchId, searchParams]);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Set initial selected chat from URL
    if (matchIdFromUrl) {
      setSelectedChatId(matchIdFromUrl);
    }
  }, [user, matchIdFromUrl, navigate]);

  // Bloquer si pas premium
  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center mx-auto">
            <MessageCircle className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Messagerie Premium</h2>
            <p className="text-muted-foreground">
              La messagerie est réservée aux membres Premium. Passez Premium pour discuter avec vos
              matches.
            </p>
          </div>
          <Button
            onClick={() => navigate('/settings?tab=premium')}
            className="w-full bg-gradient-to-r from-emerald to-emerald-light"
            size="lg"
          >
            Passer à Premium
          </Button>
        </Card>
      </div>
    );
  }

  const handleChatSelect = (matchId: string) => {
    setSelectedChatId(matchId);
  };

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-4 pb-4" style={{ borderBottom: '1px solid var(--color-border-default)' }}>
          <Button variant="ghost" onClick={() => navigate('/matches')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Messages</h1>
        </div>

        <div className="flex h-[calc(100vh-10rem)]">
          {/* Chat List - 30% */}
          <div className="w-[30%] pr-4" style={{ backgroundColor: 'var(--color-bg-card)', borderRight: '1px solid var(--color-border-default)' }}>
            <ChatList onChatSelect={handleChatSelect} selectedChatId={selectedChatId} />
          </div>

          {/* Chat Window - 70% */}
          <div className="flex-1">
            {selectedChatId ? (
              <ChatWindow matchId={selectedChatId} />
            ) : (
              <div className="h-full flex items-center justify-center rounded-lg" style={{ backgroundColor: 'var(--color-bg-page)', border: '1px solid var(--color-border-default)' }}>
                <div className="text-center p-6">
                  <MessageCircle className="h-16 w-16 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
                  <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>Sélectionnez une conversation</h3>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
