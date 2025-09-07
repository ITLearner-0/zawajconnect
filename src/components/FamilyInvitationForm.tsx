import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Send } from 'lucide-react';

interface FamilyInvitationFormProps {
  onInvitationSent?: () => void;
}

const FamilyInvitationForm: React.FC<FamilyInvitationFormProps> = ({ onInvitationSent }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isWali, setIsWali] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const response = await supabase.functions.invoke('send-family-invitation', {
        body: {
          fullName,
          email,
          relationship,
          isWali
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Invitation envoyée !",
        description: `Une invitation a été envoyée à ${email}`,
      });

      // Reset form
      setFullName('');
      setEmail('');
      setRelationship('');
      setIsWali(false);
      
      onInvitationSent?.();
    } catch (error: any) {
      console.error('Error sending invitation:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'invitation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-emerald/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-emerald-dark">
          <UserPlus className="h-5 w-5" />
          Inviter un membre de famille
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nom complet</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ex: Ahmed Ben Ali"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ahmed@example.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relation familiale</Label>
            <Select value={relationship} onValueChange={setRelationship} required>
              <SelectTrigger>
                <SelectValue placeholder="Choisir la relation" />
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
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isWali"
              checked={isWali}
              onCheckedChange={(checked) => setIsWali(checked === true)}
            />
            <Label htmlFor="isWali" className="text-sm">
              Désigner comme Wali (tuteur islamique) - peut superviser les communications
            </Label>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Information importante</p>
                <p className="text-sm text-amber-700">
                  Cette personne recevra un email d'invitation pour créer un compte et superviser vos interactions selon les principes islamiques.
                </p>
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald hover:bg-emerald-dark"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald border-t-transparent"></div>
                Envoi en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Envoyer l'invitation
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default FamilyInvitationForm;