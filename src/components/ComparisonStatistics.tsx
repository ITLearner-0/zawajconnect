import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Tag, Users, Calendar } from 'lucide-react';
import { format, startOfMonth, eachMonthOfInterval, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ComparisonHistory {
  id: string;
  compared_profile_ids: string[];
  tags: string[] | null;
  rating: number | null;
  created_at: string;
}

interface ComparisonStatisticsProps {
  history: ComparisonHistory[];
}

const COLORS = ['hsl(var(--emerald))', 'hsl(var(--gold))', 'hsl(var(--sage))', 'hsl(var(--cream))', 'hsl(var(--chart-1))', 'hsl(var(--chart-2))'];

const ComparisonStatistics = ({ history }: ComparisonStatisticsProps) => {
  // Calculate statistics
  const statistics = useMemo(() => {
    // Total comparisons
    const totalComparisons = history.length;

    // Tags frequency
    const tagFrequency: Record<string, number> = {};
    history.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
        });
      }
    });
    
    const topTags = Object.entries(tagFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, value]) => ({ name, value }));

    // Profile frequency
    const profileFrequency: Record<string, number> = {};
    history.forEach(item => {
      item.compared_profile_ids.forEach(profileId => {
        profileFrequency[profileId] = (profileFrequency[profileId] || 0) + 1;
      });
    });
    
    const topProfiles = Object.entries(profileFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, count]) => ({ 
        name: `Profil ${id.slice(0, 8)}...`, 
        value: count,
        id 
      }));

    // Monthly evolution (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 6);
    const monthlyData = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: new Date()
    }).map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
      
      const count = history.filter(item => {
        const itemDate = new Date(item.created_at);
        return itemDate >= monthStart && itemDate <= monthEnd;
      }).length;
      
      return {
        month: format(month, 'MMM yyyy', { locale: fr }),
        comparisons: count
      };
    });

    // Rating distribution
    const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
      rating: `${rating} ⭐`,
      count: history.filter(item => item.rating === rating).length
    }));

    // Average rating
    const ratingsWithValues = history.filter(item => item.rating !== null).map(item => item.rating as number);
    const averageRating = ratingsWithValues.length > 0 
      ? (ratingsWithValues.reduce((sum, r) => sum + r, 0) / ratingsWithValues.length).toFixed(1)
      : 'N/A';

    return {
      totalComparisons,
      topTags,
      topProfiles,
      monthlyData,
      ratingDistribution,
      averageRating,
      totalTags: Object.keys(tagFrequency).length,
      totalProfiles: Object.keys(profileFrequency).length
    };
  }, [history]);

  return (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comparaisons</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalComparisons}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.monthlyData[statistics.monthlyData.length - 1]?.comparisons || 0} ce mois-ci
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tags Utilisés</CardTitle>
            <Tag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalTags}</div>
            <p className="text-xs text-muted-foreground">
              {statistics.topTags[0]?.name || 'Aucun'} (le plus populaire)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profils Comparés</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.totalProfiles}</div>
            <p className="text-xs text-muted-foreground">
              Profils uniques analysés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Note Moyenne</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statistics.averageRating} ⭐</div>
            <p className="text-xs text-muted-foreground">
              Sur {history.filter(h => h.rating !== null).length} évaluations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Evolution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Comparaisons</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={statistics.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="comparisons" 
                  stroke="hsl(var(--emerald))" 
                  strokeWidth={2}
                  name="Comparaisons"
                  dot={{ fill: 'hsl(var(--emerald))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Tags Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Tags les Plus Utilisés</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.topTags}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--gold))" name="Utilisations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Profiles Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Profils les Plus Comparés</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statistics.topProfiles} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  width={120}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" fill="hsl(var(--emerald))" name="Comparaisons" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Rating Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribution des Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statistics.ratingDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ rating, count }) => count > 0 ? `${rating}: ${count}` : null}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statistics.ratingDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tag Cloud */}
      {statistics.topTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Nuage de Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {statistics.topTags.map((tag, index) => (
                <Badge 
                  key={tag.name} 
                  variant="secondary"
                  className="text-sm"
                  style={{
                    fontSize: `${Math.max(0.75, Math.min(1.5, tag.value / 2))}rem`,
                    opacity: 1 - (index * 0.1)
                  }}
                >
                  {tag.name} ({tag.value})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComparisonStatistics;
