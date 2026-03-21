import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Moon, BookOpen, Sparkles, CheckCircle2, Clock,
  PenLine, ChevronRight, AlertCircle, Heart, X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  dailyContent,
  istikharaDua,
  moodLabels,
  type DailyContent,
} from '@/data/istikhara_content';

interface JournalEntry {
  day_number: number;
  content: string;
  mood: string;
  created_at: string;
}

interface IstikharaSessionData {
  id: string;
  started_at: string;
  ends_at: string;
  status: string;
  candidate_user_id: string;
}

const IstikharaSession = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<IstikharaSessionData | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [activeDay, setActiveDay] = useState(1);
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('neutral');
  const [showDecisionDialog, setShowDecisionDialog] = useState(false);
  const [showDuaDialog, setShowDuaDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate current day based on session start
  const getCurrentDay = (): number => {
    if (!session) return 1;
    const start = new Date(session.started_at);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.min(Math.max(diffDays, 1), 7);
  };

  useEffect(() => {
    if (!user) return;
    fetchSession();
  }, [user]);

  const fetchSession = async () => {
    try {
      // Try to fetch active session
      const { data: sessions } = await supabase
        .from('istikhara_sessions')
        .select('*')
        .eq('user_id', user!.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1);

      if (sessions && sessions.length > 0) {
        const s = sessions[0] as unknown as IstikharaSessionData;
        setSession(s);
        setActiveDay(getCurrentDay());

        // Fetch journal entries
        const { data: journalEntries } = await supabase
          .from('istikhara_journal_entries')
          .select('*')
          .eq('session_id', s.id)
          .order('day_number');

        if (journalEntries) {
          setEntries(journalEntries as unknown as JournalEntry[]);
        }
      }
    } catch {
      // Tables might not exist yet
    } finally {
      setLoading(false);
    }
  };

  const startNewSession = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('istikhara_sessions')
        .insert({
          user_id: user.id,
          candidate_user_id: user.id, // Placeholder
          status: 'active',
        })
        .select()
        .single();

      if (data) {
        setSession(data as unknown as IstikharaSessionData);
        setActiveDay(1);
        toast({ title: 'Session démarrée', description: 'Bismillah. Que cette période de réflexion vous guide.' });
      }
    } catch {
      // Use demo mode
      setSession({
        id: 'demo',
        started_at: new Date().toISOString(),
        ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'active',
        candidate_user_id: 'demo',
      });
      setActiveDay(1);
    }
  };

  const saveJournalEntry = async () => {
    if (!journalText.trim()) return;

    const entry: JournalEntry = {
      day_number: activeDay,
      content: journalText,
      mood: selectedMood,
      created_at: new Date().toISOString(),
    };

    // Save to Supabase if session exists
    if (session && session.id !== 'demo') {
      try {
        await supabase.from('istikhara_journal_entries').insert({
          session_id: session.id,
          user_id: user!.id,
          day_number: activeDay,
          content: journalText,
          mood: selectedMood,
        });
      } catch {
        // Continue in demo mode
      }
    }

    setEntries((prev) => [...prev.filter((e) => e.day_number !== activeDay), entry]);
    setJournalText('');
    toast({ title: 'Journal sauvegardé', description: `Jour ${activeDay} enregistré.` });
  };

  const handleDecision = async (decision: 'yes' | 'no') => {
    if (session && session.id !== 'demo') {
      try {
        await supabase
          .from('istikhara_sessions')
          .update({
            status: decision === 'yes' ? 'decided_yes' : 'decided_no',
            decided_at: new Date().toISOString(),
          })
          .eq('id', session.id);
      } catch {
        // Continue
      }
    }

    setShowDecisionDialog(false);
    toast({
      title: decision === 'yes' ? 'Qu\'Allah bénisse cette union' : 'Qu\'Allah vous guide vers le meilleur',
      description: decision === 'yes'
        ? "Votre décision est prise. L'étape suivante est d'en informer votre Wali."
        : "Qu'Allah vous accorde ce qui est meilleur pour votre religion et votre vie.",
    });
    setSession(null);
  };

  const currentDay = session ? getCurrentDay() : 1;
  const dayContent = dailyContent[activeDay - 1];
  const dayEntry = entries.find((e) => e.day_number === activeDay);

  // No active session — show intro
  if (!session) {
    return (
      <div className="container mx-auto py-6 px-4 space-y-6 max-w-3xl">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 text-white mb-2">
            <Moon className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Istikhara & Réflexion
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            7 jours de réflexion spirituelle guidée avant de prendre votre décision.
            Un journal privé, un hadith quotidien, et la prière d'Istikhara.
          </p>
        </div>

        {/* Dua Card */}
        <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-center">La prière de l'Istikhara</h3>
            <div className="text-center p-4 bg-white rounded-xl border">
              <p className="text-lg text-right leading-loose font-arabic" dir="rtl">
                {istikharaDua.arabic.substring(0, 100)}...
              </p>
              <Button variant="link" className="text-indigo-600" onClick={() => setShowDuaDialog(true)}>
                Lire le dua complet →
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-white/70">
                <p className="text-2xl font-bold text-indigo-600">7</p>
                <p className="text-xs text-muted-foreground">jours de réflexion</p>
              </div>
              <div className="p-3 rounded-lg bg-white/70">
                <p className="text-2xl font-bold text-indigo-600">7</p>
                <p className="text-xs text-muted-foreground">hadiths du mariage</p>
              </div>
              <div className="p-3 rounded-lg bg-white/70">
                <p className="text-2xl font-bold text-indigo-600">🔒</p>
                <p className="text-xs text-muted-foreground">journal 100% privé</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-800">
                <p className="font-medium">Comment ça fonctionne :</p>
                <ul className="mt-1 space-y-1">
                  <li>• Priez 2 rak'at surérogatoires puis récitez le dua de l'Istikhara chaque jour</li>
                  <li>• Recevez un hadith et une réflexion quotidienne</li>
                  <li>• Notez vos pensées dans votre journal privé (personne ne peut le lire)</li>
                  <li>• Au bout de 7 jours, prenez votre décision en toute sérénité</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700" onClick={startNewSession}>
          <Moon className="h-5 w-5 mr-2" /> Commencer ma période de réflexion
        </Button>

        {/* Full Dua Dialog */}
        <Dialog open={showDuaDialog} onOpenChange={setShowDuaDialog}>
          <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Dua de l'Istikhara</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 rounded-lg">
                <p className="text-lg text-right leading-loose" dir="rtl">{istikharaDua.arabic}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Translittération :</p>
                <p className="text-sm text-muted-foreground italic">{istikharaDua.transliteration}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Traduction :</p>
                <p className="text-sm text-gray-700">{istikharaDua.french}</p>
              </div>
              <p className="text-xs text-muted-foreground">Source : {istikharaDua.source}</p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Active session
  return (
    <div className="container mx-auto py-6 px-4 space-y-6 max-w-3xl">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Istikhara — Jour {currentDay}/7
        </h1>
        <Progress value={(currentDay / 7) * 100} className="h-2.5 max-w-xs mx-auto" />
      </div>

      {/* Day Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dailyContent.map((_, index) => {
          const dayNum = index + 1;
          const hasEntry = entries.some((e) => e.day_number === dayNum);
          const isAccessible = dayNum <= currentDay;

          return (
            <Button
              key={dayNum}
              variant={activeDay === dayNum ? 'default' : 'outline'}
              size="sm"
              className={`flex-shrink-0 ${
                activeDay === dayNum ? 'bg-indigo-600 hover:bg-indigo-700' :
                hasEntry ? 'border-emerald-300 text-emerald-600' :
                !isAccessible ? 'opacity-40' : ''
              }`}
              disabled={!isAccessible}
              onClick={() => {
                setActiveDay(dayNum);
                const existing = entries.find((e) => e.day_number === dayNum);
                setJournalText(existing?.content || '');
                setSelectedMood(existing?.mood || 'neutral');
              }}
            >
              {hasEntry ? <CheckCircle2 className="h-3 w-3 mr-1" /> : null}
              J{dayNum}
            </Button>
          );
        })}
      </div>

      {/* Hadith du jour */}
      <Card className="border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <BookOpen className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-indigo-600 mb-2">Hadith du jour {activeDay}</p>
              <p className="text-right text-lg leading-loose mb-2" dir="rtl">
                {dayContent.hadith.arabic}
              </p>
              <p className="text-sm text-gray-700 italic">"{dayContent.hadith.french}"</p>
              <p className="text-xs text-muted-foreground mt-1">— {dayContent.hadith.source}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reflection Question */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-amber-600 mb-1">Réflexion du jour</p>
              <p className="text-sm text-gray-700">{dayContent.reflection}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Advice */}
      <Card className="border-emerald-200 bg-emerald-50/50">
        <CardContent className="pt-4 pb-4">
          <p className="text-sm text-emerald-800">
            <span className="font-medium">💡 Conseil :</span> {dayContent.advice}
          </p>
        </CardContent>
      </Card>

      {/* Journal Entry */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PenLine className="h-5 w-5 text-indigo-500" />
            Journal privé — Jour {activeDay}
            <Badge variant="outline" className="ml-auto text-xs">
              🔒 Strictement privé
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Mood Selector */}
          <div>
            <p className="text-sm font-medium mb-2">Comment vous sentez-vous aujourd'hui ?</p>
            <div className="flex flex-wrap gap-2">
              {Object.entries(moodLabels).map(([key, { label, emoji, color }]) => (
                <Button
                  key={key}
                  variant="outline"
                  size="sm"
                  className={`${selectedMood === key ? color + ' border-2' : ''}`}
                  onClick={() => setSelectedMood(key)}
                >
                  {emoji} {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Journal Text */}
          <Textarea
            value={journalText}
            onChange={(e) => setJournalText(e.target.value)}
            placeholder="Écrivez vos pensées, réflexions et ressentis après votre prière d'Istikhara..."
            className="min-h-[150px]"
          />

          {dayEntry && !journalText && (
            <div className="p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-muted-foreground mb-1">Votre entrée sauvegardée :</p>
              <p className="text-sm">{dayEntry.content}</p>
              <Badge className={`mt-2 text-xs ${moodLabels[dayEntry.mood]?.color || ''}`}>
                {moodLabels[dayEntry.mood]?.emoji} {moodLabels[dayEntry.mood]?.label}
              </Badge>
            </div>
          )}

          <Button
            onClick={saveJournalEntry}
            disabled={!journalText.trim()}
            className="w-full bg-indigo-600 hover:bg-indigo-700"
          >
            <PenLine className="h-4 w-4 mr-2" /> Sauvegarder le journal du jour {activeDay}
          </Button>
        </CardContent>
      </Card>

      {/* Decision Button (Day 7) */}
      {currentDay >= 7 && (
        <Card className="border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-6 text-center space-y-3">
            <Sparkles className="h-8 w-8 text-indigo-500 mx-auto" />
            <h3 className="font-semibold text-lg">Votre période de réflexion est terminée</h3>
            <p className="text-sm text-muted-foreground">
              Après 7 jours de prière et de réflexion, êtes-vous prêt(e) à prendre votre décision ?
            </p>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setShowDecisionDialog(true)}
            >
              Je suis prêt(e) à décider
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Decision Dialog */}
      <Dialog open={showDecisionDialog} onOpenChange={setShowDecisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Votre décision</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Après 7 jours de prière d'Istikhara et de réflexion, quelle est votre décision ?
            Cette décision est entre vous et Allah. Prenez-la en toute sérénité.
          </p>
          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              onClick={() => handleDecision('yes')}
            >
              <Heart className="h-4 w-4 mr-2" /> Oui, je souhaite poursuivre
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => handleDecision('no')}
            >
              <X className="h-4 w-4 mr-2" /> Non, je décline
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IstikharaSession;
