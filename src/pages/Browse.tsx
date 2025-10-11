import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';
import { useConversationStatus } from '@/hooks/useConversationStatus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, X, MapPin, GraduationCap, Briefcase, Search, User, ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '@/components/VerificationBadge';
import AdvancedSearch from '@/components/AdvancedSearch';
import ReportModal from '@/components/ReportModal';
import { useToast } from '@/hooks/use-toast';
import ProfileCard from '@/components/ProfileCard';
import CompatibilityScore from '@/components/CompatibilityScore';
import { DailyLimitIndicator } from '@/components/DailyLimitIndicator';
import { UpgradeToPremiumModal } from '@/components/UpgradeToPremiumModal';
import { ActiveConversationBanner } from '@/components/ActiveConversationBanner';

interface MatchingProfile {
  id?: string;
  user_id: string;
  age: number;
  gender: string;
  city_only: string; // Seulement la ville, pas l'adresse complète
  education_level: string; // Niveau général, pas l'université spécifique
  profession_category: string; // Catégorie générale, pas le poste spécifique
  interests: string[];
  looking_for: string;
  avatar_url: string;
  verification_score: number;
}

const Browse = () => {
  const { user, subscription } = useAuth();
  const { calculateDetailedCompatibility } = useUnifiedCompatibility();
  const { checkIfInConversation } = useConversationStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<MatchingProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<MatchingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MatchingProfile | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [isInActiveConversation, setIsInActiveConversation] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string | undefined>();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchProfiles();
    checkUserConversationStatus();
  }, [user]);

  useEffect(() => {
    setFilteredProfiles(profiles);
  }, [profiles]);

  // Log initial profile view for free users
  useEffect(() => {
    if (filteredProfiles.length > 0 && currentIndex === 0 && !subscription.subscribed) {
      checkDailyLimit().then(canView => {
        if (canView) {
          logProfileView(filteredProfiles[0].user_id);
        }
      });
    }
  }, [filteredProfiles]);

  const checkUserConversationStatus = async () => {
    if (!user) return;
    
    try {
      const isInConversation = await checkIfInConversation(user.id);
      setIsInActiveConversation(isInConversation);
      
      // If in conversation, get the match ID
      if (isInConversation) {
        const { data: activeMatch } = await supabase
          .from('matches')
          .select('id')
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
          .maybeSingle();
        
        if (activeMatch && (activeMatch as any).conversation_status === 'active') {
          setActiveMatchId(activeMatch.id);
        }
      }
    } catch (error) {
      console.error('Error checking conversation status:', error);
    }
  };

  const fetchProfiles = async () => {
    if (!user) return;

    try {
      // First get current user's gender to filter opposite gender
      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('gender')
        .eq('user_id', user.id)
        .maybeSingle();

      // Determine opposite gender
      const oppositeGender = currentUserProfile?.gender === 'male' ? 'female' : 'male';

      // Get users in active conversations to exclude them
      const { data: activeConversations } = await supabase
        .from('matches' as any)
        .select('user1_id, user2_id')
        .eq('conversation_status', 'active');

      const usersInConversation = new Set<string>();
      activeConversations?.forEach((match: any) => {
        usersInConversation.add(match.user1_id);
        usersInConversation.add(match.user2_id);
      });

      // Get blocked pairs to prevent showing previous matches
      const { data: blockedPairs } = await supabase
        .from('blocked_match_pairs' as any)
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const blockedUsers = new Set<string>();
      blockedPairs?.forEach((pair: any) => {
        if (pair.user1_id === user.id) blockedUsers.add(pair.user2_id);
        if (pair.user2_id === user.id) blockedUsers.add(pair.user1_id);
      });

      // Use the secure matching data table instead of direct profile access
      const { data, error } = await supabase
        .from('profile_matching_data')
        .select(`
          *,
          user_verifications!inner(verification_score)
        `)
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(50); // Increased to compensate for filtering

      if (error) throw error;

      const profilesWithVerification = data
        ?.filter((profile: any) => 
          !usersInConversation.has(profile.user_id) && 
          !blockedUsers.has(profile.user_id)
        )
        .map((profile: any) => ({
          user_id: profile.user_id,
          age: profile.age,
          gender: profile.gender,
          city_only: profile.city_only,
          education_level: profile.education_level,
          profession_category: profile.profession_category,
          interests: profile.interests || [],
          looking_for: profile.looking_for,
          avatar_url: profile.avatar_url,
          verification_score: profile.user_verifications?.verification_score || 0,
          is_in_conversation: false
        })) || [];

      setProfiles(profilesWithVerification.slice(0, 20)); // Limit to 20 after filtering
    } catch (error) {
      console.error('Error fetching secure matching profiles:', error);
      setProfiles([]);
      toast({
        title: "Erreur de chargement",
        description: "Impossible de charger les profils. Vérifiez votre niveau de vérification.",
        variant: "destructive"
      });
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

    // Apply location filter (using city_only)
    if (filters.location) {
      filtered = filtered.filter(profile =>
        profile.city_only?.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    // Apply education filter (using education_level)
    if (filters.education) {
      filtered = filtered.filter(profile =>
        profile.education_level?.toLowerCase().includes(filters.education.toLowerCase())
      );
    }

    // Apply profession filter (using profession_category)
    if (filters.profession) {
      filtered = filtered.filter(profile =>
        profile.profession_category?.toLowerCase().includes(filters.profession.toLowerCase())
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

  const checkDailyLimit = async () => {
    if (subscription.subscribed) return true; // Premium users bypass check
    
    try {
      const { data } = await supabase.functions.invoke('check-daily-limit');
      if (data?.limit_reached) {
        setDailyLimitReached(true);
        setShowUpgradeModal(true);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking daily limit:', error);
      return true; // En cas d'erreur, on laisse passer
    }
  };

  const logProfileView = async (viewedUserId: string) => {
    if (subscription.subscribed) return; // Premium users don't need tracking
    
    try {
      await supabase.functions.invoke('log-profile-view', {
        body: { viewed_user_id: viewedUserId }
      });
    } catch (error) {
      console.error('Error logging profile view:', error);
    }
  };

  const nextProfile = async () => {
    // Check limit BEFORE showing next profile
    const canView = await checkDailyLimit();
    if (!canView) return;
    
    if (currentIndex < filteredProfiles.length - 1) {
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      
      // Log the view
      await logProfileView(filteredProfiles[newIndex].user_id);
    } else {
      toast({
        title: "Plus de profils",
        description: "Vous avez vu tous les profils disponibles"
      });
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
      // Check if user is already in an active conversation
      const isInConversation = await checkIfInConversation(user.id);
      
      if (isInConversation) {
        toast({
          title: "Action non autorisée",
          description: "Vous êtes actuellement en discussion. Vous devez d'abord terminer votre échange en cours avant de liker d'autres profils.",
          variant: "destructive"
        });
        return;
      }

      // Verify the target profile exists before creating any matches
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', profileId)
        .maybeSingle();

      if (!targetProfile) {
        toast({
          title: "Profil non trouvé",
          description: "Ce profil n'existe plus",
          variant: "destructive"
        });
        return;
      }

      // Check if match already exists
      const { data: existingMatch } = await supabase
        .from('matches')
        .select('*')
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${profileId}),and(user1_id.eq.${profileId},user2_id.eq.${user.id})`)
        .maybeSingle();

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

        console.log('Match update successful:', { 
          matchId: existingMatch.id, 
          updateData, 
          isMutual 
        });

        if (isMutual) {
          toast({
            title: "C'est un match ! 🎉",
            description: "Vous pouvez maintenant discuter ensemble",
          });
          
          // Envoyer les emails de notification de match
          try {
            await supabase.functions.invoke('send-match-notifications', {
              body: { matchId: existingMatch.id }
            });
          } catch (emailError) {
            console.error('Erreur envoi emails de match:', emailError);
          }
        } else {
          toast({
            title: "Profil liké",
            description: "Votre intérêt a été envoyé",
          });
        }
      } else {
        // Calculate real compatibility score
        const compatibilityResult = await calculateDetailedCompatibility(profileId);
        const compatibilityScore = compatibilityResult.compatibility_score;
        
        // Create new match
        await supabase
          .from('matches')
          .insert({
            user1_id: user.id,
            user2_id: profileId,
            user1_liked: true,
            match_score: Math.round(compatibilityScore)
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
        <DailyLimitIndicator />
        {isInActiveConversation && <ActiveConversationBanner matchId={activeMatchId} />}
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
                      alt="Photo de profil anonyme" 
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
                      Profil Anonyme
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
                      {currentProfile.age && (
                        <span className="text-lg">{currentProfile.age} ans</span>
                      )}
                      {currentProfile.city_only && (
                        <>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>{currentProfile.city_only}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Details sécurisés - données anonymisées */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  {currentProfile.education_level && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Niveau d'éducation</span>
                      <p className="font-medium">{currentProfile.education_level}</p>
                    </div>
                  )}
                  {currentProfile.profession_category && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Domaine professionnel</span>
                      <p className="font-medium">{currentProfile.profession_category}</p>
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
            disabled={isInActiveConversation}
            className="flex-1 border-muted-foreground text-muted-foreground hover:bg-muted order-1 sm:order-none transition-smooth"
          >
            <X className="h-4 w-4 mr-2" />
            Passer
          </Button>
          <Button
            onClick={() => handleLike(currentProfile.user_id)}
            disabled={!subscription.subscribed || dailyLimitReached || isInActiveConversation}
            variant="gradient"
            className="flex-1 order-0 sm:order-none animate-pulse-gentle"
          >
            {isInActiveConversation ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                En discussion
              </>
            ) : !subscription.subscribed ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Premium requis
              </>
            ) : (
              <>
                <Heart className="h-4 w-4 mr-2" />
                J'aime ce profil
              </>
            )}
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
          <ReportModal
            reportedUserId={currentProfile.user_id}
            reportedUserName="Utilisateur Anonyme"
          >
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-500 hover:bg-red-500 hover:text-white"
            >
              Signaler ce profil
            </Button>
          </ReportModal>
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
                  onClick={() => navigate('/enhanced-profile')}
                  className="w-full justify-start"
                >
                  Mon profil
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <UpgradeToPremiumModal 
          open={showUpgradeModal} 
          onClose={() => setShowUpgradeModal(false)}
          reason="daily_limit"
        />
      </div>

      {/* Report Modal - Remove if not needed */}
    </div>
  );
};

export default Browse;