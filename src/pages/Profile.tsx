
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ProfileFormData {
  fullName: string;
  age: string;
  gender: string;
  location: string;
  education: string;
  occupation: string;
  religiousLevel: string;
  familyBackground: string;
  aboutMe: string;
  prayerFrequency: string;
}

const Profile = () => {
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
    prayerFrequency: "five-daily", // Default value
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      // Fetch profile data
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
      }, {
        onConflict: "id"
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-center">Create Your Profile</h1>
              <CustomButton variant="outline" onClick={handleSignOut}>
                Sign Out
              </CustomButton>
            </div>
            <p className="text-center text-gray-600">
              Share information about yourself to find compatible matches
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">
                  Basic Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      name="age"
                      type="number"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="Your age"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="City, Country"
                    />
                  </div>
                </div>
              </div>

              {/* Education & Career */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">
                  Education & Career
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Input
                      id="education"
                      name="education"
                      value={formData.education}
                      onChange={handleChange}
                      placeholder="Highest education achieved"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleChange}
                      placeholder="Current occupation"
                    />
                  </div>
                </div>
              </div>

              {/* Religious Background */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">
                  Religious Background
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="religiousLevel">Religious Practice Level</Label>
                    <select
                      id="religiousLevel"
                      name="religiousLevel"
                      value={formData.religiousLevel}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="">Select level</option>
                      <option value="very-practicing">Very practicing</option>
                      <option value="practicing">Practicing</option>
                      <option value="moderately-practicing">
                        Moderately practicing
                      </option>
                      <option value="learning">Learning more about Islam</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prayerFrequency">Prayer Frequency</Label>
                    <select
                      id="prayerFrequency"
                      name="prayerFrequency"
                      value={formData.prayerFrequency}
                      onChange={handleChange}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    >
                      <option value="five-daily">Five times daily</option>
                      <option value="regular">Regular but not all five</option>
                      <option value="sometimes">Sometimes</option>
                      <option value="learning">Learning to pray</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="familyBackground">Family Background</Label>
                    <textarea
                      id="familyBackground"
                      name="familyBackground"
                      value={formData.familyBackground}
                      onChange={handleChange}
                      placeholder="Share about your family background"
                      className="w-full min-h-[100px] px-3 py-2 rounded-md border border-input bg-background"
                    />
                  </div>
                </div>
              </div>

              {/* About Me */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-primary">About Me</h2>
                <div className="space-y-2">
                  <Label htmlFor="aboutMe">Tell us about yourself</Label>
                  <textarea
                    id="aboutMe"
                    name="aboutMe"
                    value={formData.aboutMe}
                    onChange={handleChange}
                    placeholder="Share more about yourself, your interests, and what you're looking for"
                    className="w-full min-h-[150px] px-3 py-2 rounded-md border border-input bg-background"
                  />
                </div>
              </div>

              <div className="flex justify-between pt-6">
                <CustomButton
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                >
                  Back
                </CustomButton>
                <CustomButton type="submit">Save Profile</CustomButton>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
