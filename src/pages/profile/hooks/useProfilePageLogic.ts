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
    handlePrivacySettingsChange,
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
    
    try {
      const success = await handleSubmit();
      console.log("Profile save result:", success);
      
      if (success) {
        console.log("Profile saved successfully");
        
        // Check if user has taken compatibility test
        if (hasCompatibilityResults === false) {
          toast({
            title: "Profil Sauvegardé!",
            description: "Maintenant, complétez votre test de compatibilité pour trouver de meilleurs matches.",
          });
          
          // Small delay to let the user see the success message
          setTimeout(() => {
            console.log("Redirecting to compatibility test");
            navigate("/compatibility");
          }, 2000);
        } else {
          toast({
            title: "Profil Mis à Jour",
            description: "Votre profil a été mis à jour avec succès.",
          });
          
          // If user has already taken the test, redirect to nearby matches
          setTimeout(() => {
            console.log("Redirecting to nearby matches");
            navigate("/nearby");
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
  
  // Create a wrapper for verification change to match expected signature
  const handleVerificationFieldChange = (field: keyof VerificationStatus, value: boolean) => {
    handleVerificationChange(field, value);
  };

  // Create a wrapper for privacy settings change
  const handlePrivacyFieldChange = (field: keyof PrivacySettings, value: any) => {
    const newSettings = { ...privacySettings, [field]: value };
    handlePrivacySettingsChange(newSettings);
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
    handleVerificationFieldChange,
    handlePrivacyFieldChange,
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
