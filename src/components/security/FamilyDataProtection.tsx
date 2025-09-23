import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Lock, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  invitation_status: string;
  can_view_profile: boolean;
  is_wali: boolean;
  created_at: string;
}

interface ContactSecuritySettings {
  visibility: 'wali_only' | 'family' | 'private';
  encrypted: boolean;
  lastAccessed?: string;
  accessCount: number;
}

const FamilyDataProtection: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSecuritySettings>({
    visibility: 'wali_only',
    encrypted: true,
    accessCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState<{
    score: number;
    emailVerified: boolean;
    idVerified: boolean;
  } | null>(null);

  useEffect(() => {
    if (user) {
      loadFamilyData();
      loadVerificationStatus();
    }
  }, [user]);

  const loadFamilyData = async () => {
    if (!user) return;

    try {
      // Load family members using the secure view (without contact info)
      const { data: members, error } = await supabase
        .from('family_members')
        .select('id, full_name, relationship, invitation_status, can_view_profile, is_wali, created_at')
        .or(`user_id.eq.${user.id},invited_user_id.eq.${user.id}`)
        .eq('invitation_status', 'accepted');

      if (error) throw error;
      setFamilyMembers(members || []);

      // Check if user has any secure contact info
      const { data: contactData, error: contactError } = await supabase
        .from('family_contact_secure')
        .select('contact_visibility, access_count, last_accessed_at')
        .limit(1);

      if (!contactError && contactData?.length) {
        setContactSettings(prev => ({
          ...prev,
          visibility: contactData[0].contact_visibility as any,
          accessCount: contactData[0].access_count || 0,
          lastAccessed: contactData[0].last_accessed_at
        }));
      }

    } catch (error) {
      console.error('Failed to load family data:', error);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les données familiales",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_verifications')
        .select('verification_score, email_verified, id_verified')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      
      setVerificationStatus({
        score: data.verification_score || 0,
        emailVerified: data.email_verified || false,
        idVerified: data.id_verified || false
      });
    } catch (error) {
      console.error('Failed to load verification status:', error);
    }
  };

  const updateContactVisibility = async (newVisibility: 'wali_only' | 'family' | 'private') => {
    try {
      // This would be handled by a secure function in production
      toast({
        title: "Paramètres mis à jour",
        description: `Visibilité des contacts définie sur ${newVisibility}`,
      });
      
      setContactSettings(prev => ({
        ...prev,
        visibility: newVisibility
      }));
    } catch (error) {
      console.error('Failed to update contact visibility:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    switch (visibility) {
      case 'wali_only': return <Badge variant="default">Wali uniquement</Badge>;
      case 'family': return <Badge variant="secondary">Famille</Badge>;
      case 'private': return <Badge variant="outline">Privé</Badge>;
      default: return <Badge variant="outline">Non défini</Badge>;
    }
  };

  const getSecurityScore = () => {
    if (!verificationStatus) return 0;
    
    let score = verificationStatus.score;
    if (verificationStatus.emailVerified) score += 10;
    if (verificationStatus.idVerified) score += 15;
    if (contactSettings.encrypted) score += 5;
    
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Protection des Données Familiales</h2>
        <Badge variant={securityScore >= 80 ? "default" : securityScore >= 60 ? "secondary" : "destructive"}>
          Score: {securityScore}%
        </Badge>
      </div>

      {/* Security Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Statut de Sécurité</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{verificationStatus?.score || 0}%</div>
              <div className="text-sm text-muted-foreground">Score Vérification</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{familyMembers.length}</div>
              <div className="text-sm text-muted-foreground">Membres Famille</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold">{contactSettings.accessCount}</div>
              <div className="text-sm text-muted-foreground">Accès Contacts</div>
            </div>
          </div>

          {securityScore < 70 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Votre score de sécurité est faible. Complétez votre vérification pour une meilleure protection.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Contact Visibility Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5" />
            <span>Visibilité des Contacts</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Visibilité actuelle:</span>
            {getVisibilityBadge(contactSettings.visibility)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <Button
              variant={contactSettings.visibility === 'private' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateContactVisibility('private')}
            >
              <EyeOff className="h-4 w-4 mr-2" />
              Privé
            </Button>
            <Button
              variant={contactSettings.visibility === 'wali_only' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateContactVisibility('wali_only')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Wali uniquement
            </Button>
            <Button
              variant={contactSettings.visibility === 'family' ? 'default' : 'outline'}
              size="sm"
              onClick={() => updateContactVisibility('family')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Famille
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {contactSettings.lastAccessed && (
              <p>Dernier accès: {new Date(contactSettings.lastAccessed).toLocaleString('fr-FR')}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Family Members List */}
      <Card>
        <CardHeader>
          <CardTitle>Membres de la Famille</CardTitle>
        </CardHeader>
        <CardContent>
          {familyMembers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              Aucun membre de famille configuré
            </p>
          ) : (
            <div className="space-y-3">
              {familyMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-sm text-muted-foreground">{member.relationship}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {member.is_wali && <Badge variant="default">Wali</Badge>}
                    {member.can_view_profile && (
                      <Badge variant="secondary">
                        <Eye className="h-3 w-3 mr-1" />
                        Peut voir profil
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      {securityScore < 90 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="h-5 w-5" />
              <span>Recommandations de Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {!verificationStatus?.emailVerified && (
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>Vérifiez votre adresse email</span>
                </li>
              )}
              {!verificationStatus?.idVerified && (
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Complétez la vérification d'identité</span>
                </li>
              )}
              {(verificationStatus?.score || 0) < 70 && (
                <li className="flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span>Améliorez votre score de vérification en complétant votre profil</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FamilyDataProtection;