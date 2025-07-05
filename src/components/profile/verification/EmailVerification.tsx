
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
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/profile`
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Email de vérification envoyé",
        description: "Veuillez vérifier votre boîte mail et cliquer sur le lien de vérification",
      });
    } catch (error: any) {
      console.error("Email verification error:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer l'email. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <Mail className="h-5 w-5 text-islamic-teal dark:text-islamic-brightGold" />
        <div>
          <Label className="text-islamic-burgundy dark:text-islamic-cream">Email Verification</Label>
          <p className="text-xs text-gray-500 dark:text-islamic-cream/70">Verify your email address</p>
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
