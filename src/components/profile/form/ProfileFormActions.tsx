import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ProfileFormActionsProps {
  onSubmit: () => Promise<boolean>;
  isSubmitting: boolean;
  hasErrors?: boolean;
}

const ProfileFormActions: React.FC<ProfileFormActionsProps> = ({
  onSubmit,
  isSubmitting,
  hasErrors = false,
}) => {
  const handleSubmitClick = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        {hasErrors && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please fix the errors above before saving your profile.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmitClick}
            disabled={isSubmitting || hasErrors}
            className="flex items-center gap-2"
            size="lg"
          >
            <Save className="h-4 w-4" />
            {isSubmitting ? 'Saving...' : 'Save Profile'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileFormActions;
