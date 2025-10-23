import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertCircle, Crown, Gift, Plus, Search, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserSubscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  granted_by: string | null;
  granted_at: string;
  expires_at: string | null;
  notes: string | null;
  profiles: {
    full_name: string;
    email?: string;
  } | null;
}

const SubscriptionManagement = () => {
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [grantDialogOpen, setGrantDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [planType, setPlanType] = useState('premium_3_months');
  const [expirationDays, setExpirationDays] = useState('90');
  const [notes, setNotes] = useState('');

  const planTypes = [
    { value: 'premium_3_months', label: 'Premium 3 mois (9.99€/mois)', color: 'bg-emerald-600', days: 90 },
    { value: 'premium_6_months', label: 'Premium 6 mois (8.33€/mois)', color: 'bg-emerald-700', days: 180 },
    { value: 'premium_12_months', label: 'Premium 12 mois (6.66€/mois)', color: 'bg-emerald-800', days: 365 }
  ];

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles(full_name)
        `)
        .order('granted_at', { ascending: false });

      if (error) throw error;
      setSubscriptions((data as any) || []);
    } catch (error) {
      console.error('Erreur lors du chargement des abonnements:', error);
      toast.error('Impossible de charger les abonnements');
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (email: string) => {
    if (!email.includes('@')) return [];
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .ilike('full_name', `%${email}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      return [];
    }
  };

  const grantSubscription = async () => {
    if (!selectedUserId || !planType) {
      toast.error('Veuillez sélectionner un utilisateur et un plan');
      return;
    }

    try {
      const expiresAt = expirationDays ? 
        new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: selectedUserId,
          plan_type: planType,
          status: 'active',
          expires_at: expiresAt,
          notes: notes || null
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success(`Abonnement ${planType} accordé avec succès`);
      setGrantDialogOpen(false);
      setSelectedUserId('');
      setNotes('');
      loadSubscriptions();
    } catch (error) {
      console.error('Erreur lors de l\'attribution de l\'abonnement:', error);
      toast.error('Impossible d\'attribuer l\'abonnement');
    }
  };

  const toggleSubscriptionStatus = async (subscriptionId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
      
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: newStatus })
        .eq('id', subscriptionId);

      if (error) throw error;

      toast.success(`Abonnement ${newStatus === 'active' ? 'activé' : 'suspendu'}`);
      loadSubscriptions();
    } catch (error) {
      console.error('Erreur lors de la modification du statut:', error);
      toast.error('Impossible de modifier le statut');
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPlanBadge = (planType: string) => {
    const plan = planTypes.find(p => p.value === planType);
    return plan ? (
      <Badge className={`${plan.color} text-white`}>
        {plan.label}
      </Badge>
    ) : <Badge variant="secondary">{planType}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Actif</Badge>;
      case 'suspended':
        return <Badge className="bg-red-500 text-white">Suspendu</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500 text-white">Expiré</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold">Gestion des Abonnements</h2>
          <p className="text-muted-foreground">Accordez et gérez les abonnements premium des utilisateurs</p>
        </div>
        
        <Dialog open={grantDialogOpen} onOpenChange={setGrantDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Accorder un Abonnement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Accorder un Abonnement Premium</DialogTitle>
              <DialogDescription>
                Sélectionnez un utilisateur et configurez son abonnement premium
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="userId">Utilisateur (ID)</Label>
                <Input
                  id="userId"
                  placeholder="ID de l'utilisateur"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="planType">Type d'Abonnement</Label>
                <Select 
                  value={planType} 
                  onValueChange={(value) => {
                    setPlanType(value);
                    const selectedPlan = planTypes.find(p => p.value === value);
                    if (selectedPlan) {
                      setExpirationDays(selectedPlan.days.toString());
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {planTypes.map(plan => (
                      <SelectItem key={plan.value} value={plan.value}>
                        {plan.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="expiration">Durée (jours)</Label>
                <Input
                  id="expiration"
                  type="number"
                  placeholder="90"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-1">
                  La durée se met à jour automatiquement selon le plan sélectionné
                </p>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes (optionnel)</Label>
                <Textarea
                  id="notes"
                  placeholder="Notes sur cet abonnement..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              
              <Button onClick={grantSubscription} className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Accorder l'Abonnement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Abonnements</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{subscriptions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Premium</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {subscriptions.filter(s => s.plan_type.includes('premium') && s.status === 'active').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher par nom ou type d'abonnement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements Utilisateurs</CardTitle>
          <CardDescription>
            Liste de tous les abonnements accordés aux utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-muted-foreground">Chargement des abonnements...</p>
            </div>
          ) : filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8">
              <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucun abonnement trouvé</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">
                        {subscription.profiles?.full_name || 'Utilisateur inconnu'}
                      </h4>
                      {getPlanBadge(subscription.plan_type)}
                      {getStatusBadge(subscription.status)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>Accordé le: {new Date(subscription.granted_at).toLocaleDateString('fr-FR')}</p>
                      {subscription.expires_at && (
                        <p>Expire le: {new Date(subscription.expires_at).toLocaleDateString('fr-FR')}</p>
                      )}
                      {subscription.notes && (
                        <p>Notes: {subscription.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant={subscription.status === 'active' ? 'destructive' : 'default'}
                      size="sm"
                      onClick={() => toggleSubscriptionStatus(subscription.id, subscription.status)}
                    >
                      {subscription.status === 'active' ? 'Suspendre' : 'Activer'}
                    </Button>
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

export default SubscriptionManagement;