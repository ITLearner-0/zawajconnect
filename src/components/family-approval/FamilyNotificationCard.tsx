import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, MessageSquare, AlertCircle, Heart } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface FamilyNotificationCardProps {
  notification: {
    id: string;
    match_id: string;
    notification_type: string;
    content: string;
    severity: string;
    action_required: boolean;
    is_read: boolean;
    created_at: string;
    match?: {
      id: string;
      user1_id: string;
      user2_id: string;
      match_score: number;
      user1_profile?: {
        full_name: string;
        age: number;
        location: string;
        profession: string;
        avatar_url: string;
      } | null;
      user2_profile?: {
        full_name: string;
        age: number;
        location: string;
        profession: string;
        avatar_url: string;
      } | null;
    } | null;
  };
  onApprove: (notificationId: string, matchId: string, notes?: string) => Promise<void>;
  onReject: (notificationId: string, matchId: string, notes?: string) => Promise<void>;
  onRequestDiscussion: (notificationId: string, matchId: string, notes?: string) => Promise<void>;
  isProcessing: boolean;
}

const FamilyNotificationCard: React.FC<FamilyNotificationCardProps> = ({
  notification,
  onApprove,
  onReject,
  onRequestDiscussion,
  isProcessing,
}) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-l-destructive bg-destructive/5';
      case 'high':
        return 'border-l-warning bg-warning/5';
      case 'medium':
        return 'border-l-warning bg-warning/5';
      default:
        return 'border-l-primary bg-primary/5';
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'dd MMM yyyy à HH:mm', { locale: fr });
  };

  const handleAction = async (action: 'approve' | 'reject' | 'discuss') => {
    const notes = (document.getElementById(`notes-${notification.id}`) as HTMLTextAreaElement)
      ?.value;

    switch (action) {
      case 'approve':
        await onApprove(notification.id, notification.match_id, notes);
        break;
      case 'reject':
        await onReject(notification.id, notification.match_id, notes);
        break;
      case 'discuss':
        await onRequestDiscussion(notification.id, notification.match_id, notes);
        break;
    }
  };

  return (
    <Card className={`border-l-4 ${getSeverityColor(notification.severity)}`}>
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-warning" />
              <span className="font-semibold">
                {notification.notification_type === 'approval_request'
                  ? "Demande d'approbation"
                  : 'Notification famille'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={notification.is_read ? 'secondary' : 'default'}>
                {notification.is_read ? 'Lu' : 'Non lu'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {formatDate(notification.created_at)}
              </span>
            </div>
          </div>

          {/* Match Profiles */}
          {notification.match && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background rounded-lg border">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={notification.match.user1_profile?.avatar_url} />
                  <AvatarFallback>
                    {notification.match.user1_profile?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{notification.match.user1_profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {notification.match.user1_profile?.age} ans •{' '}
                    {notification.match.user1_profile?.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.match.user1_profile?.profession}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={notification.match.user2_profile?.avatar_url} />
                  <AvatarFallback>
                    {notification.match.user2_profile?.full_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{notification.match.user2_profile?.full_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {notification.match.user2_profile?.age} ans •{' '}
                    {notification.match.user2_profile?.location}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {notification.match.user2_profile?.profession}
                  </p>
                </div>
              </div>

              {notification.match.match_score && (
                <div className="col-span-full">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Score de compatibilité: {notification.match.match_score}%
                    </span>
                  </div>
                  <Progress value={notification.match.match_score} className="h-2" />
                </div>
              )}
            </div>
          )}

          {/* Notification Content */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <p className="whitespace-pre-wrap text-sm">{notification.content}</p>
          </div>

          {/* Action Buttons */}
          {notification.action_required && !notification.is_read && (
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Notes additionnelles (optionnel)
                </label>
                <Textarea
                  id={`notes-${notification.id}`}
                  placeholder="Ajoutez vos commentaires ou questions..."
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="bg-success hover:bg-success/90"
                  disabled={isProcessing}
                  onClick={() => handleAction('approve')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approuver
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={isProcessing}
                  onClick={() => handleAction('reject')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Refuser
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isProcessing}
                  onClick={() => handleAction('discuss')}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Demander Discussion
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default FamilyNotificationCard;
