import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import StarRating from '@/components/StarRating';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Phone, Video, Wifi, AlertCircle } from 'lucide-react';

interface CallFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  callId: string;
  callType: 'audio' | 'video';
  callDuration: number; // in seconds
}

const TECHNICAL_ISSUES = [
  { id: 'audio_echo', label: 'Écho audio' },
  { id: 'audio_cutting', label: 'Audio coupé/saccadé' },
  { id: 'video_freezing', label: 'Vidéo gelée' },
  { id: 'video_blur', label: 'Vidéo floue' },
  { id: 'connection_dropped', label: 'Connexion perdue' },
  { id: 'delay_lag', label: 'Délai/latence importante' },
  { id: 'no_audio', label: 'Pas de son' },
  { id: 'no_video', label: 'Pas de vidéo' },
  { id: 'other', label: 'Autre problème' },
];

const CallFeedbackDialog = ({
  open,
  onOpenChange,
  callId,
  callType,
  callDuration,
}: CallFeedbackDialogProps) => {
  const { toast } = useToast();
  const [rating, setRating] = useState<number | null>(null);
  const [audioQuality, setAudioQuality] = useState<string>('good');
  const [videoQuality, setVideoQuality] = useState<string>(
    callType === 'audio' ? 'not_applicable' : 'good'
  );
  const [connectionStability, setConnectionStability] = useState<string>('good');
  const [technicalIssues, setTechnicalIssues] = useState<string[]>([]);
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleTechnicalIssueToggle = (issueId: string) => {
    setTechnicalIssues((prev) =>
      prev.includes(issueId) ? prev.filter((id) => id !== issueId) : [...prev, issueId]
    );
  };

  const handleSubmit = async () => {
    if (!rating) {
      toast({
        title: 'Évaluation requise',
        description: 'Veuillez donner une note globale avant de soumettre',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase.from('call_feedback').insert({
        call_id: callId,
        user_id: user.id,
        rating,
        audio_quality: audioQuality,
        video_quality: videoQuality,
        connection_stability: connectionStability,
        technical_issues: technicalIssues.length > 0 ? technicalIssues : null,
        comments: comments.trim() || null,
      });

      if (error) throw error;

      toast({
        title: 'Merci pour votre feedback !',
        description: 'Votre retour nous aide à améliorer la qualité des appels',
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: 'Erreur',
        description: "Impossible d'envoyer le feedback",
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Comment s'est passé votre appel ?</DialogTitle>
          <DialogDescription>
            Durée de l'appel : {formatDuration(callDuration)} • Aidez-nous à améliorer la qualité
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Évaluation globale *</Label>
            <div className="flex items-center gap-2">
              <StarRating rating={rating} onRatingChange={setRating} size="lg" />
              {rating && (
                <span className="text-sm text-muted-foreground ml-2">
                  {rating === 5
                    ? 'Excellent'
                    : rating === 4
                      ? 'Bon'
                      : rating === 3
                        ? 'Moyen'
                        : rating === 2
                          ? 'Médiocre'
                          : 'Mauvais'}
                </span>
              )}
            </div>
          </div>

          {/* Audio Quality */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Qualité audio
            </Label>
            <RadioGroup value={audioQuality} onValueChange={setAudioQuality}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="audio-excellent" />
                <Label htmlFor="audio-excellent" className="font-normal cursor-pointer">
                  Excellente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="audio-good" />
                <Label htmlFor="audio-good" className="font-normal cursor-pointer">
                  Bonne
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="audio-fair" />
                <Label htmlFor="audio-fair" className="font-normal cursor-pointer">
                  Correcte
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="audio-poor" />
                <Label htmlFor="audio-poor" className="font-normal cursor-pointer">
                  Mauvaise
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Video Quality (only for video calls) */}
          {callType === 'video' && (
            <div className="space-y-2">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Video className="h-4 w-4" />
                Qualité vidéo
              </Label>
              <RadioGroup value={videoQuality} onValueChange={setVideoQuality}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="excellent" id="video-excellent" />
                  <Label htmlFor="video-excellent" className="font-normal cursor-pointer">
                    Excellente
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="good" id="video-good" />
                  <Label htmlFor="video-good" className="font-normal cursor-pointer">
                    Bonne
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fair" id="video-fair" />
                  <Label htmlFor="video-fair" className="font-normal cursor-pointer">
                    Correcte
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="poor" id="video-poor" />
                  <Label htmlFor="video-poor" className="font-normal cursor-pointer">
                    Mauvaise
                  </Label>
                </div>
              </RadioGroup>
            </div>
          )}

          {/* Connection Stability */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <Wifi className="h-4 w-4" />
              Stabilité de la connexion
            </Label>
            <RadioGroup value={connectionStability} onValueChange={setConnectionStability}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excellent" id="connection-excellent" />
                <Label htmlFor="connection-excellent" className="font-normal cursor-pointer">
                  Excellente
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="good" id="connection-good" />
                <Label htmlFor="connection-good" className="font-normal cursor-pointer">
                  Bonne
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="fair" id="connection-fair" />
                <Label htmlFor="connection-fair" className="font-normal cursor-pointer">
                  Correcte
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="poor" id="connection-poor" />
                <Label htmlFor="connection-poor" className="font-normal cursor-pointer">
                  Mauvaise
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Technical Issues */}
          <div className="space-y-2">
            <Label className="text-base font-semibold flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Problèmes techniques rencontrés (optionnel)
            </Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {TECHNICAL_ISSUES.map((issue) => (
                <div key={issue.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={issue.id}
                    checked={technicalIssues.includes(issue.id)}
                    onCheckedChange={() => handleTechnicalIssueToggle(issue.id)}
                  />
                  <Label htmlFor={issue.id} className="font-normal cursor-pointer">
                    {issue.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments" className="text-base font-semibold">
              Commentaires supplémentaires (optionnel)
            </Label>
            <Textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Partagez vos impressions ou suggestions d'amélioration..."
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {comments.length}/500 caractères
            </p>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Ignorer
          </Button>
          <Button onClick={handleSubmit} disabled={!rating || isSubmitting}>
            {isSubmitting ? 'Envoi...' : 'Envoyer le feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CallFeedbackDialog;
