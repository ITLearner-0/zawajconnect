import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { ModerationSuggestion as ModerationSuggestionType } from '@/hooks/useIslamicModeration';

interface ModerationSuggestionProps {
  suggestion: ModerationSuggestionType;
  onAccept: (suggestionId: string, newMessage: string) => void;
  onDismiss: (suggestionId: string) => void;
}

const ModerationSuggestion: React.FC<ModerationSuggestionProps> = ({
  suggestion,
  onAccept,
  onDismiss,
}) => {
  return (
    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/10 dark:border-amber-800">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-5 w-5" />
          Suggestion d'amélioration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Original Message */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Message original :</p>
          <p className="text-sm p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-800">
            "{suggestion.original_message}"
          </p>
        </div>

        {/* Suggested Improvement */}
        <div>
          <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mb-1">
            Version recommandée :
          </p>
          <p className="text-sm p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded border border-emerald-200 dark:border-emerald-800">
            "{suggestion.suggested_message}"
          </p>
        </div>

        {/* Reason */}
        <div>
          <p className="text-sm font-medium text-muted-foreground mb-1">Raison :</p>
          <p className="text-sm text-muted-foreground">{suggestion.improvement_reason}</p>
        </div>

        {/* Islamic Guidance */}
        {suggestion.islamic_guidance && (
          <div className="bg-gradient-to-r from-gold/10 to-emerald/10 p-3 rounded-lg border border-gold/20">
            <div className="flex items-start gap-2">
              <BookOpen className="h-4 w-4 text-gold mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-gold mb-1">Guidance islamique :</p>
                <p className="text-sm text-foreground">{suggestion.islamic_guidance}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={() => onAccept(suggestion.id, suggestion.suggested_message)}
            size="sm"
            className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Utiliser cette version
          </Button>
          <Button onClick={() => onDismiss(suggestion.id)} variant="outline" size="sm">
            Ignorer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModerationSuggestion;
