import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import ChatList from '@/components/ChatList';
import ChatWindow from '@/components/ChatWindow';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if we have a specific match to chat with from URL params
    const matchId = searchParams.get('matchId');
    if (matchId) {
      setSelectedChatId(matchId);
    }
  }, [user, searchParams]);

  const handleChatSelect = (matchId: string) => {
    setSelectedChatId(matchId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 p-4">
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
            <MessageCircle className="h-6 w-6 text-emerald" />
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