import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  UserPlus,
  Users,
  Calendar,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import {
  DelegationService,
  WaliDelegation,
  DelegateWali,
  DelegationPermission,
} from '@/services/wali/delegationService';
import { useToast } from '@/hooks/use-toast';

interface DelegationManagerProps {
  wali_id: string;
  managed_users: string[];
}

const DelegationManager: React.FC<DelegationManagerProps> = ({ wali_id, managed_users }) => {
  const { toast } = useToast();
  const [delegations, setDelegations] = useState<WaliDelegation[]>([]);
  const [availableWalis, setAvailableWalis] = useState<DelegateWali[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    delegate_wali_id: '',
    managed_user_id: '',
    delegation_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    permissions: [] as DelegationPermission[],
  });

  const defaultPermissions: DelegationPermission[] = [
    { action: 'approve_conversations', granted: false },
    { action: 'reject_requests', granted: false },
    { action: 'end_conversations', granted: false },
    { action: 'access_messages', granted: false },
    { action: 'make_decisions', granted: false },
  ];

  useEffect(() => {
    loadData();
  }, [wali_id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [delegationsList, walisList] = await Promise.all([
        DelegationService.getActiveDelegations(wali_id),
        DelegationService.findAvailableWalis(wali_id),
      ]);

      setDelegations(delegationsList);
      setAvailableWalis(walisList);
      setFormData((prev) => ({ ...prev, permissions: defaultPermissions }));
    } catch (error) {
      console.error('Error loading delegation data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les données de délégation',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelegation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.delegate_wali_id || !formData.managed_user_id || !formData.delegation_type) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await DelegationService.createDelegation({
        primary_wali_id: wali_id,
        delegate_wali_id: formData.delegate_wali_id,
        managed_user_id: formData.managed_user_id,
        delegation_type: formData.delegation_type,
        permissions: formData.permissions,
        start_date: formData.start_date,
        end_date: formData.end_date,
        reason: formData.reason,
      });

      if (result.success) {
        toast({
          title: 'Délégation créée',
          description: 'La délégation a été créée avec succès',
        });
        setShowCreateForm(false);
        loadData();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Erreur lors de la création',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Une erreur inattendue s'est produite",
        variant: 'destructive',
      });
    }
  };

  const handleRevokeDelegation = async (delegationId: string) => {
    try {
      const result = await DelegationService.revokeDelegation(delegationId);
      if (result.success) {
        toast({
          title: 'Délégation révoquée',
          description: 'La délégation a été révoquée avec succès',
        });
        loadData();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de révoquer la délégation',
        variant: 'destructive',
      });
    }
  };

  const updatePermission = (action: string, granted: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.map((p) => (p.action === action ? { ...p, granted } : p)),
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="default" className="bg-green-500">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="outline">
            <XCircle className="h-3 w-3 mr-1" />
            Expirée
          </Badge>
        );
      case 'revoked':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Révoquée
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPermissionLabel = (action: string) => {
    switch (action) {
      case 'approve_conversations':
        return 'Approuver les conversations';
      case 'reject_requests':
        return 'Rejeter les demandes';
      case 'end_conversations':
        return 'Terminer les conversations';
      case 'access_messages':
        return 'Accéder aux messages';
      case 'make_decisions':
        return 'Prendre des décisions';
      default:
        return action;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Chargement...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserPlus className="h-6 w-6" />
            Gestion des Délégations
          </h2>
          <p className="text-muted-foreground">
            Déléguer temporairement vos responsabilités à d'autres walis
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>Nouvelle Délégation</Button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une Délégation</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateDelegation} className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  La délégation permet à un autre wali vérifié de superviser temporairement vos
                  responsabilités.
                </AlertDescription>
              </Alert>

              {/* Delegate Selection */}
              <div className="space-y-2">
                <Label>Wali Délégué *</Label>
                <Select
                  value={formData.delegate_wali_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, delegate_wali_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un wali" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableWalis.map((wali) => (
                      <SelectItem key={wali.id} value={wali.user_id}>
                        {wali.first_name} {wali.last_name} - {wali.relationship}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Managed User Selection */}
              <div className="space-y-2">
                <Label>Utilisateur Supervisé *</Label>
                <Select
                  value={formData.managed_user_id}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, managed_user_id: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un utilisateur" />
                  </SelectTrigger>
                  <SelectContent>
                    {managed_users.map((userId) => (
                      <SelectItem key={userId} value={userId}>
                        Utilisateur {userId}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Delegation Type */}
              <div className="space-y-2">
                <Label>Type de Délégation *</Label>
                <Select
                  value={formData.delegation_type}
                  onValueChange={(value) =>
                    setFormData((prev) => ({ ...prev, delegation_type: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">Temporaire</SelectItem>
                    <SelectItem value="emergency">Urgence</SelectItem>
                    <SelectItem value="specific_event">Événement spécifique</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date de Début</Label>
                  <Input
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, start_date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date de Fin</Label>
                  <Input
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData((prev) => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              {/* Permissions */}
              <div className="space-y-3">
                <Label>Permissions</Label>
                {formData.permissions.map((permission) => (
                  <div key={permission.action} className="flex items-center space-x-2">
                    <Checkbox
                      id={permission.action}
                      checked={permission.granted}
                      onCheckedChange={(checked) =>
                        updatePermission(permission.action, checked === true)
                      }
                    />
                    <Label htmlFor={permission.action} className="text-sm">
                      {getPermissionLabel(permission.action)}
                    </Label>
                  </div>
                ))}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label>Raison de la Délégation</Label>
                <Textarea
                  value={formData.reason}
                  onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                  placeholder="Expliquez la raison de cette délégation..."
                  rows={3}
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                  Annuler
                </Button>
                <Button type="submit">Créer la Délégation</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Active Delegations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Délégations Actives
          </CardTitle>
        </CardHeader>
        <CardContent>
          {delegations.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">Aucune délégation active</p>
          ) : (
            <div className="space-y-4">
              {delegations.map((delegation) => (
                <div key={delegation.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-blue-500" />
                      <div>
                        <h3 className="font-medium">Délégation {delegation.delegation_type}</h3>
                        <p className="text-sm text-muted-foreground">
                          Du {new Date(delegation.start_date).toLocaleDateString()} au{' '}
                          {new Date(delegation.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(delegation.status)}
                      {delegation.status === 'active' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRevokeDelegation(delegation.id)}
                        >
                          Révoquer
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="text-sm">
                    <p>
                      <strong>Raison:</strong> {delegation.reason}
                    </p>
                    <p>
                      <strong>Permissions:</strong>{' '}
                      {delegation.permissions.filter((p) => p.granted).length} accordée(s)
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DelegationManager;
