import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, Clock, Calendar, Moon, Star, Book } from 'lucide-react';
import PrayerTimes from '@/components/PrayerTimes';
import QiblaDirection from '@/components/QiblaDirection';
import IslamicCalendar from '@/components/IslamicCalendar';

const IslamicTools = () => {
  return (
    <div className="py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
            <Compass className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Outils Islamiques</h1>
            <p className="text-muted-foreground">
              Accompagnez votre pratique religieuse au quotidien
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prayer Times */}
          <div className="lg:col-span-1">
            <PrayerTimes />
          </div>

          {/* Qibla Direction */}
          <div className="lg:col-span-1">
            <QiblaDirection />
          </div>

          {/* Islamic Calendar */}
          <div className="lg:col-span-1">
            <IslamicCalendar />
          </div>
        </div>

        {/* Additional Islamic Resources */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald/5 to-emerald/10 border-emerald/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Book className="h-8 w-8 text-emerald mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Coran</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Lecture et récitation du Saint Coran
              </p>
              <Badge variant="secondary" className="text-xs bg-emerald/10 text-emerald">
                Bientôt disponible
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gold/5 to-gold/10 border-gold/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-gold mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Adhkar</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Invocations quotidiennes et rappels
              </p>
              <Badge variant="secondary" className="text-xs bg-gold/10 text-gold-dark">
                Bientôt disponible
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-sage/5 to-sage/10 border-sage/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Moon className="h-8 w-8 text-sage mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Jeûne</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Calendrier et conseils pour le jeûne
              </p>
              <Badge variant="secondary" className="text-xs bg-sage/10 text-sage-dark">
                Bientôt disponible
              </Badge>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald/5 to-sage/5 border-emerald/20 hover:shadow-lg transition-shadow">
            <CardContent className="p-4 text-center">
              <Compass className="h-8 w-8 text-emerald mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">Mosquées</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Trouvez les mosquées près de vous
              </p>
              <Badge variant="secondary" className="text-xs bg-emerald/10 text-emerald">
                Bientôt disponible
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* Islamic Quote */}
        <Card className="mt-8 bg-gradient-to-r from-emerald/5 via-gold/5 to-sage/5 border-emerald/20">
          <CardContent className="p-6 text-center">
            <div className="max-w-2xl mx-auto">
              <p className="text-lg italic text-muted-foreground mb-4 font-arabic">
                "وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ"
              </p>
              <p className="text-sm text-foreground mb-2">
                "Et quiconque craint Allah, Il lui donnera une issue favorable, 
                et Il lui accordera Ses dons par [des moyens] sur lesquels il ne comptait pas."
              </p>
              <p className="text-xs text-emerald">
                Coran 65:2-3
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Usage Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-gold" />
              Comment utiliser ces outils
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-emerald" />
                  <strong>Horaires de prière</strong>
                </div>
                <p className="text-muted-foreground">
                  Consultez les horaires précis selon votre localisation. 
                  La prochaine prière est mise en évidence.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Compass className="h-4 w-4 text-emerald" />
                  <strong>Direction Qibla</strong>
                </div>
                <p className="text-muted-foreground">
                  Trouvez la direction exacte de la Kaaba depuis votre position. 
                  Autorisez la géolocalisation pour plus de précision.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald" />
                  <strong>Calendrier islamique</strong>
                </div>
                <p className="text-muted-foreground">
                  Suivez les dates importantes du calendrier hégirien et 
                  les événements religieux à venir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IslamicTools;