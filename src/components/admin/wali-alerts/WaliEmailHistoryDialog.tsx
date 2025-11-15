import React, { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useWaliEmailHistory, WaliEmailStats, WaliEmailHistoryItem } from '@/hooks/useWaliEmailHistory';
import { Mail, Table as TableIcon } from 'lucide-react';
import WaliEmailHistoryTable from './WaliEmailHistoryTable';
import WaliEmailHistoryFilters, { EmailFilters } from './WaliEmailHistoryFilters';

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
  const [history, setHistory] = useState<WaliEmailHistoryItem[]>([]);
  const [stats, setStats] = useState<WaliEmailStats | null>(null);
  const [filters, setFilters] = useState<EmailFilters>({
    search: '',
    status: 'all',
    emailType: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

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

  const handleResetFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      emailType: 'all',
      sortBy: 'date',
      sortOrder: 'desc'
    });
  };

  // Get effective status for an email (priority: clicked > opened > delivered > sent)
  const getEffectiveStatus = (email: WaliEmailHistoryItem): string => {
    if (email.clicked_at) return 'clicked';
    if (email.opened_at) return 'opened';
    if (email.delivered_at) return 'delivered';
    return email.delivery_status || 'pending';
  };

  // Filter and sort emails
  const filteredEmails = useMemo(() => {
    let filtered = [...history];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(searchLower) ||
        email.message_content.toLowerCase().includes(searchLower) ||
        email.sender_name.toLowerCase().includes(searchLower)
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(email => {
        const effectiveStatus = getEffectiveStatus(email);
        return effectiveStatus === filters.status;
      });
    }

    // Email type filter
    if (filters.emailType !== 'all') {
      filtered = filtered.filter(email => email.email_type === filters.emailType);
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(email => 
        new Date(email.sent_at) >= filters.dateFrom!
      );
    }
    if (filters.dateTo) {
      const endOfDay = new Date(filters.dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(email => 
        new Date(email.sent_at) <= endOfDay
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;

      switch (filters.sortBy) {
        case 'date':
          comparison = new Date(a.sent_at).getTime() - new Date(b.sent_at).getTime();
          break;
        case 'status':
          comparison = getEffectiveStatus(a).localeCompare(getEffectiveStatus(b));
          break;
        case 'type':
          comparison = a.email_type.localeCompare(b.email_type);
          break;
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [history, filters]);

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

            <WaliEmailHistoryFilters
              filters={filters}
              onFiltersChange={setFilters}
              onReset={handleResetFilters}
            />

            <div className="mt-4 mb-2 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {filteredEmails.length === history.length ? (
                  <span>{filteredEmails.length} email{filteredEmails.length > 1 ? 's' : ''}</span>
                ) : (
                  <span>
                    {filteredEmails.length} résultat{filteredEmails.length > 1 ? 's' : ''} sur {history.length} email{history.length > 1 ? 's' : ''}
                  </span>
                )}
              </p>
            </div>

            <WaliEmailHistoryTable emails={filteredEmails} loading={loading} />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
