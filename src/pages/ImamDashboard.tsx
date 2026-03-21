import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Building2, Users, Heart, Calendar, TrendingUp, MessageSquare,
  CheckCircle2, Clock, AlertTriangle, Star, FileText, Search,
  BarChart3, UserPlus, Eye, ChevronRight, Sparkles, Shield
} from 'lucide-react';

interface MosqueMember {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F';
  status: 'active' | 'matched' | 'married' | 'paused';
  registeredDate: string;
  compatibility: number;
}

interface CoupleRequest {
  id: string;
  person1: string;
  person2: string;
  requestDate: string;
  status: 'pending' | 'in-progress' | 'completed' | 'declined';
  type: 'meeting' | 'nikah' | 'mediation';
}

const members: MosqueMember[] = [
  { id: '1', name: 'Ahmed M.', age: 29, gender: 'M', status: 'active', registeredDate: '2026-01-15', compatibility: 0 },
  { id: '2', name: 'Fatima A.', age: 26, gender: 'F', status: 'matched', registeredDate: '2026-01-20', compatibility: 88 },
  { id: '3', name: 'Omar K.', age: 32, gender: 'M', status: 'active', registeredDate: '2026-02-05', compatibility: 0 },
  { id: '4', name: 'Khadija M.', age: 28, gender: 'F', status: 'married', registeredDate: '2025-11-10', compatibility: 92 },
  { id: '5', name: 'Youssef B.', age: 27, gender: 'M', status: 'paused', registeredDate: '2026-02-20', compatibility: 0 },
  { id: '6', name: 'Aisha R.', age: 25, gender: 'F', status: 'active', registeredDate: '2026-03-01', compatibility: 0 },
  { id: '7', name: 'Ibrahim S.', age: 30, gender: 'M', status: 'matched', registeredDate: '2026-01-08', compatibility: 85 },
  { id: '8', name: 'Maryam L.', age: 24, gender: 'F', status: 'active', registeredDate: '2026-03-10', compatibility: 0 },
];

const coupleRequests: CoupleRequest[] = [
  { id: '1', person1: 'Ahmed M.', person2: 'Fatima A.', requestDate: '2026-03-15', status: 'pending', type: 'meeting' },
  { id: '2', person1: 'Ibrahim S.', person2: 'Aisha R.', requestDate: '2026-03-12', status: 'in-progress', type: 'meeting' },
  { id: '3', person1: 'Omar K.', person2: 'Maryam L.', requestDate: '2026-03-18', status: 'pending', type: 'meeting' },
  { id: '4', person1: 'Khadija M.', person2: 'Hamza T.', requestDate: '2026-02-28', status: 'completed', type: 'nikah' },
];

const stats = {
  totalMembers: 48,
  activeSeekers: 32,
  matchesThisMonth: 6,
  marriagesTotal: 12,
  pendingRequests: 3,
  successRate: 78,
};

const ImamDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-emerald-100 text-emerald-700">Actif</Badge>;
      case 'matched': return <Badge className="bg-blue-100 text-blue-700">En contact</Badge>;
      case 'married': return <Badge className="bg-pink-100 text-pink-700">Marié(e)</Badge>;
      case 'paused': return <Badge className="bg-gray-100 text-gray-600">En pause</Badge>;
      default: return null;
    }
  };

  const getRequestStatus = (status: string) => {
    switch (status) {
      case 'pending': return <Badge className="bg-amber-100 text-amber-700"><Clock className="h-3 w-3 mr-1" /> En attente</Badge>;
      case 'in-progress': return <Badge className="bg-blue-100 text-blue-700"><Eye className="h-3 w-3 mr-1" /> En cours</Badge>;
      case 'completed': return <Badge className="bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-3 w-3 mr-1" /> Terminé</Badge>;
      case 'declined': return <Badge className="bg-red-100 text-red-700">Décliné</Badge>;
      default: return null;
    }
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 text-white mb-2">
          <Building2 className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Tableau de bord Imam / Mosquée
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Gérez les membres de votre communauté en recherche de mariage, facilitez les rencontres et célébrez les unions.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Membres', value: stats.totalMembers, icon: Users, color: 'text-blue-600 bg-blue-100' },
          { label: 'En recherche', value: stats.activeSeekers, icon: Search, color: 'text-emerald-600 bg-emerald-100' },
          { label: 'Matches/mois', value: stats.matchesThisMonth, icon: Heart, color: 'text-pink-600 bg-pink-100' },
          { label: 'Mariages', value: stats.marriagesTotal, icon: Star, color: 'text-amber-600 bg-amber-100' },
          { label: 'Demandes', value: stats.pendingRequests, icon: Clock, color: 'text-orange-600 bg-orange-100' },
          { label: 'Succès', value: `${stats.successRate}%`, icon: TrendingUp, color: 'text-purple-600 bg-purple-100' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="text-center">
              <CardContent className="pt-4 pb-4">
                <div className={`w-10 h-10 rounded-full mx-auto flex items-center justify-center ${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <p className="text-xl font-bold mt-2">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="members">Membres</TabsTrigger>
          <TabsTrigger value="requests">
            Demandes
            <Badge className="ml-2 bg-amber-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {stats.pendingRequests}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="insights">Statistiques</TabsTrigger>
        </TabsList>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <UserPlus className="h-4 w-4 mr-2" /> Ajouter
            </Button>
          </div>

          <div className="space-y-2">
            {filteredMembers.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-3 pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        member.gender === 'M'
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                          : 'bg-gradient-to-br from-pink-400 to-pink-600'
                      }`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">{member.name}</p>
                          {getStatusBadge(member.status)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {member.age} ans • Inscrit le {member.registeredDate}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {member.compatibility > 0 && (
                        <Badge className="bg-emerald-100 text-emerald-700">
                          <Heart className="h-3 w-3 mr-1" /> {member.compatibility}%
                        </Badge>
                      )}
                      <Button size="sm" variant="ghost">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-3">
          {coupleRequests.map((req) => (
            <Card key={req.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white z-10">
                        {req.person1.charAt(0)}
                      </div>
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center text-white font-bold text-sm border-2 border-white">
                        {req.person2.charAt(0)}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{req.person1} & {req.person2}</p>
                      <p className="text-xs text-muted-foreground">
                        {req.type === 'meeting' ? 'Demande de rencontre' :
                         req.type === 'nikah' ? 'Cérémonie de Nikah' : 'Médiation'} • {req.requestDate}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRequestStatus(req.status)}
                    {req.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 h-8">
                          Accepter
                        </Button>
                        <Button size="sm" variant="outline" className="h-8">
                          Détails
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Répartition par genre
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Hommes</span>
                      <span className="font-medium">28 (58%)</span>
                    </div>
                    <Progress value={58} className="h-3" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Femmes</span>
                      <span className="font-medium">20 (42%)</span>
                    </div>
                    <Progress value={42} className="h-3" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Taux de réussite
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="w-24 h-24 rounded-full border-8 border-emerald-500 flex items-center justify-center mx-auto bg-emerald-50">
                    <span className="text-2xl font-bold text-emerald-600">78%</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    12 mariages sur 15 rencontres facilitées cette année
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-amber-500" />
                  Activité mensuelle
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[
                    { month: 'Mars 2026', matches: 6, marriages: 1 },
                    { month: 'Février 2026', matches: 4, marriages: 2 },
                    { month: 'Janvier 2026', matches: 5, marriages: 1 },
                  ].map((m) => (
                    <div key={m.month} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <span className="text-sm">{m.month}</span>
                      <div className="flex gap-2">
                        <Badge variant="outline" className="text-xs">
                          <Heart className="h-3 w-3 mr-1 text-pink-500" /> {m.matches}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <Star className="h-3 w-3 mr-1 text-amber-500" /> {m.marriages}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-500" />
                  Suggestions IA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <strong>Ahmed M.</strong> et <strong>Maryam L.</strong> ont une compatibilité de 87%.
                    Valeurs communes : religion, famille, ambition.
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <p className="text-sm text-purple-800">
                    <strong>Omar K.</strong> cherche une personne pratiquante à Marseille.
                    <strong> Aisha R.</strong> correspond au profil.
                  </p>
                </div>
                <Button variant="outline" className="w-full border-purple-300 text-purple-600">
                  Voir toutes les suggestions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ImamDashboard;
