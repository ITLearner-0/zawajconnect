import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, User, History, Filter, ArrowRight, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HistoryEntry {
  id: string;
  subscription_id: string;
  action: string;
  performed_by: string | null;
  old_values: any;
  new_values: any;
  reason: string | null;
  created_at: string;
  admin_profile?: {
    full_name: string;
  };
  user_profile?: {
    full_name: string;
  };
}

const SubscriptionHistoryViewer = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Filters
  const [searchUser, setSearchUser] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateeTo] = useState('');

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [history, searchUser, actionFilter, dateFrom, dateTo]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) throw error;

      // Get user profiles and admin profiles for each entry
      const enrichedData = await Promise.all(
        (data || []).map(async (entry: any) => {
          const userId = entry.new_values?.user_id || entry.old_values?.user_id;
          let userProfile = null;
          let adminProfile = null;

          if (userId) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', userId)
              .maybeSingle();
            userProfile = profile;
          }

          if (entry.performed_by) {
            const { data: admin } = await supabase
              .from('profiles')
              .select('full_name')
              .eq('user_id', entry.performed_by)
              .maybeSingle();
            adminProfile = admin;
          }

          return {
            ...entry,
            user_profile: userProfile,
            admin_profile: adminProfile,
          };
        })
      );

      setHistory(enrichedData);
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
      toast.error("Impossible de charger l'historique");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...history];

    // Filter by user name
    if (searchUser) {
      filtered = filtered.filter((entry) =>
        entry.user_profile?.full_name?.toLowerCase().includes(searchUser.toLowerCase())
      );
    }

    // Filter by action
    if (actionFilter !== 'all') {
      filtered = filtered.filter((entry) => entry.action === actionFilter);
    }

    // Filter by date range
    if (dateFrom) {
      filtered = filtered.filter((entry) => new Date(entry.created_at) >= new Date(dateFrom));
    }
    if (dateTo) {
      filtered = filtered.filter(
        (entry) => new Date(entry.created_at) <= new Date(dateTo + 'T23:59:59')
      );
    }

    setFilteredHistory(filtered);
  };

  const getActionBadge = (action: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      granted: { color: 'bg-emerald-500', label: 'Accordé' },
      renewed: { color: 'bg-blue-500', label: 'Renouvelé' },
      suspended: { color: 'bg-orange-500', label: 'Suspendu' },
      activated: { color: 'bg-green-500', label: 'Activé' },
      cancelled: { color: 'bg-red-500', label: 'Annulé' },
      expired: { color: 'bg-gray-500', label: 'Expiré' },
      updated: { color: 'bg-purple-500', label: 'Modifié' },
    };

    const config = configs[action] || { color: 'bg-gray-500', label: action };
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const renderValueDiff = (oldVal: any, newVal: any, key: string) => {
    if (key === 'user_id' || key === 'id' || key === 'subscription_id') return null;

    const oldValue = oldVal?.[key];
    const newValue = newVal?.[key];

    if (oldValue === newValue) return null;

    const formatValue = (val: any) => {
      if (val === null || val === undefined) return 'N/A';
      if (typeof val === 'boolean') return val ? 'Oui' : 'Non';
      if (key === 'expires_at' || key === 'granted_at' || key === 'created_at') {
        return format(new Date(val), 'dd MMM yyyy à HH:mm', { locale: fr });
      }
      return String(val);
    };

    const getFieldLabel = (key: string) => {
      const labels: Record<string, string> = {
        plan_type: "Type d'abonnement",
        status: 'Statut',
        expires_at: "Date d'expiration",
        notes: 'Notes',
        granted_by: 'Accordé par',
        granted_at: "Date d'attribution",
      };
      return labels[key] || key;
    };

    return (
      <div key={key} className="flex items-center gap-2 text-sm py-2 border-b last:border-b-0">
        <div className="font-medium min-w-[140px] text-muted-foreground">{getFieldLabel(key)}</div>
        <div className="flex items-center gap-2 flex-1">
          <div className="px-3 py-1 bg-red-50 dark:bg-red-950 rounded text-red-700 dark:text-red-300 flex-1">
            {formatValue(oldValue)}
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <div className="px-3 py-1 bg-green-50 dark:bg-green-950 rounded text-green-700 dark:text-green-300 flex-1">
            {formatValue(newValue)}
          </div>
        </div>
      </div>
    );
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Date', 'Action', 'Utilisateur', 'Administrateur', 'Ancien Plan', 'Nouveau Plan', 'Raison'],
      ...filteredHistory.map((entry) => [
        format(new Date(entry.created_at), 'dd/MM/yyyy HH:mm'),
        entry.action,
        entry.user_profile?.full_name || 'N/A',
        entry.admin_profile?.full_name || 'Système',
        entry.old_values?.plan_type || 'N/A',
        entry.new_values?.plan_type || 'N/A',
        entry.reason || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historique-abonnements-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    toast.success('Export CSV téléchargé');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold flex items-center gap-2">
            <History className="h-6 w-6" />
            Historique des Modifications
          </h3>
          <p className="text-muted-foreground">
            {filteredHistory.length} modification{filteredHistory.length > 1 ? 's' : ''} trouvée
            {filteredHistory.length > 1 ? 's' : ''}
          </p>
        </div>
        <Button onClick={exportToCSV} variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Exporter CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="searchUser">Utilisateur</Label>
              <Input
                id="searchUser"
                placeholder="Nom d'utilisateur..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="actionFilter">Type d'action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="granted">Accordé</SelectItem>
                  <SelectItem value="renewed">Renouvelé</SelectItem>
                  <SelectItem value="suspended">Suspendu</SelectItem>
                  <SelectItem value="activated">Activé</SelectItem>
                  <SelectItem value="cancelled">Annulé</SelectItem>
                  <SelectItem value="expired">Expiré</SelectItem>
                  <SelectItem value="updated">Modifié</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="dateFrom">Date début</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="dateTo">Date fin</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateTo}
                onChange={(e) => setDateeTo(e.target.value)}
              />
            </div>
          </div>

          {(searchUser || actionFilter !== 'all' || dateFrom || dateTo) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchUser('');
                setActionFilter('all');
                setDateFrom('');
                setDateeTo('');
              }}
              className="mt-4"
            >
              Réinitialiser les filtres
            </Button>
          )}
        </CardContent>
      </Card>

      {/* History List */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement de l'historique...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune modification trouvée</p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y">
                {filteredHistory.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-4 hover:bg-accent/50 cursor-pointer transition-colors"
                    onClick={() => {
                      setSelectedEntry(entry);
                      setDetailsOpen(true);
                    }}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          {getActionBadge(entry.action)}
                          <span className="font-medium">
                            {entry.user_profile?.full_name || 'Utilisateur inconnu'}
                          </span>
                          <span className="text-muted-foreground text-sm">
                            • {entry.new_values?.plan_type || 'N/A'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(entry.created_at), 'dd MMM yyyy à HH:mm', {
                              locale: fr,
                            })}
                          </div>
                          {entry.admin_profile && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Par {entry.admin_profile.full_name}
                            </div>
                          )}
                        </div>

                        {entry.reason && (
                          <p className="text-sm text-muted-foreground italic">"{entry.reason}"</p>
                        )}
                      </div>

                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Détails de la Modification
              {selectedEntry && getActionBadge(selectedEntry.action)}
            </DialogTitle>
          </DialogHeader>

          {selectedEntry && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Utilisateur</div>
                  <div className="text-lg font-semibold">
                    {selectedEntry.user_profile?.full_name || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Date</div>
                  <div className="text-lg font-semibold">
                    {format(new Date(selectedEntry.created_at), 'dd MMMM yyyy à HH:mm', {
                      locale: fr,
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Administrateur</div>
                  <div className="text-lg font-semibold">
                    {selectedEntry.admin_profile?.full_name || 'Système'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Action</div>
                  <div className="text-lg font-semibold">{selectedEntry.action}</div>
                </div>
              </div>

              {selectedEntry.reason && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Raison / Notes
                  </div>
                  <div className="text-blue-800 dark:text-blue-200">{selectedEntry.reason}</div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-3">Modifications apportées</h4>
                <div className="border rounded-lg divide-y">
                  {selectedEntry.old_values && selectedEntry.new_values ? (
                    Object.keys(selectedEntry.new_values).map((key) =>
                      renderValueDiff(selectedEntry.old_values, selectedEntry.new_values, key)
                    )
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      Aucune modification détaillée disponible
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionHistoryViewer;
