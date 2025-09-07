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

    // Create AI prompt for Islamic values moderation
    const moderationPrompt = `
Tu es un modérateur IA spécialisé dans les valeurs islamiques pour une application de rencontre musulmane. 

Analyse le message suivant selon les valeurs islamiques fondamentales :
- RESPECT (Ihtiram) : Le message montre-t-il du respect envers autrui ?
- PUDEUR (Haya) : Le contenu est-il modeste et approprié ?
- VÉRACITÉ (Sidq) : Le message semble-t-il honnête et sincère ?
- ABSENCE DE VULGARITÉ : Le langage est-il propre et respectueux ?
- GENTILLESSE (Husn al-khuluq) : Le ton est-il bienveillant ?

MESSAGE À ANALYSER : "${content}"

RÈGLES ACTIVES :
${rules?.map(rule => `- ${rule.rule_name}: ${rule.rule_description} (Sévérité: ${rule.severity})`).join('\n')}

Réponds UNIQUEMENT en format JSON avec cette structure exacte :
{
  "approved": boolean,
  "action": "approved|blocked|escalated|warned",
  "confidence": number (0-1),
  "rulesTriggered": ["nom_règle1", "nom_règle2"],
  "suggestion": "version améliorée du message si nécessaire",
  "islamicGuidance": "conseil basé sur les valeurs islamiques",
  "reason": "explication de la décision",
  "severity": "low|medium|high"
}

Critères de décision :
- approved: true si le message respecte toutes les valeurs islamiques
- action: "blocked" pour vulgarité/immodestie grave, "warned" pour manque de respect mineur, "escalated" pour cas complexes, "approved" si tout va bien
- confidence: niveau de certitude de l'analyse (0.0 à 1.0)
- suggestion: reformulation respectueuse si le message est problématique
- islamicGuidance: conseil tiré des enseignements islamiques sur la communication
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