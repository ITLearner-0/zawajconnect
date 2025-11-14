import { useState } from 'react';
import { useWaliSuspensions } from '@/hooks/wali/useWaliSuspensions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SuspensionForm } from './SuspensionForm';
import { SuspensionList } from './SuspensionList';
import { AlertTriangle, Plus, History } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';

interface SuspensionManagementPanelProps {
  waliId: string;
}

export const SuspensionManagementPanel = ({ waliId }: SuspensionManagementPanelProps) => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const {
    suspensions,
    activeSuspension,
    loading,
    createSuspension,
    liftSuspension,
    isSuspended,
  } = useWaliSuspensions(waliId);

  const activeSuspensions = suspensions.filter((s) => s.is_active);
  const historicalSuspensions = suspensions.filter((s) => !s.is_active);

  const handleCreateSuspension = async (data: any) => {
    await createSuspension(data);
    setShowForm(false);
  };

  const handleLiftSuspension = async (suspensionId: string) => {
    if (user?.id) {
      await liftSuspension(suspensionId, user.id);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Gestion des Suspensions
              </CardTitle>
              <CardDescription>
                Gérer les suspensions et avertissements du Wali
              </CardDescription>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Suspension
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {isSuspended() && activeSuspension && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Ce Wali est actuellement suspendu</strong>
            <br />
            Type: {activeSuspension.suspension_type} | Raison: {activeSuspension.reason}
          </AlertDescription>
        </Alert>
      )}

      {showForm && (
        <SuspensionForm
          waliId={waliId}
          userId={user?.id || ''}
          onSubmit={handleCreateSuspension}
          onCancel={() => setShowForm(false)}
        />
      )}

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Actives ({activeSuspensions.length})
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique ({historicalSuspensions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <SuspensionList
            suspensions={activeSuspensions}
            onLift={handleLiftSuspension}
            canManage={true}
          />
        </TabsContent>

        <TabsContent value="history">
          <SuspensionList
            suspensions={historicalSuspensions}
            onLift={handleLiftSuspension}
            canManage={false}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
