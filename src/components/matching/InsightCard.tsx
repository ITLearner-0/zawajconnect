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
    <Card className="h-full hover:shadow-lg transition-shadow border-primary/10">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {insight.icon}
            <CardTitle className="text-base leading-tight">{insight.title}</CardTitle>
          </div>
          <Badge className={`${getCategoryColor(insight.category)} shrink-0`}>
            {insight.category}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {insight.description}
        </p>
        
        <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 space-y-1">
          <p className="text-sm font-semibold text-primary">Conseil actionnable:</p>
          <p className="text-sm text-foreground leading-relaxed">
            {insight.actionable_tip}
          </p>
        </div>
        
        <div className="p-4 bg-success/5 rounded-lg border border-success/10 space-y-1">
          <p className="text-sm font-semibold text-success">Guidance islamique:</p>
          <p className="text-sm text-foreground italic leading-relaxed">
            {insight.islamic_guidance}
          </p>
        </div>
        
        <Button variant="outline" size="sm" className="w-full mt-2">
          <ExternalLink className="h-3 w-3 mr-2" />
          En savoir plus
        </Button>
      </CardContent>
    </Card>
  );
};