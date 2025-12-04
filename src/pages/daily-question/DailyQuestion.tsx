/**
 * Daily Question Page
 * Main page for the "Question du Jour" feature
 * Displays today's question and allows users to answer
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MessageCircleQuestion,
  Send,
  Sparkles,
  Calendar,
  TrendingUp,
  Users,
  Heart,
  Loader2,
  CheckCircle2,
  ArrowRight,
  Flame,
} from 'lucide-react';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface TodayQuestion {
  question_id: string;
  question_text: string;
  question_fr: string;
  category: string;
  question_type: string;
  choices: any;
  has_answered: boolean;
  user_answer: string | null;
}

interface AnswerStats {
  total_responses: number;
  streak: number;
  total_answers: number;
}

const DailyQuestion = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [question, setQuestion] = useState<TodayQuestion | null>(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stats, setStats] = useState<AnswerStats>({ total_responses: 0, streak: 0, total_answers: 0 });
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchTodayQuestion();
    fetchUserStats();
  }, [user]);

  const fetchTodayQuestion = async () => {
    try {
      const { data, error } = await supabase.rpc('get_today_question');

      if (error) throw error;

      if (data && data.length > 0) {
        const q = data[0];
        setQuestion(q);
        if (q.user_answer) {
          setAnswer(q.user_answer);
        }
      } else {
        // No question for today
        setQuestion(null);
      }
    } catch (error) {
      console.error('Error fetching today question:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger la question du jour',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      // Get user's answer streak
      const { data: streakData } = await supabase.rpc('get_user_answer_streak', {
        p_user_id: user.id,
      });

      // Get total answers count
      const { count } = await supabase
        .from('user_daily_answers')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_skipped', false);

      setStats({
        total_responses: 0, // Would need another query for today's total
        streak: streakData || 0,
        total_answers: count || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!question || !user || !answer.trim()) {
      toast({
        title: 'Réponse vide',
        description: 'Veuillez écrire une réponse avant de soumettre',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const timeToAnswer = Math.floor((Date.now() - startTime) / 1000);

      const { error } = await supabase.from('user_daily_answers').upsert(
        {
          user_id: user.id,
          question_id: question.question_id,
          answer_text: answer.trim(),
          answer_date: new Date().toISOString().split('T')[0],
          time_to_answer_seconds: timeToAnswer,
          is_skipped: false,
          is_public: true,
        },
        {
          onConflict: 'user_id,question_id',
        }
      );

      if (error) throw error;

      toast({
        title: '🎉 Réponse enregistrée !',
        description: `Vous avez une série de ${stats.streak + 1} jour(s) !`,
      });

      // Refresh question to show "answered" state
      await fetchTodayQuestion();
      await fetchUserStats();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre réponse',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = async () => {
    if (!question || !user) return;

    try {
      const { error } = await supabase.from('user_daily_answers').upsert(
        {
          user_id: user.id,
          question_id: question.question_id,
          answer_text: '',
          answer_date: new Date().toISOString().split('T')[0],
          is_skipped: true,
          is_public: false,
        },
        {
          onConflict: 'user_id,question_id',
        }
      );

      if (error) throw error;

      toast({
        title: 'Question passée',
        description: 'Revenez demain pour une nouvelle question !',
      });

      await fetchTodayQuestion();
    } catch (error) {
      console.error('Error skipping question:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      religion: 'from-emerald-500 to-emerald-600',
      family: 'from-purple-500 to-purple-600',
      values: 'from-blue-500 to-blue-600',
      lifestyle: 'from-pink-500 to-pink-600',
      goals: 'from-orange-500 to-orange-600',
      relationship: 'from-rose-500 to-rose-600',
      personality: 'from-cyan-500 to-cyan-600',
      finance: 'from-green-500 to-green-600',
      culture: 'from-indigo-500 to-indigo-600',
      fun: 'from-yellow-500 to-yellow-600',
    };

    return colors[category] || 'from-gray-500 to-gray-600';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      religion: '🕌 Religion',
      family: '👨‍👩‍👧‍👦 Famille',
      values: '💎 Valeurs',
      lifestyle: '🌟 Style de vie',
      goals: '🎯 Objectifs',
      relationship: '💕 Relations',
      personality: '✨ Personnalité',
      finance: '💰 Finance',
      culture: '🌍 Culture',
      fun: '🎉 Détente',
    };

    return labels[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex items-center justify-center">
        <StandardLoadingState message="Chargement de la question du jour..." />
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 p-4">
        <div className="container mx-auto max-w-4xl py-12">
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircleQuestion className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-2xl font-bold mb-2">Aucune question pour aujourd'hui</h2>
              <p className="text-muted-foreground mb-6">
                Revenez demain pour découvrir une nouvelle question !
              </p>
              <Button onClick={() => navigate('/dashboard')}>Retour au tableau de bord</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isAnswered = question.has_answered && !question.user_answer?.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 p-4">
      <div className="container mx-auto max-w-5xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Question du Jour</h1>
              <p className="text-gray-600">
                Partagez vos réflexions et découvrez celles de vos matches
              </p>
            </div>
            <div className="flex items-center gap-3">
              {stats.streak > 0 && (
                <Badge variant="outline" className="px-4 py-2 text-lg">
                  <Flame className="h-5 w-5 text-orange-500 mr-2" />
                  <span className="font-bold">{stats.streak}</span> jour{stats.streak > 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Question Card */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={question.question_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-lg border-2">
                  <CardHeader
                    className={`bg-gradient-to-r ${getCategoryColor(question.category)} text-white`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="bg-white/20 text-white">
                        {getCategoryLabel(question.category)}
                      </Badge>
                      <div className="flex items-center gap-2 text-white/90 text-sm">
                        <Calendar className="h-4 w-4" />
                        {new Date().toLocaleDateString('fr-FR', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                      <MessageCircleQuestion className="inline h-7 w-7 mr-3" />
                      {question.question_fr}
                    </CardTitle>
                    <CardDescription className="text-white/80 text-base mt-2">
                      Prenez le temps de réfléchir avant de répondre. Votre réponse sera visible par
                      vos matches.
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="p-6">
                    {question.has_answered && question.user_answer ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-green-600">
                          <CheckCircle2 className="h-5 w-5" />
                          <span className="font-semibold">Vous avez déjà répondu aujourd'hui !</span>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="text-sm text-gray-600 mb-2 font-medium">Votre réponse :</p>
                          <p className="text-gray-900 whitespace-pre-wrap">{question.user_answer}</p>
                        </div>

                        <div className="flex gap-3">
                          <Button onClick={() => navigate('/daily-question/history')} variant="outline" className="flex-1">
                            <Calendar className="h-4 w-4 mr-2" />
                            Historique
                          </Button>
                          <Button
                            onClick={() => navigate(`/daily-question/matches?question_id=${question.question_id}`)}
                            className="flex-1 bg-gradient-to-r from-emerald to-emerald-light hover:from-emerald-dark hover:to-emerald text-white"
                          >
                            <Users className="h-4 w-4 mr-2" />
                            Réponses des matches
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Textarea
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                          placeholder="Écrivez votre réponse ici... Soyez authentique et réfléchi."
                          className="min-h-[200px] text-base"
                          disabled={submitting}
                        />

                        <div className="flex items-center justify-between text-sm text-gray-500">
                          <span>{answer.length} caractères</span>
                          {answer.length > 0 && (
                            <span className="text-emerald">
                              {answer.length < 50
                                ? 'Essayez de développer un peu plus'
                                : 'Belle réponse ! '}
                            </span>
                          )}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            onClick={handleSkip}
                            variant="outline"
                            disabled={submitting}
                          >
                            Passer
                          </Button>
                          <Button
                            onClick={handleSubmitAnswer}
                            disabled={!answer.trim() || submitting}
                            className="flex-1 bg-gradient-to-r from-emerald to-emerald-light text-white"
                          >
                            {submitting ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Envoi en cours...
                              </>
                            ) : (
                              <>
                                <Send className="h-4 w-4 mr-2" />
                                Envoyer ma réponse
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald" />
                  Vos Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Série actuelle</span>
                    <span className="text-lg font-bold text-orange-500">{stats.streak} jours</span>
                  </div>
                  <Progress value={(stats.streak / 30) * 100} className="h-2" />
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total de réponses</span>
                    <span className="text-lg font-bold text-emerald">{stats.total_answers}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button onClick={() => navigate('/daily-question/history')} variant="outline" className="w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    Historique
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Benefits Card */}
            <Card className="bg-gradient-to-br from-emerald-50 to-sage-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-emerald" />
                  Pourquoi répondre ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-emerald mt-1 flex-shrink-0" />
                    <span>Découvrez les valeurs profondes de vos matches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircleQuestion className="h-4 w-4 text-emerald mt-1 flex-shrink-0" />
                    <span>Démarrez des conversations significatives</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald mt-1 flex-shrink-0" />
                    <span>Améliorez votre profil et votre visibilité</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Flame className="h-4 w-4 text-emerald mt-1 flex-shrink-0" />
                    <span>Maintenez votre série et gagnez des badges</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyQuestion;
