import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import StarRating from '@/components/StarRating';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Phone, 
  Video, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  MessageSquare 
} from 'lucide-react';

interface CallFeedback {
  id: string;
  call_id: string;
  user_id: string;
  rating: number;
  audio_quality: string | null;
  video_quality: string | null;
  connection_stability: string | null;
  technical_issues: string[] | null;
  comments: string | null;
  created_at: string;
}

interface FeedbackStats {
  totalFeedbacks: number;
  averageRating: number;
  audioQualityDistribution: { [key: string]: number };
  videoQualityDistribution: { [key: string]: number };
  connectionStabilityDistribution: { [key: string]: number };
  commonIssues: { issue: string; count: number }[];
  ratingDistribution: { rating: number; count: number }[];
}

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];

const CallFeedbackDashboard = () => {
  const { toast } = useToast();
  const [feedbacks, setFeedbacks] = useState<CallFeedback[]>([]);
  const [stats, setStats] = useState<FeedbackStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d');

  useEffect(() => {
    fetchFeedbacks();
  }, [timeRange]);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('call_feedback')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by time range
      if (timeRange !== 'all') {
        const days = timeRange === '7d' ? 7 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      setFeedbacks(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les feedbacks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (feedbacks: CallFeedback[]) => {
    if (feedbacks.length === 0) {
      setStats(null);
      return;
    }

    // Average rating
    const averageRating = feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length;

    // Quality distributions
    const audioQuality: { [key: string]: number } = {};
    const videoQuality: { [key: string]: number } = {};
    const connectionStability: { [key: string]: number } = {};
    const issuesMap: { [key: string]: number } = {};
    const ratingCounts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    feedbacks.forEach(feedback => {
      // Audio quality
      if (feedback.audio_quality) {
        audioQuality[feedback.audio_quality] = (audioQuality[feedback.audio_quality] || 0) + 1;
      }

      // Video quality
      if (feedback.video_quality && feedback.video_quality !== 'not_applicable') {
        videoQuality[feedback.video_quality] = (videoQuality[feedback.video_quality] || 0) + 1;
      }

      // Connection stability
      if (feedback.connection_stability) {
        connectionStability[feedback.connection_stability] = (connectionStability[feedback.connection_stability] || 0) + 1;
      }

      // Technical issues
      if (feedback.technical_issues) {
        feedback.technical_issues.forEach(issue => {
          issuesMap[issue] = (issuesMap[issue] || 0) + 1;
        });
      }

      // Rating distribution
      if (feedback.rating >= 1 && feedback.rating <= 5) {
        ratingCounts[feedback.rating] = (ratingCounts[feedback.rating] || 0) + 1;
      }
    });

    // Convert to arrays for charts
    const commonIssues = Object.entries(issuesMap)
      .map(([issue, count]) => ({ issue, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const ratingDistribution = Object.entries(ratingCounts)
      .map(([rating, count]) => ({ rating: parseInt(rating), count }));

    setStats({
      totalFeedbacks: feedbacks.length,
      averageRating,
      audioQualityDistribution: audioQuality,
      videoQualityDistribution: videoQuality,
      connectionStabilityDistribution: connectionStability,
      commonIssues,
      ratingDistribution
    });
  };

  const getQualityLabel = (quality: string): string => {
    const labels: { [key: string]: string } = {
      excellent: 'Excellente',
      good: 'Bonne',
      fair: 'Correcte',
      poor: 'Mauvaise',
      not_applicable: 'N/A'
    };
    return labels[quality] || quality;
  };

  const getQualityColor = (quality: string): string => {
    const colors: { [key: string]: string } = {
      excellent: 'bg-green-500',
      good: 'bg-blue-500',
      fair: 'bg-yellow-500',
      poor: 'bg-red-500'
    };
    return colors[quality] || 'bg-gray-500';
  };

  const getIssueLabel = (issueId: string): string => {
    const labels: { [key: string]: string } = {
      audio_echo: 'Écho audio',
      audio_cutting: 'Audio coupé',
      video_freezing: 'Vidéo gelée',
      video_blur: 'Vidéo floue',
      connection_dropped: 'Connexion perdue',
      delay_lag: 'Délai/latence',
      no_audio: 'Pas de son',
      no_video: 'Pas de vidéo',
      other: 'Autre'
    };
    return labels[issueId] || issueId;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Feedbacks d'appels</h2>
          <p className="text-muted-foreground mt-1">
            Analyse des retours utilisateurs pour améliorer la qualité
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timeRange === '7d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('7d')}
          >
            7 jours
          </Button>
          <Button
            variant={timeRange === '30d' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('30d')}
          >
            30 jours
          </Button>
          <Button
            variant={timeRange === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setTimeRange('all')}
          >
            Tout
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedbacks</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFeedbacks}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Note moyenne</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(2)}</div>
                <StarRating rating={Math.round(stats.averageRating)} readonly size="sm" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Problèmes signalés</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.commonIssues.reduce((sum, issue) => sum + issue.count, 0)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {stats && (
        <Tabs defaultValue="ratings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ratings">Notes</TabsTrigger>
            <TabsTrigger value="quality">Qualité</TabsTrigger>
            <TabsTrigger value="issues">Problèmes</TabsTrigger>
            <TabsTrigger value="feedback">Détails</TabsTrigger>
          </TabsList>

          <TabsContent value="ratings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Distribution des notes</CardTitle>
                <CardDescription>Répartition des évaluations 1-5 étoiles</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={stats.ratingDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="rating" label={{ value: 'Note', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Nombre', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="quality" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Qualité Audio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.audioQualityDistribution).map(([quality, count]) => (
                      <div key={quality} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`} />
                          <span className="text-sm">{getQualityLabel(quality)}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    Qualité Vidéo
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.videoQualityDistribution).map(([quality, count]) => (
                      <div key={quality} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`} />
                          <span className="text-sm">{getQualityLabel(quality)}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Stabilité Connexion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(stats.connectionStabilityDistribution).map(([quality, count]) => (
                      <div key={quality} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getQualityColor(quality)}`} />
                          <span className="text-sm">{getQualityLabel(quality)}</span>
                        </div>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="issues" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Problèmes techniques les plus fréquents</CardTitle>
                <CardDescription>Top 10 des problèmes signalés</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={stats.commonIssues} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis 
                      type="category" 
                      dataKey="issue" 
                      width={150}
                      tickFormatter={getIssueLabel}
                    />
                    <Tooltip formatter={(value, name, props) => [value, getIssueLabel(props.payload.issue)]} />
                    <Bar dataKey="count" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-4">
            <div className="space-y-4">
              {feedbacks.slice(0, 50).map((feedback) => (
                <Card key={feedback.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <StarRating rating={feedback.rating} readonly size="sm" />
                        <span className="text-sm text-muted-foreground">
                          {new Date(feedback.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        {feedback.audio_quality && (
                          <Badge variant="outline">{getQualityLabel(feedback.audio_quality)}</Badge>
                        )}
                        {feedback.video_quality && feedback.video_quality !== 'not_applicable' && (
                          <Badge variant="outline">{getQualityLabel(feedback.video_quality)}</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {(feedback.technical_issues || feedback.comments) && (
                    <CardContent className="space-y-2">
                      {feedback.technical_issues && feedback.technical_issues.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-1">Problèmes signalés:</p>
                          <div className="flex flex-wrap gap-1">
                            {feedback.technical_issues.map((issue, idx) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {getIssueLabel(issue)}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {feedback.comments && (
                        <div>
                          <p className="text-sm font-medium mb-1">Commentaire:</p>
                          <p className="text-sm text-muted-foreground">{feedback.comments}</p>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {!stats && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun feedback disponible pour cette période</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CallFeedbackDashboard;