import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatabaseProfile } from '@/types/profile';
import { ArrowLeft, User } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dummyProfiles } from '@/data/profiles';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        console.log("Fetching profile with ID:", id);
        
        // First check if this is a demo profile
        const demoProfile = dummyProfiles.find(p => p.id === id);
        
        if (demoProfile) {
          console.log("Found demo profile:", demoProfile);
          setProfile(demoProfile);
          setLoading(false);
          return;
        }

        // If not a demo profile, try to fetch from database
        console.log("Not a demo profile, fetching from database...");
        
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', id)
          .eq('is_visible', true)
          .single();

        if (error) {
          console.error("Error fetching profile from database:", error);
          
          // If it's a "not found" error, show appropriate message
          if (error.code === 'PGRST116') {
            toast({
              title: "Profile not found",
              description: "This profile may have been removed or is no longer visible.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "There was a problem loading this profile.",
              variant: "destructive",
            });
          }
          
          // Don't redirect immediately, let user decide
          setProfile(null);
          setLoading(false);
          return;
        }

        if (profileData) {
          // Convert database profile to DatabaseProfile format
          const formattedProfile: DatabaseProfile = {
            id: profileData.id,
            first_name: profileData.first_name || '',
            last_name: profileData.last_name || '',
            gender: profileData.gender || '',
            location: profileData.location || '',
            education_level: profileData.education_level || '',
            occupation: profileData.occupation || '',
            religious_practice_level: profileData.religious_practice_level || '',
            birth_date: profileData.birth_date || '',
            about_me: profileData.about_me || '',
            prayer_frequency: profileData.prayer_frequency || '',
            wali_name: profileData.wali_name || '',
            wali_relationship: profileData.wali_relationship || '',
            wali_contact: profileData.wali_contact || '',
            profile_picture: profileData.profile_picture || '',
            gallery: profileData.gallery || [],
            email_verified: profileData.email_verified || false,
            phone_verified: profileData.phone_verified || false,
            id_verified: profileData.id_verified || false,
            wali_verified: profileData.wali_verified || false,
            is_visible: profileData.is_visible || false,
            privacy_settings: profileData.privacy_settings || {
              profileVisibilityLevel: 1,
              showAge: true,
              showLocation: true,
              showOccupation: true,
              allowNonMatchMessages: true
            },
            blocked_users: profileData.blocked_users || [],
            content_flags: [],
            moderation_status: 'approved',
            last_moderation_date: null,
            created_at: profileData.created_at || '',
            updated_at: profileData.updated_at || ''
          };
          
          console.log("Found database profile:", formattedProfile);
          setProfile(formattedProfile);
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

    fetchProfile();
  }, [id, toast]);

  const handleEditMyProfile = () => {
    navigate('/profile');
  };

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
                We couldn't find the profile you're looking for. It may have been removed or is no longer visible.
              </p>
              <div className="flex gap-2 mt-4 justify-center">
                <Button 
                  className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white" 
                  onClick={() => navigate(-1)}
                  variant="default"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => navigate('/nearby')}
                  className="border-rose-300 text-rose-700 hover:bg-rose-100"
                >
                  Browse Matches
                </Button>
              </div>
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

  // Check if this is the current user's own profile
  const isOwnProfile = currentUserId === id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-25 to-rose-100 dark:from-rose-950 dark:via-rose-900 dark:to-pink-950 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ProfileHeader onSignOut={handleSignOut} />
        
        {/* Add Edit Profile button if viewing own profile */}
        {isOwnProfile && (
          <div className="mb-6 text-center">
            <Button
              onClick={handleEditMyProfile}
              className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white"
            >
              <User className="mr-2 h-4 w-4" />
              Edit My Profile
            </Button>
          </div>
        )}
        
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
