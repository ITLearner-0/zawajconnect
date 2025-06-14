
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dummyProfiles } from '@/data/profiles';

// Import the refactored components
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileCard from '@/components/profile/ProfileCard';
import ProfileDetails from '@/components/profile/ProfileDetails';
import ProfileQuote from '@/components/profile/ProfileQuote';

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<DatabaseProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        console.log("Fetching profile with ID:", id);
        
        // First check if this is a demo profile
        const demoProfile = dummyProfiles.find(p => p.id === id);
        
        if (demoProfile) {
          console.log("Found demo profile:", demoProfile);
          setProfile(demoProfile);
        } else {
          // If not a demo profile, try to fetch from database
          console.log("Not a demo profile, fetching from database...");
          // Add your real profile fetching logic here
          
          // If profile not found
          if (!demoProfile) {
            console.error("Profile not found with ID:", id);
            toast({
              title: "Profile not found",
              description: "We couldn't find the profile you're looking for.",
              variant: "destructive",
            });
            navigate('/demo');
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "There was a problem loading this profile.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProfile();
    }
  }, [id, navigate, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <div className="animate-spin h-12 w-12 border-t-2 border-rose-600 dark:border-rose-300 rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950">
        <Card className="w-full max-w-md bg-white/80 dark:bg-rose-900/80 backdrop-blur-sm border-rose-200 dark:border-rose-700">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-rose-800 dark:text-rose-200">Profile Not Found</h2>
              <p className="text-rose-600 dark:text-rose-300 mt-2">
                We couldn't find the profile you're looking for.
              </p>
              <Button 
                className="mt-4 bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white" 
                onClick={() => navigate('/demo')}
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSignOut = () => {
    navigate('/');
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ProfileHeader onSignOut={handleSignOut} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <ProfileCard profile={profile} />
          </div>

          <div className="md:col-span-2">
            <ProfileDetails profile={profile} />
            <ProfileQuote />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
