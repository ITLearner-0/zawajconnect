
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

        // Pour l'instant, créer des données de test pour afficher quelque chose
        const mockMatches: CompatibilityMatch[] = [
          {
            userId: "mock-user-1",
            score: 85,
            profileData: {
              id: "mock-user-1",
              first_name: "Amina",
              last_name: "K.",
              gender: "female",
              location: "Paris, France",
              birth_date: "1995-03-15", 
              religious_practice_level: "Pratiquant",
              education_level: "Master",
              email_verified: true,
              phone_verified: true,
              id_verified: false,
              is_visible: true
            },
            matchDetails: {
              strengths: ["Pratique religieuse", "Valeurs familiales"],
              differences: ["Localisation"],
              categoryScores: {
                religious: 90,
                lifestyle: 80,
                family: 85,
                personal: 82
              }
            }
          },
          {
            userId: "mock-user-2", 
            score: 78,
            profileData: {
              id: "mock-user-2",
              first_name: "Khadija",
              last_name: "M.",
              gender: "female",
              location: "Lyon, France",
              birth_date: "1992-07-22",
              religious_practice_level: "Très pratiquant",
              education_level: "Licence",
              email_verified: true,
              phone_verified: false,
              id_verified: true,
              is_visible: true
            },
            matchDetails: {
              strengths: ["Éducation", "Objectifs de vie"],
              differences: ["Niveau de pratique"],
              categoryScores: {
                religious: 75,
                lifestyle: 82,
                family: 80,
                personal: 75
              }
            }
          },
          {
            userId: "mock-user-3",
            score: 72,
            profileData: {
              id: "mock-user-3",
              first_name: "Fatima",
              last_name: "B.",
              gender: "female", 
              location: "Marseille, France",
              birth_date: "1994-11-08",
              religious_practice_level: "Modéré",
              education_level: "Doctorat",
              email_verified: true,
              phone_verified: true,
              id_verified: false,
              is_visible: true
            },
            matchDetails: {
              strengths: ["Ambition professionnelle", "Communication"],
              differences: ["Pratique religieuse"],
              categoryScores: {
                religious: 65,
                lifestyle: 78,
                family: 75,
                personal: 70
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
