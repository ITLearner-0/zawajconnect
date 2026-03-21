import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import {
  ShieldCheck, Star, Users, MessageSquare, ThumbsUp, Award,
  CheckCircle2, Clock, UserCheck, ChevronRight, Sparkles, Heart
} from 'lucide-react';

interface Endorsement {
  id: string;
  authorName: string;
  authorRole: string;
  content: string;
  date: string;
  verified: boolean;
  category: 'character' | 'religiosity' | 'family' | 'professional';
}

const mockEndorsements: Endorsement[] = [
  { id: '1', authorName: 'Imam Abdallah', authorRole: 'Imam de la mosquée Al-Firdaws', content: "Je connais ce frère depuis 5 ans. C'est une personne sincère, assidue à la prière et engagée dans la communauté. Je le recommande pour le mariage.", date: '2026-03-10', verified: true, category: 'religiosity' },
  { id: '2', authorName: 'Dr. Karim B.', authorRole: 'Collègue de travail', content: "Un professionnel sérieux et fiable. Très respectueux et honnête dans ses relations. Je l'ai côtoyé pendant 3 ans et je peux témoigner de son intégrité.", date: '2026-03-08', verified: true, category: 'professional' },
  { id: '3', authorName: 'Oum Hafsa', authorRole: 'Voisine et amie de la famille', content: "Je connais cette famille depuis 10 ans. Une éducation exemplaire, des valeurs islamiques solides. Cette personne ferait un(e) excellent(e) époux/épouse.", date: '2026-03-05', verified: false, category: 'family' },
  { id: '4', authorName: 'Frère Youssef', authorRole: 'Ami proche', content: "Un frère de confiance, patient et généreux. Toujours prêt à aider. Son comportement est conforme à la sunnah au quotidien.", date: '2026-02-28', verified: true, category: 'character' },
];

const verificationBadges = [
  { name: 'Identité vérifiée', icon: UserCheck, earned: true, description: "Pièce d'identité vérifiée" },
  { name: 'Recommandé par un Imam', icon: Star, earned: true, description: "Au moins un Imam a témoigné" },
  { name: 'Famille connue', icon: Users, earned: true, description: "Références familiales validées" },
  { name: '5+ témoignages', icon: MessageSquare, earned: false, description: "5 témoignages ou plus reçus" },
  { name: 'Profil vérifié Premium', icon: Award, earned: false, description: "Vérification complète" },
];

const categoryLabels: Record<string, { label: string; color: string }> = {
  character: { label: 'Caractère', color: 'bg-blue-100 text-blue-700' },
  religiosity: { label: 'Religiosité', color: 'bg-emerald-100 text-emerald-700' },
  family: { label: 'Famille', color: 'bg-purple-100 text-purple-700' },
  professional: { label: 'Professionnel', color: 'bg-amber-100 text-amber-700' },
};

const CommunityVerification = () => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const trustScore = 78;

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 text-white mb-2">
          <ShieldCheck className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Vérifié par la Communauté
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Renforcez la confiance avec des témoignages vérifiés de votre communauté : imam, famille, amis, collègues.
        </p>
      </div>

      {/* Trust Score */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full border-8 border-blue-500 flex items-center justify-center bg-white">
                <div className="text-center">
                  <span className="text-3xl font-bold text-blue-600">{trustScore}</span>
                  <span className="text-xs text-blue-600 block">/ 100</span>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 bg-blue-500 text-white rounded-full p-1">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-xl font-bold text-blue-800">Score de confiance</h2>
              <p className="text-blue-700 text-sm mt-1">
                Basé sur 4 témoignages vérifiés, l'attestation d'un imam et la vérification d'identité.
              </p>
              <Progress value={trustScore} className="h-2 mt-3" />
              <p className="text-xs text-muted-foreground mt-2">
                Ajoutez 1 témoignage de plus pour atteindre le niveau "Profil de confiance élevée"
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Verification Badges */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Badges de vérification</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {verificationBadges.map((badge) => {
            const Icon = badge.icon;
            return (
              <Card key={badge.name} className={`text-center transition-all ${
                badge.earned ? 'border-blue-300 bg-blue-50' : 'opacity-50'
              }`}>
                <CardContent className="pt-4 pb-4">
                  <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${
                    badge.earned ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-medium mt-2">{badge.name}</p>
                  {badge.earned && (
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mx-auto mt-1" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Endorsements */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Témoignages reçus ({mockEndorsements.length})</h2>
          <Button
            variant="outline"
            size="sm"
            className="border-blue-300 text-blue-600"
            onClick={() => setShowRequestForm(!showRequestForm)}
          >
            <Users className="h-4 w-4 mr-1" /> Demander un témoignage
          </Button>
        </div>

        {showRequestForm && (
          <Card className="mb-4 border-blue-200 bg-blue-50/50">
            <CardContent className="pt-6 space-y-3">
              <p className="text-sm font-medium">Envoyer une demande de témoignage</p>
              <Textarea placeholder="Message personnalisé (optionnel) : 'Salam, pourriez-vous témoigner de mon caractère pour mon profil de mariage ?'" />
              <div className="flex gap-2">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Envoyer par email
                </Button>
                <Button size="sm" variant="outline">
                  Copier le lien
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {mockEndorsements.map((endorsement) => (
            <Card key={endorsement.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {endorsement.authorName.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{endorsement.authorName}</span>
                      {endorsement.verified && (
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Vérifié
                        </Badge>
                      )}
                      <Badge className={`text-xs ${categoryLabels[endorsement.category].color}`}>
                        {categoryLabels[endorsement.category].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{endorsement.authorRole}</p>
                    <p className="text-sm mt-2 text-gray-700 leading-relaxed">"{endorsement.content}"</p>
                    <p className="text-xs text-muted-foreground mt-2">{endorsement.date}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* How it works */}
      <Card className="border-dashed border-2 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-center mb-4">Comment ça fonctionne ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { step: '1', title: 'Invitez', desc: "Envoyez une demande de témoignage à vos proches, imam, collègues" },
              { step: '2', title: 'Ils témoignent', desc: "Ils rédigent un témoignage sur votre caractère, religiosité ou intégrité" },
              { step: '3', title: 'Confiance renforcée', desc: "Votre score de confiance augmente et les badges se débloquent" },
            ].map((s) => (
              <div key={s.step} className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center mx-auto mb-2">
                  {s.step}
                </div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityVerification;
