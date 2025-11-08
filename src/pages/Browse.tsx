import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useUnifiedCompatibility } from '@/hooks/useUnifiedCompatibility';
import { useConversationStatus } from '@/hooks/useConversationStatus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, X, MapPin, GraduationCap, Briefcase, Search, User, ChevronLeft, ChevronRight, Lock, Users, Grid3x3, LayoutGrid, StickyNote, Star } from 'lucide-react';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
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
import ProfileComparator from '@/components/ProfileComparator';
import ProfileNoteCard from '@/components/ProfileNoteCard';
import { useFavorites } from '@/hooks/useFavorites';
import NotesSearchFilter from '@/components/NotesSearchFilter';
import { useIsMobile } from '@/hooks/use-mobile';
import { BrowseProfileCard } from '@/components/BrowseProfileCard';

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

interface MatchData {
  user1_id: string;
  user2_id: string;
}

interface BlockedPairData {
  user1_id: string;
  user2_id: string;
}

interface SearchFilters {
  ageRange?: [number, number];
  education?: string;
  location?: string;
  interests?: string[];
  profession?: string;
  verifiedOnly?: boolean;
  withPhoto?: boolean;
}

const Browse = () => {
  const { user, subscription } = useAuth();
  const { calculateDetailedCompatibility } = useUnifiedCompatibility();
  const { checkIfInConversation } = useConversationStatus();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isMobile = useIsMobile();
  const [profiles, setProfiles] = useState<MatchingProfile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<MatchingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MatchingProfile | undefined>(undefined);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [isInActiveConversation, setIsInActiveConversation] = useState(false);
  const [activeMatchId, setActiveMatchId] = useState<string | undefined>(undefined);
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([]);
  const [showComparator, setShowComparator] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [gridStartIndex, setGridStartIndex] = useState(0);
  const [notesSearchKeyword, setNotesSearchKeyword] = useState('');
  const [profilesWithNotes, setProfilesWithNotes] = useState<Set<string>>(new Set());

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
        if (canView && filteredProfiles[0]) {
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
        .from('matches')
        .select('user1_id, user2_id')
        .eq('conversation_status', 'active');

      const usersInConversation = new Set<string>();
      activeConversations?.forEach((match: MatchData) => {
        usersInConversation.add(match.user1_id);
        usersInConversation.add(match.user2_id);
      });

      // Get blocked pairs to prevent showing previous matches
      const { data: blockedPairs } = await supabase
        .from('blocked_match_pairs')
        .select('user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const blockedUsers = new Set<string>();
      blockedPairs?.forEach((pair: BlockedPairData) => {
        if (pair.user1_id === user.id) blockedUsers.add(pair.user2_id);
        if (pair.user2_id === user.id) blockedUsers.add(pair.user1_id);
      });

      // Use the secure matching data table instead of direct profile access
      const { data, error } = await supabase
        .from('profile_matching_data')
        .select('*')
        .neq('user_id', user.id)
        .eq('gender', oppositeGender)
        .eq('is_visible', true)
        .order('created_at', { ascending: false })
        .limit(50); // Increased to compensate for filtering

      if (error) throw error;

      // Get verification scores separately
      const userIds = data?.map(p => p.user_id) ?? [];
      const { data: verifications } = await supabase
        .from('user_verifications')
        .select('user_id, verification_score')
        .in('user_id', userIds);

      const verificationMap = (verifications ?? []).reduce((acc, v) => {
        acc[v.user_id] = v.verification_score ?? 0;
        return acc;
      }, {} as Record<string, number>);

      const profilesWithVerification = data
        ?.filter((profile) =>
          !usersInConversation.has(profile.user_id) &&
          !blockedUsers.has(profile.user_id)
        )
        .map((profile): MatchingProfile => ({
          user_id: profile.user_id,
          age: profile.age ?? 0,
          gender: profile.gender ?? '',
          city_only: profile.city_only ?? '',
          education_level: profile.education_level ?? '',
          profession_category: profile.profession_category ?? '',
          interests: (profile.interests as string[] | null) ?? [],
          looking_for: profile.looking_for ?? '',
          avatar_url: profile.avatar_url ?? '',
          verification_score: verificationMap[profile.user_id] ?? 0
        })) ?? [];

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

  const handleSearch = (filters: SearchFilters) => {
    let filtered = [...profiles];

    // Apply age filter
    if (filters.ageRange && filters.ageRange[0] && filters.ageRange[1]) {
      filtered = filtered.filter(profile => 
        profile.age >= filters.ageRange![0] && profile.age <= filters.ageRange![1]
      );
    }

    // Apply location filter (using city_only)
    if (filters.location) {
      filtered = filtered.filter(profile =>
        profile.city_only?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }

    // Apply education filter (using education_level)
    if (filters.education) {
      filtered = filtered.filter(profile =>
        profile.education_level?.toLowerCase().includes(filters.education!.toLowerCase())
      );
    }

    // Apply profession filter (using profession_category)
    if (filters.profession) {
      filtered = filtered.filter(profile =>
        profile.profession_category?.toLowerCase().includes(filters.profession!.toLowerCase())
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
    if (filters.interests && filters.interests.length > 0) {
      filtered = filtered.filter(profile =>
        profile.interests?.some(interest =>
          filters.interests!.includes(interest)
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

  const handleNotesSearch = async (keyword: string) => {
    if (!user) return;

    try {
      // Fetch all notes that contain the keyword
      const { data: notes, error } = await supabase
        .from('profile_notes')
        .select('profile_id, note')
        .eq('user_id', user.id)
        .ilike('note', `%${keyword}%`);

      if (error) throw error;

      // Create a set of profile IDs that have matching notes
      const matchingProfileIds = new Set(notes?.map(n => n.profile_id) ?? []);
      setProfilesWithNotes(matchingProfileIds);
      
      // Filter profiles to only show those with matching notes
      const filtered = profiles.filter(profile => 
        matchingProfileIds.has(profile.user_id)
      );

      setFilteredProfiles(filtered);
      setNotesSearchKeyword(keyword);
      setGridStartIndex(0);

      toast({
        title: "Recherche effectuée",
        description: `${filtered.length} profil${filtered.length > 1 ? 's' : ''} trouvé${filtered.length > 1 ? 's' : ''} avec des notes correspondantes`,
      });
    } catch (error) {
      console.error('Error searching notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rechercher dans les notes",
        variant: "destructive"
      });
    }
  };

  const handleClearNotesSearch = () => {
    setNotesSearchKeyword('');
    setProfilesWithNotes(new Set());
    setFilteredProfiles(profiles);
    setGridStartIndex(0);
    toast({
      title: "Recherche réinitialisée",
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
      const profileToView = filteredProfiles[newIndex];
      if (profileToView) {
        await logProfileView(profileToView.user_id);
      }
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

  const toggleProfileSelection = (profileId: string) => {
    setSelectedProfiles(prev => {
      if (prev.includes(profileId)) {
        return prev.filter(id => id !== profileId);
      } else if (prev.length < 3) {
        return [...prev, profileId];
      } else {
        toast({
          title: "Limite atteinte",
          description: "Vous ne pouvez comparer que 3 profils maximum",
          variant: "destructive"
        });
        return prev;
      }
    });
  };

  const handleCompare = async () => {
    if (selectedProfiles.length >= 2) {
      // Save comparison to history before opening
      try {
        await supabase.from('profile_comparison_history').insert({
          user_id: user!.id,
          compared_profile_ids: selectedProfiles,
          comparison_name: `Comparaison du ${format(new Date(), 'PPP', { locale: fr })}`
        });
      } catch (error) {
        console.error('Error saving comparison:', error);
      }
      
      setShowComparator(true);
    }
  };

  const handleClearSelection = () => {
    setSelectedProfiles([]);
    setSelectionMode(false);
  };

  const currentProfile = filteredProfiles[currentIndex];
  const gridProfilesPerPage = 9;
  const gridProfiles = filteredProfiles.slice(gridStartIndex, gridStartIndex + gridProfilesPerPage);

  const nextGridPage = async () => {
    const canView = await checkDailyLimit();
    if (!canView) return;
    
    if (gridStartIndex + gridProfilesPerPage < filteredProfiles.length) {
      setGridStartIndex(gridStartIndex + gridProfilesPerPage);
      // Log views for the new page
      const newProfiles = filteredProfiles.slice(gridStartIndex + gridProfilesPerPage, gridStartIndex + gridProfilesPerPage * 2);
      for (const profile of newProfiles) {
        await logProfileView(profile.user_id);
      }
    }
  };

  const previousGridPage = () => {
    if (gridStartIndex > 0) {
      setGridStartIndex(Math.max(0, gridStartIndex - gridProfilesPerPage));
    }
  };

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
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="bg-card rounded-lg border p-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Découvrir les Profils</h1>
          <p className="text-muted-foreground">
            Parcourez et connectez-vous avec des profils compatibles
          </p>
        </div>

        <DailyLimitIndicator />
        {isInActiveConversation && <ActiveConversationBanner matchId={activeMatchId} />}
        
        {/* Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-card rounded-lg border p-4">
          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode ? "default" : "outline"}
              onClick={() => setSelectionMode(!selectionMode)}
            >
              <Users className="h-4 w-4 mr-2" />
              {selectionMode ? "Mode sélection" : "Comparer"}
            </Button>
            
            <Button
              variant={viewMode === 'grid' ? "default" : "outline"}
              onClick={() => setViewMode(viewMode === 'carousel' ? 'grid' : 'carousel')}
            >
              {viewMode === 'grid' ? <LayoutGrid className="h-4 w-4 mr-2" /> : <Grid3x3 className="h-4 w-4 mr-2" />}
              {viewMode === 'grid' ? 'Grille' : 'Carousel'}
            </Button>
          </div>
          
          {selectionMode && selectedProfiles.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {selectedProfiles.length} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
              </Badge>
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                Annuler
              </Button>
            </div>
          )}
        </div>

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

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {viewMode === 'carousel' ? (
              /* Carousel Mode - Original Single Profile View */
              <div className="border rounded overflow-hidden">
              <div className="relative">
                {/* Selection Checkbox */}
                {selectionMode && (
                  <div className="absolute top-4 right-20 z-10">
                    <div className="bg-white rounded p-2 shadow border">
                      <Checkbox
                        checked={selectedProfiles.includes(currentProfile.user_id)}
                        onCheckedChange={() => toggleProfileSelection(currentProfile.user_id)}
                        className="h-6 w-6"
                      />
                    </div>
                  </div>
                )}
                {/* Profile Image */}
                <div className="h-80 md:h-96 bg-muted/30 flex items-center justify-center overflow-hidden">
                  {currentProfile.avatar_url ? (
                    <img 
                      src={currentProfile.avatar_url} 
                      alt="Photo de profil anonyme" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="h-24 w-24 text-muted-foreground" />
                  )}
                </div>

                {/* Navigation Arrows */}
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow"
                  onClick={previousProfile}
                  disabled={currentIndex === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full p-2 shadow"
                  onClick={nextProfile}
                  disabled={currentIndex === filteredProfiles.length - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>

                {/* Profile Counter */}
                <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm">
                  {currentIndex + 1} / {filteredProfiles.length}
                </div>

                {/* Verification Badge */}
                <div className="absolute top-4 left-4">
                  <VerificationBadge verificationScore={currentProfile.verification_score} />
                </div>
              </div>

              <div className="p-6 border-t">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold mb-1">
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
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            onClick={handlePass}
            variant="outline"
            disabled={isInActiveConversation}
            className="flex-1"
          >
            <X className="h-4 w-4 mr-2" />
            Passer
          </Button>
          <Button
            onClick={() => handleLike(currentProfile.user_id)}
            disabled={!subscription.subscribed || dailyLimitReached || isInActiveConversation}
            className="flex-1"
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
            className="flex-1"
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
              className="text-destructive border-destructive"
            >
              Signaler ce profil
            </Button>
          </ReportModal>
        </div>
              </div>
              </div>
            ) : (
              /* Grid Mode - Multiple Profiles View */
              <div className="space-y-6">
                {/* Notes Search Filter */}
                <NotesSearchFilter
                  onSearch={handleNotesSearch}
                  onClear={handleClearNotesSearch}
                  isActive={!!notesSearchKeyword}
                  resultsCount={notesSearchKeyword ? filteredProfiles.length : undefined}
                />

                {/* Grid Pagination - Traditional Style */}
                <div className="flex flex-col items-center gap-4">
                  <div className="text-sm text-muted-foreground">
                    Page {Math.floor(gridStartIndex / gridProfilesPerPage) + 1} sur {Math.ceil(filteredProfiles.length / gridProfilesPerPage)} • {filteredProfiles.length} profils au total
                  </div>
                </div>

                 {/* Profiles Table/Cards */}
                {isMobile ? (
                  /* Mobile View - Cards */
                  <div className="space-y-3">
                    {gridProfiles.map((profile) => (
                      <BrowseProfileCard
                        key={profile.user_id}
                        profile={profile}
                        selectionMode={selectionMode}
                        isSelected={selectedProfiles.includes(profile.user_id)}
                        isFavorite={isFavorite(profile.user_id)}
                        onToggleSelection={toggleProfileSelection}
                        onToggleFavorite={toggleFavorite}
                        onViewDetails={(userId) => navigate(`/profile/${userId}`)}
                        onLike={handleLike}
                      />
                    ))}
                  </div>
                ) : (
                  /* Desktop View - Table */
                  <div className="border rounded overflow-x-auto max-w-full">
                    <table className="w-full min-w-full">
                    <thead className="bg-muted/30 border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-semibold">Photo</th>
                        <th className="text-left p-3 text-sm font-semibold">Nom</th>
                        <th className="text-left p-3 text-sm font-semibold">Âge</th>
                        <th className="text-left p-3 text-sm font-semibold">Localisation</th>
                        <th className="text-left p-3 text-sm font-semibold">Éducation</th>
                        <th className="text-left p-3 text-sm font-semibold">Vérification</th>
                        <th className="text-center p-3 text-sm font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gridProfiles.map((profile, index) => (
                        <tr 
                          key={profile.user_id} 
                          className={`border-b ${index % 2 === 0 ? 'bg-background' : 'bg-muted/20'}`}
                        >
                          {/* Photo */}
                          <td className="p-3">
                            <div className="relative">
                              {profile.avatar_url ? (
                                <img 
                                  src={profile.avatar_url} 
                                  alt="Photo de profil" 
                                  className="h-16 w-16 rounded object-cover border"
                                />
                              ) : (
                                <div className="h-16 w-16 rounded border bg-muted flex items-center justify-center">
                                  <User className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                              {/* Favorite Star */}
                              <button
                                onClick={() => toggleFavorite(profile.user_id)}
                                className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow border"
                              >
                                <Star
                                  className={`h-3 w-3 ${
                                    isFavorite(profile.user_id)
                                      ? 'fill-yellow-500 text-yellow-500'
                                      : 'text-gray-400'
                                  }`}
                                />
                              </button>
                            </div>
                          </td>

                          {/* Nom */}
                          <td className="p-3 max-w-[150px]">
                            <div className="font-medium text-sm truncate">Profil Anonyme</div>
                            {profile.profession_category && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1 truncate">
                                <Briefcase className="h-3 w-3 flex-shrink-0" />
                                {profile.profession_category}
                              </div>
                            )}
                          </td>

                          {/* Âge */}
                          <td className="p-3">
                            <span className="text-sm">{profile.age || '-'} ans</span>
                          </td>

                          {/* Localisation */}
                          <td className="p-3 max-w-[120px]">
                            <div className="text-sm flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                              {profile.city_only || '-'}
                            </div>
                          </td>

                          {/* Éducation */}
                          <td className="p-3 max-w-[120px]">
                            <div className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                              <GraduationCap className="h-3 w-3 flex-shrink-0" />
                              {profile.education_level || '-'}
                            </div>
                          </td>

                          {/* Vérification */}
                          <td className="p-3">
                            <VerificationBadge verificationScore={profile.verification_score} />
                          </td>

                          {/* Actions */}
                          <td className="p-3">
                            <div className="flex items-center justify-center gap-2">
                              {selectionMode && (
                                <Checkbox
                                  checked={selectedProfiles.includes(profile.user_id)}
                                  onCheckedChange={() => toggleProfileSelection(profile.user_id)}
                                  className="h-4 w-4"
                                />
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/profile/${profile.user_id}`)}
                                className="text-xs"
                              >
                                Voir
                              </Button>
                              <Button
                                onClick={() => handleLike(profile.user_id)}
                                disabled={!subscription.subscribed || dailyLimitReached || isInActiveConversation}
                                size="sm"
                                className="text-xs"
                              >
                                <Heart className="h-3 w-3" />
                              </Button>
                              {user && (
                                <ProfileNoteCard 
                                  userId={user.id} 
                                  profileId={profile.user_id}
                                  searchKeyword={notesSearchKeyword}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  
                  {/* Empty State */}
                  {gridProfiles.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>Aucun profil à afficher</p>
                    </div>
                  )}
                </div>
                )}

                {/* Traditional Pagination */}
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={previousGridPage}
                        className={gridStartIndex === 0 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.ceil(filteredProfiles.length / gridProfilesPerPage) }, (_, i) => {
                      const currentPage = Math.floor(gridStartIndex / gridProfilesPerPage) + 1;
                      const totalPages = Math.ceil(filteredProfiles.length / gridProfilesPerPage);
                      const pageNumber = i + 1;
                      
                      // Show first page, last page, current page, and pages around current
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                      ) {
                        return (
                          <PaginationItem key={i}>
                            <PaginationLink
                              onClick={async () => {
                                const canView = await checkDailyLimit();
                                if (!canView) return;
                                setGridStartIndex(i * gridProfilesPerPage);
                              }}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      } else if (
                        pageNumber === currentPage - 2 ||
                        pageNumber === currentPage + 2
                      ) {
                        return <PaginationEllipsis key={i} />;
                      }
                      return null;
                    })}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={nextGridPage}
                        className={gridStartIndex + gridProfilesPerPage >= filteredProfiles.length ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
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

        {/* Comparator Dialog */}
        <Dialog open={showComparator} onOpenChange={setShowComparator}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Comparaison des profils sélectionnés</DialogTitle>
            </DialogHeader>
            <ProfileComparator profileIds={selectedProfiles} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Floating Compare Button */}
      {selectionMode && selectedProfiles.length >= 2 && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <Button
            size="lg"
            onClick={handleCompare}
            className="bg-gradient-to-r from-emerald to-gold text-white shadow-2xl hover:shadow-emerald/50 animate-pulse-gentle px-8 py-6 text-lg"
          >
            <Users className="h-5 w-5 mr-2" />
            Comparer les {selectedProfiles.length} profils sélectionnés
          </Button>
        </div>
      )}
    </div>
  );
};

export default Browse;