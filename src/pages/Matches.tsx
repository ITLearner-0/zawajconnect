
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, X, Star, Filter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Match {
  id: string;
  name: string;
  age: number;
  location: string;
  compatibility: number;
  image: string;
  lastActive: string;
  verified: boolean;
}

const Matches = () => {
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentMatch, setCurrentMatch] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    // Simulated matches data
    setMatches([
      {
        id: '1',
        name: 'Amina Al-Zahra',
        age: 25,
        location: 'Paris, France',
        compatibility: 89,
        image: '/placeholder-avatar.jpg',
        lastActive: '2 heures',
        verified: true
      },
      {
        id: '2',
        name: 'Khadija Benali',
        age: 28,
        location: 'Lyon, France',
        compatibility: 92,
        image: '/placeholder-avatar.jpg',
        lastActive: '1 jour',
        verified: true
      }
    ]);
  }, []);

  const handleLike = () => {
    toast({
      title: "Correspondance envoyée",
      description: "Votre intérêt a été envoyé avec succès.",
    });
    nextMatch();
  };

  const handlePass = () => {
    nextMatch();
  };

  const nextMatch = () => {
    if (currentMatch < matches.length - 1) {
      setCurrentMatch(currentMatch + 1);
    } else {
      toast({
        title: "Plus de correspondances",
        description: "Revenez plus tard pour de nouvelles correspondances.",
      });
    }
  };

  const currentMatchData = matches[currentMatch];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-rose-800 dark:text-rose-200">
            Correspondances
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-rose-300 text-rose-700 hover:bg-rose-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtres
          </Button>
        </div>

        {currentMatchData ? (
          <Card className="shadow-xl border-rose-200 dark:border-rose-700 bg-white/90 dark:bg-rose-900/90 backdrop-blur-sm">
            <CardHeader className="text-center pb-4">
              <div className="relative mx-auto w-48 h-48 mb-4">
                <img
                  src={currentMatchData.image}
                  alt={currentMatchData.name}
                  className="w-full h-full object-cover rounded-full border-4 border-rose-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=300&fit=crop&crop=face';
                  }}
                />
                {currentMatchData.verified && (
                  <div className="absolute bottom-2 right-2 bg-green-500 rounded-full p-1">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <CardTitle className="text-xl text-rose-800 dark:text-rose-200">
                {currentMatchData.name}, {currentMatchData.age}
              </CardTitle>
              <p className="text-rose-600 dark:text-rose-300">
                {currentMatchData.location}
              </p>
              <div className="bg-rose-100 dark:bg-rose-800 rounded-lg p-2 mt-2">
                <p className="text-sm font-medium text-rose-800 dark:text-rose-200">
                  Compatibilité: {currentMatchData.compatibility}%
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center space-x-4 mt-6">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handlePass}
                  className="border-gray-300 hover:bg-gray-50 px-8"
                >
                  <X className="h-6 w-6 text-gray-600" />
                </Button>
                <Button
                  size="lg"
                  onClick={handleLike}
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white px-8"
                >
                  <Heart className="h-6 w-6" />
                </Button>
              </div>
              <p className="text-center text-sm text-rose-600 dark:text-rose-300 mt-4">
                Dernière activité: {currentMatchData.lastActive}
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg border-rose-200 dark:border-rose-700 bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <h3 className="text-lg font-medium text-rose-800 dark:text-rose-200 mb-2">
                Aucune correspondance disponible
              </h3>
              <p className="text-rose-600 dark:text-rose-300">
                Revenez plus tard pour de nouvelles correspondances.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Matches;
