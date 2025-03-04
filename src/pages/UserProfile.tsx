
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dummyProfiles } from '@/data/dummyData';

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
        const foundProfile = dummyProfiles.find(p => p.id === id);
        
        if (foundProfile) {
          setProfile(foundProfile);
        } else {
          toast({
            title: "Profile not found",
            description: "We couldn't find the profile you're looking for.",
            variant: "destructive",
          });
          navigate('/demo');
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-t-2 border-islamic-teal rounded-full"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold">Profile Not Found</h2>
              <p className="text-muted-foreground mt-2">
                We couldn't find the profile you're looking for.
              </p>
              <Button 
                className="mt-4" 
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

  return (
    <div className="min-h-screen bg-accent/10 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ProfileHeader />
        
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
