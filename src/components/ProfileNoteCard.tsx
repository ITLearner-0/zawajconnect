import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { StickyNote, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import NoteTagSelector from './NoteTagSelector';

interface ProfileNoteCardProps {
  userId: string;
  profileId: string;
  searchKeyword?: string;
}

const ProfileNoteCard = ({ userId, profileId, searchKeyword }: ProfileNoteCardProps) => {
  // Helper function to highlight text
  const highlightText = (text: string, keyword?: string) => {
    if (!keyword || !text) return text;

    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === keyword.toLowerCase() ? (
        <mark key={index} className="bg-yellow-300 text-black font-semibold px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };
  const { toast } = useToast();
  const [note, setNote] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [noteId, setNoteId] = useState<string | null>(null);

  useEffect(() => {
    fetchNote();
  }, [userId, profileId]);

  const fetchNote = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_notes')
        .select('id, note')
        .eq('user_id', userId)
        .eq('profile_id', profileId)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setNote(data.note);
        setNoteId(data.id);
        setHasNote(true);
      }
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const handleSave = async () => {
    if (!note.trim()) {
      handleDelete();
      return;
    }

    setIsSaving(true);
    try {
      const { data, error } = await supabase
        .from('profile_notes')
        .upsert(
          {
            user_id: userId,
            profile_id: profileId,
            note: note.trim(),
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: 'user_id,profile_id',
          }
        )
        .select('id')
        .single();

      if (error) throw error;

      setHasNote(true);
      if (data) {
        setNoteId(data.id);
      }
      setIsVisible(false);
      toast({
        title: 'Note sauvegardée',
        description: 'Votre note privée a été enregistrée',
      });
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la note',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { error } = await supabase
        .from('profile_notes')
        .delete()
        .eq('user_id', userId)
        .eq('profile_id', profileId);

      if (error) throw error;

      setNote('');
      setHasNote(false);
      setIsVisible(false);
      toast({
        title: 'Note supprimée',
        description: 'La note a été supprimée',
      });
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="relative">
      {/* Note Icon Button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsVisible(!isVisible)}
        className={`${hasNote ? 'text-gold hover:text-gold/80' : 'text-muted-foreground hover:text-gold'}`}
        title={hasNote ? 'Modifier la note' : 'Ajouter une note'}
      >
        <StickyNote className={`h-4 w-4 ${hasNote ? 'fill-gold' : ''}`} />
      </Button>

      {/* Note Editor Popover */}
      {isVisible && (
        <Card className="absolute top-full right-0 mt-2 p-3 w-80 shadow-xl z-30 border-2 border-emerald/20 animate-fade-in">
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Note privée</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsVisible(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            {searchKeyword && note && (
              <div className="text-xs p-2 border rounded-md bg-yellow-50 border-yellow-200 mb-2">
                <div className="font-medium text-yellow-800 mb-1">📌 Mot-clé trouvé :</div>
                <div className="text-yellow-900">{highlightText(note, searchKeyword)}</div>
              </div>
            )}
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ajoutez vos observations personnelles..."
              className="min-h-[100px] text-sm"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">{note.length}/500</div>

            {noteId && (
              <div className="pt-2 border-t">
                <NoteTagSelector noteId={noteId} />
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 bg-emerald text-white hover:bg-emerald/90"
              >
                <Save className="h-3 w-3 mr-1" />
                {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
              </Button>
              {hasNote && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                >
                  Supprimer
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ProfileNoteCard;
