import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserLevel } from './useUserLevel';

interface DailyQuest {
  id: string;
  quest_type: string;
  title: string;
  description: string;
  target_value: number;
  xp_reward: number;
  icon: string;
}

interface QuestProgress {
  quest_id: string;
  current_progress: number;
  completed: boolean;
  completed_at: string | null;
}

export const useDailyQuests = () => {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [questProgress, setQuestProgress] = useState<Map<string, QuestProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { addXP } = useUserLevel();

  useEffect(() => {
    loadDailyQuests();
  }, []);

  const loadDailyQuests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Assign and get daily quests for user
    const { data: questsData, error } = await supabase
      .rpc('assign_daily_quests_to_user', { p_user_id: user.id });

    if (error) {
      console.error('Error loading daily quests:', error);
      setLoading(false);
      return;
    }

    if (questsData) {
      // Map the RPC result to our interface
      const mappedQuests: DailyQuest[] = questsData.map(q => ({
        id: q.quest_id,
        quest_type: q.quest_type,
        title: q.title,
        description: q.description,
        target_value: q.target_value,
        xp_reward: q.xp_reward,
        icon: q.icon
      }));
      
      setQuests(mappedQuests);

      // Get progress for these quests
      const questIds: string[] = mappedQuests.map(q => q.id);
      
      if (questIds.length > 0) {
        const today = new Date().toISOString().split('T')[0] ?? '';
        
        const { data: progressData } = await supabase
          .from('user_daily_quest_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('quest_date', today)
          .in('quest_id', questIds);

        if (progressData) {
          const progressMap = new Map(
            progressData.map(p => [p.quest_id, {
              quest_id: p.quest_id,
              current_progress: p.current_progress,
              completed: p.completed,
              completed_at: p.completed_at
            }])
          );
          setQuestProgress(progressMap);
        }
      }
    }

    setLoading(false);
  };

  const updateQuestProgress = useCallback(async (
    questType: string,
    incrementBy: number = 1
  ) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const quest = quests.find(q => q.quest_type === questType);
    if (!quest) return;

    const currentProgress = questProgress.get(quest.id);
    const newProgress = (currentProgress?.current_progress || 0) + incrementBy;
    const isCompleted = newProgress >= quest.target_value;

    // Don't update if already completed
    if (currentProgress?.completed) return;

    const today = new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('user_daily_quest_progress')
      .upsert({
        user_id: user.id,
        quest_id: quest.id,
        quest_date: today,
        current_progress: newProgress,
        completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (error) {
      console.error('Error updating quest progress:', error);
      return;
    }

    if (data) {
      setQuestProgress(prev => new Map(prev).set(quest.id, {
        quest_id: data.quest_id,
        current_progress: data.current_progress,
        completed: data.completed,
        completed_at: data.completed_at
      }));

      // If just completed, award XP
      if (isCompleted && !currentProgress?.completed) {
        await addXP(quest.xp_reward, `Quête complétée: ${quest.title}`);
        
        toast({
          title: '✨ Quête Complétée!',
          description: (
            <div className="space-y-1">
              <p className="font-semibold">{quest.title}</p>
              <p className="text-sm">+{quest.xp_reward} XP</p>
            </div>
          ),
          duration: 5000,
        });
      }
    }
  }, [quests, questProgress, toast, addXP]);

  const getQuestProgress = (questId: string) => {
    return questProgress.get(questId);
  };

  const getCompletedCount = () => {
    return Array.from(questProgress.values()).filter(p => p.completed).length;
  };

  const getTotalXPEarned = () => {
    return Array.from(questProgress.entries()).reduce((total, [questId, progress]) => {
      if (progress.completed) {
        const quest = quests.find(q => q.id === questId);
        return total + (quest?.xp_reward || 0);
      }
      return total;
    }, 0);
  };

  return {
    quests,
    questProgress,
    loading,
    updateQuestProgress,
    getQuestProgress,
    getCompletedCount,
    getTotalXPEarned,
    refreshQuests: loadDailyQuests
  };
};
