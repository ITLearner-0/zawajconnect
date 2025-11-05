import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  MessageCircle, 
  Star, 
  TrendingUp,
  Calendar,
  Crown,
  Gift,
  Users,
  Bell,
  Eye,
  Shield,
  Zap
} from 'lucide-react';
import MobileProfileHeader from './MobileProfileHeader';
import SuccessStoriesShowcase from './SuccessStoriesShowcase';
import PremiumSubscription from './PremiumSubscription';
import IslamicCalendarWidget from './IslamicCalendarWidget';

interface DashboardStats {
  total_matches: number;
  mutual_matches: number;
  messages_count: number;
  profile_views: number;
  likes_received: number;
  verification_score: number;
}

interface RecentActivity {
  id: string;
  type: 'like' | 'match' | 'message' | 'view';
  user_name: string;
  user_avatar?: string;
  timestamp: string;
  read: boolean;
}

const EnhancedDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    total_matches: 0,
    mutual_matches: 0,
    messages_count: 0,
    profile_views: 0,
    likes_received: 0,
    verification_score: 0
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profile) {
        setUserProfile(profile);
      }

      // Load dashboard stats
      await Promise.all([
        loadMatches(),
        loadMessages(), 
        loadProfileViews(),
        loadVerificationScore(),
        loadRecentActivity()
      ]);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du tableau de bord",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadMatches = async () => {
    if (!user) return;

    try {
      const { data: matches } = await supabase
        .from('matches')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      const totalMatches = matches?.length || 0;
      const mutualMatches = matches?.filter(m => m.is_mutual)?.length || 0;

      setStats(prev => ({
        ...prev,
        total_matches: totalMatches,
        mutual_matches: mutualMatches
      }));
    } catch (error) {
      console.error('Error loading matches:', error);
    }
  };

  const loadMessages = async () => {
    if (!user) return;

    try {
      const { data: messages } = await supabase
        .from('messages')
        .select('*')
        .eq('sender_id', user.id);

      setStats(prev => ({
        ...prev,
        messages_count: messages?.length || 0
      }));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadProfileViews = async () => {
    if (!user) return;

    try {
      const { count } = await supabase
        .from('profile_views')
        .select('*', { count: 'exact', head: true })
        .eq('viewed_id', user.id);

      setStats(prev => ({
        ...prev,
        profile_views: count || 0
      }));
    } catch (error) {
      console.error('Error loading profile views:', error);
    }
  };

  const loadVerificationScore = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('user_verifications')
        .select('verification_score')
        .eq('user_id', user.id)
        .maybeSingle();

      setStats(prev => ({
        ...prev,
        verification_score: data?.verification_score || 0
      }));
    } catch (error) {
      console.error('Error loading verification score:', error);
    }
  };

  const loadRecentActivity = async () => {
    // Load from database when available
    setRecentActivity([]);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'like':
                        return <Heart className="h-4 w-4 text-destructive" />;
      case 'match':
        return <Star className="h-4 w-4 text-gold" />;
      case 'message':
        return <MessageCircle className="h-4 w-4 text-primary" />;
      case 'view':
        return <Eye className="h-4 w-4 text-emerald" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getActivityText = (activity: RecentActivity) => {
    switch (activity.type) {
      case 'like':
        return `${activity.user_name} a liké votre profil`;
      case 'match':
        return `Nouveau match avec ${activity.user_name} !`;
      case 'message':
        return `Nouveau message de ${activity.user_name}`;
      case 'view':
        return `${activity.user_name} a consulté votre profil`;
      default:
        return 'Nouvelle activité';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5">
        <div className="container mx-auto max-w-6xl p-4">
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-24 bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream via-sage/20 to-emerald/5 pb-20 md:pb-4">
      <div className="container mx-auto max-w-6xl p-4">
        {/* Mobile Profile Header */}
        <MobileProfileHeader profile={userProfile ?? undefined} />

        {/* Desktop Header */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Tableau de Bord</h1>
            <p className="text-muted-foreground">Gérez votre recherche de partenaire</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/settings')}>
              Paramètres
            </Button>
            <Button className="bg-emerald hover:bg-emerald-dark" onClick={() => navigate('/browse')}>
              Découvrir des profils
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <IslamicCalendarWidget />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                <TabsTrigger value="activity">Activité</TabsTrigger>
                <TabsTrigger value="success">Réussites</TabsTrigger>
                <TabsTrigger value="premium">Premium</TabsTrigger>
              </TabsList>

              <div className="mt-6">
                <TabsContent value="overview" className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <Heart className="h-8 w-8 text-emerald mx-auto mb-2" />
                        <div className="text-2xl font-bold text-emerald">{stats.mutual_matches}</div>
                        <div className="text-sm text-muted-foreground">Matches Mutuels</div>
                      </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                       <CardContent className="p-4 text-center">
                         <MessageCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                         <div className="text-2xl font-bold text-primary">{stats.messages_count}</div>
                         <div className="text-sm text-muted-foreground">Messages Envoyés</div>
                       </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                       <CardContent className="p-4 text-center">
                         <Eye className="h-8 w-8 text-secondary mx-auto mb-2" />
                         <div className="text-2xl font-bold text-secondary">{stats.profile_views}</div>
                         <div className="text-sm text-muted-foreground">Vues de Profil</div>
                       </CardContent>
                    </Card>
                    
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 text-center">
                        <Shield className="h-8 w-8 text-gold mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gold">{stats.verification_score}%</div>
                        <div className="text-sm text-muted-foreground">Vérification</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-gold" />
                        Actions Rapides
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/browse')}
                          className="justify-start h-auto p-4 flex-col items-start"
                        >
                          <Heart className="h-6 w-6 text-emerald mb-2" />
                          <div>
                            <div className="font-semibold">Découvrir</div>
                            <div className="text-sm text-muted-foreground">Nouveaux profils</div>
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/matches')}
                          className="justify-start h-auto p-4 flex-col items-start"
                        >
                          <Star className="h-6 w-6 text-gold mb-2" />
                          <div>
                            <div className="font-semibold">Matches</div>
                            <div className="text-sm text-muted-foreground">{stats.mutual_matches} mutuels</div>
                          </div>
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={() => navigate('/chat')}
                          className="justify-start h-auto p-4 flex-col items-start"
                        >
                          <MessageCircle className="h-6 w-6 text-primary mb-2" />
                          <div>
                            <div className="font-semibold">Messages</div>
                            <div className="text-sm text-muted-foreground">Conversations</div>
                          </div>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Activité Récente</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivity.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivity.map((activity) => (
                            <div 
                              key={activity.id} 
                              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                                !activity.read ? 'bg-emerald/5 border border-emerald/20' : 'hover:bg-muted/50'
                              }`}
                            >
                              <div className="flex-shrink-0">
                                {getActivityIcon(activity.type)}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-medium">
                                  {getActivityText(activity)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(activity.timestamp).toLocaleDateString('fr-FR', {
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </p>
                              </div>
                              {!activity.read && (
                                <Badge className="bg-emerald text-white text-xs">
                                  Nouveau
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <p className="text-muted-foreground">Aucune activité récente</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="success">
                  <SuccessStoriesShowcase />
                </TabsContent>

                <TabsContent value="premium">
                  <PremiumSubscription />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedDashboard;