import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Input validation schema
const ApprovalRequestSchema = z.object({
  user_id: z.string().uuid(),
  match_user_id: z.string().uuid(),
  compatibility_score: z.number().min(0).max(100),
  islamic_score: z.number().min(0).max(100).optional(),
  cultural_score: z.number().min(0).max(100).optional(),
  personality_score: z.number().min(0).max(100).optional(),
  matching_reasons: z.array(z.string().max(500)).optional(),
  potential_concerns: z.array(z.string().max(500)).optional()
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Get user from auth header (JWT verified by Supabase)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Authentication requise' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication invalide' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    let validatedInput;
    try {
      const rawInput = await req.json();
      validatedInput = ApprovalRequestSchema.parse(rawInput);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return new Response(
        JSON.stringify({ error: 'Données invalides' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check recent approval requests (max 10 per hour)
    const { data: recentRequests, error: rateLimitError } = await supabase
      .from('family_notifications')
      .select('id')
      .eq('notification_type', 'approval_request')
      .gte('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

    if (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError);
      return new Response(
        JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (recentRequests && recentRequests.length >= 10) {
      console.warn(`Rate limit exceeded for approval requests`);
      return new Response(
        JSON.stringify({ error: 'Trop de demandes. Veuillez patienter une heure.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { 
      user_id, 
      match_user_id, 
      compatibility_score,
      islamic_score,
      cultural_score,
      personality_score,
      matching_reasons,
      potential_concerns 
    } = validatedInput;

    // Verify requesting user owns the profile
    if (user.id !== user_id) {
      return new Response(
        JSON.stringify({ error: 'Non autorisé' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Family approval request initiated');

    // Get user and match profiles
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: matchProfile, error: matchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', match_user_id)
      .single();

    if (userError || matchError) {
      console.error('Profile fetch error:', userError || matchError);
      return new Response(
        JSON.stringify({ error: 'Impossible de récupérer les profils' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get Islamic preferences for both users
    const { data: userIslamic } = await supabase
      .from('islamic_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: matchIslamic } = await supabase
      .from('islamic_preferences')
      .select('*')
      .eq('user_id', match_user_id)
      .single();

    // Get family members who should be notified
    const { data: familyMembers, error: familyError } = await supabase
      .from('family_members')
      .select('*')
      .eq('user_id', user_id)
      .eq('invitation_status', 'accepted')
      .eq('is_wali', true);

    if (familyError) {
      console.error('Error fetching family members:', familyError);
      return new Response(
        JSON.stringify({ error: 'Erreur système' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!familyMembers || familyMembers.length === 0) {
      console.log('No wali found for user');
      return new Response(
        JSON.stringify({ 
          error: 'no_family_members',
          message: 'Aucun membre de famille (wali) trouvé. Veuillez inviter un wali.',
        }), 
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI analysis if OpenAI key is available
    let aiAnalysis = null;
    if (openAIApiKey) {
      const prompt = `
Analyser ce match potentiel selon les valeurs islamiques et donner des conseils à la famille:

Profil de ${userProfile?.full_name}:
- Âge: ${userProfile?.age} ans
- Localisation: ${userProfile?.location}
- Profession: ${userProfile?.profession}
- Pratique religieuse: ${userIslamic?.prayer_frequency}
- Lecture du Coran: ${userIslamic?.quran_reading}
- Importance de la religion: ${userIslamic?.importance_of_religion}

Profil du match potentiel ${matchProfile?.full_name}:
- Âge: ${matchProfile?.age} ans
- Localisation: ${matchProfile?.location}  
- Profession: ${matchProfile?.profession}
- Pratique religieuse: ${matchIslamic?.prayer_frequency}
- Lecture du Coran: ${matchIslamic?.quran_reading}
- Importance de la religion: ${matchIslamic?.importance_of_religion}

Scores de compatibilité:
- Score islamique: ${islamic_score}%
- Score culturel: ${cultural_score}%
- Score personnalité: ${personality_score}%
- Score global: ${compatibility_score}%

Points forts: ${matching_reasons?.join(', ')}
Points d'attention: ${potential_concerns?.join(', ')}

Fournir une analyse respectueuse en français comprenant:
1. Évaluation de la compatibilité religieuse
2. Questions importantes à poser lors d'un entretien
3. Recommandations pour la famille
4. Aspects à surveiller pendant la période de connaissance
`;

      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${openAIApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { 
                role: 'system', 
                content: 'Tu es un conseiller islamique spécialisé dans le mariage halal. Réponds de manière respectueuse, en tenant compte des valeurs islamiques et de l\'importance du rôle de la famille dans le choix du conjoint.' 
              },
              { role: 'user', content: prompt }
            ],
            max_tokens: 800,
            temperature: 0.7
          }),
        });

        if (response.ok) {
          const data = await response.json();
          aiAnalysis = data.choices[0].message.content;
        } else {
          console.error('OpenAI API error:', response.status);
        }
      } catch (error) {
        console.error('OpenAI request failed:', error);
      }
    }

    // Create match record if it doesn't exist
    let { data: matchRecord } = await supabase
      .from('matches')
      .select('id')
      .or(`and(user1_id.eq.${user_id},user2_id.eq.${match_user_id}),and(user1_id.eq.${match_user_id},user2_id.eq.${user_id})`)
      .single();

    if (!matchRecord) {
      const { data: newMatch, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: user_id,
          user2_id: match_user_id,
          match_score: compatibility_score,
          family_supervision_required: true,
          can_communicate: false
        })
        .select('id')
        .single();

      if (matchError) {
        console.error('Match creation failed:', matchError);
        return new Response(
          JSON.stringify({ error: 'Impossible de créer le match' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      matchRecord = newMatch;
    }

    // Send notifications to family members
    const notifications = [];
    for (const familyMember of familyMembers) {
      const notificationContent = `
${userProfile?.full_name} demande l'approbation familiale pour un match potentiel avec ${matchProfile?.full_name}.

Compatibilité: ${compatibility_score}% (Islamique: ${islamic_score}%, Culturel: ${cultural_score}%, Personnalité: ${personality_score}%)

${aiAnalysis ? `Analyse IA:\n${aiAnalysis}` : ''}
`;

      const { data: notification, error: notifError } = await supabase
        .from('family_notifications')
        .insert({
          family_member_id: familyMember.id,
          match_id: matchRecord.id,
          notification_type: 'approval_request',
          content: notificationContent,
          severity: 'high',
          action_required: true
        })
        .select()
        .single();

      if (notifError) {
        console.error('Notification creation failed:', notifError);
      } else {
        notifications.push(notification);
      }
    }

    console.log('Approval request processed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        notifications_sent: notifications.length,
        ai_analysis_included: !!aiAnalysis,
        match_id: matchRecord.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in family-approval-request:', error);
    return new Response(
      JSON.stringify({ error: 'Une erreur est survenue. Veuillez réessayer.' }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});