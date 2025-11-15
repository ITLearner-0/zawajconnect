import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle, Ban, Mail, FileText } from 'lucide-react';

interface WaliAlertQuickActionsProps {
  alertId: string;
  waliUserId: string;
  acknowledged: boolean;
  onAcknowledge: (alertId: string) => void;
  onSuspend: (alertId: string, waliUserId: string) => void;
  onContact: (alertId: string) => void;
  onGenerateReport: (alertId: string) => void;
}

const WaliAlertQuickActions: React.FC<WaliAlertQuickActionsProps> = ({
  alertId,
  waliUserId,
  acknowledged,
  onAcknowledge,
  onSuspend,
  onContact,
  onGenerateReport,
}) => {
  if (acknowledged) {
    return (
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onGenerateReport(alertId)}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          Rapport
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Button size="sm" variant="default" onClick={() => onAcknowledge(alertId)} className="gap-2">
        <CheckCircle className="h-4 w-4" />
        Traiter
      </Button>
      <Button
        size="sm"
        variant="destructive"
        onClick={() => onSuspend(alertId, waliUserId)}
        className="gap-2"
      >
        <Ban className="h-4 w-4" />
        Suspendre
      </Button>
      <Button size="sm" variant="outline" onClick={() => onContact(alertId)} className="gap-2">
        <Mail className="h-4 w-4" />
        Contacter
      </Button>
      <Button size="sm" variant="ghost" onClick={() => onGenerateReport(alertId)} className="gap-2">
        <FileText className="h-4 w-4" />
        Rapport
      </Button>
    </div>
  );
};

export default WaliAlertQuickActions;
