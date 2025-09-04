import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, Edit, Trash2, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FamilyMember {
  id: string;
  relationship: string;
  full_name: string;
  email: string;
  phone: string;
  can_view_profile: boolean;
  can_communicate: boolean;
  is_wali: boolean;
  created_at: string;
}

const Family = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null);
  const [formData, setFormData] = useState({
    relationship: '',
    full_name: '',
    email: '',
    phone: '',
    can_view_profile: false,
    can_communicate: false,
    is_wali: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchFamilyMembers();
  }, [user]);

  const fetchFamilyMembers = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      setFamilyMembers(data || []);
    } catch (error) {
      console.error('Error fetching family members:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingMember) {
        // Update existing member
        await supabase
          .from('family_members')
          .update(formData)
          .eq('id', editingMember.id);
      } else {
        // Add new member
        await supabase
          .from('family_members')
          .insert({
            ...formData,
            user_id: user.id
          });
      }

      fetchFamilyMembers();
      resetForm();
      setShowAddDialog(false);
      setEditingMember(null);
    } catch (error) {
      console.error('Error saving family member:', error);
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (member: FamilyMember) => {
    setFormData({
      relationship: member.relationship,
      full_name: member.full_name,
      email: member.email,
      phone: member.phone,
      can_view_profile: member.can_view_profile,
      can_communicate: member.can_communicate,
      is_wali: member.is_wali
    });
    setEditingMember(member);
    setShowAddDialog(true);
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce membre de la famille ?')) {
      return;
    }

    try {
      await supabase
        .from('family_members')
        .delete()
        .eq('id', memberId);

      fetchFamilyMembers();
    } catch (error) {
      console.error('Error deleting family member:', error);
      alert('Erreur lors de la suppression');
    }
  };

  const resetForm = () => {
    setFormData({
      relationship: '',
      full_name: '',
      email: '',
      phone: '',
      can_view_profile: false,
      can_communicate: false,
      is_wali: false
    });
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels = {
      father: 'Père',
      mother: 'Mère',
      brother: 'Frère',
      sister: 'Sœur',
      guardian: 'Tuteur',
      wali: 'Wali'
    };
    return labels[relationship as keyof typeof labels] || relationship;
  };

  if (loading) {
    return (
      <div className="py-8 px-4">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des membres de la famille...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4">
      <div className="container mx-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Gestion familiale</h1>
                <p className="text-muted-foreground">Impliquez votre famille dans votre parcours matrimonial</p>
              </div>
            </div>

            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMember ? 'Modifier le membre' : 'Ajouter un membre de la famille'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="relationship">Relation</Label>
                    <Select 
                      value={formData.relationship} 
                      onValueChange={(value) => setFormData(prev => ({...prev, relationship: value}))}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez la relation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="father">Père</SelectItem>
                        <SelectItem value="mother">Mère</SelectItem>
                        <SelectItem value="brother">Frère</SelectItem>
                        <SelectItem value="sister">Sœur</SelectItem>
                        <SelectItem value="guardian">Tuteur</SelectItem>
                        <SelectItem value="wali">Wali</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="full_name">Nom complet</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData(prev => ({...prev, full_name: e.target.value}))}
                      placeholder="Nom complet"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                        placeholder="email@exemple.com"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Peut voir le profil</Label>
                        <p className="text-sm text-muted-foreground">Autoriser à voir votre profil complet</p>
                      </div>
                      <Switch
                        checked={formData.can_view_profile}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, can_view_profile: checked}))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Peut communiquer</Label>
                        <p className="text-sm text-muted-foreground">Autoriser à communiquer avec vos matches</p>
                      </div>
                      <Switch
                        checked={formData.can_communicate}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, can_communicate: checked}))}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Est le Wali</Label>
                        <p className="text-sm text-muted-foreground">Personne responsable de vos décisions matrimoniales</p>
                      </div>
                      <Switch
                        checked={formData.is_wali}
                        onCheckedChange={(checked) => setFormData(prev => ({...prev, is_wali: checked}))}
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1 bg-emerald hover:bg-emerald-dark text-primary-foreground">
                      {editingMember ? 'Modifier' : 'Ajouter'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setShowAddDialog(false);
                        setEditingMember(null);
                        resetForm();
                      }}
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {familyMembers.length > 0 ? (
            <div className="grid gap-4">
              {familyMembers.map((member) => (
                <Card key={member.id} className="animate-fade-in">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-foreground">{member.full_name}</h3>
                          <Badge variant="secondary">
                            {getRelationshipLabel(member.relationship)}
                          </Badge>
                          {member.is_wali && (
                            <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                              <Crown className="h-3 w-3 mr-1" />
                              Wali
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {member.email && <p>📧 {member.email}</p>}
                          {member.phone && <p>📱 {member.phone}</p>}
                        </div>

                        <div className="flex gap-2 mt-3">
                          {member.can_view_profile && (
                            <Badge variant="outline" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Peut voir le profil
                            </Badge>
                          )}
                          {member.can_communicate && (
                            <Badge variant="outline" className="text-xs">
                              💬 Peut communiquer
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(member)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(member.id)}
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
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">Aucun membre de famille ajouté</h3>
                <p className="text-muted-foreground mb-4">
                  Ajoutez des membres de votre famille pour les impliquer dans votre parcours matrimonial
                </p>
                <Button 
                  onClick={() => setShowAddDialog(true)}
                  className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter votre premier membre
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Family;