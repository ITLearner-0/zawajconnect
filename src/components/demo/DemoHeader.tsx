
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Info, Star, MessageCircle, Video } from 'lucide-react';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { useTranslation } from 'react-i18next';

const DemoHeader = () => {
  const { t } = useTranslation();

  // Safely get the arrays with proper typing
  const messagingTips = t('demo.messagingTips', { returnObjects: true }) as string[];
  const videoTips = t('demo.videoTips', { returnObjects: true }) as string[];

  return (
    <IslamicPattern variant="border" className="mb-6 bg-white">
      <Card className="border-0 shadow-none bg-transparent">
        <CardHeader>
          <CardTitle className="text-2xl font-bold flex items-center gap-2 text-islamic-teal">
            <Star className="h-5 w-5 text-islamic-gold" />
            {t('demo.title')}
            <Info className="h-5 w-5 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {t('demo.description')}
          </p>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-islamic-teal/10 p-3 rounded-lg border border-islamic-teal/20">
              <div className="flex items-center text-islamic-teal mb-2">
                <MessageCircle className="h-4 w-4 mr-2" />
                <h3 className="font-medium">{t('demo.messagingFeatures')}</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                {Array.isArray(messagingTips) && messagingTips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
            
            <div className="bg-islamic-gold/10 p-3 rounded-lg border border-islamic-gold/20">
              <div className="flex items-center text-islamic-gold mb-2">
                <Video className="h-4 w-4 mr-2" />
                <h3 className="font-medium">{t('demo.videoFeatures')}</h3>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                {Array.isArray(videoTips) && videoTips.map((tip: string, index: number) => (
                  <li key={index}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </IslamicPattern>
  );
};

export default DemoHeader;
