import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Compass, Heart, BookOpen, Users, Home, Briefcase,
  Globe, Shield, Sparkles, CheckCircle2, ArrowRight, Star
} from 'lucide-react';

interface Value {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  importance: number;
  color: string;
}

interface MatchProfile {
  name: string;
  age: number;
  city: string;
  matchScore: number;
  topValues: string[];
  avatar: string;
}

const initialValues: Value[] = [
  { id: 'taqwa', name: 'Taqwa (Piété)', icon: BookOpen, description: 'Conscience d\'Allah dans chaque décision', importance: 80, color: 'emerald' },
  { id: 'family', name: 'Famille', icon: Users, description: 'Priorité à la cellule familiale', importance: 90, color: 'pink' },
  { id: 'ambition', name: 'Ambition', icon: Briefcase, description: 'Développement professionnel et personnel', importance: 60, color: 'blue' },
  { id: 'generosity', name: 'Générosité', icon: Heart, description: 'Donner et partager avec les autres', importance: 85, color: 'red' },
  { id: 'knowledge', name: 'Savoir (\'Ilm)', icon: BookOpen, description: 'Apprentissage continu et sciences islamiques', importance: 75, color: 'amber' },
  { id: 'community', name: 'Communauté', icon: Globe, description: 'Engagement dans la oumma', importance: 70, color: 'purple' },
  { id: 'simplicity', name: 'Simplicité', icon: Home, description: 'Vie modeste et zuhd', importance: 65, color: 'cyan' },
  { id: 'honesty', name: 'Honnêteté', icon: Shield, description: 'Transparence et vérité en toute situation', importance: 95, color: 'indigo' },
];

const matchedProfiles: MatchProfile[] = [
  { name: 'Fatima A.', age: 26, city: 'Lyon', matchScore: 94, topValues: ['Taqwa', 'Famille', 'Honnêteté'], avatar: 'F' },
  { name: 'Khadija M.', age: 28, city: 'Paris', matchScore: 89, topValues: ['Famille', 'Générosité', 'Savoir'], avatar: 'K' },
  { name: 'Aisha R.', age: 25, city: 'Marseille', matchScore: 85, topValues: ['Taqwa', 'Communauté', 'Simplicité'], avatar: 'A' },
  { name: 'Maryam S.', age: 27, city: 'Toulouse', matchScore: 82, topValues: ['Honnêteté', 'Ambition', 'Famille'], avatar: 'M' },
];

const colorMap: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-600',
  pink: 'from-pink-500 to-pink-600',
  blue: 'from-blue-500 to-blue-600',
  amber: 'from-amber-500 to-amber-600',
  purple: 'from-purple-500 to-purple-600',
  cyan: 'from-cyan-500 to-cyan-600',
  red: 'from-red-500 to-red-600',
  indigo: 'from-indigo-500 to-indigo-600',
};

const ValuesMatching = () => {
  const [values, setValues] = useState<Value[]>(initialValues);
  const [showResults, setShowResults] = useState(false);

  const handleImportanceChange = (valueId: string, newImportance: number[]) => {
    setValues((prev) =>
      prev.map((v) => (v.id === valueId ? { ...v, importance: newImportance[0] } : v))
    );
  };

  const sortedValues = [...values].sort((a, b) => b.importance - a.importance);

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl" style={{ backgroundColor: 'var(--color-bg-page)' }}>
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full text-white mb-2" style={{ backgroundColor: 'var(--color-primary)' }}>
          <Compass className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-primary)' }}>
          Matching par Valeurs
        </h1>
        <p className="max-w-xl mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Au-delà des critères classiques, trouvez quelqu'un qui partage vos valeurs profondes.
          Classez vos valeurs par importance pour un matching plus authentique.
        </p>
      </div>

      {/* Islamic Quote */}
      <Card style={{ backgroundColor: 'var(--color-warning-bg)', border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-lg)' }}>
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--color-warning)' }} />
            <div>
              <p className="text-sm italic" style={{ color: 'var(--color-text-primary)' }}>
                « On épouse une femme pour quatre choses : sa richesse, sa lignée, sa beauté et sa religion. Choisis celle qui a la religion, tu seras gagnant. »
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>— Hadith rapporté par Al-Bukhârî et Muslim</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {!showResults ? (
        <>
          {/* Values Configuration */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Classez vos valeurs par importance</h2>
            <p className="text-sm text-muted-foreground">
              Déplacez les curseurs pour indiquer l'importance de chaque valeur dans votre recherche.
            </p>

            <div className="space-y-4">
              {sortedValues.map((value) => {
                const Icon = value.icon;
                return (
                  <Card key={value.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4">
                      <div className="flex items-start gap-4">
                        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${colorMap[value.color]} text-white flex-shrink-0`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{value.name}</p>
                              <p className="text-xs text-muted-foreground">{value.description}</p>
                            </div>
                            <Badge variant="outline" className="font-bold">
                              {value.importance}%
                            </Badge>
                          </div>
                          <Slider
                            value={[value.importance]}
                            onValueChange={(v) => handleImportanceChange(value.id, v)}
                            min={0}
                            max={100}
                            step={5}
                            className="mt-2"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <Button
              className="w-full h-12 text-lg"
              style={{ backgroundColor: 'var(--color-primary)', color: '#fff', borderRadius: 'var(--radius-md)' }}
              onClick={() => setShowResults(true)}
            >
              <Sparkles className="h-5 w-5 mr-2" /> Trouver mes matches par valeurs
            </Button>
          </div>
        </>
      ) : (
        <>
          {/* Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Vos matches par valeurs</h2>
              <Button variant="outline" size="sm" onClick={() => setShowResults(false)}>
                Modifier mes valeurs
              </Button>
            </div>

            {/* Top Values Summary */}
            <Card style={{ backgroundColor: 'var(--color-primary-light)', border: '1px solid var(--color-primary-border)', borderRadius: 'var(--radius-lg)' }}>
              <CardContent className="pt-4 pb-4">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-primary)' }}>Vos 3 valeurs principales :</p>
                <div className="flex flex-wrap gap-2">
                  {sortedValues.slice(0, 3).map((v) => (
                    <Badge key={v.id} style={{ backgroundColor: 'var(--color-primary-muted)', color: 'var(--color-primary)' }}>
                      <Star className="h-3 w-3 mr-1" /> {v.name} ({v.importance}%)
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Match Cards */}
            <div className="space-y-3">
              {matchedProfiles.map((profile, index) => (
                <Card key={profile.name} className="hover:shadow-lg transition-all hover:-translate-y-0.5">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: 'var(--color-primary)' }}>
                          {profile.avatar}
                        </div>
                        {index === 0 && (
                          <div className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 rounded-full p-0.5">
                            <Star className="h-3 w-3" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{profile.name}</p>
                            <p className="text-sm text-muted-foreground">{profile.age} ans • {profile.city}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold" style={{
                              color: profile.matchScore >= 90 ? 'var(--color-success)' :
                              profile.matchScore >= 80 ? 'var(--color-info)' : 'var(--color-warning)'
                            }}>{profile.matchScore}%</span>
                            <p className="text-xs text-muted-foreground">compatibilité</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {profile.topValues.map((v) => (
                            <Badge key={v} variant="outline" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button size="sm" variant="ghost">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-dashed border-2 text-center" style={{ borderColor: 'var(--color-primary-border)' }}>
              <CardContent className="pt-6 pb-6">
                <Sparkles className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--color-primary)' }} />
                <p className="text-sm font-medium">Le matching par valeurs s'affine avec le temps</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Plus vous interagissez, plus les suggestions deviennent pertinentes.
                </p>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default ValuesMatching;
