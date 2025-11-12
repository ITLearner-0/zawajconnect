import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface ProfileTag {
  id: string;
  tag_name: string;
  color: string;
  created_at: string | null;
}

export const useProfileTags = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<ProfileTag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  const fetchTags = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profile_tags')
        .select('*')
        .eq('user_id', user.id)
        .order('tag_name');

      if (error) throw error;

      setTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const createTag = async (tagName: string, color: string) => {
    if (!user) {
      toast.error('Vous devez être connecté pour créer des tags');
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('profile_tags')
        .insert({
          user_id: user.id,
          tag_name: tagName,
          color: color
        })
        .select()
        .single();

      if (error) throw error;

      setTags(prev => [...prev, data]);
      toast.success(`Tag "${tagName}" créé`);
      return data;
    } catch (error: any) {
      console.error('Error creating tag:', error);
      if (error.code === '23505') {
        toast.error('Ce tag existe déjà');
      } else {
        toast.error('Erreur lors de la création du tag');
      }
      return null;
    }
  };

  const updateTag = async (tagId: string, tagName: string, color: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profile_tags')
        .update({ tag_name: tagName, color: color })
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTags(prev => prev.map(tag => 
        tag.id === tagId ? { ...tag, tag_name: tagName, color: color } : tag
      ));
      toast.success('Tag mis à jour');
      return true;
    } catch (error) {
      console.error('Error updating tag:', error);
      toast.error('Erreur lors de la mise à jour du tag');
      return false;
    }
  };

  const deleteTag = async (tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profile_tags')
        .delete()
        .eq('id', tagId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTags(prev => prev.filter(tag => tag.id !== tagId));
      toast.success('Tag supprimé');
      return true;
    } catch (error) {
      console.error('Error deleting tag:', error);
      toast.error('Erreur lors de la suppression du tag');
      return false;
    }
  };

  const addTagToFavorite = async (profileId: string, tagId: string) => {
    if (!user) return false;

    try {
      // Get favorite ID
      const { data: favorite, error: favError } = await supabase
        .from('profile_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .single();

      if (favError || !favorite) throw favError;

      // Add tag to favorite
      const { error } = await supabase
        .from('favorite_tags')
        .insert({
          favorite_id: favorite.id,
          tag_id: tagId
        });

      if (error) throw error;

      toast.success('Tag ajouté au favori');
      return true;
    } catch (error: any) {
      console.error('Error adding tag to favorite:', error);
      if (error.code === '23505') {
        toast.error('Ce tag est déjà associé à ce favori');
      } else {
        toast.error('Erreur lors de l\'ajout du tag');
      }
      return false;
    }
  };

  const removeTagFromFavorite = async (profileId: string, tagId: string) => {
    if (!user) return false;

    try {
      const { data: favorite, error: favError } = await supabase
        .from('profile_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .single();

      if (favError || !favorite) throw favError;

      const { error } = await supabase
        .from('favorite_tags')
        .delete()
        .eq('favorite_id', favorite.id)
        .eq('tag_id', tagId);

      if (error) throw error;

      toast.success('Tag retiré du favori');
      return true;
    } catch (error) {
      console.error('Error removing tag from favorite:', error);
      toast.error('Erreur lors du retrait du tag');
      return false;
    }
  };

  const getFavoriteTags = async (profileId: string): Promise<ProfileTag[]> => {
    if (!user) return [];

    try {
      const { data: favorite, error: favError } = await supabase
        .from('profile_favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (favError || !favorite) return [];

      const { data, error } = await supabase
        .from('favorite_tags')
        .select('tag_id, profile_tags(*)')
        .eq('favorite_id', favorite.id);

      if (error) throw error;

      return data?.map(item => (item as any).profile_tags).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching favorite tags:', error);
      return [];
    }
  };

  const addTagToNote = async (noteId: string, tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('note_tags')
        .insert({
          note_id: noteId,
          tag_id: tagId
        });

      if (error) throw error;

      toast.success('Tag ajouté à la note');
      return true;
    } catch (error: any) {
      console.error('Error adding tag to note:', error);
      if (error.code === '23505') {
        toast.error('Ce tag est déjà associé à cette note');
      } else {
        toast.error('Erreur lors de l\'ajout du tag');
      }
      return false;
    }
  };

  const removeTagFromNote = async (noteId: string, tagId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', noteId)
        .eq('tag_id', tagId);

      if (error) throw error;

      toast.success('Tag retiré de la note');
      return true;
    } catch (error) {
      console.error('Error removing tag from note:', error);
      toast.error('Erreur lors du retrait du tag');
      return false;
    }
  };

  const getNoteTags = async (noteId: string): Promise<ProfileTag[]> => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('note_tags')
        .select('tag_id, profile_tags(*)')
        .eq('note_id', noteId);

      if (error) throw error;

      return data?.map(item => (item as any).profile_tags).filter(Boolean) || [];
    } catch (error) {
      console.error('Error fetching note tags:', error);
      return [];
    }
  };

  return {
    tags,
    loading,
    createTag,
    updateTag,
    deleteTag,
    addTagToFavorite,
    removeTagFromFavorite,
    getFavoriteTags,
    addTagToNote,
    removeTagFromNote,
    getNoteTags,
    refetch: fetchTags
  };
};
