import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProfileAnalytics } from "@/hooks/profile/useProfileAnalytics";
import { useProfileRecommendations } from "@/hooks/profile/useProfileRecommendations";
import { ProfileFormData, VerificationStatus, PrivacySettings } from "@/types/profile";

export const useProfilePageLogic = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasCompatibilityResults, setHasCompatibilityResults] = useState<boolean | null>(null);
  
  const { 
    formData, 
    isNewUser, 
    userEmail,
    userId,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    handleChange, 
    handleVerificationChange,
    handlePrivacySettingsChange: originalHandlePrivacySettingsChange,
    handleSubmit, 
    handleSignOut,
    toggleAccountVisibility,
    unblockUser
  } = useProfile();

  // Analytics and recommendations - use userId instead of userEmail
  const { analytics, loading: analyticsLoading } = useProfileAnalytics(userId);
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    handleRecommendationAction 
  } = useProfileRecommendations(userId);
  
  const {
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep
  } = useOnboarding(formData, isNewUser);

  // Visibility settings state
  const [visibilitySettings, setVisibilitySettings] = useState({
    isVisible: isAccountVisible,
    visibilityLevel: 80,
    showOnlyToMatches: false,
    hideFromSearch: false,
    temporaryHide: false,
    temporaryHideUntil: undefined
  });

  // Check if user has taken compatibility test
  useEffect(() => {
    const checkCompatibilityResults = async () => {
      if (!userId) return;
      
      try {
        console.log("Checking compatibility results for user:", userId);
        const { data, error } = await supabase
          .from('compatibility_results')
          .select('id')
          .eq('user_id', userId)
          .limit(1);

        if (error) {
          console.error("Error checking compatibility results:", error);
          setHasCompatibilityResults(false);
          return;
        }

        const hasResults = data && data.length > 0;
        console.log("User has compatibility results:", hasResults);
        setHasCompatibilityResults(hasResults);
      } catch (error) {
        console.error("Error checking compatibility results:", error);
        setHasCompatibilityResults(false);
      }
    };

    checkCompatibilityResults();
  }, [userId]);

  // Wrapper function to handle the save process and redirect
  const handleSaveProfile = async () => {
    console.log("Save profile button clicked");
    console.log("User ID:", userId);
    console.log("Has compatibility results:", hasCompatibilityResults);
    console.log("Form data:", formData);
    
    try {
      const success = await handleSubmit();
      console.log("Profile save result:", success);
      
      if (success) {
        console.log("Profile saved successfully");
        
        toast({
          title: "Profil Sauvegardé!",
          description: "Votre profil a été sauvegardé avec succès.",
        });
        
        // Check if user has taken compatibility test for navigation
        if (hasCompatibilityResults === false) {
          // Small delay to let the user see the success message
          setTimeout(() => {
            console.log("Redirecting to compatibility test");
            navigate("/compatibility");
          }, 2000);
        } else if (hasCompatibilityResults === true) {
          // If user has already taken the test, they can access nearby matches
          setTimeout(() => {
            console.log("User can now access nearby matches");
            // Don't automatically redirect, let user navigate manually
          }, 2000);
        }
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
          variant: "destructive",
        });
      }
      return success;
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Create a wrapper for privacy settings change to match expected signature
  const handlePrivacySettingsChange = (field: keyof PrivacySettings, value: any) => {
    const newSettings = { ...privacySettings, [field]: value };
    originalHandlePrivacySettingsChange(newSettings);
  };
  
  // Wrapper functions to convert boolean returns to void
  const handleToggleVisibility = async () => {
    await toggleAccountVisibility();
  };
  
  const handleUnblockUser = async (userId: string) => {
    await unblockUser(userId);
  };

  const handleVisibilitySettingsChange = (newSettings: any) => {
    setVisibilitySettings(newSettings);
    // Here you could also sync with backend if needed
  };

  return {
    // Profile data
    formData,
    isNewUser,
    userEmail,
    userId,
    verificationStatus,
    privacySettings,
    blockedUsers,
    isAccountVisible,
    hasCompatibilityResults,
    
    // Handlers - keep handleChange as is (React event handler)
    handleChange,
    handleVerificationChange, // This is already the correct signature from useProfile
    handlePrivacySettingsChange, // Now using the wrapper function
    handleSaveProfile,
    handleSignOut,
    handleToggleVisibility,
    handleUnblockUser,
    handleVisibilitySettingsChange,
    
    // Onboarding
    isOnboarding,
    currentStep,
    steps,
    handleNext,
    handlePrevious,
    completeOnboarding,
    canProceedCurrentStep,
    
    // Analytics and recommendations
    analytics,
    analyticsLoading,
    recommendations,
    recommendationsLoading,
    handleRecommendationAction,
    
    // Visibility settings
    visibilitySettings
  };
};
