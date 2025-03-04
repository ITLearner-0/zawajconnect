
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { Mail, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface EmailVerificationProps {
  isVerified: boolean;
  userEmail: string;
}

const EmailVerification = ({ isVerified, userEmail }: EmailVerificationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const sendEmailVerification = async () => {
    setLoading(true);
    try {
      await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      });
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and click the verification link",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-primary" />
        <div>
          <Label>Email Verification</Label>
          <p className="text-xs text-gray-500">Verify your email address</p>
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
            onClick={sendEmailVerification}
            disabled={loading}
          >
            Verify Email
          </CustomButton>
        )}
      </div>
    </div>
  );
};

export default EmailVerification;
