import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import FamilyDashboard from '@/components/FamilyDashboard';
import FamilyInvitationForm from '@/components/FamilyInvitationForm';
import ParentalApprovalWorkflow from '@/components/ParentalApprovalWorkflow';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Phone, 
  Mail, 
  Edit,
  Trash2,
  Crown,
  Eye,
  MessageCircle,
  Heart,
  Settings,
  CheckCircle,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  email?: string;
  phone?: string;
  is_wali: boolean;
  can_communicate: boolean;
  can_view_profile: boolean;
  created_at: string;
}

interface PrivacySettings {
  id: string;
  allow_family_involvement: boolean;
  profile_visibility: string;
  photo_visibility: string;
  contact_visibility: string;
  allow_messages_from: string;
}

const Family = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);

  const [newMember, setNewMember] = useState({
    full_name: '',
    relationship: '',
    email: '',
    phone: '',
    is_wali: false,
    can_communicate: false,
    can_view_profile: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    fetchFamilyMembers();
    fetchPrivacySettings();
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
      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les membres de la famille",
        variant: "destructive"
      });
    }
  };

  const fetchPrivacySettings = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPrivacySettings(data);
      } else {
        // Create default privacy settings
        const { data: newSettings, error: createError } = await supabase
          .from('privacy_settings')
          .insert({
            user_id: user.id,
            allow_family_involvement: false,
            profile_visibility: 'public',
            photo_visibility: 'matches_only',
            contact_visibility: 'matches_only',
            allow_messages_from: 'matches_only'
          })
          .select()
          .maybeSingle();

        if (createError) throw createError;
        setPrivacySettings(newSettings);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const addFamilyMember = async () => {
    if (!user || !newMember.full_name || !newMember.relationship) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('family_members')
        .insert({
          user_id: user.id,
          ...newMember
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      setFamilyMembers(prev => [data, ...prev]);
      setNewMember({
        full_name: '',
        relationship: '',
        email: '',
        phone: '',
        is_wali: false,
        can_communicate: false,
        can_view_profile: false
      });
      setShowAddForm(false);

      toast({
        title: "Membre ajouté",
        description: "Le membre de la famille a été ajouté avec succès",
      });
    } catch (error) {
      console.error('Error adding family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le membre de la famille",
        variant: "destructive"
      });
    }
  };

  const updateFamilyMember = async (memberId: string, updates: Partial<FamilyMember>) => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', memberId)
        .select()
        .maybeSingle();

      if (error) throw error;

      setFamilyMembers(prev => 
        prev.map(member => member.id === memberId ? data : member)
      );

      toast({
        title: "Membre mis à jour",
        description: "Les informations ont été mises à jour avec succès",
      });
    } catch (error) {
      console.error('Error updating family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le membre",
        variant: "destructive"
      });
    }
  };

  const deleteFamilyMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      setFamilyMembers(prev => prev.filter(member => member.id !== memberId));

      toast({
        title: "Membre supprimé",
        description: "Le membre de la famille a été supprimé",
      });
    } catch (error) {
      console.error('Error deleting family member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre",
        variant: "destructive"
      });
    }
  };

  const updatePrivacySettings = async (updates: Partial<PrivacySettings>) => {
    if (!user || !privacySettings) return;

    try {
      const { data, error } = await supabase
        .from('privacy_settings')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .maybeSingle();

      if (error) throw error;

      setPrivacySettings(data);

      toast({
        title: "Paramètres mis à jour",
        description: "Vos paramètres de confidentialité ont été sauvegardés",
      });
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres",
        variant: "destructive"
      });
    }
  };

  const relationshipOptions = [
    { value: 'father', label: 'Père' },
    { value: 'mother', label: 'Mère' },
    { value: 'brother', label: 'Frère' },
    { value: 'sister', label: 'Sœur' },
    { value: 'uncle', label: 'Oncle' },
    { value: 'aunt', label: 'Tante' },
    { value: 'guardian', label: 'Tuteur/Tutrice' },
    { value: 'other', label: 'Autre' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3"></div>
            <div className="h-96 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/10 to-emerald/5 p-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 bg-gradient-to-br from-gold to-gold-light rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Implication Familiale</h1>
            <p className="text-muted-foreground">
              Gérez la participation de votre famille dans votre recherche matrimoniale
            </p>
          </div>
        </div>

        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">Tableau de bord</TabsTrigger>
            <TabsTrigger value="approval">Approbations</TabsTrigger>
            <TabsTrigger value="members">Membres famille</TabsTrigger>
            <TabsTrigger value="privacy">Confidentialité</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <FamilyDashboard />
          </TabsContent>

          <TabsContent value="approval" className="space-y-6">
            <ParentalApprovalWorkflow />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Family Members */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Membres de la famille ({familyMembers.length})
                  </CardTitle>
                  <Button
                    onClick={() => setShowAddForm(true)}
                    variant="gradient"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Ajouter un membre
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add Member Form */}
                {showAddForm && (
                  <Card className="border-emerald/20 bg-emerald/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Ajouter un nouveau membre</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Nom complet *</Label>
                          <Input
                            id="name"
                            value={newMember.full_name}
                            onChange={(e) => setNewMember(prev => ({ ...prev, full_name: e.target.value }))}
                            placeholder="Nom et prénom"
                          />
                        </div>
                        <div>
                          <Label>Relation *</Label>
                          <Select 
                            value={newMember.relationship} 
                            onValueChange={(value) => setNewMember(prev => ({ ...prev, relationship: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez la relation" />
                            </SelectTrigger>
                            <SelectContent>
                              {relationshipOptions.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newMember.email}
                            onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@exemple.com"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone">Téléphone</Label>
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
                            <Label className="text-sm font-medium">Wali (Tuteur religieux)</Label>
                            <p className="text-xs text-muted-foreground">
                              Cette personne est responsable religieusement de votre mariage
                            </p>
                          </div>
                          <Switch
                            checked={newMember.is_wali}
                            onCheckedChange={(checked) => 
                              setNewMember(prev => ({ ...prev, is_wali: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Peut communiquer</Label>
                            <p className="text-xs text-muted-foreground">
                              Peut contacter vos matches à votre place
                            </p>
                          </div>
                          <Switch
                            checked={newMember.can_communicate}
                            onCheckedChange={(checked) => 
                              setNewMember(prev => ({ ...prev, can_communicate: checked }))
                            }
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <Label className="text-sm font-medium">Peut voir votre profil</Label>
                            <p className="text-xs text-muted-foreground">
                              A accès à votre profil complet
                            </p>
                          </div>
                          <Switch
                            checked={newMember.can_view_profile}
                            onCheckedChange={(checked) => 
                              setNewMember(prev => ({ ...prev, can_view_profile: checked }))
                            }
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={addFamilyMember} variant="gradient" className="flex-1">
                          Ajouter le membre
                        </Button>
                        <Button 
                          onClick={() => setShowAddForm(false)} 
                          variant="outline"
                          className="flex-1"
                        >
                          Annuler
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Family Members List */}
                {familyMembers.length > 0 ? (
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <Card key={member.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-gradient-to-br from-sage to-sage-dark rounded-full flex items-center justify-center">
                                <span className="text-white font-bold">
                                  {member.full_name.charAt(0)}
                                </span>
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{member.full_name}</h3>
                                  {member.is_wali && (
                                    <Badge className="bg-gold/10 text-gold border-gold/20">
                                      <Crown className="h-3 w-3 mr-1" />
                                      Wali
                                    </Badge>
                                  )}
                                </div>
                                
                                <p className="text-sm text-muted-foreground mb-2">
                                  {relationshipOptions.find(r => r.value === member.relationship)?.label}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  {member.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="h-3 w-3" />
                                      <span>{member.email}</span>
                                    </div>
                                  )}
                                  {member.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="h-3 w-3" />
                                      <span>{member.phone}</span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex items-center gap-4 mt-2">
                                  {member.can_view_profile && (
                                    <Badge variant="outline" className="text-xs">
                                      <Eye className="h-3 w-3 mr-1" />
                                      Peut voir le profil
                                    </Badge>
                                  )}
                                  {member.can_communicate && (
                                    <Badge variant="outline" className="text-xs">
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Peut communiquer
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingMember(member)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteFamilyMember(member.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : !showAddForm && (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Aucun membre de famille ajouté</h3>
                    <p className="text-muted-foreground mb-6">
                      Ajoutez des membres de votre famille pour qu'ils puissent vous accompagner dans votre recherche
                    </p>
                    <Button onClick={() => setShowAddForm(true)} variant="gradient">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Ajouter le premier membre
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Family Invitation Form */}
            <FamilyInvitationForm />
          </TabsContent>

          <TabsContent value="privacy" className="space-y-6">
            {/* Privacy Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres de confidentialité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {privacySettings && (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base font-medium">Autoriser l'implication familiale</Label>
                        <p className="text-sm text-muted-foreground">
                          Permettre à votre famille de participer à votre recherche matrimoniale
                        </p>
                      </div>
                      <Switch
                        checked={privacySettings.allow_family_involvement}
                        onCheckedChange={(checked) => 
                          updatePrivacySettings({ allow_family_involvement: checked })
                        }
                      />
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div>
                        <Label className="text-base font-medium">Visibilité du profil</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Qui peut voir votre profil complet
                        </p>
                        <Select 
                          value={privacySettings.profile_visibility} 
                          onValueChange={(value) => updatePrivacySettings({ profile_visibility: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public - Visible par tous</SelectItem>
                            <SelectItem value="verified_only">Profils vérifiés uniquement</SelectItem>
                            <SelectItem value="matches_only">Matches uniquement</SelectItem>
                            <SelectItem value="family_approved">Famille + Matches</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Visibilité des photos</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Qui peut voir vos photos de profil
                        </p>
                        <Select 
                          value={privacySettings.photo_visibility} 
                          onValueChange={(value) => updatePrivacySettings({ photo_visibility: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="public">Public - Visible par tous</SelectItem>
                            <SelectItem value="verified_only">Profils vérifiés uniquement</SelectItem>
                            <SelectItem value="matches_only">Matches uniquement</SelectItem>
                            <SelectItem value="family_approved">Famille + Matches</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-base font-medium">Messages autorisés de</Label>
                        <p className="text-sm text-muted-foreground mb-3">
                          Qui peut vous envoyer des messages
                        </p>
                        <Select 
                          value={privacySettings.allow_messages_from} 
                          onValueChange={(value) => updatePrivacySettings({ allow_messages_from: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="everyone">Tout le monde</SelectItem>
                            <SelectItem value="verified_only">Profils vérifiés uniquement</SelectItem>
                            <SelectItem value="matches_only">Matches uniquement</SelectItem>
                            <SelectItem value="family_approved">Approuvé par la famille</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Family;