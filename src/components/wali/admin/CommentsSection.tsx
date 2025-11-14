import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Plus, Edit2, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { WaliComment } from '@/hooks/wali/useWaliRegistrationComments';
import type { WaliPermissionCheck } from '@/hooks/wali/useWaliAdminPermissions';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CommentsSectionProps {
  comments: WaliComment[];
  currentAdminId: string;
  permissions: WaliPermissionCheck;
  onAddComment: (text: string, isInternal: boolean) => Promise<boolean>;
  onUpdateComment: (id: string, text: string) => Promise<boolean>;
  onDeleteComment: (id: string) => Promise<boolean>;
}

export const CommentsSection = ({
  comments,
  currentAdminId,
  permissions,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentsSectionProps) => {
  const [newComment, setNewComment] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdd = async () => {
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    const success = await onAddComment(newComment, true);
    setIsSubmitting(false);

    if (success) {
      setNewComment('');
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editText.trim()) return;

    setIsSubmitting(true);
    const success = await onUpdateComment(id, editText);
    setIsSubmitting(false);

    if (success) {
      setEditingId(null);
      setEditText('');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsSubmitting(true);
    const success = await onDeleteComment(deleteId);
    setIsSubmitting(false);

    if (success) {
      setDeleteId(null);
    }
  };

  const startEdit = (comment: WaliComment) => {
    setEditingId(comment.id);
    setEditText(comment.comment_text);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Commentaires ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add new comment */}
        {permissions.canEdit && (
          <div className="space-y-2">
            <Textarea
              placeholder="Ajouter un commentaire interne..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <Button
              onClick={handleAdd}
              disabled={!newComment.trim() || isSubmitting}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un commentaire
            </Button>
          </div>
        )}

        {/* Comments list */}
        <div className="space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Aucun commentaire pour le moment
            </p>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="border rounded-lg p-3 space-y-2 bg-muted/50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {comment.admin_name}
                      </span>
                      {comment.is_internal && (
                        <Badge variant="secondary" className="text-xs">
                          Interne
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    </div>

                    {editingId === comment.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdate(comment.id)}
                            disabled={isSubmitting}
                          >
                            Enregistrer
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditText('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {comment.comment_text}
                      </p>
                    )}
                  </div>

                  {comment.admin_id === currentAdminId &&
                    permissions.canEdit &&
                    editingId !== comment.id && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => startEdit(comment)}
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setDeleteId(comment.id)}
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </Button>
                      </div>
                    )}
                </div>
              </div>
            ))
          )}
        </div>

        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Supprimer le commentaire ?</AlertDialogTitle>
              <AlertDialogDescription>
                Cette action est irréversible. Le commentaire sera définitivement
                supprimé.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground"
              >
                Supprimer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};
