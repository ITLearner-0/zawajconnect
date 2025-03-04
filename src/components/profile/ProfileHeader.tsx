
import React from "react";
import CustomButton from "@/components/CustomButton";
import AccessibilityControls from "@/components/AccessibilityControls";

interface ProfileHeaderProps {
  onSignOut: () => void;
}

const ProfileHeader = ({ onSignOut }: ProfileHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 id="profile-heading" className="text-2xl font-bold text-center">Update Your Profile</h1>
      <div className="flex items-center gap-2">
        <AccessibilityControls />
        <CustomButton 
          variant="outline" 
          onClick={onSignOut}
          aria-label="Sign out of your account"
        >
          Sign Out
        </CustomButton>
      </div>
    </div>
  );
};

export default ProfileHeader;
