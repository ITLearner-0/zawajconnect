import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';

interface RecommendationInsight {
  category: string;
  title: string;
  description: string;
  actionable_tip: string;
  islamic_guidance: string;
  icon: React.ReactNode;
}

interface InsightCardProps {
  insight: RecommendationInsight;
}

export const InsightCard = ({ insight }: InsightCardProps) => {
  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'compatibilité':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'profil':
        return 'bg-warning/10 text-warning border-warning/20';
      case 'valeurs':
        return 'bg-success/10 text-success border-success/20';
      case 'intérêts':
        return 'bg-accent/10 text-accent border-accent/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-card">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          {insight.icon}
          <h4 className="text-sm font-semibold">{insight.title}</h4>
        </div>
        <Badge variant="outline" className="text-xs">
          {insight.category}
        </Badge>
      </div>

      <p className="text-sm text-muted-foreground mb-3">{insight.description}</p>

      <div className="space-y-3">
        <div className="p-3 bg-muted/30 rounded-md">
          <p className="text-xs font-medium mb-1">Conseil actionnable:</p>
          <p className="text-sm">{insight.actionable_tip}</p>
        </div>

        <div className="p-3 bg-muted/30 rounded-md">
          <p className="text-xs font-medium mb-1">Guidance islamique:</p>
          <p className="text-sm italic">{insight.islamic_guidance}</p>
        </div>

        <Button variant="outline" size="sm" className="w-full">
          <ExternalLink className="h-3 w-3 mr-2" />
          En savoir plus
        </Button>
      </div>
    </div>
  );
};
