import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useIslamicModeration, ModerationSuggestion as ModerationSuggestionType } from '@/hooks/useIslamicModeration';
import ModerationSuggestion from './ModerationSuggestion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, BookOpen } from 'lucide-react';

interface MessageModerationWrapperProps {
  children: React.ReactNode;
  matchId: string;
}

const MessageModerationWrapper: React.FC<MessageModerationWrapperProps> = ({
  children,
  matchId
}) => {
  const { user } = useAuth();
  const { getSuggestions, applySuggestion, isChecking, lastResult } = useIslamicModeration();
  const [suggestions, setSuggestions] = useState<ModerationSuggestionType[]>([]);

  const loadSuggestions = useCallback(async () => {
    if (!user) return;

    const userSuggestions = await getSuggestions(user.id);
    setSuggestions(userSuggestions);
  }, [user, getSuggestions]);

  useEffect(() => {
    if (user) {
      loadSuggestions();
    }
  }, [user, loadSuggestions]);

  const handleAcceptSuggestion = async (suggestionId: string, newMessage: string) => {
    await applySuggestion(suggestionId);
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));

    // Trigger event for parent component to use the suggested message
    window.dispatchEvent(new CustomEvent('useSuggestedMessage', {
      detail: { message: newMessage }
    }));
  };

  const handleDismissSuggestion = (suggestionId: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== suggestionId));
  };

  return (
    <div className="space-y-4">
      {/* Moderation Status */}
      {isChecking && (
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-blue-700 dark:text-blue-300">
                Vérification du contenu selon les valeurs islamiques...
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Moderation Result */}
      {lastResult && !lastResult.approved && (
        <Card className={`border-${lastResult.action === 'blocked' ? 'red' : 'amber'}-200 bg-${lastResult.action === 'blocked' ? 'red' : 'amber'}-50/50`}>
          <CardContent className="p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className={`h-4 w-4 text-${lastResult.action === 'blocked' ? 'red' : 'amber'}-500 mt-0.5`} />
              <div>
                <p className={`text-sm font-medium text-${lastResult.action === 'blocked' ? 'red' : 'amber'}-700`}>
                  {lastResult.action === 'blocked' ? 'Message bloqué' : 
                   lastResult.action === 'warned' ? 'Message nécessite attention' : 'En révision'}
                </p>
                <p className={`text-xs text-${lastResult.action === 'blocked' ? 'red' : 'amber'}-600 mt-1`}>
                  {lastResult.reason}
                </p>
                {lastResult.islamicGuidance && (
                  <div className="mt-2 p-2 bg-white/50 rounded border border-gold/20">
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-3 w-3 text-gold mt-0.5" />
                      <p className="text-xs text-foreground">{lastResult.islamicGuidance}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suggestions */}
      {suggestions.map((suggestion) => (
        <ModerationSuggestion
          key={suggestion.id}
          suggestion={suggestion}
          onAccept={handleAcceptSuggestion}
          onDismiss={handleDismissSuggestion}
        />
      ))}

      {/* Main Content */}
      {children}
    </div>
  );
};

export default MessageModerationWrapper;