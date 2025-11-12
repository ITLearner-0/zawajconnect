import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import CustomButton from '@/components/CustomButton';
import { Phone, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PhoneVerificationProps {
  isVerified: boolean;
}

const PhoneVerification = ({ isVerified }: PhoneVerificationProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendPhoneVerification = async () => {
    setLoading(true);
    // In a real app, you would integrate with a service like Twilio
    // For this demo, we'll simulate sending a code

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setShowVerificationInput(true);
      toast({
        title: 'Verification code sent',
        description: "We've sent a code to your phone number",
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not send verification code. Please try again.',
        variant: 'destructive',
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
        // Update verification status using the is_verified field with a phone_method metadata
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) throw new Error('User not found');

        // Update the profile with verification metadata
        const { error } = await supabase
          .from('profiles')
          .update({
            phone_verified: true,
            is_verified: true,
            verification_document_url: `phone:${phoneNumber}`,
          })
          .eq('id', user.id);

        if (error) throw error;

        setShowVerificationInput(false);
        toast({
          title: 'Phone verified',
          description: 'Your phone number has been successfully verified',
        });

        // Refresh the page to update the verification status
        window.location.reload();
      } else {
        toast({
          title: 'Invalid code',
          description: 'Please enter a valid 6-digit code',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Could not verify phone. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
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
          {isVerified ? (
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

      {!isVerified && (
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
  );
};

export default PhoneVerification;
