import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Compass, BookOpen, Calendar, Star } from 'lucide-react';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaDirection from '@/components/QiblaDirection';
import IslamicQuotes from '@/components/IslamicQuotes';
import IslamicCalendarWidget from '@/components/IslamicCalendarWidget';

const IslamicTools = () => {
  const [activeTab, setActiveTab] = useState('prayer-times');

  const tools = [
    {
      id: 'prayer-times',
      name: 'Heures de Prière',
      icon: Clock,
      description: 'Horaires de prière précis selon votre localisation',
      component: <PrayerTimes />
    },
    {
      id: 'qibla',
      name: 'Direction Qibla',
      icon: Compass,
      description: 'Boussole pour trouver la direction de la Mecque',
      component: <QiblaDirection />
    },
    {
      id: 'quotes',
      name: 'Citations Islamiques',
      icon: BookOpen,
      description: 'Citations du Coran et Hadiths inspirantes',
      component: <IslamicQuotes />
    },
    {
      id: 'calendar',
      name: 'Calendrier Islamique',
      icon: Calendar,
      description: 'Dates importantes et événements islamiques',
      component: <IslamicCalendarWidget />
    }
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Star className="h-8 w-8 text-primary" />
          Outils Islamiques
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Des outils spirituels pour accompagner votre pratique religieuse au quotidien
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto p-1">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <TabsTrigger 
                key={tool.id} 
                value={tool.id}
                className="flex flex-col items-center gap-2 p-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Icon className="h-5 w-5" />
                <span className="text-sm font-medium">{tool.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tools.map((tool) => (
          <TabsContent key={tool.id} value={tool.id} className="mt-6">
            {tool.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default IslamicTools;