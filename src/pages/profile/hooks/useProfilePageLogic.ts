import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";
import { useOnboarding } from "@/hooks/useOnboarding";
import { useProfileAnalytics } from "@/hooks/profile/useProfileAnalytics";
import { useProfileRecommendations } from "@/hooks/profile/useProfileRecommendations";
import { ProfileFormData, VerificationStatus, PrivacySettings } from "@/types/profile";

export const useProfilePageLogic = () => {
  console.log("useProfilePageLogic: Hook started");
  
  const { toast } = useToast();
  const [hasCompatibilityResults, setHasCompatibilityResults] = useState<boolean | null>(null);
  
  console.log("useProfilePageLogic: About to call useProfile");
  
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
    unblockUser,
    loading,
    error
  } = useProfile();

  console.log("useProfilePageLogic: useProfile returned:", {
    formData: !!formData,
    userId,
    loading,
    error
  });

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

  // Wrapper function to handle the save process
  const handleSaveProfile = async () => {
    console.log("=== PROFILE SAVE PROCESS STARTED ===");
    console.log("Save profile button clicked");
    console.log("User ID:", userId);
    console.log("Has compatibility results:", hasCompatibilityResults);
    console.log("Form data:", formData);
    
    if (!userId) {
      console.error("No user ID available for profile save");
      toast({
        title: "Erreur",
        description: "Identifiant utilisateur manquant. Veuillez vous reconnecter.",
        variant: "destructive",
      });
      return { success: false };
    }

    if (!formData) {
      console.error("No form data available for profile save");
      toast({
        title: "Erreur",
        description: "Données de profil manquantes. Veuillez rafraîchir la page.",
        variant: "destructive",
      });
      return { success: false };
    }
    
    try {
      console.log("Calling handleSubmit with form data:", formData);
      const success = await handleSubmit();
      console.log("handleSubmit returned:", success);
      
      if (success) {
        console.log("Profile saved successfully");
        
        toast({
          title: "Profil Sauvegardé!",
          description: "Votre profil a été sauvegardé avec succès.",
        });
        
        // Return navigation suggestion instead of navigating directly
        return {
          success: true,
          shouldNavigateToCompatibility: hasCompatibilityResults === false,
          message: hasCompatibilityResults === false ? 
            "Vous pouvez maintenant passer au test de compatibilité." : 
            "Profil sauvegardé avec succès."
        };
      } else {
        console.error("handleSubmit returned false - profile save failed");
        toast({
          title: "Erreur",
          description: "Impossible de sauvegarder le profil. Veuillez réessayer.",
          variant: "destructive",
        });
        return { success: false };
      }
    } catch (error) {
      console.error("=== ERROR IN PROFILE SAVE PROCESS ===");
      console.error("Error saving profile:", error);
      
      let errorMessage = "Une erreur inattendue s'est produite lors de la sauvegarde.";
      
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('session')) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = "Problème de connexion. Vérifiez votre connexion internet.";
        } else if (error.message.includes('validation')) {
          errorMessage = "Certains champs du profil ne sont pas valides. Veuillez vérifier vos données.";
        } else {
          errorMessage = `Erreur: ${error.message}`;
        }
      }
      
      toast({
        title: "Erreur de Sauvegarde",
        description: errorMessage,
        variant: "destructive",
      });
      
      return { success: false, error: errorMessage };
    } finally {
      console.log("=== PROFILE SAVE PROCESS ENDED ===");
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

  console.log("useProfilePageLogic: Returning final data:", {
    formData: !!formData,
    userId,
    loading,
    error
  });

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
    loading,
    error,
    
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
