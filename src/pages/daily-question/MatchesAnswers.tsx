/**
 * Matches Answers Page - Phase 3
 * Shows answers from matches for the same question
 * Enables social features and conversation starters
 */

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  MessageCircleQuestion,
  Heart,
  MessageCircle,
  Users,
  ArrowLeft,
  Sparkles,
  Clock,
  TrendingUp,
  Flame,
  Send,
} from 'lucide-react';
import StandardLoadingState from '@/components/ui/StandardLoadingState';

interface MatchAnswer {
  id: string;
  answer_text: string;
  answer_date: string;
  time_to_answer_seconds: number;
  likes_count: number;
  user_id: string;
  profile: {
    first_name: string;
    last_name: string;
    profile_picture: string | null;
    location: string;
    age: number;
  };
}

interface QuestionInfo {
  question_id: string;
  question_fr: string;
  category: string;
  difficulty_level: string;
}

const MatchesAnswers = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const questionId = searchParams.get('question_id');

  const [question, setQuestion] = useState<QuestionInfo | null>(null);
  const [myAnswer, setMyAnswer] = useState<string>('');
  const [matchesAnswers, setMatchesAnswers] = useState<MatchAnswer[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedAnswers, setLikedAnswers] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!questionId) {
      toast({
        title: 'Erreur',
        description: 'Question non spécifiée',
        variant: 'destructive',
      });
      navigate('/daily-question');
      return;
    }

    fetchQuestionAndAnswers();
  }, [user, questionId]);

  const fetchQuestionAndAnswers = async () => {
    if (!user || !questionId) return;

    try {
      // Fetch question info
      const { data: questionData, error: questionError } = await supabase
        .from('daily_questions')
        .select('id, question_fr, category, difficulty_level')
        .eq('id', questionId)
        .single();

      if (questionError) throw questionError;

      setQuestion({
        question_id: questionData.id,
        question_fr: questionData.question_fr,
        category: questionData.category,
        difficulty_level: questionData.difficulty_level,
      });

      // Fetch my answer
      const { data: myAnswerData } = await supabase
        .from('user_daily_answers')
        .select('answer_text')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .eq('is_skipped', false)
        .single();

      if (myAnswerData) {
        setMyAnswer(myAnswerData.answer_text);
      }

      // Fetch matches' answers using a custom RPC function
      const { data: matchesData, error: matchesError } = await supabase.rpc(
        'get_matches_answers_for_question',
        {
          p_user_id: user.id,
          p_question_id: questionId,
        }
      );

      if (matchesError) {
        console.error('Error fetching matches answers:', matchesError);
        // If function doesn't exist, fallback to manual query
        await fetchMatchesAnswersManual();
      } else {
        setMatchesAnswers(matchesData || []);
      }

      // Fetch liked answers
      const { data: likesData } = await supabase
        .from('answer_likes')
        .select('answer_id')
        .eq('user_id', user.id);

      if (likesData) {
        setLikedAnswers(new Set(likesData.map((like) => like.answer_id)));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les réponses des matches',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchesAnswersManual = async () => {
    if (!user || !questionId) return;

    try {
      // Get mutual matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select('user1_id, user2_id')
        .eq('is_mutual', true)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

      if (!matchesData || matchesData.length === 0) {
        setMatchesAnswers([]);
        return;
      }

      // Get match IDs
      const matchIds = matchesData.map((match) =>
        match.user1_id === user.id ? match.user2_id : match.user1_id
      );

      // Get answers from matches
      const { data: answersData } = await supabase
        .from('user_daily_answers')
        .select(
          `
          id,
          answer_text,
          answer_date,
          time_to_answer_seconds,
          likes_count,
          user_id,
          profile:profiles!user_daily_answers_user_id_fkey(
            first_name,
            last_name,
            profile_picture,
            location,
            birth_date
          )
        `
        )
        .eq('question_id', questionId)
        .in('user_id', matchIds)
        .eq('is_public', true)
        .eq('is_skipped', false)
        .order('created_at', { ascending: false });

      if (answersData) {
        // Transform data to match interface
        const transformedData = answersData.map((answer: any) => ({
          ...answer,
          profile: {
            ...answer.profile,
            age: answer.profile.birth_date
              ? new Date().getFullYear() - new Date(answer.profile.birth_date).getFullYear()
              : 0,
          },
        }));

        setMatchesAnswers(transformedData);
      }
    } catch (error) {
      console.error('Error in manual fetch:', error);
    }
  };

  const handleLike = async (answerId: string) => {
    if (!user) return;

    try {
      const isLiked = likedAnswers.has(answerId);

      if (isLiked) {
        // Unlike
        await supabase
          .from('answer_likes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);

        setLikedAnswers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(answerId);
          return newSet;
        });

        // Update local state
        setMatchesAnswers((prev) =>
          prev.map((answer) =>
            answer.id === answerId
              ? { ...answer, likes_count: answer.likes_count - 1 }
              : answer
          )
        );
      } else {
        // Like
        await supabase.from('answer_likes').insert({
          answer_id: answerId,
          user_id: user.id,
        });

        setLikedAnswers((prev) => new Set(prev).add(answerId));

        // Update local state
        setMatchesAnswers((prev) =>
          prev.map((answer) =>
            answer.id === answerId
              ? { ...answer, likes_count: answer.likes_count + 1 }
              : answer
          )
        );

        toast({
          title: '❤️ Vous avez aimé cette réponse !',
          description: 'Pourquoi ne pas leur envoyer un message ?',
        });
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de liker la réponse',
        variant: 'destructive',
      });
    }
  };

  const handleStartConversation = (matchUserId: string, matchName: string) => {
    // Navigate to messages with pre-filled conversation starter
    const starter = `Salut ${matchName}! J'ai vu ta réponse à la question "${question?.question_fr}". ${getConversationStarter()}`;

    toast({
      title: '💬 Conversation starter créé !',
      description: `Prêt à discuter avec ${matchName}`,
    });

    // Navigate to messages with query params
    navigate(`/messages?user_id=${matchUserId}&starter=${encodeURIComponent(starter)}`);
  };

  const getConversationStarter = () => {
    const starters = [
      "C'est très intéressant ce que tu as partagé !",
      'On a des points de vue similaires !',
      'Ton approche est vraiment réfléchie.',
      "J'aimerais en savoir plus sur ta perspective.",
      'Ta réponse est vraiment inspirante !',
    ];
    return starters[Math.floor(Math.random() * starters.length)];
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 flex items-center justify-center">
        <StandardLoadingState message="Chargement des réponses de vos matches..." />
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
              <h2 className="text-2xl font-bold mb-2">Question introuvable</h2>
              <Button onClick={() => navigate('/daily-question')}>
                Retour à la question du jour
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 via-white to-sage-50 p-4">
      <div className="container mx-auto max-w-6xl py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            onClick={() => navigate('/daily-question')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Réponses de vos Matches
              </h1>
              <p className="text-gray-600">
                Découvrez ce que vos matches pensent de cette question
              </p>
            </div>
            <Badge variant="outline" className="px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              {matchesAnswers.length} match{matchesAnswers.length > 1 ? 'es' : ''}
            </Badge>
          </div>

          {/* Question Card */}
          <Card className={`border-2 bg-gradient-to-r ${getCategoryColor(question.category)}`}>
            <CardHeader className="text-white">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {getCategoryLabel(question.category)}
                </Badge>
              </div>
              <CardTitle className="text-2xl">
                <MessageCircleQuestion className="inline h-6 w-6 mr-2" />
                {question.question_fr}
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content - Matches Answers */}
          <div className="lg:col-span-2 space-y-6">
            {matchesAnswers.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">
                    Aucune réponse pour le moment
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Vos matches n'ont pas encore répondu à cette question.
                  </p>
                  <Button onClick={() => navigate('/daily-question')}>
                    Retour à la question du jour
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence mode="wait">
                {matchesAnswers.map((answer, index) => (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={answer.profile.profile_picture || undefined} />
                              <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-gold-100">
                                {getInitials(
                                  answer.profile.first_name,
                                  answer.profile.last_name
                                )}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="font-semibold text-lg">
                                {answer.profile.first_name} {answer.profile.last_name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {answer.profile.age} ans • {answer.profile.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            {new Date(answer.answer_date).toLocaleDateString('fr-FR')}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4 border">
                          <p className="text-gray-900 whitespace-pre-wrap">
                            {answer.answer_text}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant={likedAnswers.has(answer.id) ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleLike(answer.id)}
                              className={
                                likedAnswers.has(answer.id)
                                  ? 'bg-rose-500 hover:bg-rose-600'
                                  : ''
                              }
                            >
                              <Heart
                                className={`h-4 w-4 mr-2 ${
                                  likedAnswers.has(answer.id) ? 'fill-current' : ''
                                }`}
                              />
                              {answer.likes_count}
                            </Button>

                            {answer.time_to_answer_seconds && (
                              <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Sparkles className="h-4 w-4" />
                                {Math.floor(answer.time_to_answer_seconds / 60)}min de
                                réflexion
                              </div>
                            )}
                          </div>

                          <Button
                            onClick={() =>
                              handleStartConversation(
                                answer.user_id,
                                answer.profile.first_name
                              )
                            }
                            className="bg-emerald hover:bg-emerald-dark"
                          >
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Discuter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Sidebar - My Answer & Stats */}
          <div className="space-y-6">
            {/* My Answer Card */}
            {myAnswer && (
              <Card className="bg-gradient-to-br from-emerald-50 to-sage-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-emerald" />
                    Votre Réponse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-white rounded-lg p-4 border border-emerald-200">
                    <p className="text-gray-900 whitespace-pre-wrap text-sm">{myAnswer}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald" />
                  Statistiques
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Matches ayant répondu</span>
                    <span className="text-lg font-bold text-emerald">
                      {matchesAnswers.length}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Total likes donnés</span>
                    <span className="text-lg font-bold text-rose-500">
                      {likedAnswers.size}
                    </span>
                  </div>
                </div>

                {matchesAnswers.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      💡 <strong>Conseil:</strong> Utilisez ces réponses pour démarrer des
                      conversations authentiques !
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Conseils
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start gap-2">
                    <Heart className="h-4 w-4 text-rose-500 mt-1 flex-shrink-0" />
                    <span>Likez les réponses qui résonnent avec vous</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <MessageCircle className="h-4 w-4 text-blue-500 mt-1 flex-shrink-0" />
                    <span>Utilisez les réponses comme conversation starters</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-1 flex-shrink-0" />
                    <span>Soyez authentique dans vos interactions</span>
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

export default MatchesAnswers;
