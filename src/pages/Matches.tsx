import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { Heart, MessageCircle, Eye, Users, Clock, Crown, ArrowUpDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ConversationStatusBadge } from '@/components/ui/ConversationStatusBadge';
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useIsMobile } from '@/hooks/use-mobile';
import { MatchCard } from '@/components/MatchCard';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  user1_liked: boolean;
  user2_liked: boolean;
  is_mutual: boolean;
  created_at: string;
  conversation_status?: 'not_started' | 'active' | 'ended';
  other_user: {
    id: string;
    user_id: string;
    full_name: string;
    age: number;
    location: string;
    profession: string;
    bio: string;
  };
}

const Matches = () => {
  const { user, subscription, checkSubscription, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [matches, setMatches] = useState<Match[]>([]);
  const [mutualMatches, setMutualMatches] = useState<Match[]>([]);
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [mutualPage, setMutualPage] = useState(1);
  const [pendingPage, setPendingPage] = useState(1);
  const matchesPerPage = 10;
  const [sortColumn, setSortColumn] = useState<'name' | 'score' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debug: afficher le statut d'abonnement
  console.log('📊 Statut abonnement Matches:', subscription);

  // Tous les hooks DOIVENT être appelés avant tout return conditionnel
  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    if (!authLoading && subscription.subscribed) {
      fetchMatches();
    }
  }, [user, authLoading, subscription.subscribed]);

  const fetchMatches = async () => {
    if (!user) return;

    try {
      // Get matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (matchesData) {
        const processedMatches = await Promise.all(
          matchesData.map(async (match) => {
            const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
            
            const { data: otherUserProfile } = await supabase
              .from('profiles')
              .select('id, full_name, age, location, profession, bio, user_id')
              .eq('user_id', otherUserId)
              .maybeSingle();

            return {
              ...match,
              match_score: match.match_score ?? 0,
              user1_liked: !!match.user1_liked,
              user2_liked: !!match.user2_liked,
              is_mutual: !!match.is_mutual,
              conversation_status: (match.conversation_status ?? 'not_started') as 'not_started' | 'active' | 'ended',
              other_user: otherUserProfile ? {
                ...otherUserProfile,
                user_id: otherUserId,
                full_name: otherUserProfile.full_name ?? 'Utilisateur inconnu',
                age: otherUserProfile.age ?? 0,
                location: otherUserProfile.location ?? 'Non spécifié',
                profession: otherUserProfile.profession ?? 'Non spécifié',
                bio: otherUserProfile.bio ?? ''
              } : {
                id: otherUserId,
                user_id: otherUserId,
                full_name: 'Utilisateur inconnu',
                age: 0,
                location: 'Non spécifié',
                profession: 'Non spécifié',
                bio: ''
              }
            };
          })
        );

        setMatches(processedMatches);
        setMutualMatches(processedMatches.filter(m => m.is_mutual));
        setPendingMatches(processedMatches.filter(m => !m.is_mutual));
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const startChat = (matchId: string) => {
    navigate(`/chat/${matchId}`);
  };

  const viewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleSort = (column: 'name' | 'score' | 'date') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  const sortMatches = (matchesToSort: Match[]) => {
    return [...matchesToSort].sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'name':
          comparison = (a.other_user?.full_name || '').localeCompare(b.other_user?.full_name || '');
          break;
        case 'score':
          comparison = a.match_score - b.match_score;
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };


  const getStatusBadge = (match: Match) => {
    if (match.conversation_status === 'ended') {
      return <Badge variant="outline" className="border-destructive/50 text-destructive">Terminée</Badge>;
    }
    if (match.conversation_status === 'active') {
      return <Badge variant="outline" className="border-emerald/50 text-emerald">Active</Badge>;
    }
    if (match.is_mutual) {
      return <Badge variant="outline" className="border-gold/50 text-gold-dark">Mutuel</Badge>;
    }
    
    const iLiked = (match.user1_id === user?.id && match.user1_liked) || 
                   (match.user2_id === user?.id && match.user2_liked);
    const theyLiked = (match.user1_id === user?.id && match.user2_liked) || 
                      (match.user2_id === user?.id && match.user1_liked);
    
    if (iLiked && theyLiked) {
      return <Badge variant="outline" className="border-gold/50 text-gold-dark">Mutuel</Badge>;
    }
    if (iLiked) {
      return <Badge variant="outline" className="border-emerald/50 text-emerald">Vous avez liké</Badge>;
    }
    if (theyLiked) {
      return <Badge variant="outline" className="border-gold/50 text-gold-dark">Vous a liké</Badge>;
    }
    
    return <Badge variant="outline">En attente</Badge>;
  };

  // Tous les returns conditionnels APRÈS les hooks et fonctions
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-8 text-center space-y-6">
          <div className="h-20 w-20 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center mx-auto">
            <Heart className="h-10 w-10 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Fonctionnalité Premium</h2>
            <p className="text-muted-foreground">
              Accédez à vos matches, likes et mises en relation en passant à Premium.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => {
                console.log('Navigation vers Premium...');
                navigate('/settings?tab=premium');
              }}
              className="w-full bg-gradient-to-r from-emerald to-emerald-light"
              size="lg"
            >
              <Crown className="h-4 w-4 mr-2" />
              Passer à Premium
            </Button>
            <Button
              onClick={async () => {
                console.log('🔄 Vérification forcée du statut...');
                await checkSubscription();
                window.location.reload();
              }}
              variant="outline"
              className="w-full"
            >
              Vérifier mon abonnement
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 overflow-x-hidden max-w-full w-full">
      <div className="container mx-auto max-w-full w-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mes Matches</h1>
              <p className="text-muted-foreground">Découvrez vos compatibilités et commencez à discuter</p>
            </div>
          </div>

          <Tabs defaultValue="mutual" className="space-y-6">
            <ResponsiveTabsList tabCount={2}>
              <TabsTrigger value="mutual" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Matches Mutuels ({mutualMatches.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En Attente ({pendingMatches.length})
              </TabsTrigger>
            </ResponsiveTabsList>

            <TabsContent value="mutual" className="space-y-4">
              {mutualMatches.length > 0 ? (
                <>
                {/* Mobile View - Cards */}
                {isMobile ? (
                  <div className="space-y-3">
                    {sortMatches(mutualMatches).slice((mutualPage - 1) * matchesPerPage, mutualPage * matchesPerPage).map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        statusBadge={getStatusBadge(match)}
                        onViewProfile={viewProfile}
                        onStartChat={startChat}
                      />
                    ))}
                  </div>
                ) : (
                  /* Desktop View - Table */
                  <div className="border rounded-lg overflow-x-auto max-w-full">
                    <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">Photo</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Nom
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('score')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Score
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('date')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Date du match
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortMatches(mutualMatches).slice((mutualPage - 1) * matchesPerPage, mutualPage * matchesPerPage).map((match) => (
                        <TableRow key={match.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="h-12 w-12 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                              <span className="text-sm text-primary-foreground font-bold">
                                {match.other_user?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium text-foreground truncate">{match.other_user?.full_name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {match.other_user?.age} ans • {match.other_user?.location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-emerald/50 text-emerald">
                              {match.match_score}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(match.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(match)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => viewProfile(match.other_user.user_id)}
                                variant="outline"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Profil
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startChat(match.id)}
                                disabled={match.conversation_status === 'ended'}
                                className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}

                {/* Pagination for Mutual Matches */}
                {mutualMatches.length > matchesPerPage && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setMutualPage(p => Math.max(1, p - 1))}
                          className={mutualPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.ceil(mutualMatches.length / matchesPerPage) }, (_, i) => {
                        const pageNumber = i + 1;
                        const totalPages = Math.ceil(mutualMatches.length / matchesPerPage);
                        
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= mutualPage - 1 && pageNumber <= mutualPage + 1)
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setMutualPage(pageNumber)}
                                isActive={mutualPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === mutualPage - 2 ||
                          pageNumber === mutualPage + 2
                        ) {
                          return <PaginationEllipsis key={i} />;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setMutualPage(p => Math.min(Math.ceil(mutualMatches.length / matchesPerPage), p + 1))}
                          className={mutualPage >= Math.ceil(mutualMatches.length / matchesPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun match mutuel</h3>
                  <p className="text-muted-foreground mb-4">Continuez à découvrir des profils pour trouver votre partenaire idéal</p>
                  <Button onClick={() => navigate('/browse')} className="bg-emerald hover:bg-emerald-dark text-primary-foreground">
                    Découvrir des profils
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingMatches.length > 0 ? (
                <>
                {/* Mobile View - Cards */}
                {isMobile ? (
                  <div className="space-y-3">
                    {sortMatches(pendingMatches).slice((pendingPage - 1) * matchesPerPage, pendingPage * matchesPerPage).map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        statusBadge={getStatusBadge(match)}
                        onViewProfile={viewProfile}
                        onStartChat={startChat}
                      />
                    ))}
                  </div>
                ) : (
                  /* Desktop View - Table */
                  <div className="border rounded-lg overflow-x-auto max-w-full">
                    <Table className="min-w-full">
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-16">Photo</TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('name')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Nom
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('score')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Score
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>
                          <button 
                            onClick={() => handleSort('date')}
                            className="flex items-center gap-1 hover:text-foreground"
                          >
                            Date du match
                            <ArrowUpDown className="h-4 w-4" />
                          </button>
                        </TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortMatches(pendingMatches).slice((pendingPage - 1) * matchesPerPage, pendingPage * matchesPerPage).map((match) => (
                        <TableRow key={match.id} className="hover:bg-muted/30">
                          <TableCell>
                            <div className="h-12 w-12 bg-gradient-to-br from-sage to-sage-dark rounded-full flex items-center justify-center">
                              <span className="text-sm text-primary-foreground font-bold">
                                {match.other_user?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px]">
                              <div className="font-medium text-foreground truncate">{match.other_user?.full_name}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {match.other_user?.age} ans • {match.other_user?.location}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {match.match_score}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground">
                              {new Date(match.created_at).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </span>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(match)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => viewProfile(match.other_user.user_id)}
                                variant="outline"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Profil
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => startChat(match.id)}
                                disabled={!match.is_mutual}
                                className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                              >
                                <MessageCircle className="h-3 w-3 mr-1" />
                                Message
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}

                {/* Pagination for Pending Matches */}
                {pendingMatches.length > matchesPerPage && (
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => setPendingPage(p => Math.max(1, p - 1))}
                          className={pendingPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {Array.from({ length: Math.ceil(pendingMatches.length / matchesPerPage) }, (_, i) => {
                        const pageNumber = i + 1;
                        const totalPages = Math.ceil(pendingMatches.length / matchesPerPage);
                        
                        if (
                          pageNumber === 1 ||
                          pageNumber === totalPages ||
                          (pageNumber >= pendingPage - 1 && pageNumber <= pendingPage + 1)
                        ) {
                          return (
                            <PaginationItem key={i}>
                              <PaginationLink
                                onClick={() => setPendingPage(pageNumber)}
                                isActive={pendingPage === pageNumber}
                                className="cursor-pointer"
                              >
                                {pageNumber}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (
                          pageNumber === pendingPage - 2 ||
                          pageNumber === pendingPage + 2
                        ) {
                          return <PaginationEllipsis key={i} />;
                        }
                        return null;
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => setPendingPage(p => Math.min(Math.ceil(pendingMatches.length / matchesPerPage), p + 1))}
                          className={pendingPage >= Math.ceil(pendingMatches.length / matchesPerPage) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">Aucun match en attente</h3>
                  <p className="text-muted-foreground">Tous vos matches ont été traités</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Matches;