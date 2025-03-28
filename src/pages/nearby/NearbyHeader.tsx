
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Star } from "lucide-react";
import CustomButton from "@/components/CustomButton";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import AccessibilityControls from "@/components/AccessibilityControls";
import { useIsMobile } from "@/hooks/use-mobile";

const NearbyHeader = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <CustomButton
            variant="ghost"
            onClick={() => navigate("/")}
            className="mr-2 sm:mr-4 hover:bg-islamic-teal/10 group p-2"
            aria-label="Back to home"
          >
            <ArrowLeft className="h-4 w-4 text-islamic-teal group-hover:translate-x-[-2px] transition-transform" />
            {!isMobile && <span className="ml-2">Back</span>}
          </CustomButton>
          <h1 className="text-xl sm:text-3xl font-bold text-islamic-teal flex items-center gap-2 font-serif">
            {isMobile ? "Nearby" : "Find Nearby Matches"}
            <Star className="h-4 w-4 sm:h-5 sm:w-5 text-islamic-gold" />
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
