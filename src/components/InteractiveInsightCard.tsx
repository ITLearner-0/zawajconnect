import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ChevronDown,
  ChevronUp,
  Star,
  Heart,
  Lightbulb,
  BookOpen,
  Users,
  TrendingUp,
} from 'lucide-react';

interface InteractiveInsightCardProps {
  title: string;
  subtitle?: string;
  mainContent: string | string[];
  expandedContent?: string | string[];
  insights?: string[];
  recommendations?: string[];
  icon?: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'info';
  showExpand?: boolean;
  className?: string;
}

const InteractiveInsightCard: React.FC<InteractiveInsightCardProps> = ({
  title,
  subtitle,
  mainContent,
  expandedContent,
  insights = [],
  recommendations = [],
  icon,
  variant = 'default',
  showExpand = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return 'border-emerald/20 bg-emerald/5';
      case 'warning':
        return 'border-gold/20 bg-gold/5';
      case 'info':
        return 'border-primary/20 bg-primary/5';
      default:
        return 'border-border bg-card';
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'success':
        return 'text-emerald';
      case 'warning':
        return 'text-gold';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  const renderContent = (content: string | string[]) => {
    if (Array.isArray(content)) {
      return (
        <ul className="space-y-1 text-sm text-muted-foreground">
          {content.map((item, index) => (
            <li key={index} className="flex items-start space-x-2">
              <span className="text-primary mt-1">•</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <p className="text-sm text-muted-foreground">{content}</p>;
  };

  return (
    <Card
      className={`w-full transition-all duration-200 hover:shadow-lg ${getVariantStyles()} ${className}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between space-x-3">
          <div className="flex items-start space-x-3 flex-1 min-w-0">
            {icon && (
              <div className={`p-2 rounded-lg bg-background flex-shrink-0 ${getIconColor()}`}>
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base sm:text-lg font-semibold mb-1 break-words">
                {title}
              </CardTitle>
              {subtitle && (
                <p className="text-xs sm:text-sm text-muted-foreground break-words">{subtitle}</p>
              )}
            </div>
          </div>

          {showExpand && (expandedContent || insights.length > 0 || recommendations.length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex-shrink-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-4 relative">
          {/* Main Content */}
          <div className="relative z-10">{renderContent(mainContent)}</div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="space-y-4 relative z-10 mt-4">
              {expandedContent && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-primary" />
                      <span>Détails</span>
                    </h4>
                    {renderContent(expandedContent)}
                  </div>
                </>
              )}

              {insights.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <Star className="w-4 h-4 text-gold" />
                      <span>Insights</span>
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {insights.map((insight, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {insight}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {recommendations.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
                      <Lightbulb className="w-4 h-4 text-emerald" />
                      <span>Recommandations</span>
                    </h4>
                    <ul className="space-y-2">
                      {recommendations.map((rec, index) => (
                        <li
                          key={index}
                          className="flex items-start space-x-2 text-sm text-muted-foreground"
                        >
                          <TrendingUp className="w-3 h-3 text-emerald mt-1 flex-shrink-0" />
                          <span className="break-words">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveInsightCard;
