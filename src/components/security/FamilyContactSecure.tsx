import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Mail, Phone, Eye, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SecureContact {
  contact_type: string;
  contact_value: string;
  last_verified: string;
}

interface Props {
  familyMemberId: string;
}

/**
 * Secure component for displaying family member contact information
 * Only accessible to walis with verification_score >= 85 and id_verified = true
 * Uses the get_family_contact_secure() SECURITY DEFINER function
 */
export const FamilyContactSecure = ({ familyMemberId }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<SecureContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    if (user && familyMemberId) {
      loadSecureContact();
    }
  }, [user, familyMemberId]);

  const loadSecureContact = async () => {
    if (!user) return;

    setLoading(true);
    setAccessDenied(false);

    try {
      // Call the secure function to get contact info
      const { data, error } = await supabase
        .rpc('get_family_contact_secure', {
          family_member_uuid: familyMemberId
        });

      if (error) {
        if (error.message.includes('Access denied') || error.message.includes('Insufficient verification')) {
          setAccessDenied(true);
          toast({
            title: "Accès refusé",
            description: "Vous devez être un Wali vérifié (score ≥85, ID vérifiée) pour accéder aux coordonnées.",
            variant: "destructive"
          });
        } else {
          throw error;
        }
      } else {
        setContacts(data || []);
      }
    } catch (error) {
      console.error('Error loading secure contact:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de contact sécurisées",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-emerald/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Shield className="h-4 w-4 animate-pulse" />
            <span className="text-sm">Chargement sécurisé...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (accessDenied) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-destructive">
            <Lock className="h-4 w-4" />
            <span className="text-sm font-medium">Accès restreint aux Walis vérifiés</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Score de vérification ≥85 et ID vérifiée requis
          </p>
        </CardContent>
      </Card>
    );
  }

  if (contacts.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Aucune information de contact disponible
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald/20">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Shield className="h-4 w-4 text-emerald" />
          Informations de Contact Sécurisées
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {contacts.map((contact, index) => (
          <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              {contact.contact_type === 'email' ? (
                <Mail className="h-4 w-4 text-emerald" />
              ) : (
                <Phone className="h-4 w-4 text-emerald" />
              )}
              <span className="text-sm font-medium">{contact.contact_value}</span>
            </div>
            <Badge variant="outline" className="text-xs">
              <Eye className="h-3 w-3 mr-1" />
              Accès audité
            </Badge>
          </div>
        ))}
        <p className="text-xs text-muted-foreground mt-3">
          🔒 Cet accès est enregistré dans les logs de sécurité
        </p>
      </CardContent>
    </Card>
  );
};
