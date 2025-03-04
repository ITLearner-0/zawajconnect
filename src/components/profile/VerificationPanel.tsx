
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/CustomButton";
import { VerificationStatus } from "@/types/profile";
import { Check, Mail, Phone, ShieldCheck, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
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

  const sendPhoneVerification = async () => {
    setLoading(true);
    // In a real app, you would integrate with a service like Twilio
    // For this demo, we'll simulate sending a code
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowVerificationInput(true);
      toast({
        title: "Verification code sent",
        description: "We've sent a code to your phone number",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not send verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyPhone = async () => {
    setLoading(true);
    
    try {
      // In a real app, verify the code with backend
      // For this demo, accept any 6-digit code
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Update verification status
        const { error } = await supabase
          .from("profiles")
          .update({ phone_verified: true })
          .eq("id", (await supabase.auth.getUser()).data.user?.id);
        
        if (error) throw error;
        
        onVerificationChange({
          ...verificationStatus,
          phone: true,
        });
        
        setShowVerificationInput(false);
        toast({
          title: "Phone verified",
          description: "Your phone number has been successfully verified",
        });
      } else {
        toast({
          title: "Invalid code",
          description: "Please enter a valid 6-digit code",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not verify phone. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startIdVerification = () => {
    // In a real app, redirect to a KYC provider
    toast({
      title: "ID Verification",
      description: "This would redirect to an ID verification service in a production app",
    });
  };

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
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <Label>Email Verification</Label>
              <p className="text-xs text-gray-500">Verify your email address</p>
            </div>
          </div>
          <div>
            {verificationStatus.email ? (
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

        {/* Phone Verification */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" />
              <div>
                <Label>Phone Verification</Label>
                <p className="text-xs text-gray-500">Verify your phone number</p>
              </div>
            </div>
            <div>
              {verificationStatus.phone ? (
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Verified
                </Badge>
              ) : !showVerificationInput ? (
                <CustomButton
                  size="sm"
                  onClick={sendPhoneVerification}
                  disabled={loading || !phoneNumber}
                >
                  Send Code
                </CustomButton>
              ) : null}
            </div>
          </div>

          {!verificationStatus.phone && (
            <div className="space-y-2">
              <Input
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading || showVerificationInput}
              />

              {showVerificationInput && (
                <div className="mt-2 space-y-2">
                  <Input
                    placeholder="Enter verification code"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    disabled={loading}
                  />
                  <div className="flex justify-end space-x-2">
                    <CustomButton
                      size="sm"
                      variant="outline"
                      onClick={() => setShowVerificationInput(false)}
                      disabled={loading}
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      size="sm"
                      onClick={verifyPhone}
                      disabled={loading || verificationCode.length !== 6}
                    >
                      Verify
                    </CustomButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ID Verification */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <div>
              <Label>ID Verification</Label>
              <p className="text-xs text-gray-500">Verify your identity for maximum trust</p>
            </div>
          </div>
          <div>
            {verificationStatus.id ? (
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
                disabled={loading}
              >
                Verify ID
              </CustomButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default VerificationPanel;
