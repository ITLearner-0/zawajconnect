import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Sparkles, Loader2, CheckCircle, AlertTriangle, Lightbulb } from 'lucide-react';

interface SmartSuggestionPanelProps {
  title: string;
  description?: string;
  suggestions: string[] | { suggestions: string[]; warnings?: string[] };
  loading: boolean;
  onSelect?: (suggestion: string) => void;
  onRefresh?: () => void;
  compact?: boolean;
}

export const SmartSuggestionPanel = ({
  title,
  description,
  suggestions,
  loading,
  onSelect,
  onRefresh,
  compact = false
}: SmartSuggestionPanelProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Handle both array and object formats
  const suggestionsList = Array.isArray(suggestions) 
    ? suggestions 
    : suggestions?.suggestions || [];
  
  const warnings = !Array.isArray(suggestions) ? suggestions?.warnings : undefined;

  const handleSelect = (suggestion: string, index: number) => {
    setSelectedIndex(index);
    onSelect?.(suggestion);
    
    // Reset selection after 2 seconds
    setTimeout(() => setSelectedIndex(null), 2000);
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">Génération des suggestions...</p>
              <p className="text-xs text-muted-foreground">L'IA analyse vos informations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!suggestionsList || suggestionsList.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {suggestionsList.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSelect(suggestion, index)}
            className="w-full text-left p-3 rounded-lg border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors text-sm"
          >
            <div className="flex items-start gap-2">
              {selectedIndex === index ? (
                <CheckCircle className="h-4 w-4 text-emerald mt-0.5 flex-shrink-0" />
              ) : (
                <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              )}
              <span className="flex-1">{suggestion}</span>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">{title}</CardTitle>
              {description && (
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="h-8 w-8 p-0"
            >
              <Sparkles className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Warnings */}
        {warnings && warnings.length > 0 && (
          <Alert className="border-gold/30 bg-gold/5">
            <AlertTriangle className="h-4 w-4 text-gold" />
            <AlertDescription className="text-sm">
              <ul className="list-disc list-inside space-y-1">
                {warnings.map((warning, index) => (
                  <li key={index} className="text-gold">{warning}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Suggestions */}
        <div className="space-y-2">
          {suggestionsList.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => handleSelect(suggestion, index)}
              disabled={!onSelect}
              className={`w-full text-left p-3 rounded-lg border transition-all ${
                selectedIndex === index
                  ? 'border-emerald bg-emerald/10'
                  : 'border-primary/20 bg-background hover:bg-primary/5'
              } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="flex items-start gap-3">
                {selectedIndex === index ? (
                  <CheckCircle className="h-5 w-5 text-emerald mt-0.5 flex-shrink-0" />
                ) : (
                  <Badge variant="outline" className="bg-primary/10 border-primary/30 flex-shrink-0">
                    {index + 1}
                  </Badge>
                )}
                <span className="text-sm flex-1">{suggestion}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2 border-t border-primary/10">
          <Sparkles className="h-3 w-3" />
          <span>Suggestions générées par IA</span>
        </div>
      </CardContent>
    </Card>
  );
};
