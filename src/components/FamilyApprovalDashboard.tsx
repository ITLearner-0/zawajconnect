import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';
import { useFamilyApproval } from '@/hooks/useFamilyApproval';
import FamilyNotificationCard from '@/components/family-approval/FamilyNotificationCard';

const FamilyApprovalDashboard = () => {
  const { user } = useAuth();
  const { notifications, loading, processingIds, loadNotifications, handleApprovalDecision } = useFamilyApproval();

  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
    }
  }, [user]);

  const handleApprove = async (notificationId: string, matchId: string, notes?: string) => {
    if (user) {
      await handleApprovalDecision(user.id, notificationId, matchId, 'approved', notes);
    }
  };

  const handleReject = async (notificationId: string, matchId: string, notes?: string) => {
    if (user) {
      await handleApprovalDecision(user.id, notificationId, matchId, 'rejected', notes);
    }
  };

  const handleRequestDiscussion = async (notificationId: string, matchId: string, notes?: string) => {
    if (user) {
      await handleApprovalDecision(user.id, notificationId, matchId, 'needs_discussion', notes);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Demandes d'Approbation Familiale
          </CardTitle>
        </CardHeader>
      </Card>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">Aucune demande en attente</h3>
            <p className="text-muted-foreground">
              Vous serez notifié lorsque votre famille aura besoin de votre approbation pour un match
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <FamilyNotificationCard
              key={notification.id}
              notification={notification}
              onApprove={handleApprove}
              onReject={handleReject}
              onRequestDiscussion={handleRequestDiscussion}
              isProcessing={processingIds.has(notification.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FamilyApprovalDashboard;