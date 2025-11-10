import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleError, handleAIError, successResponse, ErrorCode } from '../_shared/errorHandler.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProfileAnalysisRequest {
  profile: {
    full_name?: string;
    age?: number;
    bio?: string;
    location?: string;
    education?: string;
    profession?: string;
    interests?: string[];
    avatar_url?: string;
  };
  islamicPrefs?: {
    prayer_frequency?: string;
    quran_reading?: string;
    sect?: string;
    madhab?: string;
    importance_of_religion?: string;
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

interface Suggestion {
  type: 'urgent' | 'important' | 'optional';
  category: string;
  title: string;
  description: string;
  action: string;
  impact: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, islamicPrefs, completionStats }: ProfileAnalysisRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('[ANALYZE_PROFILE] LOVABLE_API_KEY not configured');
      return handleError(new Error('API key missing'), ErrorCode.INTERNAL_ERROR, 'ANALYZE_PROFILE');
    }

    // Construire le prompt d'analyse
    const systemPrompt = `Tu es un expert en optimisation de profils pour une plateforme de rencontres musulmanes.
Ton rôle est d'analyser le profil d'un utilisateur et de proposer 3-5 suggestions personnalisées et actionnables pour améliorer son profil.

Règles importantes :
- Sois spécifique et contextuel aux données du profil
- Priorise les suggestions selon leur impact potentiel
- Utilise un ton encourageant et bienveillant
- Concentre-toi sur les éléments manquants ou incomplets
- Adapte tes suggestions au contexte musulman (halal, respect des valeurs islamiques)`;

    const userPrompt = `Analyse ce profil et propose des améliorations :

**Informations de base :**
- Nom : ${profile.full_name || 'Non défini'}
- Âge : ${profile.age || 'Non défini'}
- Localisation : ${profile.location || 'Non définie'}
- Profession : ${profile.profession || 'Non définie'}
- Éducation : ${profile.education || 'Non définie'}
- Bio : ${profile.bio || 'Aucune biographie'}
- Photo de profil : ${profile.avatar_url ? 'Présente' : 'Absente'}
- Centres d'intérêt : ${profile.interests?.length ? profile.interests.join(', ') : 'Aucun'}

**Préférences islamiques :**
- Fréquence de prière : ${islamicPrefs?.prayer_frequency || 'Non définie'}
- Lecture du Coran : ${islamicPrefs?.quran_reading || 'Non définie'}
- Courant : ${islamicPrefs?.sect || 'Non défini'}
- Madhab : ${islamicPrefs?.madhab || 'Non défini'}
- Importance de la religion : ${islamicPrefs?.importance_of_religion || 'Non définie'}

**Scores de complétion :**
- Global : ${completionStats.overall}%
- Informations de base : ${completionStats.basicInfo}%
- Préférences islamiques : ${completionStats.islamicPrefs}%
- Photos : ${completionStats.photos}%
- Compatibilité : ${completionStats.compatibility}%
- Confidentialité : ${completionStats.privacy}%
- Vérification : ${completionStats.verification}%

Propose 3-5 suggestions d'amélioration personnalisées.`;

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
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "provide_suggestions",
              description: "Retourne des suggestions d'amélioration du profil",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["urgent", "important", "optional"],
                          description: "Niveau de priorité de la suggestion"
                        },
                        category: {
                          type: "string",
                          description: "Catégorie (photos, bio, préférences, etc.)"
                        },
                        title: {
                          type: "string",
                          description: "Titre court et accrocheur"
                        },
                        description: {
                          type: "string",
                          description: "Explication détaillée du pourquoi"
                        },
                        action: {
                          type: "string",
                          description: "Action concrète à effectuer"
                        },
                        impact: {
                          type: "string",
                          description: "Impact attendu sur le profil"
                        }
                      },
                      required: ["type", "category", "title", "description", "action", "impact"],
                      additionalProperties: false
                    }
                  }
                },
                required: ["suggestions"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "provide_suggestions" } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return handleAIError(response.status, errorText, 'ANALYZE_PROFILE');
    }

    const data = await response.json();

    // Extraire les suggestions depuis l'appel de fonction
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error('[ANALYZE_PROFILE] No tool call in AI response:', data);
      return handleError(new Error('Invalid AI response'), ErrorCode.AI_GATEWAY_ERROR, 'ANALYZE_PROFILE');
    }

    const suggestions = JSON.parse(toolCall.function.arguments);

    return successResponse(suggestions);

  } catch (error) {
    return handleError(error, ErrorCode.INTERNAL_ERROR, 'ANALYZE_PROFILE');
  }
});
