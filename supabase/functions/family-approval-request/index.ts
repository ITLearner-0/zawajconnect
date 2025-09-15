import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { 
      user_id, 
      match_user_id, 
      compatibility_score,
      islamic_score,
      cultural_score,
      personality_score,
      matching_reasons,
      potential_concerns 
    } = await req.json();

    console.log('Family approval request for:', { user_id, match_user_id });

    // Get user and match profiles
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single();

    const { data: matchProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', match_user_id)
      .single();

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

    console.log('Family members found:', familyMembers?.length || 0);

    if (familyError) {
      console.error('Error fetching family members:', familyError);
      return new Response(
        JSON.stringify({ error: 'Erreur lors de la récupération des membres de famille' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!familyMembers || familyMembers.length === 0) {
      console.log('No family members found for user:', user_id);
      return new Response(
        JSON.stringify({ 
          error: 'no_family_members',
          message: 'Aucun membre de famille (wali) trouvé pour l\'approbation. Veuillez d\'abord inviter et faire accepter un wali dans vos paramètres famille.',
          user_id: user_id
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
        }
      } catch (error) {
        console.error('OpenAI error:', error);
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
        console.error('Error creating match:', matchError);
        throw matchError;
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
        console.error('Error creating notification:', notifError);
      } else {
        notifications.push(notification);
      }
    }

    // Send email notification if email service is available
    try {
      const resendApiKey = Deno.env.get('RESEND_API_KEY');
      if (resendApiKey && familyMembers[0]?.email) {
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'notifications@lovable.app',
            to: [familyMembers[0].email],
            subject: `Demande d'approbation familiale - ${userProfile?.full_name}`,
            html: `
              <h2>Demande d'approbation familiale</h2>
              <p><strong>${userProfile?.full_name}</strong> demande votre approbation pour un match potentiel.</p>
              
              <h3>Profil du match: ${matchProfile?.full_name}</h3>
              <ul>
                <li>Âge: ${matchProfile?.age} ans</li>
                <li>Localisation: ${matchProfile?.location}</li>
                <li>Profession: ${matchProfile?.profession}</li>
              </ul>
              
              <h3>Scores de compatibilité</h3>
              <ul>
                <li>Score global: ${compatibility_score}%</li>
                <li>Compatibilité islamique: ${islamic_score}%</li>
                <li>Compatibilité culturelle: ${cultural_score}%</li>
              </ul>
              
              ${aiAnalysis ? `<h3>Analyse et recommandations</h3><p>${aiAnalysis.replace(/\n/g, '<br>')}</p>` : ''}
              
              <p>Connectez-vous à l'application pour examiner cette demande et donner votre avis.</p>
            `
          }),
        });

        if (!emailResponse.ok) {
          console.error('Email sending failed:', await emailResponse.text());
        }
      }
    } catch (emailError) {
      console.error('Email error:', emailError);
    }

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
      JSON.stringify({ error: error.message }), 
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});