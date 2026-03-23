import { useState, useMemo } from 'react';
import { useWaliRegistrations } from '@/hooks/wali/useWaliRegistrations';
import { useWaliAdminPermissions } from '@/hooks/wali/useWaliAdminPermissions';
import { useWaliFilters, WaliFilterValues } from '@/hooks/wali/useWaliFilters';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { RegistrationList } from '@/components/wali/admin/RegistrationList';
import { RegistrationDetailModal } from '@/components/wali/admin/RegistrationDetailModal';
import { ExportMenu } from '@/components/wali/admin/ExportMenu';
import { PermissionBadge } from '@/components/wali/permissions';
import { AdvancedFilters, SavedFiltersList } from '@/components/wali/filters';
import { WaliAdminTabs } from '@/components/wali/navigation';
import {
  Loader2,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  RefreshCw,
  Filter,
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { exportWaliRegistrationsToExcel, exportWaliRegistrationsToCSV } from '@/utils/waliExport';

const AdminWaliRegistrations = () => {
  const [selectedTab, setSelectedTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'pending'
  );
  const [selectedRegistration, setSelectedRegistration] = useState<WaliRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<WaliFilterValues>({ status: 'pending' });
  const { permissions } = useWaliAdminPermissions();
  const { savedFilters, saveFilter, deleteFilter, setDefaultFilter } = useWaliFilters();

  const {
    registrations: allRegistrations,
    loading,
    error,
    refetch,
    approveRegistration,
    rejectRegistration,
    updateVerificationNotes,
  } = useWaliRegistrations();

  // Filter registrations based on active filters
  const filteredRegistrations = useMemo(() => {
    let filtered = allRegistrations;

    // Tab filter
    if (selectedTab !== 'all') {
      filtered = filtered.filter((r) => r.status === selectedTab);
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter((r) => r.status === filters.status);
    }

    // Search filter (searches in name, email, phone)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.full_name.toLowerCase().includes(searchLower) ||
          r.email.toLowerCase().includes(searchLower) ||
          r.phone?.toLowerCase().includes(searchLower)
      );
    }

    // Relationship filter - skip if property doesn't exist
    if (filters.relationship && filters.relationship !== 'all') {
      filtered = filtered.filter((r: any) => r.relationship === filters.relationship);
    }

    // Email filter
    if (filters.email) {
      filtered = filtered.filter((r) =>
        r.email.toLowerCase().includes(filters.email!.toLowerCase())
      );
    }

    // Phone filter
    if (filters.phone) {
      filtered = filtered.filter((r) =>
        r.phone?.toLowerCase().includes(filters.phone!.toLowerCase())
      );
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter((r) => new Date(r.created_at) >= new Date(filters.dateFrom!));
    }

    if (filters.dateTo) {
      const dateTo = new Date(filters.dateTo);
      dateTo.setHours(23, 59, 59, 999);
      filtered = filtered.filter((r) => new Date(r.created_at) <= dateTo);
    }

    return filtered;
  }, [allRegistrations, selectedTab, filters]);

  const handleLoadFilter = (savedFilter: any) => {
    setFilters(savedFilter.filters);
    if (savedFilter.filters.status && savedFilter.filters.status !== 'all') {
      setSelectedTab(savedFilter.filters.status);
    }
  };

  const handleSaveFilter = (name: string) => {
    saveFilter(name, filters);
  };

  const handleResetFilters = () => {
    setFilters({ status: selectedTab === 'all' ? undefined : selectedTab });
  };

  const handleViewDetails = (registration: WaliRegistration) => {
    setSelectedRegistration(registration);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRegistration(null);
    refetch();
  };

  const pendingCount = allRegistrations.filter((r) => r.status === 'pending').length;
  const approvedCount = allRegistrations.filter((r) => r.status === 'approved').length;
  const rejectedCount = allRegistrations.filter((r) => r.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'var(--color-bg-page)' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'var(--color-primary)' }} />
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
    <div className="container max-w-7xl mx-auto py-8 px-4" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8" style={{ color: 'var(--color-primary)' }} />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Gestion des Inscriptions Wali</h1>
                <PermissionBadge role={permissions.role} />
              </div>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Approuvez ou rejetez les demandes d'inscription en tant que Wali après vérification
                des documents
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={showFilters ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </Button>
            <ExportMenu
              onExportExcel={() => exportWaliRegistrationsToExcel(filteredRegistrations)}
              onExportCSV={() => exportWaliRegistrationsToCSV(filteredRegistrations)}
              label="Exporter"
            />
            <Button onClick={refetch} disabled={loading} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <WaliAdminTabs />
      </div>

      {/* Filters Section */}
      {showFilters && (
        <div className="grid gap-4 mb-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <AdvancedFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSaveFilter={handleSaveFilter}
              onReset={handleResetFilters}
            />
          </div>
          <div>
            <SavedFiltersList
              filters={savedFilters}
              onLoadFilter={handleLoadFilter}
              onDeleteFilter={deleteFilter}
              onSetDefault={setDefaultFilter}
            />
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader className="pb-2">
            <CardDescription style={{ color: 'var(--color-text-muted)' }}>Total</CardDescription>
            <CardTitle className="text-2xl" style={{ color: 'var(--color-text-primary)' }}>{filteredRegistrations.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs" style={{ color: 'var(--color-text-muted)' }}>
              <Eye className="mr-1 h-3 w-3" />
              Toutes inscriptions
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader className="pb-2">
            <CardDescription style={{ color: 'var(--color-text-muted)' }}>En attente</CardDescription>
            <CardTitle className="text-2xl" style={{ color: 'var(--color-text-primary)' }}>{pendingCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs" style={{ color: 'var(--color-warning)' }}>
              <Clock className="mr-1 h-3 w-3" />À traiter
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader className="pb-2">
            <CardDescription style={{ color: 'var(--color-text-muted)' }}>Approuvées</CardDescription>
            <CardTitle className="text-2xl" style={{ color: 'var(--color-text-primary)' }}>{approvedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs" style={{ color: 'var(--color-success)' }}>
              <CheckCircle2 className="mr-1 h-3 w-3" />
              Validées
            </div>
          </CardContent>
        </Card>

        <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
          <CardHeader className="pb-2">
            <CardDescription style={{ color: 'var(--color-text-muted)' }}>Rejetées</CardDescription>
            <CardTitle className="text-2xl" style={{ color: 'var(--color-text-primary)' }}>{rejectedCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center text-xs" style={{ color: 'var(--color-danger)' }}>
              <XCircle className="mr-1 h-3 w-3" />
              Refusées
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for filtering */}
      <Card style={{ backgroundColor: 'var(--color-bg-card)', border: '1px solid var(--color-border-default)', borderRadius: 'var(--radius-lg)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--color-text-primary)' }}>Liste des inscriptions</CardTitle>
          <CardDescription style={{ color: 'var(--color-text-muted)' }}>
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
                  <span className="ml-2 text-xs rounded-full px-2 py-0.5" style={{ backgroundColor: 'var(--color-warning)', color: '#fff' }}>
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="approved">Approuvées</TabsTrigger>
              <TabsTrigger value="rejected">Rejetées</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <RegistrationList
                registrations={filteredRegistrations}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <RegistrationList
                registrations={filteredRegistrations.filter((r: any) => r.status === 'pending')}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="approved" className="mt-6">
              <RegistrationList
                registrations={filteredRegistrations.filter((r: any) => r.status === 'approved')}
                onViewDetails={handleViewDetails}
              />
            </TabsContent>

            <TabsContent value="rejected" className="mt-6">
              <RegistrationList
                registrations={filteredRegistrations.filter((r: any) => r.status === 'rejected')}
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
