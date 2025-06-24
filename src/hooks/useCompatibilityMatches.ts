
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
        console.log("Loading compatibility matches...");
        
        // Vérifier si l'utilisateur est connecté
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.log("No session found");
          setLoading(false);
          return;
        }

        // Créer des données de test
        const mockMatches: CompatibilityMatch[] = [
          {
            userId: "mock-user-1",
            score: 85,
            profileData: {
              first_name: "Amina",
              last_name: "K.",
              location: "Paris, France",
              religious_practice_level: "Pratiquant",
              education_level: "Master",
              email_verified: true,
              phone_verified: true,
              id_verified: false
            },
            matchDetails: {
              strengths: ["Pratique religieuse", "Valeurs familiales"],
              differences: ["Localisation"],
              categoryScores: {
                religious: { score: 90, weight: 1.0 },
                lifestyle: { score: 80, weight: 0.8 },
                family: { score: 85, weight: 0.9 },
                personal: { score: 82, weight: 0.7 }
              }
            }
          },
          {
            userId: "mock-user-2", 
            score: 78,
            profileData: {
              first_name: "Khadija",
              last_name: "M.",
              location: "Lyon, France",
              religious_practice_level: "Très pratiquant",
              education_level: "Licence",
              email_verified: true,
              phone_verified: false,
              id_verified: true
            },
            matchDetails: {
              strengths: ["Éducation", "Objectifs de vie"],
              differences: ["Niveau de pratique"],
              categoryScores: {
                religious: { score: 75, weight: 1.0 },
                lifestyle: { score: 82, weight: 0.8 },
                family: { score: 80, weight: 0.9 },
                personal: { score: 75, weight: 0.7 }
              }
            }
          },
          {
            userId: "mock-user-3",
            score: 72,
            profileData: {
              first_name: "Fatima",
              last_name: "B.",
              location: "Marseille, France",
              religious_practice_level: "Modéré",
              education_level: "Doctorat",
              email_verified: true,
              phone_verified: true,
              id_verified: false
            },
            matchDetails: {
              strengths: ["Ambition professionnelle", "Communication"],
              differences: ["Pratique religieuse"],
              categoryScores: {
                religious: { score: 65, weight: 1.0 },
                lifestyle: { score: 78, weight: 0.8 },
                family: { score: 75, weight: 0.9 },
                personal: { score: 70, weight: 0.7 }
              }
            }
          }
        ];

        console.log("Mock matches created:", mockMatches.length);
        setMatchScores(mockMatches);
        
      } catch (error) {
        console.error("Error fetching matches:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les correspondances",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [toast]);

  return { matchScores, loading };
}
