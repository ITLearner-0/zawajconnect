
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { submitContentReport } from '@/services/contentModerationService';
import { useToast } from '@/hooks/use-toast';
import { ContentReport } from '@/types/profile';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  messageId?: string;
  conversationId: string;
  currentUserId: string;
}

const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  userId,
  messageId,
  conversationId,
  currentUserId,
}) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ContentReport['report_type']>('inappropriate_message');
  const [reportDetails, setReportDetails] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reportDetails.trim()) {
      toast({
        title: "Error",
        description: "Please provide details about your report",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const report: Partial<ContentReport> = {
        reported_user_id: userId,
        reporting_user_id: currentUserId,
        report_type: reportType,
        content_reference: messageId || conversationId,
        report_details: reportDetails,
      };

      const success = await submitContentReport(report);

      if (success) {
        toast({
          title: "Report Submitted",
          description: "Thank you for your report. Our team will review it shortly.",
        });
        onClose();
        setReportDetails('');
        setReportType('inappropriate_message');
      } else {
        throw new Error("Failed to submit report");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit report. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to handle type-safe state setting
  const handleReportTypeChange = (value: string) => {
    setReportType(value as ContentReport['report_type']);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report Inappropriate Content</DialogTitle>
          <DialogDescription>
            Please provide details about why you're reporting this content or user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Report Type</Label>
            <RadioGroup value={reportType} onValueChange={handleReportTypeChange} className="space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate_message" id="inappropriate_message" />
                <Label htmlFor="inappropriate_message">Inappropriate Message</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inappropriate_profile" id="inappropriate_profile" />
                <Label htmlFor="inappropriate_profile">Inappropriate Profile</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="harassment" id="harassment" />
                <Label htmlFor="harassment">Harassment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="spam" id="spam" />
                <Label htmlFor="spam">Spam</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="impersonation" id="impersonation" />
                <Label htmlFor="impersonation">Impersonation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other">Other</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-details">Details</Label>
            <Textarea
              id="report-details"
              value={reportDetails}
              onChange={(e) => setReportDetails(e.target.value)}
              placeholder="Please provide specific details about the issue..."
              className="min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
