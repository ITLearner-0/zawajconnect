import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  CheckCircle,
  AlertCircle,
  User,
  FileText,
  Heart,
  Image as ImageIcon,
  Star,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useProfileQuality } from '@/hooks/useProfileQuality';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileQualityPanelProps {
  profileData?: any;
  islamicPrefs?: any;
  onNavigateToSection?: (sectionId: string) => void;
}

const SECTION_ICONS: Record<string, React.ElementType> = {
  basic_info: User,
  bio: FileText,
  interests: Star,
  islamic: Heart,
  photo: ImageIcon,
};

const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
  if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-300';
  if (score >= 40) return 'text-amber-600 bg-amber-50 border-amber-300';
  return 'text-red-600 bg-red-50 border-red-300';
};

const getScoreLabel = (score: number) => {
  if (score >= 90) return 'Excellent';
  if (score >= 80) return 'Très bien';
  if (score >= 70) return 'Bien';
  if (score >= 60) return 'Moyen';
  if (score >= 40) return 'À améliorer';
  return 'Incomplet';
};

const ProfileQualityPanel: React.FC<ProfileQualityPanelProps> = ({
  profileData,
  islamicPrefs,
  onNavigateToSection,
}) => {
  const quality = useProfileQuality(profileData, islamicPrefs);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const { toast } = useToast();

  const generateAIRecommendations = async () => {
    setLoadingAI(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-onboarding-suggestions', {
        body: {
          type: 'profile_improvement',
          profileData,
          islamicPrefs,
          currentScore: quality.overallScore,
          missingSections: quality.missingSections,
        },
      });

      if (error) throw error;

      if (data?.suggestions) {
        setAiRecommendations(data.suggestions);
      }
    } catch (error: any) {
      console.error('Error generating AI recommendations:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de générer les recommandations IA',
        variant: 'destructive',
      });
    } finally {
      setLoadingAI(false);
    }
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Qualité du profil
          </CardTitle>
          <Badge variant="outline" className={getScoreColor(quality.overallScore)}>
            {quality.overallScore}/100
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Score global</span>
            <span className="font-semibold">{getScoreLabel(quality.overallScore)}</span>
          </div>
          <Progress value={quality.overallScore} className="h-3" />
          <p className="text-xs text-muted-foreground">
            {quality.completionPercentage}% des sections complètes
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* AI Recommendations */}
        {quality.overallScore < 90 && (
          <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <h4 className="font-semibold text-sm">Recommandations IA personnalisées</h4>
                {aiRecommendations.length === 0 ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={generateAIRecommendations}
                    disabled={loadingAI}
                    className="w-full"
                  >
                    {loadingAI ? 'Génération...' : 'Obtenir des conseils IA'}
                  </Button>
                ) : (
                  <ul className="space-y-1 text-xs">
                    {aiRecommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sections breakdown */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Détails par section
          </h4>

          {quality.sections.map((section) => {
            const Icon = SECTION_ICONS[section.id] || User;
            const isExpanded = expandedSection === section.id;

            return (
              <div
                key={section.id}
                className={`p-3 rounded-lg border transition-all ${
                  section.completed
                    ? 'bg-emerald-50/50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div
                      className={`p-2 rounded-full ${
                        section.completed
                          ? 'bg-emerald-100 text-emerald-600'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {section.completed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm truncate">{section.name}</h5>
                        <Badge variant="secondary" className="text-xs">
                          {section.score}%
                        </Badge>
                      </div>
                      <Progress value={section.score} className="h-1 mt-1" />
                    </div>
                  </div>
                  {section.suggestions.length > 0 && (
                    <Button variant="ghost" size="sm" className="ml-2">
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {isExpanded && section.suggestions.length > 0 && (
                  <div className="mt-3 pl-12 space-y-1">
                    {section.suggestions.map((suggestion, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <span className="text-amber-600">→</span>
                        <span>{suggestion}</span>
                      </div>
                    ))}
                    {onNavigateToSection && (
                      <Button
                        variant="link"
                        size="sm"
                        className="mt-2 h-auto p-0 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigateToSection(section.id);
                        }}
                      >
                        Compléter cette section →
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Overall tips */}
        {quality.overallScore < 80 && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs space-y-1">
                <p className="font-medium text-blue-900">Augmentez vos chances de match</p>
                <p className="text-blue-700">
                  Les profils avec un score de 80+ reçoivent 3x plus de correspondances. Complétez
                  les sections manquantes pour améliorer votre visibilité.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProfileQualityPanel;
