import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TutorialRequest {
  profile?: {
    full_name?: string;
    age?: number;
    bio?: string;
    location?: string;
    profession?: string;
    education?: string;
    interests?: string[];
    avatar_url?: string;
  };
  islamicPrefs?: {
    prayer_frequency?: string;
    quran_reading?: string;
    sect?: string;
    madhab?: string;
  };
  completionStats: {
    overall: number;
    basicInfo: number;
    islamicPrefs: number;
    photos: number;
    compatibility: number;
    privacy: number;
    verification: number;
  };
}

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  targetTab: string;
  targetElement?: string;
  objective: string;
  tips: string[];
  estimatedTime: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, islamicPrefs, completionStats }: TutorialRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Construire le contexte pour l'IA
    const contextPrompt = `Analyse ce profil et génère un tutoriel personnalisé :

**Informations de base :**
- Nom : ${profile?.full_name || 'Non défini'}
- Âge : ${profile?.age || 'Non défini'}
- Localisation : ${profile?.location || 'Non définie'}
- Profession : ${profile?.profession || 'Non définie'}
- Éducation : ${profile?.education || 'Non définie'}
- Bio : ${profile?.bio ? `"${profile.bio}"` : 'Aucune biographie'}
- Photo : ${profile?.avatar_url ? 'Présente' : 'Absente'}
- Centres d'intérêt : ${profile?.interests?.length ? profile.interests.join(', ') : 'Aucun'}

**Préférences islamiques :**
- Prière : ${islamicPrefs?.prayer_frequency || 'Non définie'}
- Lecture Coran : ${islamicPrefs?.quran_reading || 'Non définie'}
- Courant : ${islamicPrefs?.sect || 'Non défini'}
- Madhab : ${islamicPrefs?.madhab || 'Non défini'}

**Scores de complétion :**
- Global : ${completionStats.overall}%
- Informations de base : ${completionStats.basicInfo}%
- Préférences islamiques : ${completionStats.islamicPrefs}%
- Photos : ${completionStats.photos}%
- Compatibilité : ${completionStats.compatibility}%
- Confidentialité : ${completionStats.privacy}%
- Vérification : ${completionStats.verification}%

Génère 3-7 étapes de tutoriel personnalisées et ordonnées par priorité pour améliorer ce profil.
Chaque étape doit être actionnable et spécifique aux données manquantes ou incomplètes.`;

    const systemPrompt = `Tu es un expert en création de tutoriels interactifs pour l'optimisation de profils sur une plateforme de rencontres musulmanes.

Ton rôle est de générer un parcours d'amélioration personnalisé en 3 à 7 étapes maximum, ordonnées par priorité.

Règles importantes :
- Chaque étape doit cibler un aspect spécifique à améliorer
- Donne des objectifs clairs et mesurables
- Fournis 2-4 conseils pratiques par étape
- Estime le temps nécessaire de manière réaliste
- Priorise selon l'impact sur le profil (high/medium/low)
- Utilise le bon targetTab : 'wizard', 'photos', 'islamic', 'compatibility', 'privacy'
- Adapte le ton : encourageant, bienveillant et professionnel
- Respecte les valeurs islamiques dans tes recommandations`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_tutorial",
              description: "Génère un tutoriel personnalisé d'amélioration de profil",
              parameters: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        id: {
                          type: "string",
                          description: "Identifiant unique de l'étape (ex: 'step-1')"
                        },
                        title: {
                          type: "string",
                          description: "Titre court et accrocheur de l'étape"
                        },
                        description: {
                          type: "string",
                          description: "Description détaillée de ce qu'il faut faire"
                        },
                        targetTab: {
                          type: "string",
                          enum: ["wizard", "photos", "islamic", "compatibility", "privacy"],
                          description: "L'onglet où cette action doit être effectuée"
                        },
                        objective: {
                          type: "string",
                          description: "L'objectif spécifique à atteindre"
                        },
                        tips: {
                          type: "array",
                          items: { type: "string" },
                          description: "2-4 conseils pratiques pour réussir cette étape"
                        },
                        estimatedTime: {
                          type: "string",
                          description: "Temps estimé (ex: '5 min', '10 min')"
                        },
                        priority: {
                          type: "string",
                          enum: ["high", "medium", "low"],
                          description: "Niveau de priorité de cette étape"
                        }
                      },
                      required: ["id", "title", "description", "targetTab", "objective", "tips", "estimatedTime", "priority"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["steps"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_tutorial" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Limite de requêtes dépassée." }), 
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits AI épuisés." }), 
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log("AI Response:", JSON.stringify(data, null, 2));

    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const tutorial = JSON.parse(toolCall.function.arguments);

    // Ajouter completed: false à chaque étape
    const stepsWithCompletion = tutorial.steps.map((step: TutorialStep) => ({
      ...step,
      completed: false
    }));

    return new Response(
      JSON.stringify({ steps: stepsWithCompletion }), 
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Error in generate-tutorial function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Une erreur est survenue"
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
