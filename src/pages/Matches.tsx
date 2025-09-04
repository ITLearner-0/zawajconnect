import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Heart, MessageCircle, Eye, Users, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  match_score: number;
  user1_liked: boolean;
  user2_liked: boolean;
  is_mutual: boolean;
  created_at: string;
  other_user: {
    id: string;
    full_name: string;
    age: number;
    location: string;
    profession: string;
    bio: string;
  };
}

const Matches = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [matches, setMatches] = useState<Match[]>([]);
  const [mutualMatches, setMutualMatches] = useState<Match[]>([]);
  const [pendingMatches, setPendingMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchMatches();
  }, [user]);

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
              .single();

            return {
              ...match,
              other_user: otherUserProfile || {
                id: otherUserId,
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
    <div className="py-8 px-4">
      <div className="container mx-auto">
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
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="mutual" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Matches Mutuels ({mutualMatches.length})
              </TabsTrigger>
              <TabsTrigger value="pending" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                En Attente ({pendingMatches.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mutual" className="space-y-4">
              {mutualMatches.length > 0 ? (
                <div className="grid gap-4">
                  {mutualMatches.map((match) => (
                    <Card key={match.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 bg-gradient-to-br from-emerald to-emerald-light rounded-full flex items-center justify-center">
                              <span className="text-xl text-primary-foreground font-bold">
                                {match.other_user?.full_name?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-foreground">
                                  {match.other_user?.full_name}
                                </h3>
                                <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                                  {match.match_score}% compatible
                                </Badge>
                                <Badge variant="secondary" className="bg-gold/10 text-gold-dark border-gold/20">
                                  Match mutuel 💕
                                </Badge>
                              </div>
                              <p className="text-muted-foreground mb-1">
                                {match.other_user?.age} ans • {match.other_user?.location}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {match.other_user?.profession}
                              </p>
                              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                {match.other_user?.bio}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={() => startChat(match.id)}
                              className="bg-emerald hover:bg-emerald-dark text-primary-foreground"
                            >
                              <MessageCircle className="h-4 w-4 mr-2" />
                              Discuter
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => viewProfile(match.other_user.id)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Voir profil
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
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
                <div className="grid gap-4">
                  {pendingMatches.map((match) => {
                    const iLiked = (match.user1_id === user?.id && match.user1_liked) || 
                                   (match.user2_id === user?.id && match.user2_liked);
                    const theyLiked = (match.user1_id === user?.id && match.user2_liked) || 
                                      (match.user2_id === user?.id && match.user1_liked);

                    return (
                      <Card key={match.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-16 bg-gradient-to-br from-sage to-sage-dark rounded-full flex items-center justify-center">
                                <span className="text-xl text-primary-foreground font-bold">
                                  {match.other_user?.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h3 className="text-xl font-bold text-foreground">
                                    {match.other_user?.full_name}
                                  </h3>
                                  <Badge variant="outline">
                                    {match.match_score}% compatible
                                  </Badge>
                                  {iLiked && (
                                    <Badge className="bg-emerald/10 text-emerald border-emerald/20">
                                      Vous avez liké
                                    </Badge>
                                  )}
                                  {theyLiked && (
                                    <Badge className="bg-gold/10 text-gold-dark border-gold/20">
                                      Vous a liké
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-muted-foreground mb-1">
                                  {match.other_user?.age} ans • {match.other_user?.location}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {match.other_user?.profession}
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <Button
                                variant="outline"
                                onClick={() => viewProfile(match.other_user.id)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir profil
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
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