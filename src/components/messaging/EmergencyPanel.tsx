import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Shield, PhoneCall } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { reportEmergency } from '@/services/moderation/emergency';

interface EmergencyPanelProps {
  conversationId: string;
  userId: string | null;
  otherUserId: string;
}

const EmergencyPanel: React.FC<EmergencyPanelProps> = ({ conversationId, userId, otherUserId }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emergencyType, setEmergencyType] = useState<string | null>(null);

  const handleEmergencyAction = async (type: string) => {
    if (!userId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to use this feature',
        variant: 'destructive',
      });
      return;
    }

    setEmergencyType(type);
    setIsSubmitting(true);

    try {
      await reportEmergency(userId, otherUserId, conversationId, type);

      toast({
        title: 'Emergency Protocol Activated',
        description: 'Moderators have been notified and will respond shortly.',
        variant: 'default',
      });

      // For immediate threat, show additional guidance
      if (type === 'immediate_threat') {
        toast({
          title: 'Safety Alert',
          description: 'If you are in immediate danger, please contact local emergency services.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to activate emergency protocol. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setEmergencyType(null);
    }
  };

  return (
    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-700 dark:text-red-300 text-lg flex items-center">
          <AlertCircle className="h-5 w-5 mr-2" />
          Emergency Protocols
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-red-600 dark:text-red-300 mb-3">
          If you're experiencing inappropriate behavior or feel unsafe, use one of these options:
        </p>
        <div className="grid grid-cols-1 gap-2">
          <Button
            variant="outline"
            className="bg-white border-red-300 text-red-700 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
            onClick={() => handleEmergencyAction('harassment')}
            disabled={isSubmitting}
          >
            <Shield className="h-4 w-4 mr-2" />
            {isSubmitting && emergencyType === 'harassment' ? 'Reporting...' : 'Report Harassment'}
          </Button>

          <Button
            variant="outline"
            className="bg-white border-red-300 text-red-700 hover:bg-red-50 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800"
            onClick={() => handleEmergencyAction('inappropriate_content')}
            disabled={isSubmitting}
          >
            <AlertCircle className="h-4 w-4 mr-2" />
            {isSubmitting && emergencyType === 'inappropriate_content'
              ? 'Reporting...'
              : 'Report Inappropriate Content'}
          </Button>

          <Button
            variant="destructive"
            onClick={() => handleEmergencyAction('immediate_threat')}
            disabled={isSubmitting}
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            {isSubmitting && emergencyType === 'immediate_threat'
              ? 'Activating...'
              : 'Immediate Threat - Notify Admin'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmergencyPanel;
