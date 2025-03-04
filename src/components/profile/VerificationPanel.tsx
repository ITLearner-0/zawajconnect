
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { VerificationStatus } from "@/types/profile";
import EmailVerification from "./verification/EmailVerification";
import PhoneVerification from "./verification/PhoneVerification";
import IdVerification from "./verification/IdVerification";

interface VerificationPanelProps {
  verificationStatus: VerificationStatus;
  onVerificationChange: (newStatus: VerificationStatus) => void;
  userEmail: string;
}

const VerificationPanel = ({
  verificationStatus,
  onVerificationChange,
  userEmail,
}: VerificationPanelProps) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <h2 className="text-xl font-semibold text-primary">
          Verify Your Profile
        </h2>
        <p className="text-sm text-gray-600">
          Verified profiles receive more attention and trust from other users
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Verification */}
        <EmailVerification 
          isVerified={verificationStatus.email} 
          userEmail={userEmail} 
        />

        {/* Phone Verification */}
        <PhoneVerification 
          isVerified={verificationStatus.phone} 
        />

        {/* ID Verification */}
        <IdVerification 
          isVerified={verificationStatus.id} 
        />
      </CardContent>
    </Card>
  );
};

export default VerificationPanel;
