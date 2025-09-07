import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, LogIn, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const FamilyAccessPortal = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleFamilyAccess = async () => {
    if (!email.trim()) {
      toast({
        title: "Email requis",
        description: "Veuillez saisir votre adresse email",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Check if email belongs to a family member
      const { data: familyMember, error } = await supabase
        .from('family_members')
        .select(`
          *,
          profiles!inner(full_name, user_id)
        `)
        .eq('email', email.trim())
        .single();

      if (error || !familyMember) {
        toast({
          title: "Accès non autorisé",
          description: "Cette adresse email n'est pas associée à un membre de famille autorisé",
          variant: "destructive"
        });
        return;
      }

      // Generate access token and redirect to supervision dashboard
      const accessToken = btoa(`${familyMember.id}:${Date.now()}`);
      localStorage.setItem('family_access_token', accessToken);
      localStorage.setItem('family_member_data', JSON.stringify(familyMember));
      
      toast({
        title: "Accès autorisé",
        description: `Bienvenue ${familyMember.full_name}`,
      });

      // Redirect to supervision dashboard
      window.location.href = '/family-supervision';
    } catch (error) {
      console.error('Error accessing family portal:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de l'accès au portail familial",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald/5 to-sage/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-emerald/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-emerald" />
            </div>
          </div>
          <CardTitle className="text-2xl">Portail Familial Islamique</CardTitle>
          <p className="text-muted-foreground">
            Accès réservé aux tuteurs et membres de famille autorisés
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              <strong>Supervision Conforme à la Sharia :</strong> Ce portail permet aux tuteurs (Wali) 
              et membres de famille de superviser les communications dans le respect des principes islamiques.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse Email Autorisée</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="votre.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  onKeyPress={(e) => e.key === 'Enter' && handleFamilyAccess()}
                />
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Utilisez l'email que vous avez fourni lors de la configuration familiale
              </p>
            </div>

            <Button
              onClick={handleFamilyAccess}
              disabled={loading}
              className="w-full bg-emerald hover:bg-emerald-dark text-primary-foreground"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Vérification...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Accéder à la Supervision
                </div>
              )}
            </Button>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-semibold text-sm mb-2">Principes de Supervision Islamique :</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Protection de la dignité et de l'honneur</li>
              <li>• Guidance selon les enseignements islamiques</li>
              <li>• Supervision bienveillante et respectueuse</li>
              <li>• Accompagnement vers un mariage halal</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FamilyAccessPortal;