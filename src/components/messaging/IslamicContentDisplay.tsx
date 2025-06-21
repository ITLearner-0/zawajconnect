
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Star, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface IslamicContent {
  id: string;
  type: 'quran' | 'hadith';
  arabic: string;
  translation: string;
  reference: string;
  category?: string;
}

interface IslamicContentDisplayProps {
  content: IslamicContent;
  isOwn?: boolean;
  onAddToFavorites?: (contentId: string) => void;
  onShare?: (content: IslamicContent) => void;
  className?: string;
}

const IslamicContentDisplay: React.FC<IslamicContentDisplayProps> = ({
  content,
  isOwn = false,
  onAddToFavorites,
  onShare,
  className = ''
}) => {
  return (
    <Card className={`
      max-w-md group
      ${isOwn ? 'ml-auto bg-primary/5 border-primary/20' : 'bg-secondary/5 border-secondary/20'}
      ${className}
    `}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            <Badge variant={content.type === 'quran' ? 'default' : 'secondary'}>
              {content.type === 'quran' ? 'Coran' : 'Hadith'}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onAddToFavorites && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onAddToFavorites(content.id)}
              >
                <Star className="h-3 w-3" />
              </Button>
            )}
            
            {onShare && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onShare(content)}
              >
                <Share className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <h4 className="text-sm font-medium text-primary">
          {content.reference}
        </h4>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Arabic Text */}
        <div className="p-3 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 rounded-lg border border-amber-200/50 dark:border-amber-800/50">
          <p className="text-right font-arabic text-lg leading-relaxed text-amber-800 dark:text-amber-200">
            {content.arabic}
          </p>
        </div>
        
        {/* Translation */}
        <div className="p-3 bg-muted/50 rounded-lg">
          <p className="text-sm leading-relaxed italic text-muted-foreground">
            {content.translation}
          </p>
        </div>
        
        {/* Category Badge */}
        {content.category && (
          <div className="flex justify-end">
            <Badge variant="outline" className="text-xs">
              {content.category}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IslamicContentDisplay;
