import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  StickyNote,
  Search,
  Filter,
  Save,
  Trash2,
  Tag,
  Calendar,
  User,
  X,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useProfileTags, ProfileTag } from '@/hooks/useProfileTags';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NoteWithProfile {
  id: string;
  note: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profile: {
    user_id: string;
    full_name: string | null;
    age: number | null;
    location: string | null;
    avatar_url: string | null;
  };
  tags: ProfileTag[];
}

type SortOption = 'date_desc' | 'date_asc' | 'profile_name' | 'relevance';

export default function NotesManager() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { tags, addTagToNote, removeTagFromNote, getNoteTags } = useProfileTags();
  const [notes, setNotes] = useState<NoteWithProfile[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [savingNoteId, setSavingNoteId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    applyFiltersAndSort();
  }, [notes, searchQuery, sortBy, selectedTagFilter]);

  const fetchNotes = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data: notesData, error } = await supabase
        .from('profile_notes')
        .select(
          `
          id,
          note,
          profile_id,
          created_at,
          updated_at,
          profiles!profile_notes_profile_id_fkey (
            user_id,
            full_name,
            age,
            location,
            avatar_url
          )
        `
        )
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Fetch tags for each note
      const notesWithTags = await Promise.all(
        (notesData || []).map(async (note: any) => {
          const noteTags = await getNoteTags(note.id);
          return {
            ...note,
            profile: note.profiles,
            tags: noteTags,
          };
        })
      );

      setNotes(notesWithTags);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Erreur lors du chargement des notes');
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...notes];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tag filter
    if (selectedTagFilter) {
      filtered = filtered.filter((note) => note.tags.some((tag) => tag.id === selectedTagFilter));
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'date_asc':
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime();
        case 'profile_name':
          return (a.profile.full_name || '').localeCompare(b.profile.full_name || '');
        case 'relevance':
          return b.note.length - a.note.length;
        default:
          return 0;
      }
    });

    setFilteredNotes(filtered);
  };

  const handleSaveNote = async (noteId: string) => {
    if (!editingContent.trim()) {
      toast.error('La note ne peut pas être vide');
      return;
    }

    setSavingNoteId(noteId);
    try {
      const { error } = await supabase
        .from('profile_notes')
        .update({
          note: editingContent.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', noteId);

      if (error) throw error;

      setNotes((prev) =>
        prev.map((note) =>
          note.id === noteId
            ? { ...note, note: editingContent.trim(), updated_at: new Date().toISOString() }
            : note
        )
      );
      setEditingNoteId(null);
      toast.success('Note mise à jour');
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSavingNoteId(null);
    }
  };

  const handleDeleteNote = async (noteId: string, profileId: string) => {
    if (!user || !confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) return;

    try {
      const { error } = await supabase
        .from('profile_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotes((prev) => prev.filter((note) => note.id !== noteId));
      toast.success('Note supprimée');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleTagToggle = async (noteId: string, tag: ProfileTag) => {
    const note = notes.find((n) => n.id === noteId);
    if (!note) return;

    const hasTag = note.tags.some((t) => t.id === tag.id);

    if (hasTag) {
      const success = await removeTagFromNote(noteId, tag.id);
      if (success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === noteId ? { ...n, tags: n.tags.filter((t) => t.id !== tag.id) } : n
          )
        );
      }
    } else {
      const success = await addTagToNote(noteId, tag.id);
      if (success) {
        setNotes((prev) =>
          prev.map((n) => (n.id === noteId ? { ...n, tags: [...n.tags, tag] } : n))
        );
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTagFilter(null);
    setSortBy('date_desc');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/browse')} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-center gap-3 mb-6">
            <StickyNote className="h-8 w-8 text-emerald" />
            <div>
              <h1 className="text-3xl font-bold">Mes Notes Privées</h1>
              <p className="text-muted-foreground">
                {filteredNotes.length} note{filteredNotes.length > 1 ? 's' : ''}
                {searchQuery || selectedTagFilter ? ' (filtrées)' : ''}
              </p>
            </div>
          </div>

          {/* Filters */}
          <Card className="p-4 mb-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher dans les notes ou par profil..."
                  className="pl-10"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Trier par" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date_desc">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Plus récentes
                      </div>
                    </SelectItem>
                    <SelectItem value="date_asc">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Plus anciennes
                      </div>
                    </SelectItem>
                    <SelectItem value="profile_name">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Par profil (A-Z)
                      </div>
                    </SelectItem>
                    <SelectItem value="relevance">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Par pertinence
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Tag filter */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tags:</span>
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{
                          backgroundColor: selectedTagFilter === tag.id ? tag.color : 'transparent',
                          color: selectedTagFilter === tag.id ? 'white' : tag.color,
                          borderColor: tag.color,
                        }}
                        className="cursor-pointer border-2 hover:opacity-80 transition-opacity"
                        onClick={() =>
                          setSelectedTagFilter(selectedTagFilter === tag.id ? null : tag.id)
                        }
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.tag_name}
                      </Badge>
                    ))}
                  </div>
                )}

                {(searchQuery || selectedTagFilter || sortBy !== 'date_desc') && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Notes list */}
        {filteredNotes.length === 0 ? (
          <Card className="p-12 text-center">
            <StickyNote className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">
              {searchQuery || selectedTagFilter ? 'Aucune note trouvée' : 'Aucune note'}
            </h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery || selectedTagFilter
                ? 'Essayez de modifier vos filtres de recherche.'
                : 'Commencez à ajouter des notes privées sur les profils qui vous intéressent.'}
            </p>
            {(searchQuery || selectedTagFilter) && (
              <Button onClick={clearFilters} variant="outline">
                Effacer les filtres
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map((note) => (
              <Card key={note.id} className="p-5">
                <div className="space-y-4">
                  {/* Profile info */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {note.profile.avatar_url ? (
                        <img
                          src={note.profile.avatar_url}
                          alt={note.profile.full_name || 'Avatar'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => navigate(`/profile/${note.profile.user_id}`)}
                          className="font-semibold hover:underline text-left truncate block w-full"
                        >
                          {note.profile.full_name || 'Profil anonyme'}
                        </button>
                        <p className="text-sm text-muted-foreground">
                          {note.profile.age && `${note.profile.age} ans`}
                          {note.profile.age && note.profile.location && ' • '}
                          {note.profile.location}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground text-right whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(note.updated_at), 'dd MMM yyyy', { locale: fr })}
                      </div>
                    </div>
                  </div>

                  {/* Note content */}
                  {editingNoteId === note.id ? (
                    <div className="space-y-3">
                      <Textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className="min-h-[120px]"
                        maxLength={500}
                      />
                      <div className="text-xs text-muted-foreground text-right">
                        {editingContent.length}/500
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleSaveNote(note.id)}
                          disabled={savingNoteId === note.id}
                          className="bg-emerald text-white hover:bg-emerald/90"
                        >
                          <Save className="h-3 w-3 mr-1" />
                          {savingNoteId === note.id ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingNoteId(null);
                            setEditingContent('');
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-lg">
                        {note.note}
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  <div className="flex flex-wrap items-center gap-2">
                    {note.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        style={{ backgroundColor: tag.color, color: 'white' }}
                        className="cursor-pointer hover:opacity-80"
                        onClick={() => handleTagToggle(note.id, tag)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.tag_name}
                      </Badge>
                    ))}

                    {tags.filter((t) => !note.tags.some((nt) => nt.id === t.id)).length > 0 && (
                      <Select
                        onValueChange={(tagId) => {
                          const tag = tags.find((t) => t.id === tagId);
                          if (tag) handleTagToggle(note.id, tag);
                        }}
                      >
                        <SelectTrigger className="h-6 w-auto text-xs">
                          <Tag className="h-3 w-3 mr-1" />
                          Ajouter tag
                        </SelectTrigger>
                        <SelectContent>
                          {tags
                            .filter((t) => !note.tags.some((nt) => nt.id === t.id))
                            .map((tag) => (
                              <SelectItem key={tag.id} value={tag.id}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: tag.color }}
                                  />
                                  {tag.tag_name}
                                </div>
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  {/* Actions */}
                  {editingNoteId !== note.id && (
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNoteId(note.id);
                          setEditingContent(note.note);
                        }}
                      >
                        Modifier
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNote(note.id, note.profile_id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
