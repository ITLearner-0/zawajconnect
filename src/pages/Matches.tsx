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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  verification_score?: number;
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

/* ─── inline style helpers using design-system tokens ─── */
const pageBg: React.CSSProperties = { background: 'var(--color-bg-page)' };
const cardStyle: React.CSSProperties = {
  background: 'var(--color-bg-card)',
  border: '1px solid var(--color-border-default)',
  borderRadius: '16px',
};
const primaryBtnStyle: React.CSSProperties = {
  background: 'var(--color-primary)',
  color: '#fff',
};
const secondaryBtnStyle: React.CSSProperties = {
  border: '1px solid var(--color-border-default)',
  color: 'var(--color-text-secondary)',
};
const scoreBadgeStyle: React.CSSProperties = {
  background: 'var(--color-primary-light)',
  color: 'var(--color-primary)',
};
const tabActiveStyle: React.CSSProperties = {
  color: 'var(--color-primary)',
  borderBottom: '2px solid var(--color-primary)',
};
const tabInactiveStyle: React.CSSProperties = {
  color: 'var(--color-text-muted)',
};

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

      if (matchesData && matchesData.length > 0) {
        // Collect all other user IDs
        const otherUserIds = matchesData.map((m) =>
          m.user1_id === user.id ? m.user2_id : m.user1_id
        );

        // Batch fetch profiles and verification scores in parallel
        const [profilesResult, verificationsResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, age, location, profession, bio, user_id')
            .in('user_id', otherUserIds),
          supabase
            .from('user_verifications')
            .select('user_id, verification_score')
            .in('user_id', otherUserIds),
        ]);

        // Build lookup maps
        const profileMap = (profilesResult.data ?? []).reduce(
          (acc, p) => {
            acc[p.user_id] = p;
            return acc;
          },
          {} as Record<string, (typeof profilesResult.data)[0]>
        );

        const verificationMap = (verificationsResult.data ?? []).reduce(
          (acc, v) => {
            acc[v.user_id] = v.verification_score ?? 0;
            return acc;
          },
          {} as Record<string, number>
        );

        const processedMatches: Match[] = matchesData.map((match) => {
          const otherUserId = match.user1_id === user.id ? match.user2_id : match.user1_id;
          const otherUserProfile = profileMap[otherUserId];

          return {
            ...match,
            match_score: match.match_score ?? 0,
            user1_liked: !!match.user1_liked,
            user2_liked: !!match.user2_liked,
            is_mutual: !!match.is_mutual,
            conversation_status: (match.conversation_status ?? 'not_started') as
              | 'not_started'
              | 'active'
              | 'ended',
            verification_score: verificationMap[otherUserId] ?? 0,
            other_user: otherUserProfile
              ? {
                  ...otherUserProfile,
                  user_id: otherUserId,
                  full_name: otherUserProfile.full_name ?? 'Utilisateur inconnu',
                  age: otherUserProfile.age ?? 0,
                  location: otherUserProfile.location ?? 'Non spécifié',
                  profession: otherUserProfile.profession ?? 'Non spécifié',
                  bio: otherUserProfile.bio ?? '',
                }
              : {
                  id: otherUserId,
                  user_id: otherUserId,
                  full_name: 'Utilisateur inconnu',
                  age: 0,
                  location: 'Non spécifié',
                  profession: 'Non spécifié',
                  bio: '',
                },
          };
        });

        setMatches(processedMatches);
        setMutualMatches(processedMatches.filter((m) => m.is_mutual));
        setPendingMatches(processedMatches.filter((m) => !m.is_mutual));
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
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
          Terminée
        </Badge>
      );
    }
    if (match.conversation_status === 'active') {
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-success)', color: 'var(--color-success)' }}>
          Active
        </Badge>
      );
    }
    if (match.is_mutual) {
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-warning-border)', color: 'var(--color-warning)' }}>
          Mutuel
        </Badge>
      );
    }

    const iLiked =
      (match.user1_id === user?.id && match.user1_liked) ||
      (match.user2_id === user?.id && match.user2_liked);
    const theyLiked =
      (match.user1_id === user?.id && match.user2_liked) ||
      (match.user2_id === user?.id && match.user1_liked);

    if (iLiked && theyLiked) {
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-warning-border)', color: 'var(--color-warning)' }}>
          Mutuel
        </Badge>
      );
    }
    if (iLiked) {
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-success-border)', color: 'var(--color-success)' }}>
          Vous avez liké
        </Badge>
      );
    }
    if (theyLiked) {
      return (
        <Badge variant="outline" style={{ borderColor: 'var(--color-warning-border)', color: 'var(--color-warning)' }}>
          Vous a liké
        </Badge>
      );
    }

    return (
      <Badge variant="outline" style={{ borderColor: 'var(--color-border-default)', color: 'var(--color-text-muted)' }}>
        En attente
      </Badge>
    );
  };

  // Tous les returns conditionnels APRÈS les hooks et fonctions
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={pageBg}>
        <div className="text-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Vérification de votre abonnement...</p>
        </div>
      </div>
    );
  }

  if (!subscription.subscribed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={pageBg}>
        <Card className="max-w-md w-full p-8 text-center space-y-6" style={cardStyle}>
          <div
            className="h-20 w-20 rounded-full flex items-center justify-center mx-auto"
            style={{ background: 'var(--color-primary)' }}
          >
            <Heart className="h-10 w-10 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text-primary)' }}>
              Fonctionnalité Premium
            </h2>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Accédez à vos matches, likes et mises en relation en passant à Premium.
            </p>
          </div>
          <div className="space-y-3">
            <Button
              onClick={() => {
                console.log('Navigation vers Premium...');
                navigate('/settings?tab=premium');
              }}
              className="w-full text-white"
              size="lg"
              style={primaryBtnStyle}
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
              style={secondaryBtnStyle}
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
      <div className="min-h-screen flex items-center justify-center" style={pageBg}>
        <div className="text-center">
          <div
            className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent mx-auto mb-4"
            style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}
          ></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Chargement de vos matches...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 px-4 overflow-x-hidden max-w-full w-full" style={pageBg}>
      <div className="container mx-auto max-w-full w-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="h-12 w-12 rounded-full flex items-center justify-center"
              style={{ background: 'var(--color-primary)' }}
            >
              <Heart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
                Mes Matches
              </h1>
              <p style={{ color: 'var(--color-text-muted)' }}>
                Découvrez vos compatibilités et commencez à discuter
              </p>
            </div>
          </div>

          <Tabs defaultValue="mutual" className="matches-tabs space-y-6">
            <ResponsiveTabsList tabCount={2}>
              <TabsTrigger
                value="mutual"
                className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
                style={{ /* active/inactive styling handled by data-state attr in CSS override below */ }}
              >
                <Users className="h-4 w-4" />
                Matches Mutuels ({mutualMatches.length})
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="flex items-center gap-2 data-[state=active]:shadow-none data-[state=active]:bg-transparent"
              >
                <Clock className="h-4 w-4" />
                En Attente ({pendingMatches.length})
              </TabsTrigger>
            </ResponsiveTabsList>

            {/* Inline style tag for tab active/inactive states via data attributes */}
            <style>{`
              .matches-tabs [data-state="active"] {
                color: var(--color-primary) !important;
                border-bottom: 2px solid var(--color-primary) !important;
                border-radius: 0 !important;
              }
              .matches-tabs [data-state="inactive"] {
                color: var(--color-text-muted) !important;
              }
            `}</style>

            <TabsContent value="mutual" className="space-y-4">
              {mutualMatches.length > 0 ? (
                <>
                  {/* Mobile View - Cards */}
                  {isMobile ? (
                    <div className="space-y-3">
                      {sortMatches(mutualMatches)
                        .slice((mutualPage - 1) * matchesPerPage, mutualPage * matchesPerPage)
                        .map((match) => (
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
                    <div
                      className="overflow-x-auto max-w-full"
                      style={{ border: '1px solid var(--color-border-default)', borderRadius: '16px' }}
                    >
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow style={{ background: 'var(--color-bg-subtle)' }}>
                            <TableHead className="w-16">Photo</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Nom
                                <ArrowUpDown className="h-4 w-4" />
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('score')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Score
                                <ArrowUpDown className="h-4 w-4" />
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('date')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
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
                          {sortMatches(mutualMatches)
                            .slice((mutualPage - 1) * matchesPerPage, mutualPage * matchesPerPage)
                            .map((match) => (
                              <TableRow
                                key={match.id}
                                className="transition-colors"
                                style={{ background: 'var(--color-bg-card)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-card)')}
                              >
                                <TableCell>
                                  <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--color-primary)' }}
                                  >
                                    <span className="text-sm font-bold text-white">
                                      {match.other_user?.full_name?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[200px]">
                                    <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                      {match.other_user?.full_name}
                                    </div>
                                    <div className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                                      {match.other_user?.age} ans • {match.other_user?.location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={scoreBadgeStyle}
                                  >
                                    {match.match_score}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {new Date(match.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </TableCell>
                                <TableCell>{getStatusBadge(match)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => viewProfile(match.other_user.user_id)}
                                      variant="outline"
                                      className="rounded-xl"
                                      style={secondaryBtnStyle}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Voir profil
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => startChat(match.id)}
                                      disabled={match.conversation_status === 'ended'}
                                      className="text-sm rounded-xl text-white"
                                      style={primaryBtnStyle}
                                    >
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Envoyer un message
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
                            onClick={() => setMutualPage((p) => Math.max(1, p - 1))}
                            className={
                              mutualPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.ceil(mutualMatches.length / matchesPerPage) },
                          (_, i) => {
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
                          }
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setMutualPage((p) =>
                                Math.min(Math.ceil(mutualMatches.length / matchesPerPage), p + 1)
                              )
                            }
                            className={
                              mutualPage >= Math.ceil(mutualMatches.length / matchesPerPage)
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--color-bg-subtle)' }}
                  >
                    <Heart className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Aucun match mutuel
                  </h3>
                  <p className="mb-4" style={{ color: 'var(--color-text-muted)' }}>
                    Continuez à découvrir des profils pour trouver votre partenaire idéal
                  </p>
                  <Button
                    onClick={() => navigate('/browse')}
                    className="text-sm rounded-xl text-white"
                    style={primaryBtnStyle}
                  >
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
                      {sortMatches(pendingMatches)
                        .slice((pendingPage - 1) * matchesPerPage, pendingPage * matchesPerPage)
                        .map((match) => (
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
                    <div
                      className="overflow-x-auto max-w-full"
                      style={{ border: '1px solid var(--color-border-default)', borderRadius: '16px' }}
                    >
                      <Table className="min-w-full">
                        <TableHeader>
                          <TableRow style={{ background: 'var(--color-bg-subtle)' }}>
                            <TableHead className="w-16">Photo</TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('name')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Nom
                                <ArrowUpDown className="h-4 w-4" />
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('score')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
                              >
                                Score
                                <ArrowUpDown className="h-4 w-4" />
                              </button>
                            </TableHead>
                            <TableHead>
                              <button
                                onClick={() => handleSort('date')}
                                className="flex items-center gap-1"
                                style={{ color: 'var(--color-text-secondary)' }}
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
                          {sortMatches(pendingMatches)
                            .slice((pendingPage - 1) * matchesPerPage, pendingPage * matchesPerPage)
                            .map((match) => (
                              <TableRow
                                key={match.id}
                                className="transition-colors"
                                style={{ background: 'var(--color-bg-card)' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--color-bg-hover)')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'var(--color-bg-card)')}
                              >
                                <TableCell>
                                  <div
                                    className="h-12 w-12 rounded-full flex items-center justify-center"
                                    style={{ background: 'var(--color-primary)' }}
                                  >
                                    <span className="text-sm font-bold text-white">
                                      {match.other_user?.full_name?.charAt(0) || '?'}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="max-w-[200px]">
                                    <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                                      {match.other_user?.full_name}
                                    </div>
                                    <div className="text-sm truncate" style={{ color: 'var(--color-text-muted)' }}>
                                      {match.other_user?.age} ans • {match.other_user?.location}
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span
                                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold"
                                    style={scoreBadgeStyle}
                                  >
                                    {match.match_score}%
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <span className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                                    {new Date(match.created_at).toLocaleDateString('fr-FR', {
                                      day: 'numeric',
                                      month: 'short',
                                      year: 'numeric',
                                    })}
                                  </span>
                                </TableCell>
                                <TableCell>{getStatusBadge(match)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    <Button
                                      size="sm"
                                      onClick={() => viewProfile(match.other_user.user_id)}
                                      variant="outline"
                                      className="rounded-xl"
                                      style={secondaryBtnStyle}
                                    >
                                      <Eye className="h-3 w-3 mr-1" />
                                      Voir profil
                                    </Button>
                                    <Button
                                      size="sm"
                                      onClick={() => startChat(match.id)}
                                      disabled={!match.is_mutual}
                                      className="text-sm rounded-xl text-white"
                                      style={primaryBtnStyle}
                                    >
                                      <MessageCircle className="h-3 w-3 mr-1" />
                                      Envoyer un message
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
                            onClick={() => setPendingPage((p) => Math.max(1, p - 1))}
                            className={
                              pendingPage === 1
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>

                        {Array.from(
                          { length: Math.ceil(pendingMatches.length / matchesPerPage) },
                          (_, i) => {
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
                          }
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setPendingPage((p) =>
                                Math.min(Math.ceil(pendingMatches.length / matchesPerPage), p + 1)
                              )
                            }
                            className={
                              pendingPage >= Math.ceil(pendingMatches.length / matchesPerPage)
                                ? 'pointer-events-none opacity-50'
                                : 'cursor-pointer'
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div
                    className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: 'var(--color-bg-subtle)' }}
                  >
                    <Clock className="h-8 w-8" style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Aucun match en attente
                  </h3>
                  <p style={{ color: 'var(--color-text-muted)' }}>Tous vos matches ont été traités</p>
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
