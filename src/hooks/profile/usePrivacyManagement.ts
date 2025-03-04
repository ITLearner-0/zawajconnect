
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { PrivacySettings } from "@/types/profile";

interface UsePrivacyManagementProps {
  initialPrivacySettings?: PrivacySettings;
}

export const usePrivacyManagement = ({ 
  initialPrivacySettings 
}: UsePrivacyManagementProps) => {
  const { toast } = useToast();
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>(
    initialPrivacySettings || {
      profileVisibilityLevel: 1,
      showAge: true,
      showLocation: true,
      showOccupation: true,
      allowNonMatchMessages: true,
    }
  );

  const handlePrivacySettingsChange = (newSettings: PrivacySettings) => {
    setPrivacySettings(newSettings);
  };

  const updatePrivacySettingsInDB = async (userId: string) => {
    try {
      // Ensure privacy_settings column exists
      await supabase.rpc('execute_sql', {
        sql_query: `
          ALTER TABLE profiles ADD COLUMN IF NOT EXISTS privacy_settings JSONB 
          DEFAULT '{"profileVisibilityLevel": 1, "showAge": true, "showLocation": true, "showOccupation": true, "allowNonMatchMessages": true}'::jsonb;
        `
      });

      const { error } = await supabase
        .from("profiles")
        .update({ 
          privacy_settings: privacySettings 
        })
        .eq("id", userId);
        
      if (error) {
        console.error("Error updating privacy settings:", error);
        toast({
          title: "Error",
          description: "Failed to update privacy settings",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (err) {
      console.error("Error updating privacy settings:", err);
      return false;
    }
  };

  return {
    privacySettings,
    handlePrivacySettingsChange,
    updatePrivacySettingsInDB
  };
};
