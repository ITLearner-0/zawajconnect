import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Crown, Gift, Plus, Search, Users, History, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import SubscriptionHistoryViewer from '@/components/admin/SubscriptionHistoryViewer';

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
  const [selectedUserName, setSelectedUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [planType, setPlanType] = useState('premium_3_months');
  const [expirationDays, setExpirationDays] = useState('90');
  const [notes, setNotes] = useState('');
  const [existingSubscription, setExistingSubscription] = useState<UserSubscription | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [replacementReason, setReplacementReason] = useState('');

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

  const searchUsers = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setSearchingUsers(true);
      
      // Check if query is a valid UUID format
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(query);
      
      let supabaseQuery = supabase
        .from('profiles')
        .select('user_id, full_name, age, location');
      
      if (isUUID) {
        // If it's a UUID, search by user_id
        supabaseQuery = supabaseQuery.eq('user_id', query);
      } else {
        // Otherwise, search by name only
        supabaseQuery = supabaseQuery.ilike('full_name', `%${query}%`);
      }
      
      const { data, error } = await supabaseQuery.limit(20);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error('Erreur lors de la recherche d\'utilisateurs:', error);
      setSearchResults([]);
    } finally {
      setSearchingUsers(false);
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const checkExistingSubscription = async () => {
    if (!selectedUserId || !planType) {
      toast.error('Veuillez sélectionner un utilisateur et un plan');
      return;
    }

    try {
      // Check for existing active subscription
      const { data: existing, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          profiles(full_name)
        `)
        .eq('user_id', selectedUserId)
        .eq('status', 'active')
        .maybeSingle();

      if (error) throw error;

      if (existing) {
        // Show confirmation dialog if active subscription exists
        setExistingSubscription(existing as any);
        setConfirmDialogOpen(true);
      } else {
        // Proceed directly if no active subscription
        await proceedWithGrant();
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      toast.error('Impossible de vérifier l\'abonnement existant');
    }
  };

  const proceedWithGrant = async (isReplacement: boolean = false) => {
    try {
      // Get current admin user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      // Validate replacement reason if replacing
      if (isReplacement && !replacementReason.trim()) {
        toast.error('Veuillez fournir une raison pour le remplacement');
        return;
      }

      const expiresAt = expirationDays ? 
        new Date(Date.now() + parseInt(expirationDays) * 24 * 60 * 60 * 1000).toISOString() : 
        null;

      const finalNotes = isReplacement 
        ? `[REMPLACEMENT] ${replacementReason}${notes ? ' | Notes: ' + notes : ''}`
        : notes || null;

      const { error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: selectedUserId,
          plan_type: planType,
          status: 'active',
          expires_at: expiresAt,
          notes: finalNotes,
          granted_by: user.id
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast.success(`Abonnement ${planType} ${isReplacement ? 'remplacé' : 'accordé'} avec succès`);
      
      // Reset all states
      setGrantDialogOpen(false);
      setConfirmDialogOpen(false);
      setSelectedUserId('');
      setSelectedUserName('');
      setSearchQuery('');
      setSearchResults([]);
      setNotes('');
      setReplacementReason('');
      setExistingSubscription(null);
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
      <div>
        <h2 className="text-3xl font-bold">Gestion des Abonnements</h2>
        <p className="text-muted-foreground">Accordez et gérez les abonnements premium des utilisateurs</p>
      </div>

      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="subscriptions" className="gap-2">
            <Crown className="h-4 w-4" />
            Abonnements
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="h-4 w-4" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <div className="flex justify-end">
        
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
                <Label htmlFor="userSearch">Rechercher un Utilisateur</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="userSearch"
                    placeholder="Nom ou ID de l'utilisateur..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {searchingUsers && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    Recherche en cours...
                  </div>
                )}
                
                {searchResults.length > 0 && (
                  <div className="mt-2 border rounded-lg max-h-48 overflow-y-auto">
                    {searchResults.map((user) => (
                      <div
                        key={user.user_id}
                        onClick={() => {
                          setSelectedUserId(user.user_id);
                          setSelectedUserName(user.full_name || 'Utilisateur');
                          setSearchQuery(user.full_name || user.user_id);
                          setSearchResults([]);
                        }}
                        className="p-3 hover:bg-accent cursor-pointer border-b last:border-b-0"
                      >
                        <div className="font-medium">{user.full_name || 'Sans nom'}</div>
                        <div className="text-xs text-muted-foreground">
                          {user.age && `${user.age} ans`}
                          {user.age && user.location && ' • '}
                          {user.location}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          ID: {user.user_id}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedUserId && (
                  <div className="mt-2 p-2 bg-emerald-50 dark:bg-emerald-950 rounded-md text-sm">
                    <strong>Sélectionné:</strong> {selectedUserName}
                  </div>
                )}
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
              
              <Button onClick={checkExistingSubscription} className="w-full">
                <Gift className="h-4 w-4 mr-2" />
                Accorder l'Abonnement
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Confirmation Dialog for Replacement */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent className="max-w-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              Confirmer le Remplacement d'Abonnement
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cet utilisateur possède déjà un abonnement actif. Le remplacer annulera l'ancien abonnement.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {existingSubscription && (
            <div className="space-y-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg">
                <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">
                  Abonnement Actuel
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-orange-700 dark:text-orange-300 font-medium">Type</div>
                    <div className="text-orange-900 dark:text-orange-100">{existingSubscription.plan_type}</div>
                  </div>
                  <div>
                    <div className="text-orange-700 dark:text-orange-300 font-medium">Statut</div>
                    <Badge className="bg-green-500 text-white">{existingSubscription.status}</Badge>
                  </div>
                  <div>
                    <div className="text-orange-700 dark:text-orange-300 font-medium">Accordé le</div>
                    <div className="text-orange-900 dark:text-orange-100">
                      {new Date(existingSubscription.granted_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div>
                    <div className="text-orange-700 dark:text-orange-300 font-medium">Expire le</div>
                    <div className="text-orange-900 dark:text-orange-100">
                      {existingSubscription.expires_at 
                        ? new Date(existingSubscription.expires_at).toLocaleDateString('fr-FR')
                        : 'Jamais'}
                    </div>
                  </div>
                </div>
                {existingSubscription.notes && (
                  <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
                    <div className="text-orange-700 dark:text-orange-300 font-medium mb-1">Notes</div>
                    <div className="text-orange-900 dark:text-orange-100 text-sm italic">
                      {existingSubscription.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                <h4 className="font-semibold text-emerald-900 dark:text-emerald-100 mb-3">
                  Nouvel Abonnement
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-emerald-700 dark:text-emerald-300 font-medium">Type</div>
                    <div className="text-emerald-900 dark:text-emerald-100">{planType}</div>
                  </div>
                  <div>
                    <div className="text-emerald-700 dark:text-emerald-300 font-medium">Durée</div>
                    <div className="text-emerald-900 dark:text-emerald-100">{expirationDays} jours</div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="replacementReason" className="text-base font-semibold">
                  Raison du Remplacement <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="replacementReason"
                  placeholder="Expliquez pourquoi cet abonnement doit être remplacé (obligatoire)..."
                  value={replacementReason}
                  onChange={(e) => setReplacementReason(e.target.value)}
                  className="min-h-[100px]"
                  required
                />
                {replacementReason.trim() && replacementReason.length < 10 && (
                  <p className="text-sm text-orange-600 dark:text-orange-400">
                    Veuillez fournir une raison détaillée (minimum 10 caractères)
                  </p>
                )}
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmDialogOpen(false);
              setReplacementReason('');
              setExistingSubscription(null);
            }}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (replacementReason.trim().length < 10) {
                  toast.error('Veuillez fournir une raison détaillée (minimum 10 caractères)');
                  return;
                }
                proceedWithGrant(true);
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer le Remplacement
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
        </TabsContent>

        <TabsContent value="history">
          <SubscriptionHistoryViewer />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SubscriptionManagement;