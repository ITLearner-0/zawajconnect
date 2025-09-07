import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Users, Plus, Mail, Phone, Shield, Heart, UserCheck, AlertCircle, Trash2, Send } from 'lucide-react';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  email?: string;
  phone?: string;
  can_communicate: boolean;
  can_view_profile: boolean;
  is_wali: boolean;
  invitation_status?: string;
  invitation_sent_at?: string;
  invitation_token?: string;
}

interface SupervisionStats {
  total_matches: number;
  reviewed_matches: number;
  pending_reviews: number;
  family_members: number;
}

const FamilySupervisionPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [stats, setStats] = useState<SupervisionStats>({
    total_matches: 0,
    reviewed_matches: 0,
    pending_reviews: 0,
    family_members: 0
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMember, setNewMember] = useState({
    full_name: '',
    relationship: '',
    email: '',
    phone: '',
    can_communicate: false,
    can_view_profile: true,
    is_wali: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState({
    subject: '',
    body: '',
    to: ''
  });

  const relationshipOptions = [
    'Père', 'Mère', 'Frère', 'Sœur', 'Oncle', 'Tante', 
    'Grand-père', 'Grand-mère', 'Tuteur/Wali', 'Autre'
  ];

  useEffect(() => {
    if (user) {
      loadFamilyData();
    }
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load family members
      const { data: membersData, error: membersError } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (membersError) throw membersError;

      setFamilyMembers(membersData || []);

      // Load supervision stats
      await loadSupervisionStats();
    } catch (error) {
      console.error('Error loading family data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données familiales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadSupervisionStats = async () => {
    if (!user) return;

    try {
      // Get total matches
      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      // Get reviewed matches
      const { count: reviewedMatches } = await supabase
        .from('family_reviews')
        .select('*', { count: 'exact', head: true })
        .in('match_id', 
          await supabase
            .from('matches')
            .select('id')
            .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
            .then(res => res.data?.map(m => m.id) || [])
        );

      setStats({
        total_matches: totalMatches || 0,
        reviewed_matches: reviewedMatches || 0,
        pending_reviews: (totalMatches || 0) - (reviewedMatches || 0),
        family_members: familyMembers.length
      });
    } catch (error) {
      console.error('Error loading supervision stats:', error);
    }
  };

  const addFamilyMember = async () => {
    if (!user || !newMember.full_name.trim() || !newMember.relationship) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          full_name: newMember.full_name.trim(),
          relationship: newMember.relationship,
          email: newMember.email.trim() || null,
          phone: newMember.phone.trim() || null,
          can_communicate: newMember.can_communicate,
          can_view_profile: newMember.can_view_profile,
          is_wali: newMember.is_wali
        })
        .select()
        .single();

      if (error) throw error;

      setFamilyMembers(prev => [...prev, data]);
      setNewMember({
        full_name: '',
        relationship: '',
        email: '',
        phone: '',
        can_communicate: false,
        can_view_profile: true,
        is_wali: false
      });
      setShowAddForm(false);

      toast({
        title: "Membre ajouté",
        description: `${data.full_name} a été ajouté à votre famille`,
      });
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le membre de famille",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateFamilyMember = async (memberId: string, field: string, value: any) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .update({ [field]: value })
        .eq('id', memberId);

      if (error) throw error;

      setFamilyMembers(prev =>
        prev.map(member =>
          member.id === memberId ? { ...member, [field]: value } : member
        )
      );

      toast({
        title: "Mis à jour",
        description: "Les permissions ont été mises à jour",
      });
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les permissions",
        variant: "destructive"
      });
    }
  };

  const deleteFamilyMember = async (memberId: string, memberName: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));

      toast({
        title: "Membre supprimé",
        description: `${memberName} a été retiré de votre famille`,
      });
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre de famille",
        variant: "destructive"
      });
    }
  };

  const generateInvitationLink = async (member: FamilyMember) => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate invitation token and create family member record
      const { data: invitationToken, error } = await supabase
        .rpc('create_family_invitation', {
          p_user_id: user.id,
          p_full_name: member.full_name,
          p_email: member.email,
          p_relationship: member.relationship,
          p_is_wali: member.is_wali
        });

      if (error) throw error;

      // Get user profile for invitation
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('user_id', user.id)
        .single();

      const inviterName = profile?.full_name || 'Un membre de famille';
      const invitationUrl = `${window.location.origin}/invitation?token=${invitationToken}`;
      
      // Create email template
      const emailSubject = "Invitation à superviser sur NikahConnect";
      const emailBody = `Assalamu Alaikum ${member.full_name},

${inviterName} vous invite à devenir ${member.is_wali ? 'tuteur (Wali)' : 'membre de famille'} sur NikahConnect pour superviser leurs interactions selon les principes islamiques.

Votre rôle : ${member.relationship}
${member.is_wali ? 'Vous aurez le statut de Wali (tuteur)' : ''}

Vous pourrez :
- Superviser les conversations
- Consulter les profils des correspondants
- Recevoir des alertes de modération
- Participer aux discussions si nécessaire

Pour accepter cette invitation, cliquez sur le lien suivant :
${invitationUrl}

Cette invitation expire dans 7 jours. Si vous n'avez pas demandé cette invitation, vous pouvez ignorer cet email.

Cordialement,
NikahConnect - Plateforme de rencontres islamiques avec supervision familiale`;

      // Show email options dialog
      setEmailTemplate({
        subject: emailSubject,
        body: emailBody,
        to: member.email || ''
      });
      setShowEmailDialog(true);

      toast({
        title: "Lien d'invitation généré",
        description: "Choisissez votre solution email pour envoyer l'invitation.",
      });
      
    } catch (error: any) {
      console.error('Error generating invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer l'invitation. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openEmailClient = (client: string) => {
    const { subject, body, to } = emailTemplate;
    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);
    const encodedTo = encodeURIComponent(to);

    let url = '';
    
    switch (client) {
      case 'gmail':
        url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedTo}&su=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'outlook':
        url = `https://outlook.live.com/owa/?path=/mail/action/compose&to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'yahoo':
        url = `https://compose.mail.yahoo.com/?to=${encodedTo}&subject=${encodedSubject}&body=${encodedBody}`;
        break;
      case 'mailto':
        url = `mailto:${to}?subject=${encodedSubject}&body=${encodedBody}`;
        break;
      default:
        return;
    }

    window.open(url, '_blank');
    setShowEmailDialog(false);
    
    toast({
      title: "Email ouvert",
      description: "L'invitation a été préparée dans votre client email.",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement des données familiales...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Heart className="h-8 w-8 text-emerald mx-auto mb-2" />
            <div className="text-2xl font-bold text-emerald">{stats.total_matches}</div>
            <div className="text-sm text-muted-foreground">Total Matches</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="h-8 w-8 text-gold mx-auto mb-2" />
            <div className="text-2xl font-bold text-gold">{stats.reviewed_matches}</div>
            <div className="text-sm text-muted-foreground">Évalués</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-500">{stats.pending_reviews}</div>
            <div className="text-sm text-muted-foreground">En Attente</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="h-8 w-8 text-sage mx-auto mb-2" />
            <div className="text-2xl font-bold text-sage">{stats.family_members}</div>
            <div className="text-sm text-muted-foreground">Famille</div>
          </CardContent>
        </Card>
      </div>

      {/* Family Members Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-emerald" />
              Membres de la Famille
            </CardTitle>
            <Button
              onClick={() => setShowAddForm(true)}
              className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un Membre
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Gérez les membres de votre famille qui peuvent vous aider dans votre recherche de partenaire selon les traditions islamiques.
          </p>
        </CardHeader>
        <CardContent>
          {showAddForm && (
            <Card className="mb-6 border-emerald/20 bg-emerald/5">
              <CardHeader>
                <CardTitle className="text-lg">Ajouter un Membre de Famille</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={newMember.full_name}
                      onChange={(e) => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                      placeholder="Nom du membre de famille"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="relationship">Relation *</Label>
                    <Select 
                      value={newMember.relationship}
                      onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner la relation" />
                      </SelectTrigger>
                      <SelectContent>
                        {relationshipOptions.map(relation => (
                          <SelectItem key={relation} value={relation}>
                            {relation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email (optionnel)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@example.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Téléphone (optionnel)</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+33 6 12 34 56 78"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Peut communiquer directement</Label>
                      <p className="text-sm text-muted-foreground">
                        Autoriser ce membre à communiquer avec vos matches
                      </p>
                    </div>
                    <Switch
                      checked={newMember.can_communicate}
                      onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, can_communicate: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Peut voir le profil complet</Label>
                      <p className="text-sm text-muted-foreground">
                        Accès aux détails complets des profils de vos matches
                      </p>
                    </div>
                    <Switch
                      checked={newMember.can_view_profile}
                      onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, can_view_profile: checked }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Wali (Tuteur)</Label>
                      <p className="text-sm text-muted-foreground">
                        Autorité principale pour l'approbation des mariages
                      </p>
                    </div>
                    <Switch
                      checked={newMember.is_wali}
                      onCheckedChange={(checked) => setNewMember(prev => ({ ...prev, is_wali: checked }))}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={addFamilyMember}
                    disabled={saving}
                    className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                  >
                    {saving ? 'Ajout...' : 'Ajouter'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Annuler
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {familyMembers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Aucun membre de famille ajouté</h3>
              <p className="text-muted-foreground mb-4">
                Ajoutez des membres de votre famille pour bénéficier de leur guidance selon les traditions islamiques.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{member.full_name}</h4>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge variant="secondary">{member.relationship}</Badge>
                          {member.is_wali && (
                            <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                              <Shield className="h-3 w-3 mr-1" />
                              Wali
                            </Badge>
                          )}
                          {member.invitation_status && (
                            <Badge 
                              variant={
                                member.invitation_status === 'accepted' ? 'default' : 
                                member.invitation_status === 'pending' ? 'secondary' : 'destructive'
                              }
                            >
                              {member.invitation_status === 'accepted' ? 'Acceptée' : 
                               member.invitation_status === 'pending' ? 'En attente' : 'Expirée'}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.email && member.invitation_status !== 'accepted' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => generateInvitationLink(member)}
                            className="text-emerald border-emerald hover:bg-emerald/10"
                          >
                            <Send className="h-4 w-4 mr-1" />
                            {member.invitation_status === 'pending' ? 'Renvoyer' : 'Inviter'}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteFamilyMember(member.id, member.full_name)}
                          className="text-destructive border-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      {member.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4" />
                          <span>{member.email}</span>
                        </div>
                      )}
                      {member.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Communication directe</Label>
                        <Switch
                          checked={member.can_communicate}
                          onCheckedChange={(checked) => updateFamilyMember(member.id, 'can_communicate', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Voir profils complets</Label>
                        <Switch
                          checked={member.can_view_profile}
                          onCheckedChange={(checked) => updateFamilyMember(member.id, 'can_view_profile', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Autorité Wali</Label>
                        <Switch
                          checked={member.is_wali}
                          onCheckedChange={(checked) => updateFamilyMember(member.id, 'is_wali', checked)}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Islamic Guidelines */}
      <Card className="border-gold/20 bg-gradient-to-br from-gold/5 to-emerald/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-gold" />
            Guidance Islamique pour la Supervision Familiale
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-gold rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Le rôle du Wali :</strong> Dans l'Islam, le wali (tuteur) a une responsabilité importante dans le processus de mariage, particulièrement pour les femmes.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-emerald rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Consultation familiale :</strong> Impliquer la famille dans le choix du partenaire est une pratique recommandée pour assurer la compatibilité et l'harmonie.
              </p>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-2 w-2 bg-sage rounded-full mt-2"></div>
              <p className="text-muted-foreground">
                <strong>Supervision respectueuse :</strong> La supervision doit être équilibrée, respectant à la fois les traditions islamiques et l'autonomie personnelle.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Client Selection Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Choisissez votre solution email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Sélectionnez votre client email préféré pour envoyer l'invitation :
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => openEmailClient('gmail')}
                className="flex items-center gap-2 h-12"
              >
                <Mail className="h-4 w-4" />
                Gmail
              </Button>
              <Button
                variant="outline"
                onClick={() => openEmailClient('outlook')}
                className="flex items-center gap-2 h-12"
              >
                <Mail className="h-4 w-4" />
                Outlook
              </Button>
              <Button
                variant="outline"
                onClick={() => openEmailClient('yahoo')}
                className="flex items-center gap-2 h-12"
              >
                <Mail className="h-4 w-4" />
                Yahoo
              </Button>
              <Button
                variant="outline"
                onClick={() => openEmailClient('mailto')}
                className="flex items-center gap-2 h-12"
              >
                <Mail className="h-4 w-4" />
                Autre
              </Button>
            </div>
            <div className="mt-4 p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Destinataire :</strong> {emailTemplate.to}<br />
                <strong>Objet :</strong> {emailTemplate.subject}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FamilySupervisionPanel;