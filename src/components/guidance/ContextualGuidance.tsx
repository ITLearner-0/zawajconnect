import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, ChevronDown, ChevronUp, Bookmark, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { guidanceSeedData, type GuidanceEntry } from '@/data/islamicGuidanceSeed';

interface ContextualGuidanceProps {
  /** Context where the component is displayed */
  context: 'onboarding' | 'matching' | 'istikhara' | 'dashboard' | 'chat';
  /** Maximum number of guidances to show */
  maxItems?: number;
  /** Whether the component can be collapsed */
  collapsible?: boolean;
}

const sourceIcons: Record<string, string> = {
  quran: '📖',
  hadith: '🌙',
  scholar: '🎓',
  fiqh: '⚖️',
};

const sourceLabels: Record<string, string> = {
  quran: 'Coran',
  hadith: 'Hadith',
  scholar: 'Savant',
  fiqh: 'Fiqh',
};

const ContextualGuidance = ({
  context,
  maxItems = 1,
  collapsible = true,
}: ContextualGuidanceProps) => {
  const { user } = useAuth();
  const [guidances, setGuidances] = useState<GuidanceEntry[]>([]);
  const [expanded, setExpanded] = useState(!collapsible);
  const [dismissed, setDismissed] = useState(false);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchGuidance();
  }, [context]);

  const fetchGuidance = async () => {
    // Try Supabase first
    try {
      const { data } = await supabase
        .from('islamic_guidance')
        .select('*')
        .eq('published', true)
        .limit(maxItems);

      if (data && data.length > 0) {
        setGuidances(data.map((d) => ({
          category: d.category || 'general',
          title_fr: d.title || '',
          content_fr: d.content || '',
          source_reference: '',
          source_type: 'hadith',
          difficulty_level: 'beginner',
          display_context: [context],
        })));
        return;
      }
    } catch {
      // Fallback to seed data
    }

    // Filter seed data by context
    const filtered = guidanceSeedData
      .filter((g) => g.display_context.includes(context))
      .sort(() => Math.random() - 0.5)
      .slice(0, maxItems);

    setGuidances(filtered);
  };

  const trackRead = async (guidanceTitle: string) => {
    if (!user) return;
    try {
      // Mark as read in user_guidance_reads if the table exists
      await supabase.from('user_guidance_reads').insert({
        user_id: user.id,
        guidance_id: user.id, // Placeholder
      });
    } catch {
      // Table might not exist
    }
  };

  if (dismissed || guidances.length === 0) return null;

  return (
    <Card className="border-amber-200/60 bg-gradient-to-r from-amber-50/50 to-yellow-50/50">
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-amber-600">Guidance islamique</span>
                {guidances[0] && (
                  <Badge variant="outline" className="text-xs border-amber-200 text-amber-600">
                    {sourceIcons[guidances[0].source_type]} {sourceLabels[guidances[0].source_type]}
                  </Badge>
                )}
              </div>
              <div className="flex gap-1">
                {collapsible && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setExpanded(!expanded)}
                  >
                    {expanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setDismissed(true)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            {guidances.map((g, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-amber-800">{g.title_fr}</p>
                {expanded && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-amber-700 leading-relaxed whitespace-pre-line">
                      {g.content_fr}
                    </p>
                    {g.source_reference && (
                      <p className="text-xs text-amber-600 italic">
                        Source : {g.source_reference}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-amber-600 hover:text-amber-700 h-7 px-2"
                      onClick={() => {
                        trackRead(g.title_fr);
                        setSavedIds((prev) => new Set([...prev, g.title_fr]));
                      }}
                    >
                      <Bookmark className={`h-3 w-3 mr-1 ${savedIds.has(g.title_fr) ? 'fill-amber-400' : ''}`} />
                      {savedIds.has(g.title_fr) ? 'Sauvegardé' : 'Sauvegarder'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContextualGuidance;
