import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, GraduationCap, Briefcase, Search, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '@/components/VerificationBadge';
import AdvancedSearch from '@/components/AdvancedSearch';
import ReportModal from '@/components/ReportModal';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  age: number;
  gender: string;
  location: string;
  education: string;
  profession: string;
  bio: string;
  looking_for: string;
  interests: string[];
  avatar_url: string;
  verification_score: number;
}

const Browse = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfiles();
  }, [user]);

  useEffect(() => {
    setFilteredProfiles(profiles);
  }, [profiles]);

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user_verifications!inner (
            verification_score
          )
        `)
        .neq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const profilesWithVerification = data?.map((profile: any) => ({
        ...profile,
        verification_score: profile.user_verifications?.verification_score || 0
      })) || [];

      setProfiles(profilesWithVerification);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (filters: any) => {
    let filtered = [...profiles];

    // Apply age filter
    if (filters.ageRange) {
      filtered = filtered.filter(profile => 
        profile.age >= filters.ageRange[0] && profile.age <= filters.ageRange[1]
      );
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(profile =>
        profile.location?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply education filter
    if (filters.education) {
      filtered = filtered.filter(profile =>
        profile.education?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    // Apply profession filter
    if (filters.profession) {
      filtered = filtered.filter(profile =>
        profile.profession?.toLowerCase().includes(filters.profession.toLowerCase())
      );
    }

    // Apply verified filter
    if (filters.verifiedOnly) {
      filtered = filtered.filter(profile => profile.verification_score >= 50);
    }

    // Apply photo filter
    if (filters.withPhoto) {
      filtered = filtered.filter(profile => profile.avatar_url);
    }

    // Apply interests filter
    if (filters.interests.length > 0) {
      filtered = filtered.filter(profile =>
        profile.interests?.some(interest =>
          filters.interests.includes(interest)
        )
      );
    }

    setFilteredProfiles(filtered);
    setCurrentIndex(0);

    toast({
      title: "Recherche appliquée",
      description: `${filtered.length} profil(s) trouvé(s)`,
    });
  };

  const handleResetSearch = () => {
    setFilteredProfiles(profiles);
    setCurrentIndex(0);
    toast({
      title: "Filtres réinitialisés",
      description: "Tous les profils sont maintenant affichés",
    });
  };

  const nextProfile = () => {
    if (currentIndex < filteredProfiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousProfile = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleLike = async (profileId: string) => {
    if (!user) return;

    try {
      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
        .single();

      if (existingMatch) {
        // Update existing match
        const isUser1 = existingMatch.user1_id === user.id;
        const updateData = isUser1 
          ? { user1_liked: true }
          : { user2_liked: true };

        // Check if it becomes mutual
        const isMutual = isUser1 
          ? existingMatch.user2_liked 
          : existingMatch.user1_liked;

        if (isMutual) {
          (updateData as any).is_mutual = true;
        }

        await supabase
          .from('matches')
          .update(updateData)
          .eq('id', existingMatch.id);

        if (isMutual) {
          toast({
            title: "C'est un match ! 🎉",
            description: "Vous pouvez maintenant discuter ensemble",
          });
        } else {
          toast({
            title: "Profil liké",
            description: "Votre intérêt a été envoyé",
          });
        }
      } else {
        // Create new match
        await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: profileId,
            user1_liked: true,
            match_score: Math.floor(Math.random() * 40) + 60 // Random score between 60-100
          });

        toast({
          title: "Profil liké",
          description: "Votre intérêt a été envoyé",
        });
      }

      nextProfile();
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "Erreur",
        description: "Impossible de liker ce profil",
        variant: "destructive"
      });
    }
  };

  const handlePass = () => {
    nextProfile();
  };

  const currentProfile = filteredProfiles[currentIndex];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="h-96 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <Card className="h-48 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 md:p-8">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AdvancedSearch onSearch={handleSearch} onReset={handleResetSearch} />
            </div>
            <div>
              <Card>
                <CardContent className="p-8 text-center">
                  <User className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Aucun profil trouvé</h3>
                  <p className="text-muted-foreground">
                    {filteredProfiles.length === 0 && profiles.length > 0 
                      ? "Aucun profil ne correspond à vos critères de recherche."
                      : "Il n'y a pas de nouveaux profils à découvrir pour le moment."
                    }
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Advanced Search - Toggle on mobile */}
          <div className="lg:hidden">
            <Button
              onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
              variant="outline"
              className="w-full mb-4 border-emerald text-emerald hover:bg-emerald hover:text-white"
            >
              {showAdvancedSearch ? 'Masquer la recherche' : 'Recherche avancée'}
            </Button>
            {showAdvancedSearch && (
              <div className="mb-6">
                <AdvancedSearch onSearch={handleSearch} onReset={handleResetSearch} />
              </div>
            )}
          </div>

          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <Card className="overflow-hidden shadow-lg animate-scale-in card-hover">
              <div className="relative">
                {/* Profile Image */}
                <div className="h-80 md:h-96 bg-gradient-to-br from-emerald/10 to-gold/10 flex items-center justify-center overflow-hidden">
                  {currentProfile.avatar_url ? (
                    <img 
                      src={currentProfile.avatar_url} 
                      alt={currentProfile.full_name || 'Photo de profil'} 
                      className="w-full h-full object-cover transition-smooth hover:scale-110"
                    />
                  ) : (
                    <User className="h-24 w-24 text-muted-foreground animate-pulse-gentle" />
                  )}
                </div>

                {/* Navigation Arrows */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-lg hover-scale"
                  onClick={previousProfile}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow-lg hover-scale"
                  onClick={nextProfile}
                  disabled={currentIndex === filteredProfiles.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Profile Counter */}
                <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {filteredProfiles.length}
                </div>

                {/* Verification Badge */}
                <div className="absolute top-4 left-4">
                  <VerificationBadge verificationScore={currentProfile.verification_score} />
                </div>
              </div>

              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-1">
                      {currentProfile.full_name || 'Nom non renseigné'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      {currentProfile.age && (
                        <span className="text-lg">{currentProfile.age} ans</span>
                      )}
                      {currentProfile.location && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{currentProfile.location}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {currentProfile.bio && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">À propos</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {currentProfile.bio}
                    </p>
                  </div>
                )}

                {/* Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentProfile.education && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Éducation</span>
                      <p className="font-medium">{currentProfile.education}</p>
                    </div>
                  )}
                  {currentProfile.profession && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Profession</span>
                      <p className="font-medium">{currentProfile.profession}</p>
                    </div>
                  )}
                  {currentProfile.looking_for && (
                    <div className="sm:col-span-2">
                      <span className="text-sm font-medium text-muted-foreground">Recherche</span>
                      <p className="font-medium">{currentProfile.looking_for}</p>
                    </div>
                  )}
                </div>

                {/* Interests */}
                {currentProfile.interests && currentProfile.interests.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2">Centres d'intérêt</h3>
                    <div className="flex flex-wrap gap-2">
                      {currentProfile.interests.map((interest: string) => (
                        <Badge key={interest} variant="secondary" className="text-sm">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

        {/* Enhanced Mobile Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t animate-fade-in">
          <Button
            onClick={handlePass}
            variant="outline"
            className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted order-1 sm:order-none transition-smooth"
          >
            <X className="h-4 w-4 mr-2" />
            Passer
          </Button>
          <Button
            onClick={() => handleLike(currentProfile.user_id)}
            variant="gradient"
            className="flex-1 order-0 sm:order-none animate-pulse-gentle"
          >
            <Heart className="h-4 w-4 mr-2" />
            J'aime ce profil
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate(`/profile/${currentProfile.user_id}`)}
            className="flex-1 border-emerald text-emerald hover:bg-emerald hover:text-white order-2 sm:order-none hover-scale"
          >
            Voir le profil complet
          </Button>
        </div>

                <div className="flex justify-center pt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedProfile(currentProfile);
                      setReportModalOpen(true);
                    }}
                    className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
                  >
                    Signaler ce profil
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Desktop only */}
          <div className="hidden lg:block space-y-6">
            <AdvancedSearch onSearch={handleSearch} onReset={handleResetSearch} />

            <Card>
              <CardHeader>
                <div className="text-lg font-semibold">Navigation</div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={() => navigate('/matches')}
                  className="w-full justify-start border-emerald text-emerald hover:bg-emerald hover:text-white"
                >
                  Voir mes matches
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                  className="w-full justify-start"
                >
                  Mon profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        reportedUserId={selectedProfile?.user_id || ''}
        reportedUserName={selectedProfile?.full_name || 'Utilisateur'}
      />
    </div>
  );
};

export default Browse;