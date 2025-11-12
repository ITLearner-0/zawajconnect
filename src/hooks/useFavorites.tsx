import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export const useFavorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profile_favorites')
        .select('profile_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favSet = new Set(data.map((fav) => fav.profile_id));
      setFavorites(favSet);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (profileId: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour ajouter des favoris');
      return;
    }

    const isFavorite = favorites.has(profileId);

    try {
      if (isFavorite) {
        // Remove from favorites
        const { error } = await supabase
          .from('profile_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profileId);

        if (error) throw error;

        setFavorites((prev) => {
          const newSet = new Set(prev);
          newSet.delete(profileId);
          return newSet;
        });
        toast.success('Retiré des favoris');
      } else {
        // Add to favorites
        const { error } = await supabase.from('profile_favorites').insert({
          user_id: user.id,
          profile_id: profileId,
        });

        if (error) throw error;

        setFavorites((prev) => new Set(prev).add(profileId));
        toast.success('Ajouté aux favoris');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Erreur lors de la mise à jour des favoris');
    }
  };

  const isFavorite = (profileId: string) => favorites.has(profileId);

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorite,
    refetch: fetchFavorites,
  };
};
