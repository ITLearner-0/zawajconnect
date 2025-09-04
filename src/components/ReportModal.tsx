import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertTriangle } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportedUserId: string;
  reportedUserName: string;
}

const ReportModal = ({ isOpen, onClose, reportedUserId, reportedUserName }: ReportModalProps) => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reportType || !description.trim()) return;

    setSubmitting(true);
    try {
      await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId,
          report_type: reportType,
          description: description.trim()
        });

      alert('Signalement envoyé avec succès. Notre équipe va examiner votre rapport.');
      onClose();
      setReportType('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert('Erreur lors de l\'envoi du signalement. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const reportTypes = [
    { value: 'inappropriate_content', label: 'Contenu inapproprié' },
    { value: 'fake_profile', label: 'Faux profil' },
    { value: 'harassment', label: 'Harcèlement' },
    { value: 'spam', label: 'Spam' },
    { value: 'other', label: 'Autre' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Signaler {reportedUserName}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="report-type">Type de signalement</Label>
            <Select value={reportType} onValueChange={setReportType} required>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez le type de problème" />
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

          <div>
            <Label htmlFor="description">Description détaillée</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Décrivez le problème en détail..."
              rows={4}
              required
            />
          </div>

          <div className="bg-muted/50 p-4 rounded-md">
            <p className="text-sm text-muted-foreground">
              <strong>Note importante :</strong> Les signalements abusifs peuvent entraîner des sanctions sur votre compte. 
              Assurez-vous que votre signalement est justifié et basé sur des faits réels.
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="submit"
              disabled={submitting || !reportType || !description.trim()}
              className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {submitting ? 'Envoi...' : 'Envoyer le signalement'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ReportModal;