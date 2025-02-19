
import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

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
}

const Profile = () => {
  const navigate = useNavigate();
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
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This is where we'll add Supabase integration later
    console.log("Form submitted:", formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-accent/50 to-background py-12">
      <div className="container max-w-3xl mx-auto px-4">
        <Card className="shadow-lg">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Create Your Profile</h1>
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
