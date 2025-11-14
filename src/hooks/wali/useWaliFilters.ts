import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface WaliFilterValues {
  search?: string;
  status?: 'pending' | 'approved' | 'rejected' | 'all';
  relationship?: string;
  dateFrom?: string;
  dateTo?: string;
  email?: string;
  phone?: string;
}

export interface SavedFilter {
  id: string;
  user_id: string;
  name: string;
  filters: WaliFilterValues;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const useWaliFilters = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchSavedFilters();
    }
  }, [user]);

  const fetchSavedFilters = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await (supabase as any)
        .from('wali_saved_filters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedFilters(data as SavedFilter[]);
    } catch (err) {
      console.error('Error fetching saved filters:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveFilter = async (name: string, filters: WaliFilterValues): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await (supabase as any).from('wali_saved_filters').insert({
        user_id: user.id,
        name,
        filters,
        is_default: false,
      });

      if (error) throw error;

      toast({
        title: 'Filtre sauvegardé',
        description: `Le filtre "${name}" a été sauvegardé avec succès`,
      });

      await fetchSavedFilters();
      return true;
    } catch (err) {
      console.error('Error saving filter:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder le filtre',
        variant: 'destructive',
      });
      return false;
    }
  };

  const updateFilter = async (
    id: string,
    name: string,
    filters: WaliFilterValues
  ): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('wali_saved_filters')
        .update({ name, filters })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Filtre mis à jour',
        description: 'Le filtre a été mis à jour avec succès',
      });

      await fetchSavedFilters();
      return true;
    } catch (err) {
      console.error('Error updating filter:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour le filtre',
        variant: 'destructive',
      });
      return false;
    }
  };

  const deleteFilter = async (id: string): Promise<boolean> => {
    try {
      const { error } = await (supabase as any)
        .from('wali_saved_filters')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Filtre supprimé',
        description: 'Le filtre a été supprimé avec succès',
      });

      await fetchSavedFilters();
      return true;
    } catch (err) {
      console.error('Error deleting filter:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le filtre',
        variant: 'destructive',
      });
      return false;
    }
  };

  const setDefaultFilter = async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Remove default from all filters
      await (supabase as any)
        .from('wali_saved_filters')
        .update({ is_default: false })
        .eq('user_id', user.id);

      // Set new default
      const { error } = await (supabase as any)
        .from('wali_saved_filters')
        .update({ is_default: true })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'Filtre par défaut',
        description: 'Le filtre a été défini comme filtre par défaut',
      });

      await fetchSavedFilters();
      return true;
    } catch (err) {
      console.error('Error setting default filter:', err);
      toast({
        title: 'Erreur',
        description: 'Impossible de définir le filtre par défaut',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    savedFilters,
    loading,
    saveFilter,
    updateFilter,
    deleteFilter,
    setDefaultFilter,
    refetch: fetchSavedFilters,
  };
};
