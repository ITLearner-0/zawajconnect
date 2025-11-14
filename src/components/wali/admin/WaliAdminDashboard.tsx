import { useState } from 'react';
import { useWaliRegistrations } from '@/hooks/wali/useWaliRegistrations';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RegistrationList } from './RegistrationList';
import { RegistrationDetailModal } from './RegistrationDetailModal';
import { SuspensionManagementPanel } from '../suspension/SuspensionManagementPanel';
import { OnboardingProgressTracker } from '../onboarding/OnboardingProgressTracker';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { Shield, AlertTriangle, TrendingUp, Users, Search } from 'lucide-react';

export const WaliAdminDashboard = () => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'verified' | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegistration, setSelectedRegistration] = useState<WaliRegistration | null>(null);
  const [selectedWaliId, setSelectedWaliId] = useState<string>('');

  const {
    registrations,
    loading,
    error,
    approveRegistration,
    rejectRegistration,
    updateVerificationNotes,
  } = useWaliRegistrations({ status: statusFilter });

  const filteredRegistrations = registrations.filter((reg) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      reg.full_name.toLowerCase().includes(query) ||
      reg.email.toLowerCase().includes(query) ||
      reg.phone?.toLowerCase().includes(query)
    );
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    rejected: registrations.filter((r) => r.status === 'rejected').length,
    verified: registrations.filter((r) => r.status === 'verified').length,
  };

  const handleApprove = async (id: string, reviewedBy: string): Promise<boolean> => {
    try {
      await approveRegistration(id, reviewedBy);
      setSelectedRegistration(null);
      return true;
    } catch (error) {
      console.error('Error approving registration:', error);
      return false;
    }
  };

  const handleReject = async (id: string, reviewedBy: string, reason: string): Promise<boolean> => {
    try {
      await rejectRegistration(id, reviewedBy, reason);
      setSelectedRegistration(null);
      return true;
    } catch (error) {
      console.error('Error rejecting registration:', error);
      return false;
    }
  };

  const handleUpdateNotes = async (id: string, notes: string): Promise<boolean> => {
    try {
      await updateVerificationNotes(id, notes);
      return true;
    } catch (error) {
      console.error('Error updating notes:', error);
      return false;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Chargement du tableau de bord...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Shield className="h-8 w-8" />
          Administration Wali
        </h1>
        <p className="text-muted-foreground mt-1">
          Gérez les inscriptions, suspensions et progression des Walis
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              En attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Approuvées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vérifiées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Rejetées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="registrations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="registrations" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Inscriptions
          </TabsTrigger>
          <TabsTrigger value="suspensions" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Suspensions
          </TabsTrigger>
          <TabsTrigger value="onboarding" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Progression
          </TabsTrigger>
        </TabsList>

        {/* Registrations Tab */}
        <TabsContent value="registrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inscriptions Wali</CardTitle>
              <CardDescription>
                Gérez et validez les demandes d'inscription des Walis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, email ou téléphone..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select
                  value={statusFilter || 'all'}
                  onValueChange={(value) =>
                    setStatusFilter(value === 'all' ? undefined : (value as any))
                  }
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="pending">En attente</SelectItem>
                    <SelectItem value="approved">Approuvées</SelectItem>
                    <SelectItem value="verified">Vérifiées</SelectItem>
                    <SelectItem value="rejected">Rejetées</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <RegistrationList
                registrations={filteredRegistrations}
                onViewDetails={setSelectedRegistration}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Suspensions Tab */}
        <TabsContent value="suspensions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un Wali</CardTitle>
              <CardDescription>
                Choisissez un Wali pour gérer ses suspensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedWaliId} onValueChange={setSelectedWaliId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un Wali..." />
                </SelectTrigger>
                <SelectContent>
                  {registrations
                    .filter((r) => r.status === 'verified' || r.status === 'approved')
                    .map((reg) => (
                      <SelectItem key={reg.id} value={reg.wali_profile_id || reg.id}>
                        {reg.full_name} ({reg.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedWaliId && <SuspensionManagementPanel waliId={selectedWaliId} />}

          {!selectedWaliId && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Sélectionnez un Wali pour gérer ses suspensions
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Onboarding Tab */}
        <TabsContent value="onboarding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sélectionner un Wali</CardTitle>
              <CardDescription>
                Choisissez un Wali pour suivre sa progression d'intégration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedWaliId} onValueChange={setSelectedWaliId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un Wali..." />
                </SelectTrigger>
                <SelectContent>
                  {registrations
                    .filter((r) => r.status === 'approved' || r.status === 'verified')
                    .map((reg) => (
                      <SelectItem key={reg.id} value={reg.wali_profile_id || reg.id}>
                        {reg.full_name} ({reg.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedWaliId && user?.id && (
            <OnboardingProgressTracker waliId={selectedWaliId} userId={user.id} />
          )}

          {!selectedWaliId && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                Sélectionnez un Wali pour suivre sa progression
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Registration Detail Modal */}
      {selectedRegistration && (
        <RegistrationDetailModal
          registration={selectedRegistration}
          open={!!selectedRegistration}
          onOpenChange={(open) => !open && setSelectedRegistration(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onUpdateNotes={handleUpdateNotes}
        />
      )}
    </div>
  );
};
