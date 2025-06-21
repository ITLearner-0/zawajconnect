
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import BehaviorScoreDisplay from './BehaviorScoreDisplay';
import AppealForm from './AppealForm';
import { BehaviorAnalyzer, BehaviorScore } from '@/services/moderation/behaviorAnalyzer';
import { ProactiveFilter } from '@/services/moderation/proactiveFilter';
import { AppealSystem, Appeal } from '@/services/moderation/appealSystem';
import { useToast } from '@/hooks/use-toast';

interface ModerationDashboardProps {
  userId: string;
  userRole: 'user' | 'moderator' | 'admin';
  className?: string;
}

const ModerationDashboard: React.FC<ModerationDashboardProps> = ({
  userId,
  userRole,
  className = ''
}) => {
  const { toast } = useToast();
  const [behaviorScore, setBehaviorScore] = useState<BehaviorScore | null>(null);
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [showAppealForm, setShowAppealForm] = useState(false);
  const [selectedAction, setSelectedAction] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Mock data - replace with actual API calls
  const moderationStats = {
    totalFlags: 143,
    pendingReviews: 28,
    resolvedToday: 15,
    falsePositives: 3
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load behavior score (mock data)
      const mockMessages: any[] = []; // Replace with actual messages
      const score = BehaviorAnalyzer.analyzeBehavior(mockMessages, userId);
      setBehaviorScore(score);

      // Load appeals
      const userAppeals = await AppealSystem.getUserAppeals(userId);
      setAppeals(userAppeals);
    } catch (error) {
      console.error('Error loading moderation data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de modération",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAppealSubmitted = () => {
    setShowAppealForm(false);
    setSelectedAction(null);
    loadData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Tableau de Modération
        </h2>
        {userRole !== 'user' && (
          <Badge variant="outline">
            {userRole === 'admin' ? 'Administrateur' : 'Modérateur'}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="behavior">Comportement</TabsTrigger>
          <TabsTrigger value="appeals">Appels</TabsTrigger>
          {userRole !== 'user' && (
            <TabsTrigger value="moderation">Modération</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Signalements</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderationStats.totalFlags}</div>
                <p className="text-xs text-muted-foreground">
                  +12% par rapport au mois dernier
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Attente</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderationStats.pendingReviews}</div>
                <p className="text-xs text-muted-foreground">
                  Nécessitent une révision
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Résolus Aujourd'hui</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderationStats.resolvedToday}</div>
                <p className="text-xs text-muted-foreground">
                  +8% d'efficacité
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faux Positifs</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{moderationStats.falsePositives}</div>
                <p className="text-xs text-muted-foreground">
                  -2% ce mois-ci
                </p>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Le système de modération automatique analyse en permanence les comportements 
              pour maintenir un environnement sûr et respectueux.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          {behaviorScore ? (
            <BehaviorScoreDisplay 
              behaviorScore={behaviorScore} 
              showDetails={true}
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-2">Pas Assez de Données</h3>
                <p className="text-sm text-muted-foreground">
                  Continuez à utiliser la plateforme pour générer votre score comportemental.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appeals" className="space-y-4">
          {showAppealForm ? (
            <AppealForm
              moderationActionId={selectedAction?.id || ''}
              originalAction={selectedAction || {
                type: 'Test Action',
                reason: 'Test Reason',
                date: new Date().toLocaleDateString()
              }}
              onAppealSubmitted={handleAppealSubmitted}
              onCancel={() => {
                setShowAppealForm(false);
                setSelectedAction(null);
              }}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Mes Appels</h3>
                <Button 
                  onClick={() => {
                    setSelectedAction({
                      id: 'demo-action',
                      type: 'Avertissement',
                      reason: 'Message inapproprié détecté',
                      date: new Date().toLocaleDateString()
                    });
                    setShowAppealForm(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  Nouvel Appel (Demo)
                </Button>
              </div>

              {appeals.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <Scale className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="font-medium mb-2">Aucun Appel</h3>
                    <p className="text-sm text-muted-foreground">
                      Vous n'avez soumis aucun appel pour le moment.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {appeals.map((appeal) => (
                    <Card key={appeal.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{appeal.originalAction.type}</h4>
                            <p className="text-sm text-muted-foreground">
                              {appeal.appealReason}
                            </p>
                            <div className="text-xs text-muted-foreground">
                              Soumis le {new Date(appeal.submittedAt).toLocaleDateString()}
                            </div>
                          </div>
                          <Badge 
                            variant={
                              appeal.status === 'approved' ? 'default' :
                              appeal.status === 'rejected' ? 'destructive' :
                              appeal.status === 'under_review' ? 'secondary' :
                              'outline'
                            }
                          >
                            {appeal.status === 'pending' && 'En Attente'}
                            {appeal.status === 'under_review' && 'En Révision'}
                            {appeal.status === 'approved' && 'Approuvé'}
                            {appeal.status === 'rejected' && 'Rejeté'}
                          </Badge>
                        </div>
                        {appeal.reviewerNotes && (
                          <div className="mt-3 p-2 bg-muted rounded text-sm">
                            <strong>Notes du Réviseur:</strong> {appeal.reviewerNotes}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {userRole !== 'user' && (
          <TabsContent value="moderation" className="space-y-4">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Interface de modération avancée pour les modérateurs et administrateurs.
                Cette section permettrait de gérer les signalements et réviser les appels.
              </AlertDescription>
            </Alert>
            
            {/* This would contain moderation tools for moderators/admins */}
            <Card>
              <CardHeader>
                <CardTitle>Outils de Modération</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Interface de modération complète à implémenter avec gestion des signalements,
                  révision des appels, et outils d'administration.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default ModerationDashboard;
