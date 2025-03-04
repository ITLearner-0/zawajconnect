
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileFormData } from "@/types/profile";
import { geocodeLocation } from "@/utils/locationUtils";

export const useProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isNewUser, setIsNewUser] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    age: "",
    gender: "",
    location: "",
    education: "",
    occupation: "",
    religiousLevel: "",
    familyBackground: "",
    aboutMe: "",
    prayerFrequency: "five-daily",
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      console.log("Fetching profile for user:", session.user.id);
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (profile) {
        console.log("Profile data loaded:", profile);
        setFormData({
          fullName: `${profile.first_name || ""} ${profile.last_name || ""}`.trim(),
          age: profile.birth_date ? String(new Date().getFullYear() - new Date(profile.birth_date).getFullYear()) : "",
          gender: profile.gender || "",
          location: profile.location || "",
          education: profile.education_level || "",
          occupation: profile.occupation || "",
          religiousLevel: profile.religious_practice_level || "",
          familyBackground: "",
          aboutMe: profile.about_me || "",
          prayerFrequency: profile.prayer_frequency || "five-daily",
        });
        
        // Detect if this is a new user with minimal profile data
        setIsNewUser(
          !profile.first_name || 
          !profile.gender || 
          !profile.location || 
          !profile.religious_practice_level || 
          !profile.about_me
        );
      } else {
        // No profile found, definitely a new user
        setIsNewUser(true);
      }
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
    isNewUser,
    handleChange,
    handleSubmit,
    handleSignOut,
  };
};

// Function to update user coordinates via Supabase Edge Function
async function updateUserCoordinates(userId: string, latitude: number, longitude: number) {
  try {
    const { data, error } = await supabase.functions.invoke('update-coordinates', {
      body: { userId, latitude, longitude }
    });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating coordinates:', error);
    return false;
  }
}
