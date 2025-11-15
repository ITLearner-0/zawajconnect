import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  UserPlus,
  Mail,
  Phone,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  Eye,
  MessageCircle,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { familyMemberSchema } from '@/lib/validation';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  invitation_status: string;
  can_view_profile: boolean;
  can_communicate: boolean;
  is_wali: boolean;
  invitation_sent_at: string;
  invitation_accepted_at?: string;
}

const FamilyInvitationManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    relationship: '',
    is_wali: false,
    can_view_profile: true,
    can_communicate: false,
  });

  useEffect(() => {
    fetchFamilyMembers();
  }, [user]);

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const normalizedMembers = (data || []).map((m) => ({
        ...m,
        is_wali: m.is_wali ?? false,
        can_communicate: m.can_communicate ?? false,
        can_view_profile: m.can_view_profile ?? false,
        invitation_status: m.invitation_status ?? 'pending',
        invitation_sent_at: m.invitation_sent_at ?? '',
        invitation_accepted_at: m.invitation_accepted_at ?? undefined,
      }));
      setFamilyMembers(normalizedMembers);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les membres de la famille',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const sendInvitation = async () => {
    if (!user) return;

    // 🛡️ PROTECTION: Empêcher les doubles soumissions
    if (isSubmitting) {
      console.warn('⚠️ Soumission déjà en cours, requête ignorée');
      return;
    }

    // Validate with Zod
    setValidationErrors({});
    const validationResult = familyMemberSchema.safeParse({
      full_name: inviteForm.full_name,
      email: inviteForm.email,
      phone: inviteForm.phone || '',
      relationship: inviteForm.relationship,
      isWali: inviteForm.is_wali,
    });

    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setValidationErrors(fieldErrors);
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    console.log(
      '🚀 [INVITATION] Début envoi invitation pour:',
      inviteForm.full_name,
      '- Email:',
      inviteForm.email
    );

    try {
      // Send invitation email via edge function
      // The edge function will create the family_members entry via create_family_invitation RPC
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Session invalide ou expirée');
      }

      console.log('📤 [INVITATION] Appel edge function send-family-invitation...');

      const { data, error } = await supabase.functions.invoke('send-family-invitation', {
        body: {
          fullName: inviteForm.full_name,
          email: inviteForm.email,
          relationship: inviteForm.relationship,
          isWali: inviteForm.is_wali,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('❌ [INVITATION] Edge function error:', error);

        // Extract error message from response
        let errorMessage = "Impossible d'envoyer l'invitation";
        if (error.context?.body) {
          try {
            const errorBody =
              typeof error.context.body === 'string'
                ? JSON.parse(error.context.body)
                : error.context.body;
            errorMessage = errorBody.error || errorMessage;
          } catch (e) {
            console.error('Failed to parse error body:', e);
          }
        }

        throw new Error(errorMessage);
      }

      console.log('✅ [INVITATION] Invitation response:', data);

      toast({
        title: '✅ Invitation envoyée',
        description: `L'invitation a été envoyée à ${inviteForm.full_name} (${inviteForm.email})`,
      });

      setInviteModalOpen(false);
      setValidationErrors({});
      setInviteForm({
        full_name: '',
        email: '',
        phone: '',
        relationship: '',
        is_wali: false,
        can_view_profile: true,
        can_communicate: false,
      });

      // Attendre 500ms avant de recharger pour laisser le temps à la DB de se mettre à jour
      setTimeout(() => {
        fetchFamilyMembers();
      }, 500);
    } catch (error: unknown) {
      console.error('❌ [INVITATION] Error sending invitation:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Impossible d'envoyer l'invitation";
      toast({
        title: "❌ Erreur d'envoi",
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateMemberPermissions = async (memberId: string, updates: Partial<FamilyMember>) => {
    try {
      const { error } = await supabase.from('family_members').update(updates).eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Permissions mises à jour',
        description: 'Les autorisations du membre ont été modifiées',
      });

      fetchFamilyMembers();
    } catch (error) {
      console.error('Error updating permissions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de mettre à jour les permissions',
        variant: 'destructive',
      });
    }
  };

  const resendInvitation = async (memberId: string, member: FamilyMember) => {
    try {
      console.log('📤 [RESEND] Renvoi invitation à:', member.full_name);

      toast({
        title: 'Fonctionnalité non disponible',
        description: "Le renvoi d'invitation nécessite que l'email soit stocké",
        variant: 'destructive',
      });

      return;

      /* TODO: Implement resend when email is available
      const { data: { session } } = await supabase.auth.getSession();
      await supabase.functions.invoke('send-family-invitation', {
        body: {
          fullName: member.full_name,
          email: 'TODO',
          relationship: member.relationship,
          isWali: member.is_wali
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });

      await supabase
        .from('family_members')
        .update({ invitation_sent_at: new Date().toISOString() })
        .eq('id', memberId);

      toast({
        title: "Invitation renvoyée",
        description: `L'invitation a été renvoyée à ${member.full_name}`,
      });

      fetchFamilyMembers();
      */
    } catch (error) {
      console.error('Error resending invitation:', error);
      toast({
        title: 'Erreur',
        description: "Impossible de renvoyer l'invitation",
        variant: 'destructive',
      });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase.from('family_members').delete().eq('id', memberId);

      if (error) throw error;

      toast({
        title: 'Membre supprimé',
        description: 'Le membre a été retiré de votre famille',
      });

      fetchFamilyMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer le membre',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge className="bg-emerald/10 text-emerald border-emerald/20">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepté
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Refusé
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            En attente
          </Badge>
        );
    }
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      father: 'Père',
      mother: 'Mère',
      brother: 'Frère',
      sister: 'Sœur',
      uncle: 'Oncle',
      aunt: 'Tante',
      cousin: 'Cousin/Cousine',
      family_friend: 'Ami de la famille',
      wali: 'Wali',
      other: 'Autre',
    };
    return labels[relationship] || relationship;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des membres de la famille...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald" />
                Gestion Familiale
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Invitez et gérez les membres de votre famille pour la supervision islamique
              </p>
            </div>
            <Dialog open={inviteModalOpen} onOpenChange={setInviteModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald hover:bg-emerald-dark">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Inviter un membre de la famille</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {Object.keys(validationErrors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Veuillez corriger les erreurs dans le formulaire
                      </AlertDescription>
                    </Alert>
                  )}
                  <div>
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={inviteForm.full_name}
                      onChange={(e) => {
                        setInviteForm((prev) => ({ ...prev, full_name: e.target.value }));
                        if (validationErrors.full_name) {
                          setValidationErrors((prev) => ({ ...prev, full_name: '' }));
                        }
                      }}
                      placeholder="Nom du membre de la famille"
                      className={validationErrors.full_name ? 'border-destructive' : ''}
                    />
                    {validationErrors.full_name && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.full_name}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => {
                        setInviteForm((prev) => ({ ...prev, email: e.target.value }));
                        if (validationErrors.email) {
                          setValidationErrors((prev) => ({ ...prev, email: '' }));
                        }
                      }}
                      placeholder="email@exemple.com"
                      className={validationErrors.email ? 'border-destructive' : ''}
                    />
                    {validationErrors.email && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      value={inviteForm.phone}
                      onChange={(e) => {
                        setInviteForm((prev) => ({ ...prev, phone: e.target.value }));
                        if (validationErrors.phone) {
                          setValidationErrors((prev) => ({ ...prev, phone: '' }));
                        }
                      }}
                      placeholder="+33 6 12 34 56 78"
                      className={validationErrors.phone ? 'border-destructive' : ''}
                    />
                    {validationErrors.phone && (
                      <p className="text-sm text-destructive mt-1">{validationErrors.phone}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="relationship">Relation familiale</Label>
                    <Select
                      value={inviteForm.relationship}
                      onValueChange={(value) => {
                        setInviteForm((prev) => ({ ...prev, relationship: value }));
                        if (validationErrors.relationship) {
                          setValidationErrors((prev) => ({ ...prev, relationship: '' }));
                        }
                      }}
                    >
                      <SelectTrigger
                        className={validationErrors.relationship ? 'border-destructive' : ''}
                      >
                        <SelectValue placeholder="Choisissez la relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Père</SelectItem>
                        <SelectItem value="mother">Mère</SelectItem>
                        <SelectItem value="brother">Frère</SelectItem>
                        <SelectItem value="sister">Sœur</SelectItem>
                        <SelectItem value="uncle">Oncle</SelectItem>
                        <SelectItem value="aunt">Tante</SelectItem>
                        <SelectItem value="grandfather">Grand-père</SelectItem>
                        <SelectItem value="grandmother">Grand-mère</SelectItem>
                        <SelectItem value="guardian">Tuteur légal</SelectItem>
                      </SelectContent>
                    </Select>
                    {validationErrors.relationship && (
                      <p className="text-sm text-destructive mt-1">
                        {validationErrors.relationship}
                      </p>
                    )}
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <Label>Autorisations</Label>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-emerald" />
                        <span className="text-sm">Wali (tuteur islamique)</span>
                      </div>
                      <Switch
                        checked={inviteForm.is_wali}
                        onCheckedChange={(checked) =>
                          setInviteForm((prev) => ({ ...prev, is_wali: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">Voir le profil</span>
                      </div>
                      <Switch
                        checked={inviteForm.can_view_profile}
                        onCheckedChange={(checked) =>
                          setInviteForm((prev) => ({ ...prev, can_view_profile: checked }))
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">Participer aux conversations</span>
                      </div>
                      <Switch
                        checked={inviteForm.can_communicate}
                        onCheckedChange={(checked) =>
                          setInviteForm((prev) => ({ ...prev, can_communicate: checked }))
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setInviteModalOpen(false);
                        setValidationErrors({});
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      onClick={sendInvitation}
                      disabled={
                        !inviteForm.full_name ||
                        !inviteForm.email ||
                        !inviteForm.relationship ||
                        isSubmitting
                      }
                      className="bg-emerald hover:bg-emerald-dark"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                          Envoi en cours...
                        </div>
                      ) : (
                        "Envoyer l'invitation"
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Family Members List */}
      <div className="grid gap-4">
        {familyMembers.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun membre familial</h3>
              <p className="text-muted-foreground mb-4">
                Invitez des membres de votre famille pour une supervision islamique appropriée
              </p>
              <Button onClick={() => setInviteModalOpen(true)}>
                <UserPlus className="h-4 w-4 mr-2" />
                Inviter votre premier membre
              </Button>
            </CardContent>
          </Card>
        ) : (
          familyMembers.map((member) => (
            <Card key={member.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-gradient-to-br from-emerald to-sage rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-primary-foreground">
                        {member.full_name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{member.full_name}</h3>
                        {member.is_wali && (
                          <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                            <Shield className="h-3 w-3 mr-1" />
                            Wali
                          </Badge>
                        )}
                        {getStatusBadge(member.invitation_status)}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{getRelationshipLabel(member.relationship)}</span>
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {member.can_view_profile && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            Voir profil
                          </span>
                        )}
                        {member.can_communicate && (
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            Communiquer
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {member.invitation_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resendInvitation(member.id, member)}
                      >
                        Renvoyer
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Gérer {member.full_name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <Label>Autorisations</Label>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Wali (tuteur islamique)</span>
                              <Switch
                                checked={member.is_wali}
                                onCheckedChange={(checked) =>
                                  updateMemberPermissions(member.id, { is_wali: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Voir le profil</span>
                              <Switch
                                checked={member.can_view_profile}
                                onCheckedChange={(checked) =>
                                  updateMemberPermissions(member.id, { can_view_profile: checked })
                                }
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Participer aux conversations</span>
                              <Switch
                                checked={member.can_communicate}
                                onCheckedChange={(checked) =>
                                  updateMemberPermissions(member.id, { can_communicate: checked })
                                }
                              />
                            </div>
                          </div>

                          <Separator />

                          <div className="flex justify-between">
                            <Button variant="destructive" onClick={() => removeMember(member.id)}>
                              Supprimer le membre
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default FamilyInvitationManager;
