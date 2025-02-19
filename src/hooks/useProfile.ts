
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { ProfileFormData } from "@/types/profile";

export const useProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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

      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (!error && profile) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        title: "Error",
        description: "Please sign in to update your profile",
        variant: "destructive",
      });
      return;
    }

    const [firstName, ...lastNameParts] = formData.fullName.split(" ");
    const lastName = lastNameParts.join(" ");

    const { error } = await supabase
      .from("profiles")
      .upsert({
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
      });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return {
    formData,
    handleChange,
    handleSubmit,
    handleSignOut,
  };
};
