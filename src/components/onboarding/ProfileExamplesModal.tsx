import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveTabsList } from '@/components/ui/responsive-tabs-list';
import { User, Heart, Star, CheckCircle, Trophy } from 'lucide-react';

interface ProfileExample {
  id: string;
  name: string;
  age: number;
  bio: string;
  interests: string[];
  lookingFor: string;
  score: number;
  highlights: string[];
}

const PROFILE_EXAMPLES: ProfileExample[] = [
  {
    id: 'excellent',
    name: 'Ahmed',
    age: 28,
    bio: 'Ingénieur passionné par la technologie et l\'innovation. J\'aime voyager, découvrir de nouvelles cultures et pratiquer le sport. Je recherche une personne partageant mes valeurs pour construire une famille solide basée sur la foi et le respect mutuel.',
    interests: ['Lecture du Coran', 'Randonnée', 'Cuisine', 'Voyage', 'Bénévolat', 'Photographie'],
    lookingFor: 'Je recherche une épouse pieuse et éduquée pour construire une famille heureuse et équilibrée, basée sur l\'amour, le respect et la foi.',
    score: 95,
    highlights: [
      'Bio détaillée (200+ caractères)',
      '6+ centres d\'intérêt variés',
      'Objectifs clairs et précis',
      'Valeurs bien définies'
    ]
  },
  {
    id: 'good',
    name: 'Fatima',
    age: 25,
    bio: 'Professeure passionnée d\'éducation, j\'aime enseigner et apprendre. Je pratique régulièrement ma foi et je cherche quelqu\'un qui partage mes valeurs islamiques pour fonder une famille.',
    interests: ['Lecture', 'Enseignement', 'Couture', 'Cuisine'],
    lookingFor: 'Un époux pratiquant et respectueux pour construire une vie ensemble.',
    score: 78,
    highlights: [
      'Bio claire (150+ caractères)',
      '4 centres d\'intérêt',
      'Objectifs définis',
      'Pratique religieuse mentionnée'
    ]
  },
  {
    id: 'needs_improvement',
    name: 'Omar',
    age: 30,
    bio: 'Je travaille dans la finance. J\'aime le sport.',
    interests: ['Sport', 'Lecture'],
    lookingFor: 'Cherche quelqu\'un de sérieux.',
    score: 42,
    highlights: [
      '❌ Bio trop courte (<50 caractères)',
      '❌ Seulement 2 centres d\'intérêt',
      '❌ Objectifs vagues',
      '❌ Manque de détails personnels'
    ]
  }
];

interface ProfileExamplesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileExamplesModal: React.FC<ProfileExamplesModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedExample, setSelectedExample] = useState('excellent');

  const currentExample = PROFILE_EXAMPLES.find(ex => ex.id === selectedExample) ?? PROFILE_EXAMPLES[0];
  
  if (!currentExample) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-300';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-300';
    return 'text-amber-600 bg-amber-50 border-amber-300';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return Trophy;
    if (score >= 60) return Star;
    return User;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Star className="h-6 w-6 text-primary" />
            Exemples de Profils Réussis
          </DialogTitle>
          <DialogDescription>
            Découvrez ce qui fait un profil attractif et complet
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedExample} onValueChange={setSelectedExample} className="w-full">
          <ResponsiveTabsList tabCount={3}>
            <TabsTrigger value="excellent" className="flex items-center gap-1">
              <Trophy className="h-3 w-3" />
              <span className="hidden sm:inline">Excellent</span>
            </TabsTrigger>
            <TabsTrigger value="good" className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              <span className="hidden sm:inline">Bon</span>
            </TabsTrigger>
            <TabsTrigger value="needs_improvement" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              <span className="hidden sm:inline">À améliorer</span>
            </TabsTrigger>
          </ResponsiveTabsList>

          <TabsContent value={selectedExample} className="mt-4 space-y-4">
            {/* Score Badge */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{currentExample.name}, {currentExample.age} ans</h3>
              </div>
              <Badge className={`text-base px-3 py-1 ${getScoreColor(currentExample.score)}`}>
                {currentExample.score}/100
              </Badge>
            </div>

            {/* Profile Content */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Biographie</h4>
                    <Badge variant="secondary" className="text-xs">
                      {currentExample.bio.length} caractères
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentExample.bio}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Centres d'intérêt</h4>
                    <Badge variant="secondary" className="text-xs">
                      {currentExample.interests.length} intérêts
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {currentExample.interests.map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-primary" />
                    <h4 className="font-semibold text-sm">Ce qu'il/elle recherche</h4>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {currentExample.lookingFor}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Highlights */}
            <Card className={currentExample.score >= 80 ? 'border-emerald-200 bg-emerald-50/50' : ''}>
              <CardContent className="p-4">
                <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Points clés de ce profil
                </h4>
                <ul className="space-y-2">
                  {currentExample.highlights.map((highlight, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className={highlight.startsWith('❌') ? 'text-red-500' : 'text-emerald-600'}>
                        {highlight.startsWith('❌') ? '❌' : '✓'}
                      </span>
                      <span className={highlight.startsWith('❌') ? 'text-red-700' : ''}>
                        {highlight.replace('❌ ', '')}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Tips based on example */}
            {currentExample.score >= 80 && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>💡 Conseil :</strong> Ce profil est un excellent exemple ! 
                  Notez comment {currentExample.name} partage suffisamment de détails personnels 
                  tout en restant authentique et respectueux des valeurs islamiques.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={onClose}>
            Fermer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileExamplesModal;
