import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { handleError, handleAIError, ErrorCode } from '../_shared/errorHandler.ts';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatRequest {
  messages: Message[];
  profileContext?: {
    profile?: {
      full_name?: string;
      age?: number;
      bio?: string;
      location?: string;
      profession?: string;
      education?: string;
      interests?: string[];
    };
    completionStats?: {
      overall: number;
      basicInfo: number;
      islamicPrefs: number;
      photos: number;
      compatibility: number;
    };
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, profileContext }: ChatRequest = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('[PROFILE_CHAT] LOVABLE_API_KEY not configured');
      return handleError(new Error('API key missing'), ErrorCode.INTERNAL_ERROR, 'PROFILE_CHAT');
    }

    // Construire le contexte du profil
    let contextMessage = "Contexte du profil utilisateur :\n";
    
    if (profileContext?.profile) {
      const p = profileContext.profile;
      contextMessage += `- Nom : ${p.full_name || 'Non défini'}\n`;
      contextMessage += `- Âge : ${p.age || 'Non défini'}\n`;
      contextMessage += `- Localisation : ${p.location || 'Non définie'}\n`;
      contextMessage += `- Profession : ${p.profession || 'Non définie'}\n`;
      contextMessage += `- Éducation : ${p.education || 'Non définie'}\n`;
      contextMessage += `- Bio : ${p.bio ? `"${p.bio}"` : 'Aucune'}\n`;
      contextMessage += `- Centres d'intérêt : ${p.interests?.length ? p.interests.join(', ') : 'Aucun'}\n`;
    }

    if (profileContext?.completionStats) {
      const stats = profileContext.completionStats;
      contextMessage += `\nScores de complétion :\n`;
      contextMessage += `- Global : ${stats.overall}%\n`;
      contextMessage += `- Informations de base : ${stats.basicInfo}%\n`;
      contextMessage += `- Préférences islamiques : ${stats.islamicPrefs}%\n`;
      contextMessage += `- Photos : ${stats.photos}%\n`;
      contextMessage += `- Compatibilité : ${stats.compatibility}%\n`;
    }

    const systemPrompt = `Tu es un assistant expert en optimisation de profils pour une plateforme de rencontres musulmanes halal.

${contextMessage}

Ton rôle :
- Répondre aux questions sur l'amélioration du profil
- Donner des conseils personnalisés basés sur les données du profil
- Être encourageant et bienveillant
- Respecter les valeurs islamiques
- Proposer des actions concrètes et mesurables
- Expliquer l'impact de chaque suggestion

Style de communication :
- Utilise un ton amical et professionnel
- Sois concis mais précis
- Donne des exemples concrets
- Pose des questions pour mieux comprendre les besoins

Important : Reste concentré sur l'optimisation du profil et ne donne pas de conseils religieux profonds.`;

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
          ...messages
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return handleAIError(response.status, errorText, 'PROFILE_CHAT');
    }

    // Retourner le stream directement
    return new Response(response.body, {
      headers: { 
        ...corsHeaders, 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      },
    });

  } catch (error) {
    return handleError(error, ErrorCode.INTERNAL_ERROR, 'PROFILE_CHAT');
  }
});
