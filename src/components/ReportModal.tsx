import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ReportModalProps {
  reportedUserId: string;
  reportedUserName?: string;
  children: React.ReactNode;
}

const ReportModal = ({ reportedUserId, reportedUserName, children }: ReportModalProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Contenu inapproprié' },
    { value: 'fake_profile', label: 'Faux profil' },
    { value: 'harassment', label: 'Harcèlement' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Autre' },
  ];

  const handleSubmit = async () => {
    if (!reportType || !description.trim()) {
      toast({
        title: 'Informations manquantes',
        description: 'Veuillez sélectionner un type et décrire le problème',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Non authentifié');

      // Verify the reported user exists before creating the report
      const { data: reportedProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', reportedUserId)
        .maybeSingle();

      if (!reportedProfile) {
        toast({
          title: 'Utilisateur non trouvé',
          description: "Cet utilisateur n'existe plus",
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.user.id,
        reported_user_id: reportedUserId,
        report_type: reportType,
        description: description.trim(),
      });

      if (error) throw error;

      toast({
        title: 'Signalement envoyé',
        description: 'Merci, nous examinerons votre signalement',
      });

      setOpen(false);
      setReportType('');
      setDescription('');
    } catch (error) {
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le signalement",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Signaler {reportedUserName || 'cet utilisateur'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Type de problème</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner le type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description détaillée</Label>
            <Textarea
              placeholder="Décrivez le problème en détail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSubmit} disabled={loading} className="flex-1">
              {loading ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;
