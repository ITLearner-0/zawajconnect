import React from 'react';
import {
  Mail,
  MailCheck,
  MailOpen,
  MousePointerClick,
  MailX,
  AlertCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { WaliEmailHistoryItem } from '@/hooks/useWaliEmailHistory';

interface WaliEmailHistoryTableProps {
  emails: WaliEmailHistoryItem[];
  loading?: boolean;
}

const emailTypeConfig: Record<
  string,
  { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary' }
> = {
  suspension: { label: 'Suspension', variant: 'destructive' },
  contact: { label: 'Contact', variant: 'default' },
  warning: { label: 'Avertissement', variant: 'outline' },
  notification: { label: 'Notification', variant: 'secondary' },
};

const deliveryStatusConfig: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  pending: {
    label: 'En attente',
    icon: Clock,
    className: 'text-muted-foreground',
  },
  sent: {
    label: 'Envoyé',
    icon: Mail,
    className: 'text-blue-500',
  },
  delivered: {
    label: 'Livré',
    icon: MailCheck,
    className: 'text-green-500',
  },
  opened: {
    label: 'Ouvert',
    icon: MailOpen,
    className: 'text-purple-500',
  },
  clicked: {
    label: 'Cliqué',
    icon: MousePointerClick,
    className: 'text-orange-500',
  },
  failed: {
    label: 'Échoué',
    icon: MailX,
    className: 'text-red-500',
  },
  bounced: {
    label: 'Rebondi',
    icon: AlertCircle,
    className: 'text-red-500',
  },
};

const WaliEmailHistoryTable: React.FC<WaliEmailHistoryTableProps> = ({
  emails,
  loading = false,
}) => {
  const getStatusInfo = (email: WaliEmailHistoryItem) => {
    // Priority: clicked > opened > delivered > sent > failed/bounced
    if (email.clicked_at) return deliveryStatusConfig.clicked;
    if (email.opened_at) return deliveryStatusConfig.opened;
    if (email.delivered_at) return deliveryStatusConfig.delivered;

    const status = email.delivery_status || 'pending';
    const statusKey = status as keyof typeof deliveryStatusConfig;
    return deliveryStatusConfig[statusKey] ?? deliveryStatusConfig.pending;
  };

  const getEventTimestamps = (email: WaliEmailHistoryItem) => {
    const events = [];

    if (email.sent_at) {
      events.push({
        label: 'Envoyé',
        time: email.sent_at,
        icon: Mail,
        className: 'text-blue-500',
      });
    }

    if (email.delivered_at) {
      events.push({
        label: 'Livré',
        time: email.delivered_at,
        icon: MailCheck,
        className: 'text-green-500',
      });
    }

    if (email.opened_at) {
      events.push({
        label: 'Ouvert',
        time: email.opened_at,
        icon: MailOpen,
        className: 'text-purple-500',
      });
    }

    if (email.clicked_at) {
      events.push({
        label: 'Cliqué',
        time: email.clicked_at,
        icon: MousePointerClick,
        className: 'text-orange-500',
      });
    }

    return events;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (emails.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center text-muted-foreground">
          <Mail className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="font-medium">Aucun email trouvé</p>
          <p className="text-sm mt-1">Essayez d'ajuster vos filtres de recherche</p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Sujet</TableHead>
            <TableHead>Expéditeur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Événements</TableHead>
            <TableHead>Date d'envoi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {emails.map((email) => {
            const statusInfo = getStatusInfo(email);
            const StatusIcon = statusInfo?.icon ?? Clock;
            const emailType = emailTypeConfig[email.email_type] || {
              label: email.email_type,
              variant: 'default' as const,
            };
            const events = getEventTimestamps(email);

            return (
              <TableRow key={email.id}>
                <TableCell>
                  <Badge variant={emailType.variant}>{emailType.label}</Badge>
                </TableCell>

                <TableCell className="max-w-xs">
                  <div className="truncate font-medium">{email.subject}</div>
                  {email.error_message && (
                    <div className="text-xs text-red-500 mt-1">{email.error_message}</div>
                  )}
                </TableCell>

                <TableCell>
                  <div className="text-sm">{email.sender_name}</div>
                </TableCell>

                <TableCell>
                  <div className="flex items-center gap-2">
                    <StatusIcon
                      className={`h-4 w-4 ${statusInfo?.className ?? 'text-muted-foreground'}`}
                    />
                    <span className="text-sm">{statusInfo?.label ?? 'En attente'}</span>
                  </div>
                </TableCell>

                <TableCell>
                  <div className="flex gap-2">
                    {events.map((event, index) => {
                      const EventIcon = event.icon;
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-1 text-xs"
                          title={`${event.label}: ${formatDistanceToNow(new Date(event.time), {
                            addSuffix: true,
                            locale: fr,
                          })}`}
                        >
                          <EventIcon className={`h-3 w-3 ${event.className}`} />
                        </div>
                      );
                    })}
                  </div>
                </TableCell>

                <TableCell className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(email.sent_at), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
};

export default WaliEmailHistoryTable;
