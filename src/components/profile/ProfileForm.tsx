
import React, { useState } from "react";
import { Shield } from "lucide-react";
import BasicInformationSection from "./sections/BasicInfoSection";
import ReligiousSection from "./sections/ReligiousSection";
import EducationSection from "./sections/EducationSection";
import AboutSection from "./sections/AboutSection";
import WaliSection from "./sections/WaliSection";
import VerificationPanel from "./VerificationPanel";
import EnhancedPrivacySettings from "./EnhancedPrivacySettings";
import SecurityStatusCard from "./form/SecurityStatusCard";
import ProfileSection from "./form/ProfileSection";
import SubmitButton from "./form/SubmitButton";
import { useSecurityMiddleware } from "@/hooks/useSecurityMiddleware";
import { toast } from "sonner";
import { PrivacySettings } from "@/types/profile";

interface ProfileFormProps {
  formData: any;
  handleChange: (field: string, value: any) => void;
  handleSubmit: () => Promise<boolean>;
  verificationStatus: any;
  userEmail: string;
  handleVerificationChange: (field: string, value: boolean) => void;
  privacySettings: any;
  blockedUsers: string[];
  isAccountVisible: boolean;
  handlePrivacySettingsChange: (field: string, value: any) => void;
  onToggleAccountVisibility: () => Promise<void>;
  onUnblockUser: (userId: string) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  verificationStatus,
  userEmail,
  handleVerificationChange,
  privacySettings,
  blockedUsers,
  isAccountVisible,
  handlePrivacySettingsChange,
  onToggleAccountVisibility,
  onUnblockUser,
}) => {
  const { validateAction, securityStatus } = useSecurityMiddleware();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSecureChange = async (field: string, value: any) => {
    const isValid = await validateAction('profile_update', { field, value });
    if (!isValid) return;
    handleChange(field, value);
  };

  const handleSecureSubmit = async () => {
    const isValid = await validateAction('profile_save', formData);
    if (!isValid) return;

    if (!securityStatus.emailVerified) {
      toast.error("Vérification email requise", {
        description: "Veuillez vérifier votre email avant de sauvegarder le profil"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      console.log("Données du formulaire avant sauvegarde:", formData);
      const success = await handleSubmit();
      
      if (success) {
        toast.success("Profil sauvegardé avec succès!");
      } else {
        toast.error("Erreur lors de la sauvegarde du profil");
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      toast.error("Une erreur inattendue s'est produite");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationUpdate = (newStatus: any) => {
    Object.keys(newStatus).forEach(field => {
      handleVerificationChange(field, newStatus[field]);
    });
  };

  const handlePrivacyChange = (settings: PrivacySettings) => {
    Object.keys(settings).forEach(field => {
      handlePrivacySettingsChange(field, settings[field as keyof PrivacySettings]);
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <SecurityStatusCard securityStatus={securityStatus} />

      {/* Profile Sections */}
      <ProfileSection title="Informations Personnelles">
        <BasicInformationSection formData={formData} handleChange={handleSecureChange} />
      </ProfileSection>

      <ProfileSection title="Pratique Religieuse">
        <ReligiousSection formData={formData} handleChange={handleSecureChange} />
      </ProfileSection>

      <ProfileSection title="Éducation et Carrière">
        <EducationSection formData={formData} handleChange={handleSecureChange} />
      </ProfileSection>

      <ProfileSection title="À Propos de Moi">
        <AboutSection formData={formData} handleChange={handleSecureChange} />
      </ProfileSection>

      {formData.gender === "female" && (
        <ProfileSection title="Informations du Wali">
          <WaliSection formData={formData} handleChange={handleSecureChange} />
        </ProfileSection>
      )}

      <ProfileSection title="Vérification du Profil">
        <VerificationPanel
          verificationStatus={verificationStatus}
          userEmail={userEmail}
          onVerificationChange={handleVerificationUpdate}
        />
      </ProfileSection>

      <ProfileSection title="Paramètres de Confidentialité">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5" />
        </div>
        <EnhancedPrivacySettings
          userId={formData.id || ""}
          privacySettings={privacySettings}
          blockedUsers={blockedUsers}
          isAccountVisible={isAccountVisible}
          onPrivacyChange={handlePrivacyChange}
          onToggleAccountVisibility={onToggleAccountVisibility}
          onUnblockUser={onUnblockUser}
        />
      </ProfileSection>

      {/* Submit Button */}
      <SubmitButton 
        onSubmit={handleSecureSubmit}
        isSubmitting={isSubmitting}
        isLoading={securityStatus.loading}
      />
    </div>
  );
};

export default ProfileForm;
