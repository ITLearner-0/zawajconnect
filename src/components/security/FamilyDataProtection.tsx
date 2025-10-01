import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, EyeOff, Users, Lock, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FamilyMember {
  id: string;
  full_name: string;
  relationship: string;
  invitation_status: string;
  can_view_profile: boolean;
  is_wali: boolean;
}

interface ContactSecuritySettings {
  contact_visibility: 'wali_only' | 'family' | 'private';
  encrypted: boolean;
  access_count: number;
  last_accessed_at: string | null;
}

export default function FamilyDataProtection() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [contactSettings, setContactSettings] = useState<ContactSecuritySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState({
    email_verified: false,
    id_verified: false,
    verification_score: 0
  });

  useEffect(() => {
    if (user) {
      loadFamilyData();
      loadVerificationStatus();
    }
  }, [user]);

  const loadFamilyData = async () => {
    try {
      const { data: familyData, error: familyError } = await supabase
        .from('family_members')
        .select('*')
        .eq('invitation_status', 'accepted')
        .order('created_at', { ascending: false });

      if (familyError) throw familyError;
      setFamilyMembers(familyData || []);

      if (familyData && familyData.length > 0) {
        const { data: securityData } = await supabase
          .from('family_contact_secure')
          .select('*')
          .eq('family_member_id', familyData[0].id)
          .maybeSingle();

        if (securityData) {
          setContactSettings({
            contact_visibility: (securityData.contact_visibility || 'wali_only') as 'wali_only' | 'family' | 'private',
            encrypted: true,
            access_count: securityData.access_count || 0,
            last_accessed_at: securityData.last_accessed_at
          });
        }
      }
    } catch (error) {
      console.error('Error loading family data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVerificationStatus = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('user_verifications')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data && !error) {
      setVerificationStatus({
        email_verified: data.email_verified || false,
        id_verified: data.id_verified || false,
        verification_score: data.verification_score || 0
      });
    }
  };

  const updateContactVisibility = async (visibility: 'wali_only' | 'family' | 'private') => {
    try {
      if (!familyMembers[0]?.id) return;

      const { error } = await supabase
        .from('family_contact_secure')
        .update({ contact_visibility: visibility })
        .eq('family_member_id', familyMembers[0].id);

      if (error) throw error;

      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de visibilité ont été enregistrées.",
      });

      loadFamilyData();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getVisibilityBadge = (visibility: string) => {
    const configs = {
      wali_only: { label: 'Wali uniquement', variant: 'default' as const, icon: Lock },
      family: { label: 'Famille', variant: 'secondary' as const, icon: Users },
      private: { label: 'Privé', variant: 'outline' as const, icon: EyeOff }
    };
    
    const config = configs[visibility as keyof typeof configs] || configs.private;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getSecurityScore = () => {
    let score = verificationStatus.verification_score;
    if (contactSettings?.encrypted) score += 10;
    return Math.min(score, 100);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  const securityScore = getSecurityScore();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle>Protection des données familiales</CardTitle>
            </div>
            <Badge variant={securityScore >= 80 ? "default" : "destructive"}>
              Score: {securityScore}/100
            </Badge>
          </div>
          <CardDescription>
            Contrôlez qui peut accéder aux informations de contact de votre famille
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              {verificationStatus.email_verified ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm">Email vérifié</span>
            </div>
            <div className="flex items-center gap-2">
              {verificationStatus.id_verified ? (
                <CheckCircle2 className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-destructive" />
              )}
              <span className="text-sm">ID vérifié</span>
            </div>
          </div>

          {contactSettings && (
            <div className="space-y-3 p-4 border rounded-lg">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Visibilité des contacts</label>
                {getVisibilityBadge(contactSettings.contact_visibility)}
              </div>
              <Select
                value={contactSettings.contact_visibility}
                onValueChange={(value: any) => updateContactVisibility(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="wali_only">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Wali uniquement (Score ≥85)
                    </div>
                  </SelectItem>
                  <SelectItem value="family">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Famille (Score ≥60)
                    </div>
                  </SelectItem>
                  <SelectItem value="private">
                    <div className="flex items-center gap-2">
                      <EyeOff className="w-4 h-4" />
                      Privé (Moi uniquement)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-2 mt-2">
                  <Eye className="w-3 h-3" />
                  <span>Accédé {contactSettings.access_count} fois</span>
                </div>
                {contactSettings.last_accessed_at && (
                  <div className="text-xs mt-1">
                    Dernier accès: {new Date(contactSettings.last_accessed_at).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membres de la famille</CardTitle>
          <CardDescription>
            {familyMembers.length} membre(s) avec accès
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {familyMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{member.full_name}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {member.relationship}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.is_wali && (
                    <Badge variant="default">Wali</Badge>
                  )}
                  {member.can_view_profile && (
                    <Badge variant="secondary">
                      <Eye className="w-3 h-3 mr-1" />
                      Peut voir
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            {familyMembers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucun membre de famille configuré
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {securityScore < 80 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Recommandations de sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {!verificationStatus.email_verified && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <span>Vérifiez votre adresse email (+20 points)</span>
                </li>
              )}
              {!verificationStatus.id_verified && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <span>Complétez la vérification d'identité (+35 points)</span>
                </li>
              )}
              {familyMembers.filter(m => m.is_wali).length === 0 && (
                <li className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-destructive mt-0.5" />
                  <span>Configurez un Wali pour renforcer la sécurité (+20 points)</span>
                </li>
              )}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}