import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminWaliAlert } from '@/hooks/useAdminWaliAlerts';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Mail, Send, Loader2 } from 'lucide-react';
import { z } from 'zod';

interface WaliAlertContactModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alert: AdminWaliAlert | null;
}

const emailSchema = z.object({
  emailType: z.enum(['warning', 'inquiry', 'suspension']),
  subject: z
    .string()
    .trim()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne doit pas dépasser 200 caractères'),
  message: z
    .string()
    .trim()
    .min(20, 'Le message doit contenir au moins 20 caractères')
    .max(2000, 'Le message ne doit pas dépasser 2000 caractères'),
});

const WaliAlertContactModal: React.FC<WaliAlertContactModalProps> = ({
  open,
  onOpenChange,
  alert,
}) => {
  const { toast } = useToast();
  const [emailType, setEmailType] = useState<'warning' | 'inquiry' | 'suspension'>('inquiry');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (open && alert) {
      setEmailType('inquiry');
      setSubject(`Concernant l'alerte: ${alert.pattern_detected}`);
      setMessage('');
      setErrors({});
    }
  }, [open, alert]);

  const validateForm = () => {
    try {
      emailSchema.parse({
        emailType,
        subject,
        message,
      });
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach((issue) => {
          if (issue.path[0]) {
            newErrors[issue.path[0].toString()] = issue.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSend = async () => {
    if (!alert) return;

    if (!validateForm()) {
      toast({
        title: 'Erreur de validation',
        description: 'Veuillez corriger les erreurs dans le formulaire',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);

    try {
      // Call edge function to send email
      const { data, error } = await supabase.functions.invoke('send-wali-alert-email', {
        body: {
          alertId: alert.id,
          waliUserId: alert.wali_user_id,
          waliEmail: alert.wali_profile?.email || '',
          waliName: `${alert.wali_profile?.first_name} ${alert.wali_profile?.last_name}`,
          emailType,
          subject,
          message,
          alertDetails: {
            pattern: alert.pattern_detected,
            riskLevel: alert.risk_level,
            details: alert.details,
          },
        },
      });

      if (error) throw error;

      toast({
        title: 'Email envoyé',
        description: `L'email a été envoyé avec succès à ${alert.wali_profile?.first_name}`,
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error('Error sending email:', error);
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'envoyer l'email",
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  const getEmailTypeDescription = () => {
    switch (emailType) {
      case 'warning':
        return 'Avertissement formel concernant un comportement suspect';
      case 'inquiry':
        return "Demande d'information ou de clarification";
      case 'suspension':
        return 'Notification de suspension du compte wali';
      default:
        return '';
    }
  };

  const getDefaultMessage = () => {
    if (!alert) return '';

    switch (emailType) {
      case 'warning':
        return `Bonjour,\n\nNous avons détecté un comportement inhabituel sur votre compte wali. Cette alerte concerne: ${alert.pattern_detected}.\n\nNous vous demandons de réviser vos activités récentes et de vous assurer que toutes vos actions sont conformes à nos directives communautaires.\n\nSi vous avez des questions ou pensez qu'il s'agit d'une erreur, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe de modération`;

      case 'inquiry':
        return `Bonjour,\n\nNous aimerions obtenir des clarifications concernant une alerte récente sur votre compte: ${alert.pattern_detected}.\n\nPourriez-vous nous fournir plus d'informations sur cette situation?\n\nNous restons à votre disposition pour toute question.\n\nCordialement,\nL'équipe administrative`;

      case 'suspension':
        return `Bonjour,\n\nSuite à l'alerte concernant: ${alert.pattern_detected}, votre compte wali a été temporairement suspendu.\n\nCette mesure est prise pour assurer la sécurité de notre communauté. Vous pouvez soumettre un recours via le portail de support.\n\nCordialement,\nL'équipe de modération`;

      default:
        return '';
    }
  };

  // Auto-fill message when email type changes
  React.useEffect(() => {
    if (open && alert && !message) {
      setMessage(getDefaultMessage());
    }
  }, [emailType, open, alert]);

  if (!alert) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <DialogTitle>Contacter le Wali</DialogTitle>
          </div>
          <DialogDescription>
            Envoyer un email à {alert.wali_profile?.first_name} {alert.wali_profile?.last_name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Email Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="emailType">Type d'Email</Label>
            <Select value={emailType} onValueChange={(value: any) => setEmailType(value)}>
              <SelectTrigger id="emailType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inquiry">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Demande d'Information</span>
                    <span className="text-xs text-muted-foreground">
                      Pour obtenir des clarifications
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="warning">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Avertissement</span>
                    <span className="text-xs text-muted-foreground">
                      Notification de comportement suspect
                    </span>
                  </div>
                </SelectItem>
                <SelectItem value="suspension">
                  <div className="flex flex-col items-start">
                    <span className="font-medium">Notification de Suspension</span>
                    <span className="text-xs text-muted-foreground">
                      Informer d'une suspension de compte
                    </span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">{getEmailTypeDescription()}</p>
          </div>

          {/* Alert Context */}
          <div className="bg-muted/50 rounded-lg p-3 space-y-1">
            <p className="text-sm font-medium text-foreground">Contexte de l'alerte:</p>
            <p className="text-sm text-muted-foreground">
              <strong>Pattern:</strong> {alert.pattern_detected}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Niveau:</strong> {alert.risk_level}
            </p>
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Objet <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Objet de l'email"
              maxLength={200}
              className={errors.subject ? 'border-destructive' : ''}
            />
            {errors.subject && <p className="text-sm text-destructive">{errors.subject}</p>}
            <p className="text-xs text-muted-foreground">{subject.length}/200 caractères</p>
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Rédigez votre message..."
              rows={12}
              maxLength={2000}
              className={errors.message ? 'border-destructive' : ''}
            />
            {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
            <p className="text-xs text-muted-foreground">{message.length}/2000 caractères</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={sending}>
            Annuler
          </Button>
          <Button
            onClick={handleSend}
            disabled={sending || !subject.trim() || !message.trim()}
            className="gap-2"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Envoyer l'Email
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WaliAlertContactModal;
