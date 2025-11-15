import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { UserPlus, Mail, Send, AlertCircle } from 'lucide-react';
import { familyMemberSchema } from '@/lib/validation';

interface FamilyInvitationFormProps {
  onInvitationSent?: () => void;
}

const FamilyInvitationForm: React.FC<FamilyInvitationFormProps> = ({ onInvitationSent }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [relationship, setRelationship] = useState('');
  const [isWali, setIsWali] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate with Zod
    const validationResult = familyMemberSchema.safeParse({
      full_name: fullName,
      email: email,
      relationship: relationship,
      isWali: isWali,
    });

    if (!validationResult.success) {
      // Extract and display errors
      const fieldErrors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          fieldErrors[issue.path[0].toString()] = issue.message;
        }
      });
      setErrors(fieldErrors);
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Non authentifié');
      }

      const response = await supabase.functions.invoke('send-family-invitation', {
        body: {
          fullName,
          email,
          relationship,
          isWali,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: 'Invitation envoyée !',
        description: `Une invitation a été envoyée à ${email}`,
      });

      // Reset form
      setFullName('');
      setEmail('');
      setRelationship('');
      setIsWali(false);

      onInvitationSent?.();
    } catch (error: unknown) {
      console.error('Error sending invitation:', error);
      const errorMessage =
        error instanceof Error ? error.message : "Impossible d'envoyer l'invitation";
      toast({
        title: 'Erreur',
        description: errorMessage,
        variant: 'destructive',
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
              onChange={(e) => {
                setFullName(e.target.value);
                if (errors.full_name) {
                  setErrors((prev) => ({ ...prev, full_name: '' }));
                }
              }}
              placeholder="Ex: Ahmed Ben Ali"
              className={errors.full_name ? 'border-destructive' : ''}
            />
            {errors.full_name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.full_name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: '' }));
                }
              }}
              placeholder="ahmed@example.com"
              className={errors.email ? 'border-destructive' : ''}
            />
            {errors.email && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="relationship">Relation familiale</Label>
            <Select
              value={relationship}
              onValueChange={(value) => {
                setRelationship(value);
                if (errors.relationship) {
                  setErrors((prev) => ({ ...prev, relationship: '' }));
                }
              }}
            >
              <SelectTrigger className={errors.relationship ? 'border-destructive' : ''}>
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
            {errors.relationship && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.relationship}
              </p>
            )}
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
                  Cette personne recevra un email d'invitation pour créer un compte et superviser
                  vos interactions selon les principes islamiques.
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
