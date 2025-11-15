import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { WaliRegistration } from '@/hooks/wali/useWaliRegistration';
import { Bell, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface NotificationSenderProps {
  registrations: WaliRegistration[];
  selectedIds: string[];
}

export const NotificationSender = ({ registrations, selectedIds }: NotificationSenderProps) => {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const { toast } = useToast();

  const selectedRegistrations = registrations.filter((r) => selectedIds.includes(r.id));

  const handleSend = async () => {
    if (!subject.trim() || !message.trim()) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs',
        variant: 'destructive',
      });
      return;
    }

    setSending(true);
    try {
      // Call edge function to send notifications
      const { error } = await supabase.functions.invoke('send-bulk-notifications', {
        body: {
          registrationIds: selectedIds,
          subject,
          message,
        },
      });

      if (error) throw error;

      toast({
        title: 'Notifications envoyées',
        description: `${selectedIds.length} notification(s) envoyée(s) avec succès`,
      });

      setOpen(false);
      setSubject('');
      setMessage('');
    } catch (error) {
      console.error('Error sending notifications:', error);
      toast({
        title: 'Erreur',
        description: "Erreur lors de l'envoi des notifications",
        variant: 'destructive',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" disabled={selectedIds.length === 0}>
          <Bell className="h-4 w-4 mr-2" />
          Notifier ({selectedIds.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Envoyer une notification groupée</DialogTitle>
          <DialogDescription>
            Envoyer un message à {selectedIds.length} Wali{selectedIds.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet</Label>
            <Input
              id="subject"
              placeholder="Objet de la notification..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="Votre message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
            />
          </div>

          <div className="rounded-md bg-muted p-3 text-sm">
            <p className="font-medium mb-1">Destinataires :</p>
            <ul className="list-disc list-inside text-muted-foreground">
              {selectedRegistrations.slice(0, 3).map((reg) => (
                <li key={reg.id}>
                  {reg.full_name} ({reg.email})
                </li>
              ))}
              {selectedRegistrations.length > 3 && (
                <li>... et {selectedRegistrations.length - 3} autre(s)</li>
              )}
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={sending}>
            Annuler
          </Button>
          <Button onClick={handleSend} disabled={sending}>
            {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Envoyer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
