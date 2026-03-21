import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Clock, Bell, TrendingUp, Calendar, Zap, Moon, Sun,
  MessageCircle, Heart, Target, Sparkles, ChevronRight,
  BarChart3, ArrowUp, ArrowDown, Flame
} from 'lucide-react';

const engagementData = {
  bestTime: '20h - 22h',
  bestDay: 'Dimanche',
  responseRate: 87,
  avgResponseTime: '15 min',
  streak: 12,
  weeklyMessages: 45,
  trend: 'up' as const,
};

const activityHeatmap = [
  { hour: '8h', mon: 2, tue: 1, wed: 3, thu: 2, fri: 1, sat: 4, sun: 5 },
  { hour: '12h', mon: 3, tue: 4, wed: 2, thu: 3, fri: 5, sat: 3, sun: 2 },
  { hour: '16h', mon: 1, tue: 2, wed: 1, thu: 2, fri: 3, sat: 5, sun: 4 },
  { hour: '20h', mon: 5, tue: 5, wed: 4, thu: 5, fri: 2, sat: 5, sun: 5 },
  { hour: '23h', mon: 1, tue: 1, wed: 1, thu: 1, fri: 1, sat: 2, sun: 2 },
];

const recommendations = [
  {
    icon: Clock,
    title: 'Meilleur moment pour écrire',
    description: "Ahmed est le plus actif entre 20h et 22h. C'est le moment idéal pour envoyer un message.",
    priority: 'high',
  },
  {
    icon: Calendar,
    title: 'Planifiez une conversation le dimanche',
    description: "Le dimanche est votre jour le plus actif à tous les deux. Idéal pour une discussion approfondie.",
    priority: 'medium',
  },
  {
    icon: Moon,
    title: 'Évitez les messages tardifs',
    description: "Les messages après 23h ont un taux de réponse 60% plus faible. Respectez les horaires de repos.",
    priority: 'low',
  },
  {
    icon: Flame,
    title: 'Maintenez votre série !',
    description: "Vous avez échangé 12 jours consécutifs. Les couples avec une série de +14 jours ont 3x plus de chances d'aboutir.",
    priority: 'high',
  },
];

const milestones = [
  { label: 'Premier message', reached: true, day: 1, current: false },
  { label: '7 jours de conversation', reached: true, day: 7, current: false },
  { label: '50 messages échangés', reached: true, day: 9, current: false },
  { label: 'Questions du couple commencées', reached: true, day: 10, current: false },
  { label: '14 jours consécutifs', reached: false, day: 14, current: true },
  { label: 'Appel audio/vidéo', reached: false, day: 0, current: false },
  { label: 'Implication du Wali', reached: false, day: 0, current: false },
  { label: 'Rencontre formelle (Khitba)', reached: false, day: 0, current: false },
];

const SmartTiming = () => {
  const [smartReminders, setSmartReminders] = useState(true);
  const [quietHours, setQuietHours] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  const getHeatColor = (value: number) => {
    if (value >= 5) return 'bg-emerald-500';
    if (value >= 4) return 'bg-emerald-400';
    if (value >= 3) return 'bg-emerald-300';
    if (value >= 2) return 'bg-emerald-200';
    if (value >= 1) return 'bg-emerald-100';
    return 'bg-gray-100';
  };

  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 text-white mb-2">
          <Zap className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
          Smart Timing & Engagement
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Optimisez vos échanges avec des insights intelligents sur le meilleur moment pour communiquer.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <Clock className="h-6 w-6 text-cyan-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{engagementData.bestTime}</p>
            <p className="text-xs text-muted-foreground">Meilleure heure</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <TrendingUp className="h-6 w-6 text-emerald-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{engagementData.responseRate}%</p>
            <p className="text-xs text-muted-foreground">Taux de réponse</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-lg font-bold">{engagementData.streak} jours</p>
            <p className="text-xs text-muted-foreground">Série actuelle</p>
          </CardContent>
        </Card>
        <Card className="text-center">
          <CardContent className="pt-4 pb-4">
            <MessageCircle className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <p className="text-lg font-bold flex items-center justify-center gap-1">
              {engagementData.weeklyMessages}
              <ArrowUp className="h-3 w-3 text-emerald-500" />
            </p>
            <p className="text-xs text-muted-foreground">Messages/semaine</p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-cyan-500" />
            Carte d'activité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-xs text-muted-foreground text-left pr-3"></th>
                  {days.map((d) => (
                    <th key={d} className="text-xs text-muted-foreground text-center px-1">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activityHeatmap.map((row) => (
                  <tr key={row.hour}>
                    <td className="text-xs text-muted-foreground pr-3 py-1">{row.hour}</td>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri, row.sat, row.sun].map((val, i) => (
                      <td key={i} className="px-1 py-1">
                        <div className={`w-full h-8 rounded ${getHeatColor(val)} transition-colors`}
                          title={`Activité: ${val}/5`} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center gap-2 mt-3 justify-end">
            <span className="text-xs text-muted-foreground">Moins</span>
            {[1, 2, 3, 4, 5].map((v) => (
              <div key={v} className={`w-4 h-4 rounded ${getHeatColor(v)}`} />
            ))}
            <span className="text-xs text-muted-foreground">Plus</span>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Recommandations intelligentes</h2>
        <div className="space-y-3">
          {recommendations.map((rec, i) => {
            const Icon = rec.icon;
            return (
              <Card key={i} className={`hover:shadow-md transition-shadow ${
                rec.priority === 'high' ? 'border-l-4 border-l-cyan-500' :
                rec.priority === 'medium' ? 'border-l-4 border-l-blue-400' :
                'border-l-4 border-l-gray-300'
              }`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-cyan-100">
                      <Icon className="h-5 w-5 text-cyan-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{rec.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5 text-purple-500" />
            Étapes de la relation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0">
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  m.reached ? 'bg-emerald-500 text-white' :
                  m.current ? 'bg-cyan-500 text-white animate-pulse' :
                  'bg-gray-200 text-gray-400'
                }`}>
                  {m.reached ? <CheckCircle2 className="h-4 w-4" /> :
                   m.current ? <Sparkles className="h-4 w-4" /> :
                   <span className="text-xs">{i + 1}</span>}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${m.reached ? 'text-emerald-700 font-medium' : m.current ? 'font-medium' : 'text-muted-foreground'}`}>
                    {m.label}
                  </p>
                </div>
                {m.current && (
                  <Badge className="bg-cyan-100 text-cyan-700 text-xs">En cours</Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Paramètres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="smart-rem">
              <p className="font-medium text-sm">Rappels intelligents</p>
              <p className="text-xs text-muted-foreground">Rappeler d'envoyer un message aux heures optimales</p>
            </Label>
            <Switch id="smart-rem" checked={smartReminders} onCheckedChange={setSmartReminders} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="quiet">
              <p className="font-medium text-sm">Heures calmes</p>
              <p className="text-xs text-muted-foreground">Pas de notifications entre 23h et 7h</p>
            </Label>
            <Switch id="quiet" checked={quietHours} onCheckedChange={setQuietHours} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="weekly">
              <p className="font-medium text-sm">Rapport hebdomadaire</p>
              <p className="text-xs text-muted-foreground">Résumé de votre activité chaque dimanche</p>
            </Label>
            <Switch id="weekly" checked={weeklyReport} onCheckedChange={setWeeklyReport} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SmartTiming;
