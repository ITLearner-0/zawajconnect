import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tag, Plus } from 'lucide-react';
import { useProfileTags, ProfileTag } from '@/hooks/useProfileTags';
import TagManager from './TagManager';

interface NoteTagSelectorProps {
  noteId: string;
}

const NoteTagSelector = ({ noteId }: NoteTagSelectorProps) => {
  const { tags, addTagToNote, removeTagFromNote, getNoteTags } = useProfileTags();
  const [selectedTags, setSelectedTags] = useState<ProfileTag[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const loadNoteTags = async () => {
    const noteTags = await getNoteTags(noteId);
    setSelectedTags(noteTags);
  };

  useEffect(() => {
    loadNoteTags();
  }, [noteId]);

  const handleTagToggle = async (tag: ProfileTag) => {
    const isSelected = selectedTags.some((t) => t.id === tag.id);

    if (isSelected) {
      const success = await removeTagFromNote(noteId, tag.id);
      if (success) {
        setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
      }
    } else {
      const success = await addTagToNote(noteId, tag.id);
      if (success) {
        setSelectedTags((prev) => [...prev, tag]);
      }
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {selectedTags.map((tag) => (
        <Badge
          key={tag.id}
          style={{ backgroundColor: tag.color, color: 'white' }}
          className="cursor-pointer hover:opacity-80"
          onClick={() => handleTagToggle(tag)}
        >
          <Tag className="h-3 w-3 mr-1" />
          {tag.tag_name}
        </Badge>
      ))}

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="h-6 gap-1">
            <Plus className="h-3 w-3" />
            Tag
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Ajouter des tags</h4>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => {
                const isSelected = selectedTags.some((t) => t.id === tag.id);
                return (
                  <Badge
                    key={tag.id}
                    style={{
                      backgroundColor: isSelected ? tag.color : 'transparent',
                      color: isSelected ? 'white' : tag.color,
                      borderColor: tag.color,
                    }}
                    className="cursor-pointer border-2 hover:opacity-80 transition-opacity"
                    onClick={() => handleTagToggle(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.tag_name}
                  </Badge>
                );
              })}
            </div>
            {tags.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">
                Créez d'abord des tags dans la gestion des tags
              </p>
            )}
            <div className="pt-2 border-t">
              <TagManager
                compact
                onTagSelect={handleTagToggle}
                selectedTags={selectedTags.map((t) => t.id)}
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default NoteTagSelector;
