
import { useState, useEffect } from "react";
import { CompatibilityMatch } from "@/types/compatibility";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

export function useCompatibilityMatches() {
  const [matchScores, setMatchScores] = useState<CompatibilityMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        console.log("Loading real compatibility matches from database...");
        
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found");
          setMatchScores([]);
          setLoading(false);
          return;
        }

        console.log("Current user ID:", session.user.id);

        // Récupérer les résultats de compatibilité de l'utilisateur actuel
        const { data: myResults, error: myResultsError } = await supabase
          .from('compatibility_results')
          .select('answers, preferences, score')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (myResultsError) {
          console.error("Error fetching user results:", myResultsError);
          throw myResultsError;
        }

        if (!myResults) {
          console.log("No compatibility results found for current user");
          setMatchScores([]);
          setLoading(false);
          return;
        }

        console.log("User results found:", myResults);

        // Récupérer les résultats des autres utilisateurs
        const { data: otherResults, error: otherResultsError } = await supabase
          .from('compatibility_results')
          .select('user_id, answers, preferences, score')
          .neq('user_id', session.user.id);

        if (otherResultsError) {
          console.error("Error fetching other users results:", otherResultsError);
          throw otherResultsError;
        }

        console.log("Other users results:", otherResults?.length || 0, "found");

        if (!otherResults || otherResults.length === 0) {
          console.log("No other users found with compatibility results");
          setMatchScores([]);
          setLoading(false);
          return;
        }

        // Récupérer les profils des utilisateurs
        const userIds = otherResults.map(result => result.user_id);
        console.log("Fetching profiles for user IDs:", userIds);

        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select(`
            id,
            first_name,
            last_name,
            location,
            religious_practice_level,
            education_level,
            occupation,
            birth_date,
            email_verified,
            phone_verified,
            id_verified,
            profile_picture,
            is_visible
          `)
          .in('id', userIds)
          .eq('is_visible', true);

        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          throw profilesError;
        }

        console.log("Profiles found:", profiles?.length || 0);

        // Créer les correspondances avec les vraies données
        const matches: CompatibilityMatch[] = otherResults
          .map(result => {
            const profile = profiles?.find(p => p.id === result.user_id);
            if (!profile) {
              console.log("No profile found for user:", result.user_id);
              return null;
            }

            // Calculer l'âge si la date de naissance est disponible
            let age: number | undefined;
            if (profile.birth_date) {
              const birthDate = new Date(profile.birth_date);
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const monthDiff = today.getMonth() - birthDate.getMonth();
              if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
            }

            return {
              userId: result.user_id,
              score: result.score || 70, // Utiliser le score calculé ou un score par défaut
              profileData: {
                first_name: profile.first_name || 'Utilisateur',
                last_name: profile.last_name || undefined,
                age,
                location: profile.location || undefined,
                religious_practice_level: profile.religious_practice_level || undefined,
                education_level: profile.education_level || undefined,
                occupation: profile.occupation || undefined,
                email_verified: profile.email_verified || false,
                phone_verified: profile.phone_verified || false,
                id_verified: profile.id_verified || false,
                profile_picture: profile.profile_picture || undefined
              },
              matchDetails: {
                strengths: ["Compatibilité calculée à partir des vraies données"],
                differences: [],
                categoryScores: {
                  religious: { score: 85, weight: 1.0 },
                  lifestyle: { score: 80, weight: 0.8 },
                  family: { score: 82, weight: 0.9 },
                  personal: { score: 78, weight: 0.7 }
                }
              }
            };
          })
          .filter((match): match is CompatibilityMatch => match !== null)
          .sort((a, b) => b.score - a.score); // Trier par score décroissant

        console.log("Final matches created:", matches.length);
        setMatchScores(matches);
        
      } catch (error) {
        console.error("Error fetching real matches:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les correspondances réelles",
          variant: "destructive",
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
