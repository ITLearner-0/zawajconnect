import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Shield, Lock, Eye, EyeOff, Clock, Users, UserCheck,
  CheckCircle2, Send, X, AlertCircle, Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type PrivacyLevel = 'silhouette' | 'wali-only' | 'mutual-consent' | 'progressive';

interface PhotoRequest {
  id: string;
  userName: string;
  status: 'pending' | 'accepted' | 'declined';
  date: string;
}

const PrivacyLayers = () => {
  const [privacyLevel, setPrivacyLevel] = useState<PrivacyLevel>('silhouette');
  const [progressiveDays, setProgressiveDays] = useState([7]);
  const [requests, setRequests] = useState<PhotoRequest[]>([
    { id: '1', userName: 'Ahmed M.', status: 'pending', date: '2026-03-20' },
    { id: '2', userName: 'Omar K.', status: 'accepted', date: '2026-03-18' },
    { id: '3', userName: 'Youssef B.', status: 'declined', date: '2026-03-15' },
  ]);
  const { toast } = useToast();

  const handleRequestAction = (requestId: string, action: 'accepted' | 'declined') => {
    setRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, status: action } : r))
    );
    toast({
      title: action === 'accepted' ? 'Accès accordé' : 'Accès refusé',
      description: action === 'accepted'
        ? "La personne peut maintenant voir votre photo."
        : "La demande a été refusée.",
    });
  };

  const levels = [
    {
      id: 'silhouette' as const,
      name: 'Silhouette',
      icon: EyeOff,
      description: 'Seule une silhouette floue est visible par tous',
      detail: 'Niveau maximum de pudeur. Votre photo est entièrement floutée.',
      blur: 'blur-[20px]',
    },
    {
      id: 'wali-only' as const,
      name: 'Wali uniquement',
      icon: UserCheck,
      description: 'Photo claire visible uniquement par votre Wali/tuteur',
      detail: 'Seul le tuteur légal (Wali) peut voir votre photo clairement.',
      blur: 'blur-[12px]',
    },
    {
      id: 'mutual-consent' as const,
      name: 'Accord mutuel',
      icon: Users,
      description: 'Photo révélée après accord des deux parties',
      detail: 'Les deux personnes doivent accepter pour voir la photo de l\'autre.',
      blur: 'blur-[8px]',
    },
    {
      id: 'progressive' as const,
      name: 'Progressif',
      icon: Clock,
      description: `Photo révélée après ${progressiveDays[0]} jours de conversation`,
      detail: `Après ${progressiveDays[0]} jours d'échange, la photo se révèle progressivement.`,
      blur: 'blur-[4px]',
    },
  ];

  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-400 to-purple-600 text-white mb-2">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
          Confidentialité des Photos
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Contrôlez qui peut voir vos photos, avec respect de la pudeur islamique (hayâ').
        </p>
      </div>

      {/* Islamic Reminder */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Sparkles className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800">Rappel islamique</p>
              <p className="text-sm text-amber-700 mt-1">
                « Dis aux croyants de baisser leurs regards et de préserver leur chasteté. » — Sourate An-Nûr, 24:30
              </p>
              <p className="text-xs text-amber-600 mt-2">
                ZawajConnect respecte la pudeur (hayâ') en vous donnant un contrôle total sur la visibilité de vos photos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Privacy Level Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Niveau de confidentialité</h2>
          <RadioGroup value={privacyLevel} onValueChange={(v) => setPrivacyLevel(v as PrivacyLevel)}>
            {levels.map((level) => {
              const Icon = level.icon;
              const isSelected = privacyLevel === level.id;
              return (
                <Card
                  key={level.id}
                  className={`cursor-pointer transition-all duration-300 ${
                    isSelected ? 'border-purple-500 bg-purple-50 shadow-md' : 'hover:border-purple-300'
                  }`}
                  onClick={() => setPrivacyLevel(level.id)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <RadioGroupItem value={level.id} id={level.id} className="mt-1" />
                      <Label htmlFor={level.id} className="cursor-pointer flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-purple-600' : 'text-muted-foreground'}`} />
                          <span className="font-medium">{level.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </Label>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </RadioGroup>

          {privacyLevel === 'progressive' && (
            <Card className="border-purple-200">
              <CardContent className="pt-6">
                <Label className="text-sm font-medium">
                  Délai avant révélation : {progressiveDays[0]} jours
                </Label>
                <Slider
                  value={progressiveDays}
                  onValueChange={setProgressiveDays}
                  min={3}
                  max={30}
                  step={1}
                  className="mt-3"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>3 jours</span>
                  <span>30 jours</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button className="w-full bg-purple-600 hover:bg-purple-700">
            <CheckCircle2 className="h-4 w-4 mr-2" /> Enregistrer mes préférences
          </Button>
        </div>

        {/* Preview & Requests */}
        <div className="space-y-4">
          {/* Photo Preview */}
          <h2 className="text-lg font-semibold">Aperçu</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="relative inline-block">
                  <div className={`w-40 h-40 rounded-2xl bg-gradient-to-br from-purple-300 to-pink-300 mx-auto transition-all duration-700 ${
                    levels.find((l) => l.id === privacyLevel)?.blur
                  }`}>
                    <div className="w-full h-full flex items-center justify-center">
                      <Users className="h-16 w-16 text-white/60" />
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/40 rounded-full p-3">
                      <Lock className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-sm">
                    {levels.find((l) => l.id === privacyLevel)?.name}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {levels.find((l) => l.id === privacyLevel)?.detail}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Access Requests */}
          <h2 className="text-lg font-semibold">Demandes d'accès</h2>
          <div className="space-y-3">
            {requests.map((request) => (
              <Card key={request.id} className={`transition-all ${
                request.status === 'accepted' ? 'border-emerald-200 bg-emerald-50/50' :
                request.status === 'declined' ? 'border-red-200 bg-red-50/50' : ''
              }`}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
                        {request.userName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{request.userName}</p>
                        <p className="text-xs text-muted-foreground">{request.date}</p>
                      </div>
                    </div>
                    {request.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 h-8"
                          onClick={() => handleRequestAction(request.id, 'accepted')}
                        >
                          <Eye className="h-3 w-3 mr-1" /> Accepter
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-600 hover:bg-red-50 h-8"
                          onClick={() => handleRequestAction(request.id, 'declined')}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <Badge variant="outline" className={
                        request.status === 'accepted'
                          ? 'border-emerald-300 text-emerald-600'
                          : 'border-red-300 text-red-600'
                      }>
                        {request.status === 'accepted' ? (
                          <><Eye className="h-3 w-3 mr-1" /> Accepté</>
                        ) : (
                          <><EyeOff className="h-3 w-3 mr-1" /> Refusé</>
                        )}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Request Photo */}
          <Card className="border-dashed border-2 border-purple-200">
            <CardContent className="pt-6 text-center">
              <Send className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <p className="text-sm font-medium">Demander l'accès à une photo</p>
              <p className="text-xs text-muted-foreground mt-1">
                Envoyez une demande respectueuse pour voir la photo d'un profil
              </p>
              <Button variant="outline" className="mt-3 border-purple-300 text-purple-600 hover:bg-purple-50">
                <Send className="h-4 w-4 mr-2" /> Envoyer une demande
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrivacyLayers;
