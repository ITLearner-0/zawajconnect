import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RetentionPolicy } from '@/types/profile';
import { Clock } from 'lucide-react';
import { setRetentionPolicy } from '@/services/messageLifecycleService';
import { useToast } from '@/hooks/use-toast';

interface RetentionSettingsProps {
  conversationId: string;
  currentPolicy?: RetentionPolicy;
  onPolicyChanged: (policy: RetentionPolicy) => void;
}

const RetentionSettings: React.FC<RetentionSettingsProps> = ({
  conversationId,
  currentPolicy,
  onPolicyChanged,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [autoDelete, setAutoDelete] = useState(currentPolicy?.auto_delete || false);
  const [retentionType, setRetentionType] = useState<'temporary' | 'permanent'>(
    currentPolicy?.type || 'temporary'
  );
  const [durationDays, setDurationDays] = useState<string>(
    (currentPolicy?.duration_days || 30).toString()
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const newPolicy: RetentionPolicy = {
      type: retentionType,
      auto_delete: autoDelete,
      duration_days: retentionType === 'temporary' ? parseInt(durationDays) : undefined,
    };

    const success = await setRetentionPolicy(conversationId, newPolicy);

    if (success) {
      onPolicyChanged(newPolicy);
      toast({
        title: 'Retention policy updated',
        description: autoDelete
          ? `Messages will automatically delete after ${durationDays} days`
          : 'Messages will be stored indefinitely',
      });
      setIsOpen(false);
    } else {
      toast({
        title: 'Failed to update retention policy',
        description: 'There was an error saving your settings. Please try again.',
        variant: 'destructive',
      });
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>Data Retention</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Message Retention Settings</DialogTitle>
          <DialogDescription>
            Configure how long messages are stored in this conversation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="auto-delete" className="flex flex-col space-y-1">
              <span>Auto-delete messages</span>
              <span className="font-normal text-xs text-muted-foreground">
                Automatically delete messages after a specific time period
              </span>
            </Label>
            <Switch id="auto-delete" checked={autoDelete} onCheckedChange={setAutoDelete} />
          </div>

          {autoDelete && (
            <>
              <div className="space-y-2">
                <Label htmlFor="retention-type">Retention Type</Label>
                <Select
                  value={retentionType}
                  onValueChange={(value: 'temporary' | 'permanent') => setRetentionType(value)}
                >
                  <SelectTrigger id="retention-type">
                    <SelectValue placeholder="Select retention type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="temporary">Temporary (time-based)</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {retentionType === 'temporary' && (
                <div className="space-y-2">
                  <Label htmlFor="duration-days">Retention Period (days)</Label>
                  <Select value={durationDays} onValueChange={setDurationDays}>
                    <SelectTrigger id="duration-days">
                      <SelectValue placeholder="Select days" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">365 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Settings'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RetentionSettings;
