import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  ShieldCheck, Users, Eye, Bell, FileText, MessageSquare,
  CheckCircle2, AlertTriangle, Clock, TrendingUp, Send,
  ChevronRight, Sparkles, Star, Heart, UserCheck
} from 'lucide-react';

interface ConversationSummary {
  matchName: string;
  lastActive: string;
  totalMessages: number;
  duration: string;
  sentiment: 'positive' | 'neutral' | 'warning';
  topTopics: string[];
  redFlags: string[];
  greenFlags: string[];
  waliApproval: 'pending' | 'approved' | 'review';
}

const conversations: ConversationSummary[] = [
  {
    matchName: 'Ahmed M.',
    lastActive: 'Il y a 2 heures',
    totalMessages: 156,
    duration: '12 jours',
    sentiment: 'positive',
    topTopics: ['Religion', 'Famille', 'Projets de vie', 'Enfants'],
    redFlags: [],
    greenFlags: ['Respectueux', 'Sérieux dans sa démarche', 'Parle de ses parents', 'Mentionne la prière'],
    waliApproval: 'approved',
  },
  {
    matchName: 'Omar K.',
    lastActive: 'Hier',
    totalMessages: 89,
    duration: '8 jours',
    sentiment: 'neutral',
    topTopics: ['Travail', 'Ville de résidence', 'Loisirs'],
    redFlags: ['Évite les sujets religieux', 'Demande des photos souvent'],
    greenFlags: ['Poli', 'Stable professionnellement'],
    waliApproval: 'review',
  },
  {
    matchName: 'Youssef B.',
    lastActive: 'Il y a 3 jours',
    totalMessages: 34,
    duration: '5 jours',
    sentiment: 'warning',
    topTopics: ['Apparence', 'Sorties', 'Voyages'],
    redFlags: ['Messages tard la nuit', 'Insistant pour se rencontrer seuls', 'Peu de mentions religieuses'],
    greenFlags: ['Travailleur'],
    waliApproval: 'pending',
  },
];

const waliAlerts = [
  { type: 'info', icon: Bell, message: "Ahmed M. a mentionné vouloir impliquer sa famille pour la khitba", time: 'Il y a 3h' },
  { type: 'positive', icon: CheckCircle2, message: "Conversation avec Ahmed M. : aucun red flag détecté sur 156 messages", time: 'Il y a 5h' },
  { type: 'warning', icon: AlertTriangle, message: "Omar K. a demandé des photos personnelles à 3 reprises", time: 'Hier' },
  { type: 'alert', icon: AlertTriangle, message: "Youssef B. insiste pour des rencontres sans mahram", time: 'Il y a 2j' },
];

const MahramMode = () => {
  const [waliNotifications, setWaliNotifications] = useState(true);
  const [autoSummary, setAutoSummary] = useState(true);
  const [redFlagAlerts, setRedFlagAlerts] = useState(true);

  const getSentimentColor = (s: string) => {
    if (s === 'positive') return 'text-emerald-600 bg-emerald-100';
    if (s === 'warning') return 'text-red-600 bg-red-100';
    return 'text-blue-600 bg-blue-100';
  };

  const getSentimentLabel = (s: string) => {
    if (s === 'positive') return 'Positif';
    if (s === 'warning') return 'Vigilance';
    return 'Neutre';
  };

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-blue-600 text-white mb-2">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
          Mode Mahram
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tableau de bord intelligent pour le Wali (tuteur). Résumés automatiques,
          alertes et supervision respectueuse des échanges.
        </p>
      </div>

      {/* Wali Settings */}
      <Card className="border-indigo-200 bg-indigo-50/50">
        <CardContent className="pt-6">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-indigo-600" /> Paramètres Wali
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="wali-notif" className="flex-1">
                <p className="font-medium text-sm">Notifications au Wali</p>
                <p className="text-xs text-muted-foreground">Résumés hebdomadaires envoyés au tuteur</p>
              </Label>
              <Switch id="wali-notif" checked={waliNotifications} onCheckedChange={setWaliNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-summary" className="flex-1">
                <p className="font-medium text-sm">Résumés automatiques</p>
                <p className="text-xs text-muted-foreground">Analyse IA des sujets abordés (sans lire les messages)</p>
              </Label>
              <Switch id="auto-summary" checked={autoSummary} onCheckedChange={setAutoSummary} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="red-flags" className="flex-1">
                <p className="font-medium text-sm">Alertes Red Flags</p>
                <p className="text-xs text-muted-foreground">Notification immédiate si comportement inapproprié détecté</p>
              </Label>
              <Switch id="red-flags" checked={redFlagAlerts} onCheckedChange={setRedFlagAlerts} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="conversations" className="space-y-4">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="conversations">Conversations</TabsTrigger>
          <TabsTrigger value="alerts">
            Alertes
            <Badge className="ml-2 bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center rounded-full">2</Badge>
          </TabsTrigger>
          <TabsTrigger value="reports">Rapports</TabsTrigger>
        </TabsList>

        {/* Conversations Tab */}
        <TabsContent value="conversations" className="space-y-4">
          {conversations.map((conv) => (
            <Card key={conv.matchName} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center text-white font-bold">
                      {conv.matchName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{conv.matchName}</p>
                        <Badge className={getSentimentColor(conv.sentiment)}>
                          {getSentimentLabel(conv.sentiment)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {conv.totalMessages} messages • {conv.duration} • Actif {conv.lastActive}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className={
                    conv.waliApproval === 'approved' ? 'border-emerald-300 text-emerald-600' :
                    conv.waliApproval === 'review' ? 'border-amber-300 text-amber-600' :
                    'border-gray-300 text-gray-600'
                  }>
                    {conv.waliApproval === 'approved' && <><CheckCircle2 className="h-3 w-3 mr-1" /> Approuvé</>}
                    {conv.waliApproval === 'review' && <><Eye className="h-3 w-3 mr-1" /> À revoir</>}
                    {conv.waliApproval === 'pending' && <><Clock className="h-3 w-3 mr-1" /> En attente</>}
                  </Badge>
                </div>

                {/* Topics */}
                <div className="mb-3">
                  <p className="text-xs text-muted-foreground mb-1">Sujets abordés :</p>
                  <div className="flex flex-wrap gap-1">
                    {conv.topTopics.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>

                {/* Green Flags */}
                {conv.greenFlags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-emerald-600 font-medium mb-1">✅ Points positifs :</p>
                    <div className="flex flex-wrap gap-1">
                      {conv.greenFlags.map((f) => (
                        <Badge key={f} className="bg-emerald-100 text-emerald-700 text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Red Flags */}
                {conv.redFlags.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-red-600 font-medium mb-1">🚩 Points de vigilance :</p>
                    <div className="flex flex-wrap gap-1">
                      {conv.redFlags.map((f) => (
                        <Badge key={f} className="bg-red-100 text-red-700 text-xs">{f}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-3">
          {waliAlerts.map((alert, i) => {
            const Icon = alert.icon;
            const isWarning = alert.type === 'warning' || alert.type === 'alert';
            return (
              <Card key={i} className={`${
                isWarning ? 'border-red-200 bg-red-50/50' :
                alert.type === 'positive' ? 'border-emerald-200 bg-emerald-50/50' :
                'border-blue-200 bg-blue-50/50'
              }`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isWarning ? 'bg-red-100' :
                      alert.type === 'positive' ? 'bg-emerald-100' : 'bg-blue-100'
                    }`}>
                      <Icon className={`h-4 w-4 ${
                        isWarning ? 'text-red-600' :
                        alert.type === 'positive' ? 'text-emerald-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{alert.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{alert.time}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-indigo-500" />
                Rapport hebdomadaire du Wali
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 rounded-lg bg-indigo-50">
                  <p className="text-2xl font-bold text-indigo-600">3</p>
                  <p className="text-xs text-muted-foreground">Conversations actives</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-50">
                  <p className="text-2xl font-bold text-emerald-600">1</p>
                  <p className="text-xs text-muted-foreground">Recommandé</p>
                </div>
                <div className="p-3 rounded-lg bg-red-50">
                  <p className="text-2xl font-bold text-red-600">2</p>
                  <p className="text-xs text-muted-foreground">Alertes</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Résumé :</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Cette semaine, votre protégé(e) a échangé avec 3 personnes. La conversation avec
                  <strong> Ahmed M.</strong> est la plus prometteuse : les sujets abordés sont sérieux
                  (religion, famille, projets), aucun red flag détecté, et il a mentionné vouloir
                  impliquer sa famille. <strong>Recommandation :</strong> envisager une rencontre formelle (khitba).
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  <strong>Attention</strong> pour <strong>Youssef B.</strong> : comportement insistant détecté,
                  recommandation de mettre fin à l'échange ou de clarifier les intentions.
                </p>
              </div>

              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Send className="h-4 w-4 mr-2" /> Envoyer le rapport au Wali
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MahramMode;
