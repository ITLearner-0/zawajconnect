import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';
import { useProfileTags, ProfileTag } from '@/hooks/useProfileTags';

interface TagManagerProps {
  onTagSelect?: (tag: ProfileTag) => void;
  selectedTags?: string[];
  compact?: boolean;
}

const PRESET_COLORS = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
  '#64748b', // slate
  '#0ea5e9', // sky
];

const TagManager = ({ onTagSelect, selectedTags = [], compact = false }: TagManagerProps) => {
  const { tags, createTag, updateTag, deleteTag } = useProfileTags();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState<string>(PRESET_COLORS[0]!);
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState<string>(PRESET_COLORS[0]!);

  const handleCreate = async () => {
    if (!newTagName.trim()) return;

    const tag = await createTag(newTagName.trim(), newTagColor);
    if (tag) {
      setNewTagName('');
      setNewTagColor(PRESET_COLORS[0]!);
      setIsCreating(false);
    }
  };

  const handleEdit = async (tagId: string) => {
    if (!editTagName.trim() || !tagId) return;

    const success = await updateTag(tagId, editTagName.trim(), editTagColor);
    if (success) {
      setEditingId(null);
      setEditTagName('');
      setEditTagColor(PRESET_COLORS[0]!);
    }
  };

  const startEdit = (tag: ProfileTag) => {
    setEditingId(tag.id);
    setEditTagName(tag.tag_name);
    setEditTagColor(tag.color);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTagName('');
    setEditTagColor(PRESET_COLORS[0]!);
  };

  if (compact) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Tag className="h-4 w-4" />
            Tags ({tags.length})
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gérer les tags</DialogTitle>
          </DialogHeader>
          <TagManagerContent
            tags={tags}
            isCreating={isCreating}
            setIsCreating={setIsCreating}
            newTagName={newTagName}
            setNewTagName={setNewTagName}
            newTagColor={newTagColor}
            setNewTagColor={setNewTagColor}
            handleCreate={handleCreate}
            editingId={editingId}
            editTagName={editTagName}
            setEditTagName={setEditTagName}
            editTagColor={editTagColor}
            setEditTagColor={setEditTagColor}
            handleEdit={handleEdit}
            startEdit={startEdit}
            cancelEdit={cancelEdit}
            deleteTag={deleteTag}
            onTagSelect={onTagSelect}
            selectedTags={selectedTags}
          />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Card className="p-4">
      <TagManagerContent
        tags={tags}
        isCreating={isCreating}
        setIsCreating={setIsCreating}
        newTagName={newTagName}
        setNewTagName={setNewTagName}
        newTagColor={newTagColor}
        setNewTagColor={setNewTagColor}
        handleCreate={handleCreate}
        editingId={editingId}
        editTagName={editTagName}
        setEditTagName={setEditTagName}
        editTagColor={editTagColor}
        setEditTagColor={setEditTagColor}
        handleEdit={handleEdit}
        startEdit={startEdit}
        cancelEdit={cancelEdit}
        deleteTag={deleteTag}
        onTagSelect={onTagSelect}
        selectedTags={selectedTags}
      />
    </Card>
  );
};

interface TagManagerContentProps {
  tags: ProfileTag[];
  isCreating: boolean;
  setIsCreating: (val: boolean) => void;
  newTagName: string;
  setNewTagName: (val: string) => void;
  newTagColor: string;
  setNewTagColor: (val: string) => void;
  handleCreate: () => void;
  editingId: string | null;
  editTagName: string;
  setEditTagName: (val: string) => void;
  editTagColor: string;
  setEditTagColor: (val: string) => void;
  handleEdit: (id: string) => void;
  startEdit: (tag: ProfileTag) => void;
  cancelEdit: () => void;
  deleteTag: (id: string) => Promise<boolean>;
  onTagSelect?: (tag: ProfileTag) => void;
  selectedTags: string[];
}

const TagManagerContent = ({
  tags,
  isCreating,
  setIsCreating,
  newTagName,
  setNewTagName,
  newTagColor,
  setNewTagColor,
  handleCreate,
  editingId,
  editTagName,
  setEditTagName,
  editTagColor,
  setEditTagColor,
  handleEdit,
  startEdit,
  cancelEdit,
  deleteTag,
  onTagSelect,
  selectedTags
}: TagManagerContentProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Mes tags</h3>
        {!isCreating && (
          <Button
            size="sm"
            onClick={() => setIsCreating(true)}
            className="gap-2 bg-emerald text-white hover:bg-emerald/90"
          >
            <Plus className="h-4 w-4" />
            Nouveau tag
          </Button>
        )}
      </div>

      {/* Create New Tag */}
      {isCreating && (
        <Card className="p-3 border-2 border-emerald/30 bg-emerald/5">
          <div className="space-y-3">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nom du tag (ex: À revoir)"
              maxLength={30}
              onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
            />
            <div className="space-y-2">
              <label className="text-sm font-medium">Couleur :</label>
              <div className="flex flex-wrap gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewTagColor(color)}
                    className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${
                      newTagColor === color ? 'ring-2 ring-offset-2 ring-emerald' : ''
                    }`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleCreate}
                disabled={!newTagName.trim()}
                className="flex-1 bg-emerald text-white hover:bg-emerald/90"
              >
                <Check className="h-4 w-4 mr-1" />
                Créer
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName('');
                  setNewTagColor(PRESET_COLORS[0]!);
                }}
              >
                <X className="h-4 w-4 mr-1" />
                Annuler
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Tags List */}
      <div className="space-y-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun tag créé. Créez votre premier tag pour commencer à organiser vos favoris et notes.
          </p>
        ) : (
          tags.map((tag) => (
            <div key={tag.id} className="flex items-center gap-2">
              {editingId === tag.id ? (
                <Card className="flex-1 p-2 border-2 border-gold/30">
                  <div className="space-y-2">
                    <Input
                      value={editTagName}
                      onChange={(e) => setEditTagName(e.target.value)}
                      maxLength={30}
                      onKeyPress={(e) => e.key === 'Enter' && handleEdit(tag.id)}
                    />
                    <div className="flex flex-wrap gap-2">
                      {PRESET_COLORS.map((color) => (
                        <button
                          key={color}
                          onClick={() => setEditTagColor(color)}
                          className={`w-6 h-6 rounded-full ${
                            editTagColor === color ? 'ring-2 ring-offset-1 ring-gold' : ''
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleEdit(tag.id)}
                        disabled={!editTagName.trim()}
                        className="flex-1 bg-gold text-white hover:bg-gold/90"
                      >
                        <Check className="h-3 w-3 mr-1" />
                        OK
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                <>
                  <Badge
                    className="flex-1 justify-start cursor-pointer hover:opacity-80 transition-opacity"
                    style={{ backgroundColor: tag.color, color: 'white' }}
                    onClick={() => onTagSelect && onTagSelect(tag)}
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag.tag_name}
                    {selectedTags.includes(tag.id) && (
                      <Check className="h-3 w-3 ml-auto" />
                    )}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEdit(tag)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteTag(tag.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TagManager;
