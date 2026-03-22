import { useState, useEffect } from 'react';
import { CompatibilityMatch } from '@/types/compatibility';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { questions } from '@/data/compatibilityQuestions';

export function useCompatibilityMatches() {
  const [matchScores, setMatchScores] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fonction pour calculer la compatibilité entre deux utilisateurs
  const calculateCompatibility = (
    myAnswers: Record<string, any>,
    otherAnswers: Record<string, any>
  ): number => {
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(myAnswers).forEach(([questionId, myAnswer]) => {
      const otherAnswer = otherAnswers[questionId];
      if (!otherAnswer || !myAnswer) return;

      const question = questions.find((q) => q.id.toString() === questionId);
      if (!question) return;

      const weight = question.weight;
      const difference = Math.abs(myAnswer.value - otherAnswer.value);
      const compatibility = Math.max(0, 100 - difference);

      totalScore += compatibility * weight;
      totalWeight += weight;
    });

    return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
  };

  // Fonction pour calculer l'âge
  const calculateAge = (birthDate: string): number => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        console.log('Chargement des correspondances de compatibilité...');

        // Vérifier si l'utilisateur est connecté
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          console.log('Aucune session trouvée');
          setMatchScores([]);
          setLoading(false);
          return;
        }

        console.log('ID utilisateur actuel:', session.user.id);

        // Récupérer les résultats de compatibilité de l'utilisateur actuel
        const { data: myResults, error: myResultsError } = await (supabase as any)
          .from('compatibility_results')
          .select('answers, preferences, score')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (myResultsError) {
          console.error(
            'Erreur lors de la récupération des résultats utilisateur:',
            myResultsError
          );
          if (myResultsError.code === 'PGRST116') {
            console.log("Aucun résultat de compatibilité trouvé pour l'utilisateur actuel");
            setMatchScores([]);
            setLoading(false);
            return;
          }
          throw myResultsError;
        }

        if (!myResults) {
          console.log("Aucun résultat de compatibilité trouvé pour l'utilisateur actuel");
          setMatchScores([]);
          setLoading(false);
          return;
        }

        console.log('Résultats utilisateur trouvés:', myResults);

        // Récupérer les résultats des autres utilisateurs
        const { data: otherResults, error: otherResultsError } = await (supabase as any)
          .from('compatibility_results')
          .select('user_id, answers, preferences, score')
          .neq('user_id', session.user.id);

        if (otherResultsError) {
          console.error(
            'Erreur lors de la récupération des résultats des autres utilisateurs:',
            otherResultsError
          );
          throw otherResultsError;
        }

        console.log('Résultats des autres utilisateurs:', otherResults?.length || 0, 'trouvés');

        if (!otherResults || otherResults.length === 0) {
          console.log('Aucun autre utilisateur trouvé avec des résultats de compatibilité');
          setMatchScores([]);
          setLoading(false);
          return;
        }

        // Récupérer les profils des utilisateurs
        const userIds = (otherResults as any[]).map((result) => result.user_id);
        console.log('Récupération des profils pour les IDs utilisateur:', userIds);

        const { data: profiles, error: profilesError } = await (supabase as any)
          .from('profiles')
          .select(
            `
            id,
            full_name,
            gender,
            age,
            location,
            religious_level,
            education,
            profession,
            avatar_url,
            is_visible
          `
          )
          .in('id', userIds)
          .eq('is_visible', true);

        if (profilesError) {
          console.error('Erreur lors de la récupération des profils:', profilesError);
          throw profilesError;
        }

        console.log('Profils trouvés:', profiles?.length || 0);

        // Créer les correspondances avec les vraies données
        const matches: CompatibilityMatch[] = [];

        for (const result of otherResults as any[]) {
          const profile = (profiles as any[])?.find((p) => p.id === result.user_id);
          if (!profile) {
            console.log("Aucun profil trouvé pour l'utilisateur:", result.user_id);
            continue;
          }

          // Calculer le score de compatibilité réel
          const compatibilityScore = calculateCompatibility(
            (myResults as any).answers as Record<string, any>,
            result.answers as Record<string, any>
          );

          const match: CompatibilityMatch = {
            userId: result.user_id,
            score: compatibilityScore,
            profileData: {
              id: profile.id,
              full_name: profile.full_name || 'Utilisateur',
              gender: profile.gender || 'non-spécifié',
              age: profile.age || undefined,
              location: profile.location || undefined,
              religious_level: profile.religious_level || undefined,
              education: profile.education || undefined,
              avatar_url: profile.avatar_url || undefined,
            },
            matchDetails: {
              strengths: ['Compatibilité calculée à partir des vraies données'],
              challenges: [],
              compatibility: compatibilityScore,
            },
          } as any;

          matches.push(match);
        }

        // Filtrer les correspondances avec un score minimum et trier par score décroissant
        const filteredMatches = matches
          .filter((match) => (match.score ?? 0) >= 50)
          .sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

        console.log('Correspondances finales créées:', filteredMatches.length);
        setMatchScores(filteredMatches);
      } catch (error) {
        console.error('Erreur lors de la récupération des correspondances réelles:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les correspondances réelles',
          variant: 'destructive',
        });
        setMatchScores([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [toast]);

  return { matchScores, loading };
}
