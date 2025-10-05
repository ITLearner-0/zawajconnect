import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Heart, 
  Users, 
  Compass, 
  Star, 
  Calendar,
  Search,
  Filter,
  Bookmark
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface GuidanceArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

const IslamicGuidanceHub = () => {
  const [articles, setArticles] = useState<GuidanceArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<GuidanceArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>([]);

  const categories = [
    { value: 'all', label: 'Tous les articles', icon: BookOpen },
    { value: 'marriage_guidance', label: 'Guidance Matrimoniale', icon: Heart },
    { value: 'family_relations', label: 'Relations Familiales', icon: Users },
    { value: 'islamic_etiquette', label: 'Étiquette Islamique', icon: Compass },
    { value: 'hadith_teachings', label: 'Enseignements du Hadith', icon: Star },
  ];

  useEffect(() => {
    fetchGuidanceArticles();
    loadBookmarks();
  }, []);

  useEffect(() => {
    filterArticles();
  }, [articles, searchTerm, selectedCategory]);

  const fetchGuidanceArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('islamic_guidance')
        .select('*')
        .eq('published', true)
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setArticles(data || []);
    } catch (error) {
      console.error('Error fetching guidance articles:', error);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('islamic-guidance-bookmarks');
    if (saved) {
      setBookmarkedArticles(JSON.parse(saved));
    }
  };

  const toggleBookmark = (articleId: string) => {
    const updated = bookmarkedArticles.includes(articleId)
      ? bookmarkedArticles.filter(id => id !== articleId)
      : [...bookmarkedArticles, articleId];
    
    setBookmarkedArticles(updated);
    localStorage.setItem('islamic-guidance-bookmarks', JSON.stringify(updated));
  };

  const filterArticles = () => {
    let filtered = [...articles];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    setFilteredArticles(filtered);
  };

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.icon || BookOpen;
  };

  const getCategoryLabel = (category: string) => {
    const categoryData = categories.find(cat => cat.value === category);
    return categoryData?.label || category;
  };

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };


  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des articles de guidance...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-emerald to-gold rounded-full flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <CardTitle>Centre de Guidance Islamique</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ressources et enseignements pour un mariage conforme aux valeurs islamiques
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
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
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {category.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous ({filteredArticles.length})</TabsTrigger>
          <TabsTrigger value="featured">
            <Star className="h-4 w-4 mr-1" />
            À la une ({filteredArticles.filter(a => a.featured).length})
          </TabsTrigger>
          <TabsTrigger value="bookmarked">
            <Bookmark className="h-4 w-4 mr-1" />
            Favoris ({bookmarkedArticles.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {filteredArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun article trouvé</h3>
                <p className="text-muted-foreground">
                  Essayez de modifier vos critères de recherche ou de filtrage
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles.map((article) => {
                const CategoryIcon = getCategoryIcon(article.category);
                const isBookmarked = bookmarkedArticles.includes(article.id);
                
                return (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <CategoryIcon className="h-4 w-4 text-emerald" />
                            <Badge variant="outline" className="text-xs">
                              {getCategoryLabel(article.category)}
                            </Badge>
                            {article.featured && (
                              <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                                <Star className="h-3 w-3 mr-1" />
                                À la une
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-2">
                            <span>Par {article.author}</span>
                            <span>•</span>
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleBookmark(article.id)}
                          className={isBookmarked ? 'text-gold' : 'text-muted-foreground'}
                        >
                          <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        {truncateContent(article.content)}
                      </p>
                      <Button variant="outline" size="sm">
                        Lire l'article complet
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="featured" className="space-y-4">
          <div className="grid gap-4">
            {filteredArticles.filter(article => article.featured).map((article) => {
              const CategoryIcon = getCategoryIcon(article.category);
              const isBookmarked = bookmarkedArticles.includes(article.id);
              
              return (
                <Card key={article.id} className="hover:shadow-md transition-shadow border-gold/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CategoryIcon className="h-4 w-4 text-emerald" />
                          <Badge variant="outline" className="text-xs">
                            {getCategoryLabel(article.category)}
                          </Badge>
                          <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                            <Star className="h-3 w-3 mr-1" />
                            À la une
                          </Badge>
                        </div>
                        <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <span>Par {article.author}</span>
                          <span>•</span>
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(article.id)}
                        className={isBookmarked ? 'text-gold' : 'text-muted-foreground'}
                      >
                        <Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      {truncateContent(article.content, 300)}
                    </p>
                    <Button size="sm" className="bg-emerald hover:bg-emerald-dark">
                      Lire l'article complet
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="bookmarked" className="space-y-4">
          {bookmarkedArticles.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Aucun favori</h3>
                <p className="text-muted-foreground">
                  Marquez des articles comme favoris en cliquant sur l'icône signet
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredArticles
                .filter(article => bookmarkedArticles.includes(article.id))
                .map((article) => {
                  const CategoryIcon = getCategoryIcon(article.category);
                  
                  return (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CategoryIcon className="h-4 w-4 text-emerald" />
                              <Badge variant="outline" className="text-xs">
                                {getCategoryLabel(article.category)}
                              </Badge>
                              {article.featured && (
                                <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                                  <Star className="h-3 w-3 mr-1" />
                                  À la une
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl mb-2">{article.title}</CardTitle>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <span>Par {article.author}</span>
                              <span>•</span>
                              <Calendar className="h-3 w-3" />
                              <span>{new Date(article.created_at).toLocaleDateString('fr-FR')}</span>
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                            className="text-gold"
                          >
                            <Bookmark className="h-4 w-4 fill-current" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">
                          {truncateContent(article.content)}
                        </p>
                        <Button variant="outline" size="sm">
                          Lire l'article complet
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IslamicGuidanceHub;