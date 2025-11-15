import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Search, Star, User, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  featured: boolean;
  created_at: string;
}

const Guidance = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [articles, searchTerm, selectedCategory]);

  const fetchArticles = async () => {
    try {
      const { data } = await supabase
        .from('islamic_guidance')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      setArticles(
        (data ?? []).map((article) => ({
          ...article,
          title: article.title ?? '',
          content: article.content ?? '',
          category: article.category ?? '',
          author: article.author ?? '',
          featured: !!article.featured,
        }))
      );
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = articles;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((article) => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      marriage_prep: 'Préparation au mariage',
      islamic_values: 'Valeurs islamiques',
      family_life: 'Vie familiale',
      courtship_etiquette: 'Étiquette de courtisation',
      wedding_planning: 'Planification de mariage',
    };
    return labels[category as keyof typeof labels] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      marriage_prep: 'bg-emerald/10 text-emerald border-emerald/20',
      islamic_values: 'bg-gold/10 text-gold-dark border-gold/20',
      family_life: 'bg-blue/10 text-blue-dark border-blue/20',
      courtship_etiquette: 'bg-purple/10 text-purple-dark border-purple/20',
      wedding_planning: 'bg-pink/10 text-pink-dark border-pink/20',
    };
    return colors[category as keyof typeof colors] || 'bg-muted';
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-6xl mx-auto">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des articles...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Guide islamique</h1>
              <p className="text-muted-foreground">
                Conseils et guidance pour un mariage islamique réussi
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher des articles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-full md:w-64">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="marriage_prep">Préparation au mariage</SelectItem>
                      <SelectItem value="islamic_values">Valeurs islamiques</SelectItem>
                      <SelectItem value="family_life">Vie familiale</SelectItem>
                      <SelectItem value="courtship_etiquette">Étiquette de courtisation</SelectItem>
                      <SelectItem value="wedding_planning">Planification de mariage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Articles */}
          {articles.some((article) => article.featured) && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Star className="h-6 w-6 text-gold" />
                Articles en vedette
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles
                  .filter((article) => article.featured)
                  .slice(0, 2)
                  .map((article) => (
                    <Card
                      key={article.id}
                      className="hover:shadow-lg transition-all duration-300 animate-fade-in"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{article.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>
                                  {format(new Date(article.created_at), 'dd MMM yyyy', {
                                    locale: fr,
                                  })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getCategoryColor(article.category)}>
                            {getCategoryLabel(article.category)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-4">{article.content}</p>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}

          {/* All Articles */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Tous les articles ({filteredArticles.length})
            </h2>

            {filteredArticles.length > 0 ? (
              <div className="grid gap-6">
                {filteredArticles.map((article) => (
                  <Card
                    key={article.id}
                    className="hover:shadow-lg transition-all duration-300 animate-fade-in"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2 flex items-center gap-2">
                            {article.title}
                            {article.featured && (
                              <Star className="h-4 w-4 text-gold fill-current" />
                            )}
                          </CardTitle>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              <span>{article.author}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>
                                {format(new Date(article.created_at), 'dd MMM yyyy', {
                                  locale: fr,
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge className={getCategoryColor(article.category)}>
                          {getCategoryLabel(article.category)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{article.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun article trouvé</h3>
                  <p className="text-muted-foreground">
                    Essayez de modifier vos critères de recherche ou parcourez toutes les catégories
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guidance;
