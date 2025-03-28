
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";

const NearbyHeader = () => {
  const navigate = useNavigate();

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <CustomButton
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-4 hover:bg-islamic-teal/10 group"
            aria-label="Back to home"
          >
            <ArrowLeft className="mr-2 h-4 w-4 text-islamic-teal group-hover:translate-x-[-2px] transition-transform" />
            Back
          </CustomButton>
          <h1 className="text-3xl font-bold text-islamic-teal flex items-center gap-2 font-serif">
            Find Nearby Matches
            <Star className="h-5 w-5 text-islamic-gold" />
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <AccessibilityControls />
          <ThemeToggle />
        </div>
      </div>

      <IslamicPattern variant="divider" color="teal" />
    </>
  );
};

export default NearbyHeader;
