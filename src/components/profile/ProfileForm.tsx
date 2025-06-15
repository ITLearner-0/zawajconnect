
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, EyeOff } from "lucide-react";
import BasicInformationSection from "./sections/BasicInfoSection";
import ReligiousSection from "./sections/ReligiousSection";
import EducationSection from "./sections/EducationSection";
import AboutSection from "./sections/AboutSection";
import WaliSection from "./sections/WaliSection";
import VerificationPanel from "./VerificationPanel";
import EnhancedPrivacySettings from "./EnhancedPrivacySettings";
import { useSecurityMiddleware } from "@/hooks/useSecurityMiddleware";
import { sanitizeProfileData } from "@/utils/security/inputSanitization";
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
    // Validate action before allowing changes
    const isValid = await validateAction('profile_update', { field, value });
    if (!isValid) return;

    // Sanitize input based on field type
    let sanitizedValue = value;
    if (typeof value === 'string') {
      const sanitizedData = sanitizeProfileData({ [field]: value });
      sanitizedValue = sanitizedData[field];
    }

    handleChange(field, sanitizedValue);
  };

  const handleSecureSubmit = async () => {
    // Validate action before submission
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
      // Sanitize all form data before submission
      const sanitizedData = sanitizeProfileData(formData);
      
      // Update form data with sanitized version
      Object.keys(sanitizedData).forEach(key => {
        if (sanitizedData[key] !== formData[key]) {
          handleChange(key, sanitizedData[key]);
        }
      });

      await handleSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a wrapper for verification change to match expected signature
  const handleVerificationUpdate = (newStatus: any) => {
    // Convert the newStatus object to individual field updates
    Object.keys(newStatus).forEach(field => {
      handleVerificationChange(field, newStatus[field]);
    });
  };

  // Create a wrapper for privacy settings change to match expected signature
  const handlePrivacyChange = (settings: PrivacySettings) => {
    // Convert the settings object to individual field updates
    Object.keys(settings).forEach(field => {
      handlePrivacySettingsChange(field, settings[field as keyof PrivacySettings]);
    });
  };

  return (
    <div className="space-y-6">
      {/* Security Status Indicator */}
      {!securityStatus.loading && (
        <Card className={`border-2 ${securityStatus.isSecure ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}`}>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Shield className={`h-4 w-4 ${securityStatus.isSecure ? 'text-green-600' : 'text-yellow-600'}`} />
              <span className={`text-sm font-medium ${securityStatus.isSecure ? 'text-green-800' : 'text-yellow-800'}`}>
                {securityStatus.isSecure ? 'Compte sécurisé' : 'Sécurité à améliorer'}
              </span>
            </div>
            {!securityStatus.emailVerified && (
              <p className="text-xs text-yellow-700 mt-1">
                Vérifiez votre email pour accéder à toutes les fonctionnalités
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
            Informations Personnelles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <BasicInformationSection
            formData={formData}
            handleChange={handleSecureChange}
          />
        </CardContent>
      </Card>

      {/* Religious Practice */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
            Pratique Religieuse
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ReligiousSection
            formData={formData}
            handleChange={handleSecureChange}
          />
        </CardContent>
      </Card>

      {/* Education & Career */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
            Éducation et Carrière
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EducationSection
            formData={formData}
            handleChange={handleSecureChange}
          />
        </CardContent>
      </Card>

      {/* About Me */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
            À Propos de Moi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AboutSection
            formData={formData}
            handleChange={handleSecureChange}
          />
        </CardContent>
      </Card>

      {/* Wali Information (for women) */}
      {formData.gender === "female" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
              Informations du Wali
            </CardTitle>
          </CardHeader>
          <CardContent>
            <WaliSection
              formData={formData}
              handleChange={handleSecureChange}
            />
          </CardContent>
        </Card>
      )}

      {/* Verification */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200">
            Vérification du Profil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <VerificationPanel
            verificationStatus={verificationStatus}
            userEmail={userEmail}
            onVerificationChange={handleVerificationUpdate}
          />
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-rose-800 dark:text-rose-200 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Paramètres de Confidentialité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EnhancedPrivacySettings
            userId={formData.id || ""}
            privacySettings={privacySettings}
            blockedUsers={blockedUsers}
            isAccountVisible={isAccountVisible}
            onPrivacyChange={handlePrivacyChange}
            onToggleAccountVisibility={onToggleAccountVisibility}
            onUnblockUser={onUnblockUser}
          />
        </CardContent>
      </Card>

      <Separator />

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button
          onClick={handleSecureSubmit}
          size="lg"
          className="bg-rose-600 hover:bg-rose-700 text-white px-8 py-3"
          disabled={isSubmitting || securityStatus.loading}
        >
          {isSubmitting ? "Sauvegarde en cours..." : "Sauvegarder le Profil"}
        </Button>
      </div>
    </div>
  );
};

export default ProfileForm;
