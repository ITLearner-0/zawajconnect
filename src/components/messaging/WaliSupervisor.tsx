
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Shield, UserCheck } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

interface WaliSupervisorProps {
  waliName: string;
  onConfirmPresent: () => void;
}

const WaliSupervisor: React.FC<WaliSupervisorProps> = ({ 
  waliName, 
  onConfirmPresent 
}) => {
  const [open, setOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirmWali = () => {
    // Show confirmation dialog
    setOpen(true);
  };

  const handleVerifyWali = () => {
    setIsLoading(true);
    
    // Mock verification process
    // In a real app, this would send a verification code to the wali and verify it
    setTimeout(() => {
      setIsLoading(false);
      
      if (verificationCode === "123456" || verificationCode === "") {
        toast({
          title: "Wali Verification Successful",
          description: `${waliName || "Your wali"} has been verified for this call.`,
          variant: "default",
        });
        
        setOpen(false);
        onConfirmPresent();
      } else {
        toast({
          title: "Verification Failed",
          description: "The verification code is incorrect. Please try again.",
          variant: "destructive",
        });
      }
    }, 1500);
  };

  return (
    <>
      <div className="bg-amber-50 p-4 border-t border-amber-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-800">
            <Shield className="h-5 w-5 mr-2" />
            <div>
              <p className="font-medium">Wali Supervision Required</p>
              <p className="text-sm">Your wali must be present during video calls</p>
            </div>
          </div>
          
          <Button 
            onClick={handleConfirmWali}
            className="bg-amber-600 hover:bg-amber-700"
          >
            <UserCheck className="h-4 w-4 mr-2" />
            Confirm Wali Present
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Wali Presence</DialogTitle>
            <DialogDescription>
              Please confirm that {waliName || "your wali"} is present for this video call
              as required by Islamic guidelines.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              For demonstration purposes, you can use code "123456" or leave empty and click verify.
            </p>
            
            <div className="space-y-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="Enter verification code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                In a real app, this code would be sent to your wali's phone number.
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyWali} disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify Wali Present"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default WaliSupervisor;
