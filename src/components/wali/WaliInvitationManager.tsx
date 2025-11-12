import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { WaliInvitation } from '@/types/waliInvitation';
import { useWaliInvitations } from '@/hooks/wali/useWaliInvitations';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Clock, CheckCircle, XCircle, Send, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const WaliInvitationManager: React.FC = () => {
  const { user } = useAuth();
  const [newInvitationEmail, setNewInvitationEmail] = useState('');
  const [confirmationToken, setConfirmationToken] = useState('');
  const { invitations, loading, sendInvitation, confirmInvitation } = useWaliInvitations(user?.id);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInvitationEmail.trim()) return;

    const success = await sendInvitation(newInvitationEmail.trim());
    if (success) {
      setNewInvitationEmail('');
    }
  };

  const handleConfirmInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationToken.trim()) return;

    const success = await confirmInvitation(confirmationToken.trim());
    if (success) {
      setConfirmationToken('');
    }
  };

  const getStatusBadge = (invitation: WaliInvitation) => {
    const isExpired = new Date(invitation.expires_at) < new Date();

    if (isExpired && invitation.status === 'pending') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Expirée
        </Badge>
      );
    }

    switch (invitation.status) {
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'confirmed':
        return (
          <Badge variant="default">
            <CheckCircle className="h-3 w-3 mr-1" />
            Confirmée
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejetée
          </Badge>
        );
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  // Separate sent and received invitations
  const sentInvitations = invitations.filter(
    (inv) => inv.wali_profile_id && user?.id // Invitations sent by this wali
  );

  const receivedInvitations = invitations.filter(
    (inv) => inv.managed_user_id === user?.id // Invitations received by this user
  );

  return (
    <div className="space-y-6">
      {/* Send Invitation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Envoyer une Invitation Wali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email de l'utilisateur à superviser</Label>
              <Input
                id="email"
                type="email"
                value={newInvitationEmail}
                onChange={(e) => setNewInvitationEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                L'utilisateur recevra un email avec un lien de confirmation
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer l'Invitation
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Confirm Invitation Form (for users receiving invitations) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Confirmer une Invitation Wali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleConfirmInvitation} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Code de confirmation</Label>
              <Input
                id="token"
                value={confirmationToken}
                onChange={(e) => setConfirmationToken(e.target.value)}
                placeholder="Entrez le code reçu par email"
                required
              />
              <p className="text-sm text-muted-foreground">
                Entrez le code de confirmation reçu dans l'email d'invitation
              </p>
            </div>
            <Button type="submit" disabled={loading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Confirmer l'Invitation
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Sent Invitations */}
      {sentInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations Envoyées ({sentInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sentInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{invitation.email}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Envoyée{' '}
                      {formatDistanceToNow(new Date(invitation.sent_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expire{' '}
                      {formatDistanceToNow(new Date(invitation.expires_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(invitation)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Received Invitations */}
      {receivedInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitations Reçues ({receivedInvitations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {receivedInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="space-y-1">
                    <p className="font-medium">Invitation pour être supervisé(e)</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Reçue{' '}
                      {formatDistanceToNow(new Date(invitation.sent_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      Expire{' '}
                      {formatDistanceToNow(new Date(invitation.expires_at), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(invitation)}
                    {invitation.status === 'pending' &&
                      new Date(invitation.expires_at) > new Date() && (
                        <Button
                          size="sm"
                          onClick={() => confirmInvitation(invitation.invitation_token)}
                        >
                          Confirmer
                        </Button>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {invitations.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <Mail className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucune invitation pour le moment</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WaliInvitationManager;
