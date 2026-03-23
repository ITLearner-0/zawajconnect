import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import FamilyNotificationCenter from '@/components/FamilyNotificationCenter';
import {
  Shield,
  Users,
  Key,
  ArrowLeft,
  Eye,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  UserPlus,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface SupervisedPerson {
  id: string;
  user_id: string;
  full_name: string;
  relationship: string;
  is_wali: boolean;
  can_view_profile: boolean;
  can_communicate: boolean;
  invitation_status: string;
  profile?: {
    avatar_url?: string;
    age?: number;
    location?: string;
  };
  activeMatches?: number;
  pendingApprovals?: number;
}

const FamilyAccessPortal = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [supervisedPersons, setSupervisedPersons] = useState<SupervisedPerson[]>([]);

  useEffect(() => {
    if (user) {
      fetchSupervisedPersons();
    }
  }, [user]);

  const fetchSupervisedPersons = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Récupérer les personnes supervisées par ce Wali
      const { data: familyMembers, error: familyError } = await supabase
        .from('family_members')
        .select(
          `
          id,
          user_id,
          full_name,
          relationship,
          is_wali,
          can_view_profile,
          can_communicate,
          invitation_status
        `
        )
        .eq('invited_user_id', user.id)
        .eq('invitation_status', 'accepted')
        .eq('is_wali', true);

      if (familyError) throw familyError;

      if (!familyMembers || familyMembers.length === 0) {
        setSupervisedPersons([]);
        return;
      }

      // Pour chaque personne supervisée, récupérer leur profil et statistiques
      const personsWithDetails = await Promise.all(
        familyMembers.map(async (member) => {
          // Profil
          const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url, age, location')
            .eq('user_id', member.user_id)
            .maybeSingle();

          // Matches actifs
          const { count: activeMatches } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .or(`user1_id.eq.${member.user_id},user2_id.eq.${member.user_id}`)
            .eq('is_mutual', true)
            .eq('conversation_status', 'active');

          // Approbations en attente
          const { count: pendingApprovals } = await supabase
            .from('matches')
            .select('*', { count: 'exact', head: true })
            .or(`user1_id.eq.${member.user_id},user2_id.eq.${member.user_id}`)
            .eq('family_supervision_required', true)
            .is('family_approved', null);

          return {
            ...member,
            invitation_status: member.invitation_status ?? 'pending',
            is_wali: member.is_wali ?? false,
            can_communicate: member.can_communicate ?? false,
            can_view_profile: member.can_view_profile ?? false,
            profile: profile
              ? {
                  avatar_url: profile.avatar_url ?? undefined,
                  age: profile.age ?? undefined,
                  location: profile.location ?? undefined,
                }
              : undefined,
            activeMatches: activeMatches || 0,
            pendingApprovals: pendingApprovals || 0,
          };
        })
      );

      setSupervisedPersons(personsWithDetails);
    } catch (error) {
      console.error('Error fetching supervised persons:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les personnes supervisées',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-12 w-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                <Key className="h-6 w-6 text-white" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">Accès Non Autorisé</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Vous devez être connecté avec un compte de supervision familiale pour accéder à cette
              page.
            </p>
            <div className="space-y-2">
              <Link to="/auth">
                <Button className="w-full bg-emerald hover:bg-emerald-dark">Se connecter</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à l'accueil
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = async () => {
    const confirmSignOut = window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?');
    if (confirmSignOut) {
      await signOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Supervision Familiale</h1>
                <p className="text-muted-foreground">
                  Tableau de bord pour la supervision islamique
                </p>
              </div>
            </div>
            <Button onClick={handleSignOut} variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald" />
                    Personnes Supervisées
                  </div>
                  <Badge variant="outline" className="text-emerald">
                    {supervisedPersons.length}{' '}
                    {supervisedPersons.length > 1 ? 'personnes' : 'personne'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supervisedPersons.length === 0 ? (
                  <div className="text-center py-12">
                    <UserPlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Aucune personne supervisée</h3>
                    <p className="text-muted-foreground mb-4">
                      Vous ne supervisez actuellement aucune personne.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Les personnes que vous souhaitez superviser doivent vous inviter en tant que
                      Wali depuis leur compte.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {supervisedPersons.map((person) => (
                      <Card key={person.id} className="border-emerald/20">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="h-14 w-14 rounded-full bg-gradient-to-br from-emerald/20 to-gold/20 flex items-center justify-center flex-shrink-0">
                              {person.profile?.avatar_url ? (
                                <img
                                  src={person.profile.avatar_url}
                                  alt={person.full_name}
                                  className="h-full w-full rounded-full object-cover"
                                />
                              ) : (
                                <Users className="h-6 w-6 text-emerald" />
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{person.full_name}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {person.relationship} •{' '}
                                    {person.profile?.age
                                      ? `${person.profile.age} ans`
                                      : 'Âge non défini'}
                                  </p>
                                  {person.profile?.location && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      📍 {person.profile.location}
                                    </p>
                                  )}
                                </div>
                                <Badge
                                  variant={person.can_communicate ? 'default' : 'secondary'}
                                  className="ml-2"
                                >
                                  {person.can_communicate ? 'Actif' : 'En attente'}
                                </Badge>
                              </div>

                              <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="flex items-center gap-2 text-sm">
                                  <MessageCircle className="h-4 w-4 text-emerald" />
                                  <span className="text-muted-foreground">
                                    {person.activeMatches || 0} conversation
                                    {person.activeMatches !== 1 ? 's' : ''} active
                                    {person.activeMatches !== 1 ? 's' : ''}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <AlertCircle className="h-4 w-4 text-gold-600" />
                                  <span className="text-muted-foreground">
                                    {person.pendingApprovals || 0} en attente
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2 mt-4">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    (window.location.href = `/family-supervision?user=${person.user_id}`)
                                  }
                                  disabled={!person.can_view_profile}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Voir le profil
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={person.pendingApprovals === 0}
                                >
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Gérer les approbations
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <div className="mt-6 p-4 bg-emerald/10 border border-emerald/20 rounded-lg">
                  <p className="text-sm text-emerald-dark">
                    <strong>📚 Principe islamique :</strong> La supervision familiale (notamment par
                    le Wali) est essentielle pour maintenir les valeurs islamiques dans les
                    communications pré-maritales.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <FamilyNotificationCenter />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FamilyAccessPortal;
