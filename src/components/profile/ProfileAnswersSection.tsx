/**
 * Profile Answers Section
 * Displays user's answers to daily questions on their profile
 * Visible to matches or own profile
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MessageCircleQuestion,
  Heart,
  Eye,
  Sparkles,
  Calendar,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Answer {
  id: string;
  answer_text: string;
  answer_date: string;
  is_highlighted: boolean;
  views_count: number;
  likes_count: number;
  question: {
    question_fr: string;
    category: string;
    difficulty_level: string;
  };
}

interface ProfileAnswersSectionProps {
  userId: string;
  isOwnProfile?: boolean;
  maxAnswers?: number;
}

export const ProfileAnswersSection = ({
  userId,
  isOwnProfile = false,
  maxAnswers = 5,
}: ProfileAnswersSectionProps) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [hasLiked, setHasLiked] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchAnswers();
  }, [userId]);

  const fetchAnswers = async () => {
    try {
      const query = supabase
        .from('user_daily_answers')
        .select(
          `
          id,
          answer_text,
          answer_date,
          is_highlighted,
          views_count,
          likes_count,
          question:daily_questions(question_fr, category, difficulty_level)
        `
        )
        .eq('user_id', userId)
        .eq('is_skipped', false);

      // If not own profile, only show public answers
      if (!isOwnProfile) {
        query.eq('is_public', true);
      }

      // Order by highlighted first, then date
      query.order('is_highlighted', { ascending: false });
      query.order('answer_date', { ascending: false });

      const { data, error } = await query.limit(showAll ? 100 : maxAnswers);

      if (error) throw error;

      // @ts-ignore
      setAnswers(data || []);

      // Check if current user has liked these answers
      if (!isOwnProfile && data) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: likesData } = await supabase
            .from('answer_likes')
            .select('answer_id')
            .eq('user_id', user.id)
            .in(
              'answer_id',
              data.map((a: any) => a.id)
            );

          const likedMap: Record<string, boolean> = {};
          likesData?.forEach((like) => {
            likedMap[like.answer_id] = true;
          });
          setHasLiked(likedMap);
        }
      }
    } catch (error) {
      console.error('Error fetching answers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (answerId: string) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      if (hasLiked[answerId]) {
        // Unlike
        await supabase
          .from('answer_likes')
          .delete()
          .eq('answer_id', answerId)
          .eq('user_id', user.id);

        setHasLiked((prev) => ({ ...prev, [answerId]: false }));
      } else {
        // Like
        await supabase.from('answer_likes').insert({
          answer_id: answerId,
          user_id: user.id,
        });

        setHasLiked((prev) => ({ ...prev, [answerId]: true }));
      }

      // Refresh to get updated like count
      await fetchAnswers();
    } catch (error) {
      console.error('Error toggling like:', error);
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
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (answers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircleQuestion className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">
            {isOwnProfile
              ? "Vous n'avez pas encore répondu à des questions"
              : "Cet utilisateur n'a pas encore partagé de réponses"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <MessageCircleQuestion className="h-5 w-5 text-emerald" />
          Réponses aux Questions du Jour
        </h3>
        <Badge variant="outline">{answers.length} réponses</Badge>
      </div>

      <div className="space-y-4">
        {answers.slice(0, showAll ? undefined : maxAnswers).map((answer, index) => (
          <motion.div
            key={answer.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className={`${answer.is_highlighted ? 'border-2 border-emerald shadow-md' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className={`bg-${getCategoryColor(answer.question.category)}-50 text-${getCategoryColor(answer.question.category)}-700 border-${getCategoryColor(answer.question.category)}-200`}
                      >
                        {getCategoryLabel(answer.question.category)}
                      </Badge>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(answer.answer_date).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      {answer.is_highlighted && (
                        <Badge className="bg-emerald text-white text-xs">
                          <Sparkles className="h-3 w-3 mr-1" />
                          Épinglé
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-medium text-gray-700">
                      {answer.question.question_fr}
                    </CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap mb-4">{answer.answer_text}</p>

                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="flex items-center gap-3 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {answer.views_count}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {answer.likes_count}
                    </div>
                  </div>

                  {!isOwnProfile && (
                    <Button
                      onClick={() => handleLike(answer.id)}
                      size="sm"
                      variant={hasLiked[answer.id] ? 'default' : 'outline'}
                      className={hasLiked[answer.id] ? 'bg-rose-500 hover:bg-rose-600' : ''}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${hasLiked[answer.id] ? 'fill-current' : ''}`} />
                      {hasLiked[answer.id] ? 'Aimé' : 'Aimer'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {answers.length > maxAnswers && (
        <div className="text-center pt-4">
          <Button onClick={() => setShowAll(!showAll)} variant="outline">
            {showAll ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Voir moins
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Voir toutes les réponses ({answers.length})
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProfileAnswersSection;
