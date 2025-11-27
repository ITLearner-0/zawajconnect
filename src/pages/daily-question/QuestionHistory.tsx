/**
 * Question History Page
 * Shows user's complete answer history with filters and stats
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MessageCircleQuestion,
  TrendingUp,
  Filter,
  ArrowLeft,
  Sparkles,
  Flame,
  Award,
  Clock,
  Eye,
  Heart,
  Edit3,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface Answer {
  id: string;
  question_id: string;
  answer_text: string;
  answer_date: string;
  is_public: boolean;
  is_highlighted: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
  time_to_answer_seconds: number;
  question: {
    question_fr: string;
    category: string;
    difficulty_level: string;
  };
}

interface Stats {
  total_answers: number;
  current_streak: number;
  longest_streak: number;
  categories_answered: Record<string, number>;
  total_likes: number;
  total_views: number;
  average_length: number;
}

const QuestionHistory = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [filteredAnswers, setFilteredAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchAnswers();
    fetchStats();
  }, [user]);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredAnswers(answers);
    } else {
      setFilteredAnswers(answers.filter((a) => a.question.category === selectedCategory));
    }
  }, [selectedCategory, answers]);

  const fetchAnswers = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_daily_answers')
        .select(
          `
          *,
          question:daily_questions(question_fr, category, difficulty_level)
        `
        )
        .eq('user_id', user.id)
        .eq('is_skipped', false)
        .order('answer_date', { ascending: false });

      if (error) throw error;

      // @ts-ignore - Supabase types
      setAnswers(data || []);
      // @ts-ignore
      setFilteredAnswers(data || []);
    } catch (error) {
      console.error('Error fetching answers:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger votre historique',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get streak
      const { data: streakData } = await supabase.rpc('get_user_answer_streak', {
        p_user_id: user.id,
      });

      // Count by category
      const { data: answersData } = await supabase
        .from('user_daily_answers')
        .select('*, question:daily_questions(category)')
        .eq('user_id', user.id)
        .eq('is_skipped', false);

      const categoryCount: Record<string, number> = {};
      let totalLikes = 0;
      let totalViews = 0;
      let totalLength = 0;

      answersData?.forEach((answer: any) => {
        const cat = answer.question?.category || 'other';
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
        totalLikes += answer.likes_count || 0;
        totalViews += answer.views_count || 0;
        totalLength += answer.answer_text?.length || 0;
      });

      setStats({
        total_answers: answersData?.length || 0,
        current_streak: streakData || 0,
        longest_streak: streakData || 0, // Would need separate tracking
        categories_answered: categoryCount,
        total_likes: totalLikes,
        total_views: totalViews,
        average_length: answersData?.length ? Math.round(totalLength / answersData.length) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleTogglePublic = async (answerId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('user_daily_answers')
        .update({ is_public: !currentValue })
        .eq('id', answerId);

      if (error) throw error;

      toast({
        title: 'Visibilité mise à jour',
        description: !currentValue
          ? 'Cette réponse est maintenant visible par vos matches'
          : 'Cette réponse est maintenant privée',
      });

      await fetchAnswers();
    } catch (error) {
      console.error('Error toggling public:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la visibilité',
        variant: 'destructive',
      });
    }
  };

  const handleToggleHighlight = async (answerId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('user_daily_answers')
        .update({ is_highlighted: !currentValue })
        .eq('id', answerId);

      if (error) throw error;

      toast({
        title: currentValue ? 'Désépinglé' : 'Épinglé',
        description: !currentValue
          ? 'Cette réponse apparaîtra en haut de votre profil'
          : 'Cette réponse ne sera plus épinglée',
      });

      await fetchAnswers();
    } catch (error) {
      console.error('Error toggling highlight:', error);
    }
  };

  const handleEditAnswer = async (answerId: string) => {
    if (!editText.trim()) return;

    try {
      const { error } = await supabase
        .from('user_daily_answers')
        .update({ answer_text: editText.trim(), updated_at: new Date().toISOString() })
        .eq('id', answerId);

      if (error) throw error;

      toast({
        title: 'Réponse modifiée',
        description: 'Votre réponse a été mise à jour avec succès',
      });

      setEditingId(null);
      setEditText('');
      await fetchAnswers();
    } catch (error) {
      console.error('Error editing answer:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de modifier la réponse',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAnswer = async (answerId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réponse ?')) return;

    try {
      const { error } = await supabase.from('user_daily_answers').delete().eq('id', answerId);

      if (error) throw error;

      toast({
        title: 'Réponse supprimée',
        description: 'Votre réponse a été supprimée définitivement',
      });

      await fetchAnswers();
      await fetchStats();
    } catch (error) {
      console.error('Error deleting answer:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la réponse',
        variant: 'destructive',
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      religion: 'emerald',
      family: 'purple',
      values: 'blue',
      lifestyle: 'pink',
      goals: 'orange',
      relationship: 'rose',
      personality: 'cyan',
      finance: 'green',
      culture: 'indigo',
      fun: 'yellow',
    };
    return colors[category] || 'gray';
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
        <StandardLoadingState message="Chargement de votre historique..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <div className="mb-8">
          <Button onClick={() => navigate('/daily-question')} variant="ghost" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à la question du jour
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Historique</h1>
              <p className="text-gray-600">Toutes vos réponses aux questions quotidiennes</p>
            </div>
            {stats && stats.current_streak > 0 && (
              <Badge variant="outline" className="px-4 py-2 text-lg">
                <Flame className="h-5 w-5 text-orange-500 mr-2" />
                <span className="font-bold">{stats.current_streak}</span> jour
                {stats.current_streak > 1 ? 's' : ''}
              </Badge>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar Stats */}
          <div className="lg:col-span-1 space-y-4">
            {stats && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Statistiques</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Réponses</span>
                      <span className="text-2xl font-bold text-emerald">{stats.total_answers}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Série</span>
                      <span className="text-2xl font-bold text-orange-500">
                        {stats.current_streak}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Likes</span>
                      <span className="text-2xl font-bold text-rose-500">{stats.total_likes}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Vues</span>
                      <span className="text-2xl font-bold text-blue-500">{stats.total_views}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Filter */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      Catégories
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => setSelectedCategory('all')}
                      variant={selectedCategory === 'all' ? 'default' : 'outline'}
                      className="w-full justify-start"
                      size="sm"
                    >
                      Toutes ({stats.total_answers})
                    </Button>
                    {Object.entries(stats.categories_answered).map(([cat, count]) => (
                      <Button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        variant={selectedCategory === cat ? 'default' : 'outline'}
                        className="w-full justify-start"
                        size="sm"
                      >
                        {getCategoryLabel(cat)} ({count})
                      </Button>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filteredAnswers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <MessageCircleQuestion className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Aucune réponse</h3>
                  <p className="text-muted-foreground mb-6">
                    {selectedCategory === 'all'
                      ? "Vous n'avez pas encore répondu à des questions"
                      : 'Aucune réponse dans cette catégorie'}
                  </p>
                  <Button onClick={() => navigate('/daily-question')}>
                    Répondre à la question du jour
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredAnswers.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={`${
                        answer.is_highlighted ? 'border-2 border-emerald shadow-lg' : ''
                      }`}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">
                                {getCategoryLabel(answer.question.category)}
                              </Badge>
                              <span className="text-sm text-gray-500">
                                {new Date(answer.answer_date).toLocaleDateString('fr-FR', {
                                  weekday: 'long',
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </span>
                              {answer.is_highlighted && (
                                <Badge className="bg-emerald text-white">
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  Épinglé
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg">
                              {answer.question.question_fr}
                            </CardTitle>
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent>
                        {editingId === answer.id ? (
                          <div className="space-y-3">
                            <textarea
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="w-full p-3 border rounded-lg min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleEditAnswer(answer.id)}
                                size="sm"
                                className="bg-emerald hover:bg-emerald-dark"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Enregistrer
                              </Button>
                              <Button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditText('');
                                }}
                                size="sm"
                                variant="outline"
                              >
                                Annuler
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-gray-700 whitespace-pre-wrap mb-4">
                              {answer.answer_text}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t">
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {answer.views_count} vues
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {answer.likes_count} likes
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {answer.answer_text.length} caractères
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleTogglePublic(answer.id, answer.is_public)}
                                  size="sm"
                                  variant={answer.is_public ? 'default' : 'outline'}
                                >
                                  {answer.is_public ? 'Public' : 'Privé'}
                                </Button>
                                <Button
                                  onClick={() =>
                                    handleToggleHighlight(answer.id, answer.is_highlighted)
                                  }
                                  size="sm"
                                  variant="outline"
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    setEditingId(answer.id);
                                    setEditText(answer.answer_text);
                                  }}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDeleteAnswer(answer.id)}
                                  size="sm"
                                  variant="outline"
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionHistory;
