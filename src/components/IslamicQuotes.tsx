import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  RefreshCw, 
  Heart, 
  Share2, 
  Copy,
  Star,
  Quote
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface IslamicQuote {
  id: string;
  text: string;
  arabic?: string;
  source: string;
  category: string;
  author?: string;
  reference?: string;
}

const IslamicQuotes = () => {
  const { toast } = useToast();
  const [currentQuote, setCurrentQuote] = useState<IslamicQuote | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Quotes will be loaded from database
  const quotes: IslamicQuote[] = [];

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem('islamic_quotes_favorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    // Set initial quote
    getRandomQuote();
  }, []);

  const getRandomQuote = () => {
    setLoading(true);
    
    // Simulate loading delay
    setTimeout(() => {
      const randomIndex = Math.floor(Math.random() * quotes.length);
      setCurrentQuote(quotes[randomIndex]);
      setLoading(false);
    }, 500);
  };

  const toggleFavorite = (quoteId: string) => {
    const newFavorites = favorites.includes(quoteId)
      ? favorites.filter(id => id !== quoteId)
      : [...favorites, quoteId];
    
    setFavorites(newFavorites);
    localStorage.setItem('islamic_quotes_favorites', JSON.stringify(newFavorites));
    
    toast({
      title: favorites.includes(quoteId) ? "Retiré des favoris" : "Ajouté aux favoris",
      description: "Citation sauvegardée"
    });
  };

  const copyQuote = async () => {
    if (!currentQuote) return;
    
    const text = `"${currentQuote.text}"

${currentQuote.arabic ? `${currentQuote.arabic}\n\n` : ''}Source: ${currentQuote.source}${currentQuote.reference ? ` - ${currentQuote.reference}` : ''}`;
    
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Citation copiée",
        description: "La citation a été copiée dans le presse-papiers"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier la citation",
        variant: "destructive"
      });
    }
  };

  const shareQuote = async () => {
    if (!currentQuote) return;
    
    const text = `"${currentQuote.text}" - ${currentQuote.source}${currentQuote.reference ? ` (${currentQuote.reference})` : ''}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Citation Islamique',
          text: text,
        });
      } catch (error) {
        // Fallback to copy if sharing fails
        copyQuote();
      }
    } else {
      copyQuote();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Tawakkul': 'bg-blue-100 text-blue-800',
      'Spiritualité': 'bg-purple-100 text-purple-800',
      'Sabr': 'bg-green-100 text-green-800',
      'Taqwa': 'bg-yellow-100 text-yellow-800',
      'Service': 'bg-orange-100 text-orange-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (!currentQuote) {
    return <div className="flex items-center justify-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <BookOpen className="h-6 w-6" />
              Citations Islamiques
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={getRandomQuote}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Main Quote Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <Quote className="h-16 w-16 text-primary/10" />
        </div>
        
        <CardContent className="p-8">
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center justify-between">
              <Badge className={getCategoryColor(currentQuote.category)}>
                {currentQuote.category}
              </Badge>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(currentQuote.id)}
                  className={favorites.includes(currentQuote.id) ? 'text-red-500' : ''}
                >
                  <Heart className={`h-4 w-4 ${favorites.includes(currentQuote.id) ? 'fill-current' : ''}`} />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={shareQuote}>
                  <Share2 className="h-4 w-4" />
                </Button>
                
                <Button variant="ghost" size="sm" onClick={copyQuote}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Quote Text */}
            <div className="space-y-4">
              <blockquote className="text-xl md:text-2xl font-medium leading-relaxed text-foreground">
                "{currentQuote.text}"
              </blockquote>
              
              {/* Arabic Text */}
              {currentQuote.arabic && (
                <div className="text-right">
                  <p className="text-lg md:text-xl font-arabic text-primary/80 leading-loose">
                    {currentQuote.arabic}
                  </p>
                </div>
              )}
            </div>

            {/* Source Information */}
            <div className="border-t pt-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-medium text-primary">
                    {currentQuote.source}
                    {currentQuote.author && (
                      <span className="text-muted-foreground ml-2">
                        - {currentQuote.author}
                      </span>
                    )}
                  </p>
                  
                  {currentQuote.reference && (
                    <p className="text-sm text-muted-foreground">
                      {currentQuote.reference}
                    </p>
                  )}
                </div>
                
                {favorites.includes(currentQuote.id) && (
                  <Badge variant="outline" className="w-fit">
                    <Star className="h-3 w-3 mr-1" />
                    Favori
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={getRandomQuote} className="flex-1" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Nouvelle Citation
        </Button>
        
        <Button variant="outline" onClick={shareQuote} className="flex-1">
          <Share2 className="h-4 w-4 mr-2" />
          Partager
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => toggleFavorite(currentQuote.id)}
          className="flex-1"
        >
          <Heart className={`h-4 w-4 mr-2 ${favorites.includes(currentQuote.id) ? 'fill-current text-red-500' : ''}`} />
          {favorites.includes(currentQuote.id) ? 'Favoris' : 'Ajouter'}
        </Button>
      </div>
    </div>
  );
};

export default IslamicQuotes;