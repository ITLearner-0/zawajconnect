import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer
} from 'recharts';
import {
  Heart, TrendingUp, AlertTriangle, MessageCircle, Target,
  Sparkles, CheckCircle2, Clock, Users, ChevronRight, Star
} from 'lucide-react';

const radarData = [
  { subject: 'Pratique Religieuse', you: 85, partner: 78, fullMark: 100 },
  { subject: 'Valeurs Familiales', you: 90, partner: 88, fullMark: 100 },
  { subject: 'Style de Vie', you: 72, partner: 65, fullMark: 100 },
  { subject: 'Objectifs Pro', you: 80, partner: 75, fullMark: 100 },
  { subject: 'Communication', you: 88, partner: 82, fullMark: 100 },
  { subject: 'Vision du Couple', you: 92, partner: 90, fullMark: 100 },
];

const strengths = [
  { icon: Heart, title: 'Valeurs familiales alignées', description: 'Vous partagez une vision commune de la famille : éducation islamique des enfants, respect des parents, solidarité familiale. Score : 89%.' },
  { icon: Star, title: 'Vision du couple harmonieuse', description: "Vos attentes sur les rôles conjugaux et la communication sont très proches. Vous valorisez tous deux le dialogue et le respect mutuel." },
  { icon: Target, title: 'Objectifs de vie compatibles', description: "Vous souhaitez tous les deux construire un foyer stable avec une pratique religieuse régulière et un engagement communautaire." },
];

const attentionPoints = [
  { icon: AlertTriangle, title: 'Style de vie à harmoniser', description: "Vos rythmes quotidiens diffèrent : l'un est plutôt du matin, l'autre du soir. Discutez de l'organisation de vos journées." },
  { icon: MessageCircle, title: 'Gestion financière à clarifier', description: "Vos approches de l'épargne et des dépenses varient. Un budget commun et des objectifs partagés vous aideraient." },
];

const challenges = [
  { icon: Users, title: 'Relations avec la belle-famille', description: "Vos attentes sur la proximité avec la belle-famille divergent. L'un souhaite une grande proximité, l'autre plus d'indépendance." },
];

const timeline = [
  { label: 'Premier échange', completed: true, date: '15 Mars', insight: 'Première impression positive, valeurs communes identifiées' },
  { label: 'Questions du couple', completed: true, date: '18 Mars', insight: '72 questions répondues, 85% de compatibilité' },
  { label: 'Échange approfondi', completed: false, date: 'En cours', insight: 'Débloque les insights sur la communication' },
  { label: 'Rencontre Wali', completed: false, date: 'À planifier', insight: 'Validation familiale et bénédiction' },
];

const suggestedQuestions = [
  "Comment envisagez-vous la gestion du budget quand nous aurons des enfants ?",
  "Quelle relation idéale souhaitez-vous entre nos deux familles ?",
  "Comment gérez-vous les désaccords importants ?",
  "Quel est votre rythme idéal pour les visites familiales ?",
];

const CompatibilityDeepDive = () => {
  const overallScore = 84;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-5xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-rose-400 to-pink-600 text-white mb-2">
          <TrendingUp className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Analyse de Compatibilité
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Rapport détaillé et narratif de votre compatibilité avec Fatima A.
        </p>
      </div>

      {/* Overall Score */}
      <Card className="border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-full border-8 border-emerald-500 flex items-center justify-center bg-white">
                <div className="text-center">
                  <span className="text-4xl font-bold text-emerald-600">{overallScore}</span>
                  <span className="text-sm text-emerald-600">%</span>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1.5">
                <Sparkles className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold text-emerald-800">Excellente compatibilité</h2>
              <p className="text-emerald-700 mt-1">
                Vous et Fatima partagez des valeurs profondes et une vision commune de la vie conjugale.
                Quelques points méritent discussion pour renforcer votre entente.
              </p>
              <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                <Badge className="bg-emerald-100 text-emerald-700">3 points forts</Badge>
                <Badge className="bg-amber-100 text-amber-700">2 points d'attention</Badge>
                <Badge className="bg-orange-100 text-orange-700">1 défi</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="radar" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="radar">Radar</TabsTrigger>
          <TabsTrigger value="narrative">Rapport</TabsTrigger>
          <TabsTrigger value="timeline">Parcours</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Radar Chart */}
        <TabsContent value="radar">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Radar de compatibilité</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Vous" dataKey="you" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                  <Radar name="Partenaire" dataKey="partner" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">
                {radarData.map((d) => (
                  <div key={d.subject} className="text-center p-3 rounded-lg bg-gray-50">
                    <p className="text-xs text-muted-foreground">{d.subject}</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {Math.round((d.you + d.partner) / 2)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Narrative Report */}
        <TabsContent value="narrative" className="space-y-4">
          {/* Strengths */}
          <div>
            <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Points Forts
            </h3>
            <div className="space-y-3">
              {strengths.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="border-emerald-200 bg-emerald-50/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-emerald-100 h-fit">
                          <Icon className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-medium text-emerald-800">{s.title}</p>
                          <p className="text-sm text-emerald-700 mt-1">{s.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Attention Points */}
          <div>
            <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Points d'Attention
            </h3>
            <div className="space-y-3">
              {attentionPoints.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="border-amber-200 bg-amber-50/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 h-fit">
                          <Icon className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-amber-800">{s.title}</p>
                          <p className="text-sm text-amber-700 mt-1">{s.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Challenges */}
          <div>
            <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center gap-2">
              <Target className="h-5 w-5" /> Défis Potentiels
            </h3>
            <div className="space-y-3">
              {challenges.map((s, i) => {
                const Icon = s.icon;
                return (
                  <Card key={i} className="border-orange-200 bg-orange-50/50">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex gap-3">
                        <div className="p-2 rounded-lg bg-orange-100 h-fit">
                          <Icon className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <p className="font-medium text-orange-800">{s.title}</p>
                          <p className="text-sm text-orange-700 mt-1">{s.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Timeline */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Parcours de découverte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-0">
                {timeline.map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.completed ? <CheckCircle2 className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      {i < timeline.length - 1 && (
                        <div className={`w-0.5 h-16 ${step.completed ? 'bg-emerald-300' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{step.label}</p>
                        <Badge variant="outline" className="text-xs">{step.date}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{step.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-blue-500" />
                Questions à poser
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestedQuestions.map((q, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-blue-800">{q}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                Sujets à approfondir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {['Gestion financière', 'Relations belle-famille', 'Rythme de vie', 'Lieu de résidence'].map((topic) => (
                  <Button key={topic} variant="outline" className="justify-between h-auto py-3">
                    {topic}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 bg-emerald-50">
            <CardContent className="pt-6 text-center">
              <Sparkles className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
              <p className="font-medium">Prochaine étape recommandée</p>
              <p className="text-sm text-muted-foreground mt-1">
                Complétez les "Questions du Couple" ensemble pour affiner votre analyse
              </p>
              <Button className="mt-3 bg-emerald-600 hover:bg-emerald-700">
                Accéder aux Questions du Couple
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CompatibilityDeepDive;
