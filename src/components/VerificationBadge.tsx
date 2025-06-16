
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface VerificationBadgeProps {
  type: "email" | "phone" | "id";
  verified: boolean;
}

const VerificationBadge = ({ type, verified }: VerificationBadgeProps) => {
  if (!verified) return null;

  const labels = {
    email: "Email Vérifié",
    phone: "Téléphone Vérifié",
    id: "Identité Vérifiée",
  };

  const descriptions = {
    email: "L'utilisateur a vérifié son adresse email",
    phone: "L'utilisateur a vérifié son numéro de téléphone",
    id: "L'utilisateur a complété la vérification d'identité",
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1"
          >
            <Check className="h-3 w-3" />
            {labels[type]}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{descriptions[type]}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default VerificationBadge;
