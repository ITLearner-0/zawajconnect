import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Star, Moon, Sun, ArrowLeft, ArrowRight } from 'lucide-react';

interface IslamicDate {
  day: number;
  month: string;
  monthNumber: number;
  year: number;
  weekDay: string;
  gregorianDate: Date;
}

interface ImportantDate {
  day: number;
  month: number;
  event: string;
  type: 'holy' | 'sunnah' | 'reminder';
}

const IslamicCalendar = () => {
  const [currentIslamicDate, setCurrentIslamicDate] = useState<IslamicDate | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(0);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

  const islamicMonths = [
    'Muharram', 'Safar', 'Rabi\' al-awwal', 'Rabi\' al-thani',
    'Jumada al-awwal', 'Jumada al-thani', 'Rajab', 'Sha\'ban',
    'Ramadan', 'Shawwal', 'Dhu al-Qi\'dah', 'Dhu al-Hijjah'
  ];

  const importantIslamicDates: ImportantDate[] = [
    { day: 1, month: 1, event: 'Nouvel An Islamique', type: 'holy' },
    { day: 10, month: 1, event: 'Jour d\'Ashura', type: 'holy' },
    { day: 12, month: 3, event: 'Mawlid an-Nabi (naissance du Prophète)', type: 'sunnah' },
    { day: 27, month: 7, event: 'Isra et Mi\'raj', type: 'holy' },
    { day: 15, month: 8, event: 'Laylat al-Bara\'at (Nuit du pardon)', type: 'sunnah' },
    { day: 1, month: 9, event: 'Début du Ramadan', type: 'holy' },
    { day: 27, month: 9, event: 'Laylat al-Qadr (Nuit du destin)', type: 'holy' },
    { day: 1, month: 10, event: 'Eid al-Fitr', type: 'holy' },
    { day: 9, month: 12, event: 'Jour d\'Arafah', type: 'holy' },
    { day: 10, month: 12, event: 'Eid al-Adha', type: 'holy' }
  ];

  // Simplified Islamic date conversion (approximation)
  const convertToIslamic = (gregorianDate: Date): IslamicDate => {
    // This is a simplified approximation. In a real app, use a proper Islamic calendar library
    const gregorianYear = gregorianDate.getFullYear();
    const gregorianMonth = gregorianDate.getMonth() + 1;
    const gregorianDay = gregorianDate.getDate();
    
    // Approximate Islamic year (this is not accurate, use proper conversion)
    const islamicYear = Math.floor((gregorianYear - 622) * 1.030684) + 1;
    
    // For demonstration, using current month index
    const monthIndex = (gregorianMonth + 6) % 12; // Rough approximation
    const islamicMonth = islamicMonths[monthIndex];
    
    const weekDays = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const weekDay = weekDays[gregorianDate.getDay()];
    
    return {
      day: gregorianDay,
      month: islamicMonth || '',
      monthNumber: monthIndex + 1,
      year: islamicYear,
      weekDay: weekDay || '',
      gregorianDate
    };
  };

  useEffect(() => {
    const today = new Date();
    const islamicDate = convertToIslamic(today);
    setCurrentIslamicDate(islamicDate);
    setSelectedMonth(islamicDate.monthNumber);
    setSelectedYear(islamicDate.year);

    // Filter important dates for current month
    const currentMonthEvents = importantIslamicDates.filter(
      date => date.month === islamicDate.monthNumber
    );
    setImportantDates(currentMonthEvents);
  }, []);

  const changeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'next') {
      if (selectedMonth === 12) {
        setSelectedMonth(1);
        setSelectedYear(selectedYear + 1);
      } else {
        setSelectedMonth(selectedMonth + 1);
      }
    } else {
      if (selectedMonth === 1) {
        setSelectedMonth(12);
        setSelectedYear(selectedYear - 1);
      } else {
        setSelectedMonth(selectedMonth - 1);
      }
    }

    // Update important dates for new month
    const monthEvents = importantIslamicDates.filter(
      date => date.month === selectedMonth
    );
    setImportantDates(monthEvents);
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'holy':
        return <Star className="h-3 w-3" />;
      case 'sunnah':
        return <Moon className="h-3 w-3" />;
      default:
        return <Sun className="h-3 w-3" />;
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'holy':
        return 'bg-emerald/10 text-emerald border-emerald/20';
      case 'sunnah':
        return 'bg-gold/10 text-gold-dark border-gold/20';
      default:
        return 'bg-blue/10 text-blue-dark border-blue/20';
    }
  };

  if (!currentIslamicDate) return null;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald" />
            Calendrier Islamique
          </div>
          <Badge variant="secondary" className="font-arabic text-sm">
            {currentIslamicDate.year} هـ
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Current Date Display */}
        <div className="text-center bg-gradient-to-r from-emerald/10 to-gold/10 rounded-lg p-6 border border-emerald/20">
          <div className="space-y-2">
            <p className="text-3xl font-bold text-emerald">
              {currentIslamicDate.day}
            </p>
            <p className="text-lg font-semibold text-foreground">
              {currentIslamicDate.month} {currentIslamicDate.year}
            </p>
            <p className="text-sm text-muted-foreground">
              {currentIslamicDate.weekDay}
            </p>
            <Badge variant="outline" className="text-xs">
              {currentIslamicDate.gregorianDate.toLocaleDateString('fr-FR')}
            </Badge>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth('prev')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Précédent
          </Button>
          
          <div className="text-center">
            <h3 className="font-semibold text-lg">
              {islamicMonths[selectedMonth - 1]} {selectedYear}
            </h3>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => changeMonth('next')}
            className="flex items-center gap-2"
          >
            Suivant
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Important Dates in Current Month */}
        {importantDates.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-semibold text-foreground flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" />
              Dates Importantes ce Mois
            </h4>
            <div className="space-y-2">
              {importantDates.map((date, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-card border"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={getEventTypeColor(date.type)}>
                      {getEventTypeIcon(date.type)}
                      <span className="ml-1">{date.day}</span>
                    </Badge>
                    <span className="font-medium">{date.event}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {date.type === 'holy' ? 'Sacré' : 
                     date.type === 'sunnah' ? 'Sunnah' : 'Rappel'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Islamic Months Grid */}
        <div className="space-y-3">
          <h4 className="font-semibold text-foreground">Mois Islamiques</h4>
          <div className="grid grid-cols-3 gap-2">
            {islamicMonths.map((month, index) => (
              <Button
                key={month}
                variant={selectedMonth === index + 1 ? "default" : "outline"}
                size="sm"
                className={`text-xs ${
                  selectedMonth === index + 1 
                    ? 'bg-emerald hover:bg-emerald-dark text-white' 
                    : 'hover:bg-emerald/10'
                }`}
                onClick={() => {
                  setSelectedMonth(index + 1);
                  const monthEvents = importantIslamicDates.filter(
                    date => date.month === index + 1
                  );
                  setImportantDates(monthEvents);
                }}
              >
                {month}
              </Button>
            ))}
          </div>
        </div>

        {/* Quranic Verse */}
        <div className="bg-gradient-to-r from-gold/10 to-emerald/10 rounded-lg p-4 border border-gold/20">
          <p className="text-center text-gold-dark font-arabic text-lg mb-2">
            إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا
          </p>
          <p className="text-center text-sm text-muted-foreground italic">
            "Le nombre de mois, auprès d'Allah, est de douze mois"
          </p>
          <p className="text-center text-xs text-gold-dark mt-2">
            - Coran 9:36
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default IslamicCalendar;