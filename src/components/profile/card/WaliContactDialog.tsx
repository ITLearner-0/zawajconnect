import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DatabaseProfile } from '@/types/profile';
import CustomButton from '@/components/CustomButton';
import { useToast } from '@/components/ui/use-toast';

interface WaliContactDialogProps {
  profile: DatabaseProfile;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const WaliContactDialog = ({ profile, open, onOpenChange }: WaliContactDialogProps) => {
  const { toast } = useToast();

  const handleWaliContact = () => {
    toast({
      title: 'Wali contact initiated',
      description: 'Contact request sent to the wali.',
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Wali Contact Information</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            According to Islamic tradition, communication with {profile.full_name} requires wali
            permission.
          </p>

          <div className="bg-accent/20 p-4 rounded-md">
            <h3 className="font-medium">Wali Details:</h3>
            <p>
              <span className="font-medium">Name:</span> {profile.wali_name}
            </p>
            <p>
              <span className="font-medium">Relationship:</span> {profile.wali_relationship}
            </p>
            <p>
              <span className="font-medium">Contact:</span> {profile.wali_contact}
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <CustomButton variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </CustomButton>
            <CustomButton variant="teal" onClick={handleWaliContact}>
              Contact Wali
            </CustomButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaliContactDialog;
