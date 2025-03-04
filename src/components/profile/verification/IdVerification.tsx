
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { ShieldCheck, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface IdVerificationProps {
  isVerified: boolean;
}

const IdVerification = ({ isVerified }: IdVerificationProps) => {
  const { toast } = useToast();

  const startIdVerification = () => {
    // In a real app, redirect to a KYC provider
    toast({
      title: "ID Verification",
      description: "This would redirect to an ID verification service in a production app",
    });
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <div>
          <Label>ID Verification</Label>
          <p className="text-xs text-gray-500">Verify your identity for maximum trust</p>
        </div>
      </div>
      <div>
        {isVerified ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <CustomButton
            size="sm"
            onClick={startIdVerification}
          >
            Verify ID
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default IdVerification;
