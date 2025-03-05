
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import CustomButton from "@/components/CustomButton";
import { ShieldCheck, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface IdVerificationProps {
  isVerified: boolean;
}

const IdVerification = ({ isVerified }: IdVerificationProps) => {
  const { toast } = useToast();

  const startIdVerification = async () => {
    try {
      // In a real app, redirect to a KYC provider
      // For this demo, we'll simulate verification
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("User not found");
      }
      
      // Update the profile with verification metadata
      const { error } = await supabase
        .from("profiles")
        .update({ 
          is_verified: true,
          verification_document_url: "id:verified" // Store verification method
        })
        .eq("id", user.id);
      
      if (error) throw error;
      
      toast({
        title: "ID Verification",
        description: "Your ID has been successfully verified",
      });
      
      // Refresh to update UI
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not complete verification. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-islamic-teal dark:text-islamic-brightGold" />
        <div>
          <Label className="text-islamic-burgundy dark:text-islamic-cream">ID Verification</Label>
          <p className="text-xs text-gray-500 dark:text-islamic-cream/70">Verify your identity for maximum trust</p>
        </div>
      </div>
      <div>
        {isVerified ? (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50"
          >
            <Check className="h-3 w-3" />
            Verified
          </Badge>
        ) : (
          <CustomButton
            size="sm"
            variant="gold"
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
