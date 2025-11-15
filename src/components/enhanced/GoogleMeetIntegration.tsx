import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Video, ExternalLink, Calendar, Users, Clock, Copy, CheckCircle } from 'lucide-react';

interface GoogleMeetIntegrationProps {
  matchId: string;
  partnerId: string;
  partnerName: string;
  onMeetingCreated?: (meetingLink: string) => void;
}

const GoogleMeetIntegration: React.FC<GoogleMeetIntegrationProps> = ({
  matchId,
  partnerId,
  partnerName,
  onMeetingCreated,
}) => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [meetingLink, setMeetingLink] = useState<string | null>(null);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const createGoogleMeetLink = async () => {
    setIsCreating(true);

    try {
      // Simulation de création de lien Google Meet
      // Dans une vraie implémentation, ceci appellerait l'API Google Meet
      const simulatedMeetingId = `meet-${Date.now()}`;
      const simulatedMeetingLink = `https://meet.google.com/${simulatedMeetingId}`;

      // Simuler un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setMeetingId(simulatedMeetingId);
      setMeetingLink(simulatedMeetingLink);

      toast({
        title: 'Réunion Google Meet créée',
        description: 'Le lien de la réunion a été généré avec succès',
      });

      onMeetingCreated?.(simulatedMeetingLink);
    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de créer la réunion Google Meet',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copyMeetingLink = async () => {
    if (meetingLink) {
      try {
        await navigator.clipboard.writeText(meetingLink);
        setCopied(true);
        toast({
          title: 'Lien copié',
          description: 'Le lien de la réunion a été copié dans le presse-papiers',
        });

        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de copier le lien',
          variant: 'destructive',
        });
      }
    }
  };

  const joinMeeting = () => {
    if (meetingLink) {
      window.open(meetingLink, '_blank');
    }
  };

  if (meetingLink) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-6 w-6 text-green-600" />
            Réunion Google Meet créée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-800 dark:text-green-200">
                Prêt à rejoindre
              </span>
            </div>
            <Badge variant="outline" className="text-green-700 border-green-300">
              <Users className="h-3 w-3 mr-1" />
              {partnerName}
            </Badge>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lien de la réunion:</p>
            <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
              <code className="flex-1 text-sm font-mono truncate">{meetingLink}</code>
              <Button variant="ghost" size="sm" onClick={copyMeetingLink} className="shrink-0">
                {copied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={joinMeeting}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Rejoindre sur Google Meet
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-1">
            <p>• La réunion s'ouvrira dans un nouvel onglet</p>
            <p>• Assurez-vous d'avoir une connexion internet stable</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-6 w-6 text-blue-600" />
          Appel via Google Meet
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-950/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold">{partnerName}</h3>
          <p className="text-sm text-muted-foreground">Créer une réunion Google Meet sécurisée</p>
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>Réunion instantanée</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Jusqu'à 100 participants</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Durée illimitée</span>
          </div>
        </div>

        <Button onClick={createGoogleMeetLink} disabled={isCreating} className="w-full" size="lg">
          {isCreating ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Création en cours...
            </>
          ) : (
            <>
              <Video className="h-4 w-4 mr-2" />
              Créer une réunion Google Meet
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>• Nécessite un compte Google</p>
          <p>• La réunion sera accessible immédiatement</p>
          <p>• Le lien peut être partagé avec votre partenaire</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoogleMeetIntegration;
