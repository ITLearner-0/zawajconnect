import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWaliEmailHistory, WaliEmailStats } from '@/hooks/useWaliEmailHistory';
import { Mail, Table as TableIcon } from 'lucide-react';
import WaliEmailHistoryTable from './WaliEmailHistoryTable';

interface WaliEmailHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  waliUserId: string;
  waliName: string;
}

export const WaliEmailHistoryDialog = ({
  open,
  onOpenChange,
  waliUserId,
  waliName
}: WaliEmailHistoryDialogProps) => {
  const { getEmailHistory, getEmailStats, loading } = useWaliEmailHistory();
  const [history, setHistory] = useState<any[]>([]);
  const [stats, setStats] = useState<WaliEmailStats | null>(null);

  useEffect(() => {
    if (open && waliUserId) {
      loadData();
    }
  }, [open, waliUserId]);

  const loadData = async () => {
    const [historyData, statsData] = await Promise.all([
      getEmailHistory(waliUserId),
      getEmailStats(waliUserId)
    ]);
    setHistory(historyData);
    setStats(statsData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Historique des emails - {waliName}
          </DialogTitle>
          <DialogDescription>
            Historique complet des communications par email avec suivi de livraison
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            {stats && (
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Total</div>
                  <div className="text-2xl font-bold">{stats.total_emails}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Envoyés</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.sent_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Délivrés</div>
                  <div className="text-2xl font-bold text-green-600">{stats.delivered_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Échecs</div>
                  <div className="text-2xl font-bold text-red-600">{stats.failed_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Ouverts</div>
                  <div className="text-2xl font-bold text-purple-600">{stats.opened_count}</div>
                </Card>
                <Card className="p-3">
                  <div className="text-xs text-muted-foreground mb-1">Cliqués</div>
                  <div className="text-2xl font-bold text-orange-600">{stats.clicked_count}</div>
                </Card>
              </div>
            )}

            <WaliEmailHistoryTable emails={history} loading={loading} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
