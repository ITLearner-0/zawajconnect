
import React from "react";
import CustomButton from "@/components/CustomButton";
import AccessibilityControls from "@/components/AccessibilityControls";
import { IslamicPattern } from "@/components/ui/islamic-pattern";
import { LogOut, User, Settings } from "lucide-react";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  return (
    <IslamicPattern variant="background" intensity="light" className="mb-6 rounded-lg bg-islamic-cream/30 dark:bg-islamic-darkCard/30">
      <div className="flex flex-col md:flex-row justify-between items-center p-4 gap-4">
        <div className="flex items-center">
          <div className="bg-islamic-teal rounded-full p-2 mr-3 text-white">
            <User className="h-6 w-6" />
          </div>
          <div>
            <h1 id="profile-heading" className="text-2xl font-bold text-islamic-teal dark:text-islamic-cream">
              Your Profile
            </h1>
            <p className="text-sm text-muted-foreground dark:text-islamic-cream/70">
              Update your information and privacy settings
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <AccessibilityControls />
          <CustomButton 
            variant="outline" 
            onClick={onSignOut}
            aria-label="Sign out of your account"
            className="flex items-center gap-2 border-islamic-teal/30 hover:bg-islamic-teal/10 dark:border-islamic-darkTeal/40 dark:hover:bg-islamic-darkTeal/20"
          >
            <LogOut className="h-4 w-4 text-islamic-burgundy dark:text-islamic-darkBrightGold" />
            Sign Out
          </CustomButton>
        </div>
      </div>
    </IslamicPattern>
  );
};

export default ProfileHeader;
