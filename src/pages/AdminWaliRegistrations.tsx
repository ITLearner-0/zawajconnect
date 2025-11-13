import { useState } from 'react';
import { useWaliRegistrations } from '@/hooks/wali/useWaliRegistrations';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RegistrationList } from '@/components/wali/admin/RegistrationList';
import { RegistrationDetailModal } from '@/components/wali/admin/RegistrationDetailModal';
import { Loader2, Shield, CheckCircle2, XCircle, Clock, Eye } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminWaliRegistrations = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [selectedRegistration, setSelectedRegistration] = useState<WaliRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    registrations,
    loading,
    error,
    refetch,
    approveRegistration,
    rejectRegistration,
    updateVerificationNotes,
  } = useWaliRegistrations({
    status: selectedTab === 'all' ? undefined : selectedTab === 'pending' ? 'pending' : selectedTab === 'approved' ? 'approved' : 'rejected',
  });

  const handleViewDetails = (registration: WaliRegistration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    refetch();
  };

  const pendingCount = registrations.filter((r) => r.status === 'pending').length;
  const approvedCount = registrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = registrations.filter((r) => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto py-8 px-4">
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gestion des Inscriptions Wali</h1>
        </div>
        <p className="text-muted-foreground">
          Approuvez ou rejetez les demandes d'inscription en tant que Wali après vérification des documents
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{registrations.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-muted-foreground">
              <Eye className="mr-1 h-3 w-3" />
              Toutes inscriptions
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>En attente</CardDescription>
            <CardTitle className="text-2xl">{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-yellow-600">
              <Clock className="mr-1 h-3 w-3" />
              À traiter
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Approuvées</CardDescription>
            <CardTitle className="text-2xl">{approvedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-success">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Validées
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rejetées</CardDescription>
            <CardTitle className="text-2xl">{rejectedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs text-destructive">
              <XCircle className="mr-1 h-3 w-3" />
              Refusées
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des inscriptions</CardTitle>
          <CardDescription>
            Cliquez sur "Voir" pour examiner les détails et documents de chaque candidat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Toutes</TabsTrigger>
              <TabsTrigger value="pending" className="relative">
                En attente
                {pendingCount > 0 && (
                  <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approuvées</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <RegistrationList
                registrations={registrations}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <RegistrationList
                registrations={registrations.filter((r) => r.status === 'pending')}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <RegistrationList
                registrations={registrations.filter((r) => r.status === 'approved')}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <RegistrationList
                registrations={registrations.filter((r) => r.status === 'rejected')}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <RegistrationDetailModal
        registration={selectedRegistration}
        open={isModalOpen}
        onOpenChange={handleModalClose}
        onApprove={approveRegistration}
        onReject={rejectRegistration}
        onUpdateNotes={updateVerificationNotes}
      />
    </div>
  );
};

export default AdminWaliRegistrations;
