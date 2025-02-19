
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import CustomButton from "@/components/CustomButton";
import { useProfile } from "@/hooks/useProfile";
import BasicInformation from "@/components/profile/BasicInformation";
import EducationCareer from "@/components/profile/EducationCareer";
import ReligiousBackground from "@/components/profile/ReligiousBackground";
import AboutMe from "@/components/profile/AboutMe";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  const { formData, handleChange, handleSubmit, handleSignOut } = useProfile();

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
              <BasicInformation formData={formData} handleChange={handleChange} />
              <EducationCareer formData={formData} handleChange={handleChange} />
              <ReligiousBackground formData={formData} handleChange={handleChange} />
              <AboutMe formData={formData} handleChange={handleChange} />

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
