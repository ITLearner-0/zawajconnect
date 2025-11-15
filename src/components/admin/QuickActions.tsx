import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, Check, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuickActions: React.FC = () => {
  const { toast } = useToast();

  const handleReviewPendingReports = () => {
    toast({
      title: 'Opening Pending Reports',
      description: 'Navigating to pending reports review section.',
    });
  };

  const handleEmergencyProtocol = () => {
    toast({
      title: 'Emergency Protocol',
      description: 'Initiating emergency protocol simulation.',
      variant: 'destructive',
    });
  };

  const handleVerifyWalis = () => {
    toast({
      title: 'Wali Verification',
      description: 'Opening Wali verification queue.',
    });
  };

  const handleSetupEmergencySystem = () => {
    // In a real app, this would trigger the emergency system setup
    toast({
      title: 'System Setup',
      description: 'Setting up emergency response system...',
    });

    // Simulate success after 2 seconds
    setTimeout(() => {
      toast({
        title: 'Setup Complete',
        description: 'Emergency response system is now active.',
        variant: 'default',
      });
    }, 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button
          className="w-full flex items-center justify-start bg-islamic-teal text-white hover:bg-islamic-teal/90"
          onClick={handleReviewPendingReports}
        >
          <Check className="h-4 w-4 mr-2" />
          Review Pending Reports
        </Button>

        <Button
          className="w-full flex items-center justify-start bg-red-600 text-white hover:bg-red-700"
          onClick={handleEmergencyProtocol}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Emergency Protocol Center
        </Button>

        <Button
          className="w-full flex items-center justify-start bg-islamic-brightGold text-islamic-burgundy hover:bg-islamic-brightGold/90"
          onClick={handleVerifyWalis}
        >
          <Shield className="h-4 w-4 mr-2" />
          Verify Wali Profiles
        </Button>

        <Button
          className="w-full flex items-center justify-start"
          variant="outline"
          onClick={handleSetupEmergencySystem}
        >
          <Users className="h-4 w-4 mr-2" />
          Setup Emergency Response System
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
