import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ModerationResult {
  approved: boolean;
  action: 'approved' | 'blocked' | 'escalated';
  confidence: number;
  rulesTriggered: string[];
  reason: string;
  suggestion?: string;
  islamicGuidance?: string;
  severity?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, userId, matchId } = await req.json();

    if (!content || !userId) {
      return new Response(
        JSON.stringify({ error: 'Content and userId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Moderating content for user ${userId}: "${content}"`);

    // Prepare moderation prompt
    const moderationPrompt = `
Analyse ce message selon les principes islamiques stricts pour une application de rencontre musulmane:

Message: "${content}"

Règles de modération islamique:
1. "partage_informations_personnelles" - Interdiction de partager numéros de téléphone, adresses, réseaux sociaux
2. "demande_rencontre_privee" - Interdiction de proposer des rencontres sans supervision familiale
3. "contraire à la pudeur" - Tout contenu sexuel, romantique explicite ou immodeste
4. "vulgarité et grossièreté" - Langage inapproprié, insultant ou vulgaire
5. "pression et harcèlement" - Insistance excessive ou comportement inapproprié

Réponds UNIQUEMENT en JSON valide avec cette structure exacte:
{
  "approved": boolean,
  "action": "approved" | "blocked" | "escalated",
  "confidence": number (0.0-1.0),
  "rulesTriggered": ["règle1", "règle2"],
  "reason": "explication claire",
  "suggestion": "message amélioré respectueux (optionnel si bloqué)",
  "islamicGuidance": "conseil islamique approprié",
  "severity": "low" | "medium" | "high" | "critical"
}

Sois strict sur la pudeur (haya) et la supervision familiale selon la Sharia.`;

    // Call OpenAI API
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'Tu es un expert en modération basée sur les valeurs islamiques. Réponds toujours en JSON valide uniquement.' 
          },
          { role: 'user', content: moderationPrompt }
        ],
        max_completion_tokens: 500,
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

    // Parse AI response with improved error handling
    let moderationResult: ModerationResult;
    try {
      // Clean the AI response to ensure it's pure JSON
      let cleanedAnalysis = aiAnalysis.trim();
      
      // Remove any markdown code blocks if present
      if (cleanedAnalysis.startsWith('```json')) {
        cleanedAnalysis = cleanedAnalysis.replace(/```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleanedAnalysis.startsWith('```')) {
        cleanedAnalysis = cleanedAnalysis.replace(/```\n?/, '').replace(/\n?```$/, '');
      }
      
      // Try to extract JSON from the response if it contains extra text
      const jsonMatch = cleanedAnalysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanedAnalysis = jsonMatch[0];
      }
      
      console.log('Cleaned AI response:', cleanedAnalysis);
      moderationResult = JSON.parse(cleanedAnalysis);
      
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      console.error('Original AI response:', aiAnalysis);
      
      // More intelligent fallback based on content analysis
      const hasInappropriateContent = content.toLowerCase().includes('telephone') || 
                                      content.toLowerCase().includes('whatsapp') || 
                                      content.toLowerCase().includes('rencontre') ||
                                      content.toLowerCase().includes('seul');
      
      moderationResult = {
        approved: !hasInappropriateContent,
        action: hasInappropriateContent ? 'blocked' : 'approved',
        confidence: 0.7,
        rulesTriggered: hasInappropriateContent ? ['parsing_fallback'] : [],
        reason: hasInappropriateContent ? 'Contenu potentiellement inapproprié détecté par analyse de secours' : 'Analyse de secours - contenu approuvé',
        islamicGuidance: 'En cas de problème technique, nous analysons le contenu selon les principes de base.',
        severity: hasInappropriateContent ? 'high' : 'low'
      };
    }

    // Ensure required fields exist
    if (typeof moderationResult.approved !== 'boolean') {
      moderationResult.approved = false;
    }
    if (!moderationResult.action) {
      moderationResult.action = 'escalated';
    }
    if (typeof moderationResult.confidence !== 'number') {
      moderationResult.confidence = 0.5;
    }
    if (!Array.isArray(moderationResult.rulesTriggered)) {
      moderationResult.rulesTriggered = ['unknown'];
    }

    // Save message suggestion if content was improved
    if (moderationResult.suggestion && moderationResult.approved === false) {
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

    // Sauvegarder le log de modération pour déclencher les notifications familiales si nécessaire
    try {
      const { error: logError } = await supabase
        .from('moderation_logs')
        .insert({
          user_id: userId,
          match_id: matchId, // Nécessaire pour les notifications familiales
          content_analyzed: content,
          ai_analysis: moderationResult,
          rules_triggered: moderationResult.rulesTriggered,
          action_taken: moderationResult.action,
          confidence_score: moderationResult.confidence,
          human_reviewed: false
        });

      if (logError) {
        console.error('Error logging moderation decision:', logError);
      } else {
        console.log('Moderation log saved successfully');
      }
    } catch (error) {
      console.error('Error logging moderation decision:', error);
    }

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