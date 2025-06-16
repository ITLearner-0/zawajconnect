
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
    email: "Email Verified",
    phone: "Phone Verified",
    id: "ID Verified",
  };

  const descriptions = {
    email: "User has verified their email address",
    phone: "User has verified their phone number",
    id: "User has completed identity verification",
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
