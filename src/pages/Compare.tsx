import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Star, Trash2, Edit, Eye, Clock, Filter, StarOff, Download, Tag, X, Plus, ArrowUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProfileComparator from '@/components/ProfileComparator';
import StarRating from '@/components/StarRating';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { generateComparisonPDF } from '@/services/comparisonPdfExportService';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';

interface ComparisonHistory {
  id: string;
  user_id: string;
  compared_profile_ids: string[];
  comparison_name: string | null;
  notes: string | null;
  is_favorite: boolean;
  tags: string[];
  rating: number | null;
  created_at: string;
  updated_at: string;
}

const Compare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { batchCalculateCompatibility } = useUnifiedCompatibility();
  const [history, setHistory] = useState<ComparisonHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ComparisonHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComparison, setSelectedComparison] = useState<ComparisonHistory | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingComparison, setEditingComparison] = useState<ComparisonHistory | null>(null);
  const [editName, setEditName] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showTagsDialog, setShowTagsDialog] = useState(false);
  const [editingTags, setEditingTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [tagEditingComparison, setTagEditingComparison] = useState<ComparisonHistory | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'rating'>('date');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const radarChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [history, dateFilter, favoritesOnly, selectedTags, sortBy, ratingFilter]);

  useEffect(() => {
    // Extract all unique tags from history
    const tags = new Set<string>();
    history.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    setAvailableTags(Array.from(tags).sort());
  }, [history]);

  const fetchHistory = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_comparison_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Error fetching comparison history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des comparaisons",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      if (dateFilter === 'today') {
        filterDate.setHours(0, 0, 0, 0);
      } else if (dateFilter === 'week') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === 'month') {
        filterDate.setMonth(now.getMonth() - 1);
      }

      filtered = filtered.filter(item => new Date(item.created_at) >= filterDate);
    }

    // Filter by favorites
    if (favoritesOnly) {
      filtered = filtered.filter(item => item.is_favorite);
    }

    // Filter by tags (OR logic - show if ANY selected tag matches)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(item => 
        item.tags && item.tags.some(tag => selectedTags.includes(tag))
      );
    }

    // Filter by rating
    if (ratingFilter !== null) {
      filtered = filtered.filter(item => item.rating === ratingFilter);
    }

    // Sort
    if (sortBy === 'rating') {
      filtered.sort((a, b) => {
        // Sort by rating descending, nulls last
        if (a.rating === null && b.rating === null) return 0;
        if (a.rating === null) return 1;
        if (b.rating === null) return -1;
        return b.rating - a.rating;
      });
    } else {
      // Sort by date descending (default)
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    setFilteredHistory(filtered);
  };

  const handleView = (comparison: ComparisonHistory) => {
    setSelectedComparison(comparison);
    setShowViewDialog(true);
  };

  const handleEdit = (comparison: ComparisonHistory) => {
    setEditingComparison(comparison);
    setEditName(comparison.comparison_name || '');
    setEditNotes(comparison.notes || '');
    setShowEditDialog(true);
  };

  const handleSaveEdit = async () => {
    if (!editingComparison) return;

    try {
      const { error } = await supabase
        .from('profile_comparison_history')
        .update({
          comparison_name: editName || null,
          notes: editNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingComparison.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Comparaison mise à jour"
      });

      setShowEditDialog(false);
      fetchHistory();
    } catch (error) {
      console.error('Error updating comparison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la comparaison",
        variant: "destructive"
      });
    }
  };

  const handleToggleFavorite = async (comparison: ComparisonHistory) => {
    try {
      const { error } = await supabase
        .from('profile_comparison_history')
        .update({
          is_favorite: !comparison.is_favorite,
          updated_at: new Date().toISOString()
        })
        .eq('id', comparison.id);

      if (error) throw error;

      toast({
        title: comparison.is_favorite ? "Retiré des favoris" : "Ajouté aux favoris",
        description: comparison.is_favorite 
          ? "Cette comparaison n'est plus dans vos favoris"
          : "Cette comparaison est maintenant dans vos favoris"
      });

      fetchHistory();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le favori",
        variant: "destructive"
      });
    }
  };

  const handleOpenTagsDialog = (comparison: ComparisonHistory) => {
    setTagEditingComparison(comparison);
    setEditingTags(comparison.tags || []);
    setNewTag('');
    setShowTagsDialog(true);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !editingTags.includes(newTag.trim())) {
      setEditingTags([...editingTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setEditingTags(editingTags.filter(tag => tag !== tagToRemove));
  };

  const handleSaveTags = async () => {
    if (!tagEditingComparison) return;

    try {
      const { error } = await supabase
        .from('profile_comparison_history')
        .update({
          tags: editingTags,
          updated_at: new Date().toISOString()
        })
        .eq('id', tagEditingComparison.id);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Tags mis à jour"
      });

      setShowTagsDialog(false);
      fetchHistory();
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les tags",
        variant: "destructive"
      });
    }
  };

  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleRatingChange = async (comparisonId: string, newRating: number) => {
    try {
      const { error } = await supabase
        .from('profile_comparison_history')
        .update({
          rating: newRating === 0 ? null : newRating,
          updated_at: new Date().toISOString()
        })
        .eq('id', comparisonId);

      if (error) throw error;

      toast({
        title: newRating === 0 ? "Note retirée" : "Note enregistrée",
        description: newRating === 0 ? "La note a été supprimée" : `Note: ${newRating}/5 étoiles`
      });

      fetchHistory();
    } catch (error) {
      console.error('Error updating rating:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la note",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette comparaison ?')) return;

    try {
      const { error } = await supabase
        .from('profile_comparison_history')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Supprimé",
        description: "Comparaison supprimée avec succès"
      });

      fetchHistory();
    } catch (error) {
      console.error('Error deleting comparison:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la comparaison",
        variant: "destructive"
      });
    }
  };

  const handleExportPdf = async () => {
    if (!selectedComparison || !user) return;
    
    setExportingPdf(true);
    try {
      // Fetch profiles data with user_id
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, age, location, occupation')
        .in('id', selectedComparison.compared_profile_ids);

      if (profilesError) throw profilesError;
      if (!profiles || profiles.length === 0) {
        throw new Error('No profiles found');
      }

      // Get user IDs from profiles
      const userIds = profiles.map(p => p.user_id).filter(Boolean);

      // Calculate real compatibility scores using the unified compatibility hook
      const compatibilityResults = await batchCalculateCompatibility(userIds);

      // Map compatibility results to scores by profile ID
      const scores = profiles.map(profile => {
        const result = compatibilityResults[profile.user_id];
        return {
          profileId: profile.id,
          overall: result?.compatibility_score ?? 60,
          islamic: result?.islamic_score ?? 60,
          cultural: result?.cultural_score ?? 60,
          personality: result?.personality_score ?? 60,
        };
      });

      await generateComparisonPDF({
        comparisonName: selectedComparison.comparison_name || 'Comparaison sans titre',
        comparisonDate: format(new Date(selectedComparison.created_at), 'PPP', { locale: fr }),
        data: {
          profiles: profiles.map(p => ({
            id: p.id,
            full_name: p.full_name,
            age: p.age,
            location: p.location,
            occupation: p.occupation,
          })),
          scores,
          insights: compatibilityResults,
        },
        notes: selectedComparison.notes || undefined,
        radarChartElement: radarChartRef.current || undefined,
      });

      toast({
        title: "Export réussi",
        description: "Le PDF a été téléchargé avec les scores réels de compatibilité"
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'exporter le PDF",
        variant: "destructive"
      });
    } finally {
      setExportingPdf(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <Card className="animate-pulse">
            <CardContent className="p-8">
              <div className="h-64 bg-muted rounded"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Historique des Comparaisons</h1>
          <p className="text-muted-foreground">
            Retrouvez toutes vos comparaisons de profils précédentes
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={dateFilter} onValueChange={(value: any) => setDateFilter(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Période" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les dates</SelectItem>
                      <SelectItem value="today">Aujourd'hui</SelectItem>
                      <SelectItem value="week">Cette semaine</SelectItem>
                      <SelectItem value="month">Ce mois</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <Select 
                    value={ratingFilter?.toString() || 'all'} 
                    onValueChange={(value) => setRatingFilter(value === 'all' ? null : parseInt(value))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Toutes les notes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les notes</SelectItem>
                      <SelectItem value="5">5 étoiles</SelectItem>
                      <SelectItem value="4">4 étoiles</SelectItem>
                      <SelectItem value="3">3 étoiles</SelectItem>
                      <SelectItem value="2">2 étoiles</SelectItem>
                      <SelectItem value="1">1 étoile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                  <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date (récent)</SelectItem>
                      <SelectItem value="rating">Note (meilleur)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant={favoritesOnly ? "default" : "outline"}
                  onClick={() => setFavoritesOnly(!favoritesOnly)}
                  className={favoritesOnly ? "bg-gold text-white" : "border-gold text-gold hover:bg-gold hover:text-white"}
                >
                  <Star className="h-4 w-4 mr-2" />
                  {favoritesOnly ? "Afficher tout" : "Favoris uniquement"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => navigate('/browse')}
                  className="border-emerald text-emerald hover:bg-emerald hover:text-white"
                >
                  Nouvelle comparaison
                </Button>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Filtrer par tags:</span>
                  {availableTags.map(tag => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-emerald text-white hover:bg-emerald/90'
                          : 'hover:bg-emerald/10'
                      }`}
                      onClick={() => toggleTagFilter(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                  {selectedTags.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTags([])}
                      className="h-6 text-xs"
                    >
                      Réinitialiser
                    </Button>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {history.length === 0 
                  ? "Aucune comparaison" 
                  : "Aucune comparaison trouvée"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {history.length === 0
                  ? "Commencez à comparer des profils depuis la page Découvrir"
                  : "Aucune comparaison ne correspond aux filtres sélectionnés"}
              </p>
              <Button onClick={() => navigate('/browse')} variant="outline" className="border-emerald text-emerald hover:bg-emerald hover:text-white">
                Découvrir des profils
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredHistory.map((comparison) => (
              <Card key={comparison.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">
                          {comparison.comparison_name || `Comparaison du ${format(new Date(comparison.created_at), 'PPP', { locale: fr })}`}
                        </h3>
                        {comparison.is_favorite && (
                          <Star className="h-5 w-5 text-gold fill-gold" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <StarRating
                          rating={comparison.rating}
                          onRatingChange={(rating) => handleRatingChange(comparison.id, rating)}
                          size="sm"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {format(new Date(comparison.created_at), 'PPP à HH:mm', { locale: fr })}
                        </div>
                        <Badge variant="secondary">
                          {comparison.compared_profile_ids.length} profils
                        </Badge>
                      </div>

                      {comparison.notes && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                          {comparison.notes}
                        </p>
                      )}

                      {comparison.tags && comparison.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {comparison.tags.map(tag => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFavorite(comparison)}
                        className="hover:bg-gold/10"
                        title="Favori"
                      >
                        {comparison.is_favorite ? (
                          <StarOff className="h-4 w-4 text-gold" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenTagsDialog(comparison)}
                        className="hover:bg-purple-100"
                        title="Gérer les tags"
                      >
                        <Tag className="h-4 w-4 text-purple-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleView(comparison)}
                        className="hover:bg-emerald/10"
                        title="Voir"
                      >
                        <Eye className="h-4 w-4 text-emerald" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(comparison)}
                        className="hover:bg-blue-100"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comparison.id)}
                        className="hover:bg-red-100"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* View Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>
                  {selectedComparison?.comparison_name || 'Comparaison'}
                </DialogTitle>
                <Button
                  onClick={handleExportPdf}
                  disabled={exportingPdf}
                  variant="outline"
                  size="sm"
                  className="border-emerald text-emerald hover:bg-emerald hover:text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportingPdf ? 'Export en cours...' : 'Exporter en PDF'}
                </Button>
              </div>
            </DialogHeader>
            {selectedComparison && (
              <div className="space-y-4">
                {selectedComparison.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {selectedComparison.notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
                <div ref={radarChartRef}>
                  <ProfileComparator profileIds={selectedComparison.compared_profile_ids} />
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifier la comparaison</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nom de la comparaison</label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Meilleurs candidats Mars 2024"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes personnelles</label>
                <Textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Ajoutez vos observations, impressions..."
                  rows={4}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveEdit} className="bg-emerald text-white hover:bg-emerald-dark">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Tags Management Dialog */}
        <Dialog open={showTagsDialog} onOpenChange={setShowTagsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Gérer les tags</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Tags actuels</label>
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md">
                  {editingTags.length === 0 ? (
                    <span className="text-sm text-muted-foreground">Aucun tag</span>
                  ) : (
                    editingTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Ajouter un tag</label>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Ex: Candidats prioritaires, À revoir..."
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                  />
                  <Button 
                    onClick={handleAddTag}
                    variant="outline"
                    size="sm"
                    disabled={!newTag.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {availableTags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Tags existants (cliquez pour ajouter)</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags
                      .filter(tag => !editingTags.includes(tag))
                      .map(tag => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-emerald/10"
                          onClick={() => setEditingTags([...editingTags, tag])}
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTagsDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleSaveTags} className="bg-emerald text-white hover:bg-emerald-dark">
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Compare;
