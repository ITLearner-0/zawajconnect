import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationRequest {
  content: string;
  userId: string;
  context?: string;
}

interface ModerationResult {
  approved: boolean;
  action: 'approved' | 'blocked' | 'escalated' | 'warned';
  confidence: number;
  rulesTriggered: string[];
  suggestion?: string;
  islamicGuidance?: string;
  reason: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { content, userId, context = 'message' }: ModerationRequest = await req.json();

    console.log(`Moderating content for user ${userId}: "${content}"`);

    // Get active moderation rules
    const { data: rules, error: rulesError } = await supabase
      .from('islamic_moderation_rules')
      .select('*')
      .eq('is_active', true);

    if (rulesError) {
      console.error('Error fetching moderation rules:', rulesError);
      throw rulesError;
    }

    // Create AI prompt for Islamic values moderation with strict supervision rules
    const moderationPrompt = `
Tu es un modérateur IA ULTRA-STRICT spécialisé dans les valeurs islamiques pour une application de rencontre musulmane respectant INTÉGRALEMENT la Sharia.

RÈGLES ABSOLUES - AUCUNE EXCEPTION :
1. INTERDICTION TOTALE de partager des informations de contact (numéro de téléphone, email, adresse, réseaux sociaux, Snapchat, Instagram, WhatsApp, Telegram, etc.)
2. INTERDICTION de proposer des rencontres privées sans supervision familiale (café, restaurant, promenade, cinéma, etc.)
3. INTERDICTION de tout langage contraire à la pudeur islamique (Haya)
4. SUPERVISION FAMILIALE OBLIGATOIRE pour tous les échanges entre personnes non-mariées de sexes opposés

MESSAGE À ANALYSER : "${content}"

DÉTECTION STRICTE - Si le message contient :
- Des numéros (même partiels) : 06, 07, +33, etc. → BLOCKED IMMÉDIATEMENT
- Des mots comme "numéro", "téléphone", "appeler", "SMS" → BLOCKED
- Des emails ou mentions d'email → BLOCKED  
- Des propositions de rendez-vous → BLOCKED
- Des références à des apps de messagerie → BLOCKED

RÈGLES SYSTÈME :
${rules?.map(rule => `- ${rule.rule_name}: ${rule.rule_description} (Sévérité: ${rule.severity})`).join('\n')}

RÉPONSE JSON STRICTE :
{
  "approved": boolean (false si MOINDRE violation),
  "action": "blocked|warned|escalated|approved",
  "confidence": number (0.9+ pour détections claires),
  "rulesTriggered": ["partage_informations_personnelles", "contraire à la pudeur", etc.],
  "suggestion": "reformulation islamiquement appropriée",
  "islamicGuidance": "rappel des principes islamiques sur la pudeur et la supervision",
  "reason": "explication détaillée de la violation",
  "severity": "critical|high|medium|low"
}

IMPORTANT: En cas de doute, TOUJOURS privilégier le blocage pour respecter la pudeur islamique. Mieux vaut être trop strict que pas assez.
`;

    // Call OpenAI API for content moderation
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en modération basée sur les valeurs islamiques. Réponds toujours en JSON valide uniquement.' 
          },
          { role: 'user', content: moderationPrompt }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const aiAnalysis = aiResponse.choices[0].message.content;
    
    console.log('AI Analysis raw:', aiAnalysis);

    // Parse AI response
    let moderationResult: ModerationResult;
    try {
      moderationResult = JSON.parse(aiAnalysis);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback to safe moderation
      moderationResult = {
        approved: false,
        action: 'escalated',
        confidence: 0.5,
        rulesTriggered: ['parsing_error'],
        reason: 'Erreur d\'analyse IA - escaladé par sécurité',
        suggestion: content,
        islamicGuidance: 'En cas de doute, privilégions toujours la prudence et le respect mutuel.'
      };
    }

    // Log moderation decision
    const { error: logError } = await supabase
      .from('moderation_logs')
      .insert({
        user_id: userId,
        content_analyzed: content,
        ai_analysis: {
          raw_response: aiAnalysis,
          model: 'gpt-4.1-2025-04-14',
          rules_applied: rules?.map(r => r.rule_name) || []
        },
        rules_triggered: moderationResult.rulesTriggered,
        action_taken: moderationResult.action,
        confidence_score: moderationResult.confidence,
      });

    if (logError) {
      console.error('Error logging moderation decision:', logError);
    }

    // Create suggestion if content needs improvement
    if (!moderationResult.approved && moderationResult.suggestion && moderationResult.suggestion !== content) {
      const { error: suggestionError } = await supabase
        .from('message_suggestions')
        .insert({
          user_id: userId,
          original_message: content,
          suggested_message: moderationResult.suggestion,
          improvement_reason: moderationResult.reason,
          islamic_guidance: moderationResult.islamicGuidance
        });

      if (suggestionError) {
        console.error('Error saving suggestion:', suggestionError);
      }
    }

    console.log('Moderation result:', moderationResult);

    return new Response(JSON.stringify(moderationResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in moderate-content function:', error);
    
    // Return safe fallback response
    const fallbackResult: ModerationResult = {
      approved: false,
      action: 'escalated',
      confidence: 0.0,
      rulesTriggered: ['system_error'],
      reason: 'Erreur système - contenu escaladé par sécurité',
      suggestion: undefined,
      islamicGuidance: 'En cas de problème technique, nous privilégions la sécurité et la prudence.'
    };

    return new Response(JSON.stringify(fallbackResult), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});