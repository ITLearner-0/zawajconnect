import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Heart,
  User,
  Target,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  Star,
} from 'lucide-react';
import {
  useCompatibilityInsights,
  type UseCompatibilityInsightsReturn,
} from '@/hooks/useCompatibilityInsights';
import MobileCompatibilityCard from '@/components/MobileCompatibilityCard';
import InteractiveInsightCard from '@/components/InteractiveInsightCard';

interface MobileInsightsDashboardProps {
  userId?: string;
}

const MobileInsightsDashboard: React.FC<MobileInsightsDashboardProps> = ({ userId }) => {
  const { insights, loading }: UseCompatibilityInsightsReturn = useCompatibilityInsights(userId);
  const [activeTab, setActiveTab] = useState('overview');

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-2 bg-muted rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="p-4">
        <Card className="border-dashed border-2">
          <CardContent className="p-6 text-center">
            <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Commencez votre analyse</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Découvrez vos insights de compatibilité personnalisés
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mx-auto">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <ResponsiveTabsList tabCount={4} className="mb-4">
          <TabsTrigger value="overview" className="text-xs">
            Vue
          </TabsTrigger>
          <TabsTrigger value="scores" className="text-xs">
            Scores
          </TabsTrigger>
          <TabsTrigger value="tips" className="text-xs">
            Conseils
          </TabsTrigger>
          <TabsTrigger value="guidance" className="text-xs">
            Guide
          </TabsTrigger>
        </ResponsiveTabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3">
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Votre Profil</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Style relationnel</span>
                  <Badge variant="secondary" className="text-xs">
                    {insights.relationshipStyle}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  {insights.summary.slice(0, 120)}...
                </div>
                <div className="flex flex-wrap gap-1">
                  {insights.priorities.slice(0, 3).map((priority, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {priority}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {insights.redFlags.length > 0 && (
            <InteractiveInsightCard
              title="Points d'Attention"
              subtitle={`${insights.redFlags.length} point(s) à considérer`}
              mainContent={insights.redFlags.slice(0, 2).map((flag) => flag.title)}
              expandedContent={insights.redFlags.map(
                (flag) => `${flag.title}: ${flag.description}`
              )}
              icon={<AlertTriangle className="w-4 h-4" />}
              variant="warning"
              showExpand={insights.redFlags.length > 2}
            />
          )}
        </TabsContent>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-3">
          {insights.compatibilityAreas.map((area, index) => (
            <div key={area.category} style={{ animationDelay: `${index * 100}ms` }}>
              <MobileCompatibilityCard
                title={area.category}
                score={area.score}
                icon={<Heart className="w-4 h-4 text-primary" />}
                description={area.description}
                highlights={[`${area.score}% compatible`]}
                className="animate-slide-up"
              />
            </div>
          ))}
        </TabsContent>

        {/* Tips Tab */}
        <TabsContent value="tips" className="space-y-3">
          <InteractiveInsightCard
            title="Partenaire Idéal"
            subtitle="Profil recommandé"
            mainContent={insights.idealPartner.slice(0, 3)}
            expandedContent={insights.idealPartner}
            icon={<Target className="w-4 h-4" />}
            variant="info"
          />

          <InteractiveInsightCard
            title="Suggestions d'Amélioration"
            subtitle={`${insights.suggestions.length} conseil(s)`}
            mainContent={insights.suggestions.slice(0, 2).map((s) => s.title)}
            expandedContent={insights.suggestions.map((s) => `${s.title}: ${s.description}`)}
            recommendations={insights.suggestions.map((s) => s.description)}
            icon={<Lightbulb className="w-4 h-4" />}
            variant="success"
          />
        </TabsContent>

        {/* Guidance Tab */}
        <TabsContent value="guidance" className="space-y-3">
          {insights.islamicGuidance.map((guidance, index) => (
            <InteractiveInsightCard
              key={index}
              title={guidance.title}
              subtitle="Guidance islamique"
              mainContent={guidance.application}
              expandedContent={`${guidance.verse} - ${guidance.source}`}
              icon={<BookOpen className="w-4 h-4" />}
              variant="default"
              className="animate-fade-in"
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileInsightsDashboard;
