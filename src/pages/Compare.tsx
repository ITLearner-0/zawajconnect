import { useState, useEffect } from 'react';
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
import { Calendar, Star, Trash2, Edit, Eye, Clock, Filter, StarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ProfileComparator from '@/components/ProfileComparator';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ComparisonHistory {
  id: string;
  user_id: string;
  compared_profile_ids: string[];
  comparison_name: string | null;
  notes: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

const Compare = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchHistory();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [history, dateFilter, favoritesOnly]);

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
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="flex items-center gap-2 flex-1">
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
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleToggleFavorite(comparison)}
                        className="hover:bg-gold/10"
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
                        onClick={() => handleView(comparison)}
                        className="hover:bg-emerald/10"
                      >
                        <Eye className="h-4 w-4 text-emerald" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(comparison)}
                        className="hover:bg-blue-100"
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(comparison.id)}
                        className="hover:bg-red-100"
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
              <DialogTitle>
                {selectedComparison?.comparison_name || 'Comparaison'}
              </DialogTitle>
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
                <ProfileComparator profileIds={selectedComparison.compared_profile_ids} />
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
      </div>
    </div>
  );
};

export default Compare;
