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
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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
              La messagerie est réservée aux membres Premium. Passez Premium pour discuter avec vos matches.
            </p>
          </div>
          <Button
            onClick={() => navigate('/settings?tab=subscription')}
            className="w-full bg-gradient-to-r from-emerald to-emerald-light"
            size="lg"
          >
            Passer à Premium
          </Button>
        </Card>
      </div>
    );
  }
  
  // Get matchId from URL params or search params
  const matchIdFromUrl = useMemo(() => {
    return paramMatchId || searchParams.get('matchId') || null;
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

  const handleChatSelect = (matchId: string) => {
    setSelectedChatId(matchId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/matches')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux matches
          </Button>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Chat List */}
          <div className="lg:col-span-1">
            <ChatList 
              onChatSelect={handleChatSelect}
              selectedChatId={selectedChatId}
            />
          </div>

          {/* Chat Window */}
          <div className="lg:col-span-2">
            {selectedChatId ? (
              <ChatWindow matchId={selectedChatId} />
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center p-6">
                  <MessageCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-muted-foreground">
                    Choisissez une conversation dans la liste pour commencer à discuter
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;