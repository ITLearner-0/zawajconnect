import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IslamicPattern } from '@/components/ui/islamic-pattern';
import { DatabaseProfile } from '@/types/profile';
import { ArrowLeft, Mail, Phone, MapPin, Bookmark, Heart, User, BookOpen, BookHeart } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { dummyProfiles } from '@/data/dummyData';
import CustomButton from '@/components/CustomButton';

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
        <Button 
          onClick={() => navigate('/demo')} 
          variant="ghost" 
          className="mb-4 hover:bg-islamic-teal/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profiles
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <IslamicPattern variant="border" className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-32 w-32 ring-4 ring-offset-4 ring-islamic-teal/20 mb-4">
                  {profile.profile_picture ? (
                    <AvatarImage src={profile.profile_picture} alt={`${profile.first_name}'s profile`} />
                  ) : null}
                  <AvatarFallback className="bg-islamic-teal text-white text-3xl">
                    {profile.first_name[0]}
                  </AvatarFallback>
                </Avatar>
                
                <h1 className="text-2xl font-bold text-islamic-blue">
                  {profile.first_name} {profile.last_name}
                </h1>
                
                <p className="text-muted-foreground mt-1">{profile.occupation}</p>
                
                <Badge className={`mt-2 ${profile.gender === 'Male' ? 'bg-islamic-blue' : 'bg-islamic-gold'}`}>
                  {profile.gender}
                </Badge>

                <div className="flex items-center justify-center mt-6 space-x-2">
                  <CustomButton variant="outline" size="sm" className="flex items-center">
                    <Mail className="mr-1 h-4 w-4" /> Message
                  </CustomButton>
                  <CustomButton variant="outline" size="sm" className="flex items-center">
                    <Bookmark className="mr-1 h-4 w-4" /> Save
                  </CustomButton>
                </div>
              </div>
            </IslamicPattern>
          </div>

          <div className="md:col-span-2">
            <IslamicPattern variant="background" className="bg-white rounded-lg shadow-lg p-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
                    <User className="mr-2 h-5 w-5" /> Basic Information
                  </h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Age:</span>
                      <span>{profile.birth_date ? new Date().getFullYear() - new Date(profile.birth_date).getFullYear() : 'Not specified'}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Location:</span>
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1 text-islamic-gold" /> {profile.location}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" /> Education & Career
                  </h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Education:</span>
                      <span>{profile.education_level}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Occupation:</span>
                      <span>{profile.occupation}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-islamic-teal flex items-center">
                    <BookHeart className="mr-2 h-5 w-5" /> Religious Background
                  </h2>
                  <div className="mt-3 space-y-3">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Practice Level:</span>
                      <span>{profile.religious_practice_level}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-500 w-24">Prayer:</span>
                      <span>{profile.prayer_frequency}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h2 className="text-xl font-semibold text-islamic-teal">About Me</h2>
                  <p className="mt-2 text-gray-700">{profile.about_me}</p>
                </div>
                
                {profile.wali_name && (
                  <div className="mt-4 p-4 bg-islamic-cream rounded-lg border border-islamic-sand">
                    <h3 className="font-semibold text-islamic-burgundy">Wali Information</h3>
                    <div className="mt-2 space-y-2 text-sm">
                      <div><span className="font-medium">Name:</span> {profile.wali_name}</div>
                      <div><span className="font-medium">Relationship:</span> {profile.wali_relationship}</div>
                      <div><span className="font-medium">Contact:</span> {profile.wali_contact}</div>
                    </div>
                  </div>
                )}
              </div>
            </IslamicPattern>
            
            <div className="text-center mt-6 text-islamic-blue">
              <p className="italic text-sm">
                "And among His Signs is that He created for you mates from among yourselves, 
                that you may dwell in tranquility with them, and He has put love and mercy between your hearts."
              </p>
              <p className="text-xs mt-1">- Ar-Rum 30:21</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
