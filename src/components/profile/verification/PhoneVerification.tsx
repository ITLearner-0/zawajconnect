
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import CustomButton from "@/components/CustomButton";
import { Phone, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PhoneVerificationProps {
  isVerified: boolean;
}

const PhoneVerification = ({ isVerified }: PhoneVerificationProps) => {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showVerificationInput, setShowVerificationInput] = useState(false);
  const [loading, setLoading] = useState(false);

  const sendPhoneVerification = async () => {
    setLoading(true);
    // In a real app, you would integrate with a service like Twilio
    // For this demo, we'll simulate sending a code
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setShowVerificationInput(true);
      toast({
        title: "Code de vérification envoyé",
        description: "Nous avons envoyé un code à votre numéro de téléphone",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le code de vérification. Veuillez réessayer.",
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
        // Update verification status using the is_verified field with a phone_method metadata
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) throw new Error("Utilisateur non trouvé");
        
        // Update the profile with verification metadata
        const { error } = await supabase
          .from("profiles")
          .update({ 
            is_verified: true,
            verification_document_url: `phone:${phoneNumber}` // Store verification method and data
          })
          .eq("id", user.id);
        
        if (error) throw error;
        
        setShowVerificationInput(false);
        toast({
          title: "Téléphone vérifié",
          description: "Votre numéro de téléphone a été vérifié avec succès",
        });
        
        // Refresh the page to update the verification status
        window.location.reload();
      } else {
        toast({
          title: "Code invalide",
          description: "Veuillez entrer un code à 6 chiffres valide",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de vérifier le téléphone. Veuillez réessayer.",
        variant: "destructive",
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
            <Label>Vérification Téléphone</Label>
            <p className="text-xs text-gray-500">Vérifiez votre numéro de téléphone</p>
          </div>
        </div>
        <div>
          {isVerified ? (
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              Vérifié
            </Badge>
          ) : !showVerificationInput ? (
            <CustomButton
              size="sm"
              onClick={sendPhoneVerification}
              disabled={loading || !phoneNumber}
            >
              Envoyer Code
            </CustomButton>
          ) : null}
        </div>
      </div>

      {!isVerified && (
        <div className="space-y-2">
          <Input
            placeholder="Entrez votre numéro de téléphone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading || showVerificationInput}
          />

          {showVerificationInput && (
            <div className="mt-2 space-y-2">
              <Input
                placeholder="Entrez le code de vérification"
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
                  Annuler
                </CustomButton>
                <CustomButton
                  size="sm"
                  onClick={verifyPhone}
                  disabled={loading || verificationCode.length !== 6}
                >
                  Vérifier
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
