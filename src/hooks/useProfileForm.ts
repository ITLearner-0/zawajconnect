
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileFormData, VerificationStatus } from "@/types/profile";
import { geocodeLocation } from "@/utils/locationUtils";
import { updateUserCoordinates } from "@/utils/profileUtils";

interface UseProfileFormProps {
  initialFormData: ProfileFormData;
  initialVerificationStatus: VerificationStatus;
}

export const useProfileForm = ({ initialFormData, initialVerificationStatus }: UseProfileFormProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>(initialFormData);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>(initialVerificationStatus);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVerificationChange = (newStatus: VerificationStatus) => {
    setVerificationStatus(newStatus);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.error("No active session found");
      toast({
        title: "Error",
        description: "Please sign in to update your profile",
        variant: "destructive",
      });
      return;
    }

    const [firstName, ...lastNameParts] = formData.fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const profileData = {
      id: session.user.id,
      first_name: firstName,
      last_name: lastName,
      gender: formData.gender,
      location: formData.location,
      education_level: formData.education,
      occupation: formData.occupation,
      religious_practice_level: formData.religiousLevel,
      prayer_frequency: formData.prayerFrequency,
      about_me: formData.aboutMe,
      birth_date: formData.age ? new Date(new Date().getFullYear() - parseInt(formData.age), 0, 1).toISOString() : null,
    };

    console.log("Attempting to save profile with data:", profileData);

    // First, update the profile data
    const { error } = await supabase
      .from("profiles")
      .upsert(profileData);

    if (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Now, attempt to geocode the location and update coordinates
    if (formData.location) {
      try {
        const locationData = await geocodeLocation(formData.location);
        
        if (locationData) {
          // Update the user's coordinates
          await updateUserCoordinates(
            session.user.id,
            locationData.latitude,
            locationData.longitude
          );
          
          console.log("Updated user coordinates:", locationData);
        }
      } catch (err) {
        console.error("Error updating coordinates:", err);
        // We don't want to block the profile save if geocoding fails
      }
    }

    console.log("Profile saved successfully");
    toast({
      title: "Success",
      description: "Profile updated successfully",
      duration: 3000,
    });
    
    // Only navigate after a successful save
    navigate("/");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return {
    formData,
    verificationStatus,
    handleChange,
    handleVerificationChange,
    handleSubmit,
    handleSignOut,
  };
};
