import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    // Generate different suggestions based on type
    switch (type) {
      case 'bio':
        systemPrompt = `Tu es un expert en création de profils pour une application de rencontre musulmane. 
Ton rôle est de suggérer des bios authentiques, engageantes et respectueuses des valeurs islamiques.
La bio doit être sincère, positive et mettre en valeur la personnalité unique de la personne.`;

        userPrompt = `Génère 3 suggestions de bio (150-200 caractères chacune) pour un profil avec ces informations:
- Intérêts: ${data.interests?.join(', ') || 'Non spécifiés'}
- Profession: ${data.profession || 'Non spécifiée'}
- Éducation: ${data.education || 'Non spécifiée'}
- Ce que la personne recherche: ${data.lookingFor || 'Non spécifié'}

Chaque bio doit être unique, authentique et refléter la personnalité musulmane moderne.
Retourne uniquement un tableau JSON avec 3 strings, sans texte supplémentaire.`;
        break;

      case 'islamic_preferences':
        systemPrompt = `Tu es un conseiller spirituel musulman expert qui aide les personnes à définir leurs préférences islamiques de manière cohérente.
Tu comprends les nuances entre les différentes écoles de pensée et pratiques islamiques.`;

        userPrompt = `Analyse ces préférences islamiques et suggère des améliorations ou signale des incohérences:
- Secte: ${data.sect || 'Non spécifié'}
- Madhab: ${data.madhab || 'Non spécifié'}
- Fréquence de prière: ${data.prayerFrequency || 'Non spécifié'}
- Lecture du Coran: ${data.quranReading || 'Non spécifié'}
- Importance de la religion: ${data.importanceOfReligion || 'Non spécifié'}
- Halal strict: ${data.halalDiet ? 'Oui' : 'Non'}
- Préférence hijab: ${data.hijabPreference || 'Non spécifié'}
- Préférence barbe: ${data.beardPreference || 'Non spécifié'}

Retourne un objet JSON avec:
{
  "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "warnings": ["avertissement1"] (si incohérences)
}`;
        break;

      case 'field_tips':
        systemPrompt = `Tu es un coach en développement personnel spécialisé dans les profils de rencontre musulmans.
Tu donnes des conseils concis, pratiques et bienveillants.`;

        userPrompt = `Donne 3 conseils courts (40-60 caractères) pour améliorer ce champ "${data.fieldName}".
Valeur actuelle: "${data.currentValue || 'Vide'}"
Contexte: ${data.context || 'Profil de rencontre musulman'}

Retourne uniquement un tableau JSON avec 3 strings de conseils courts.`;
        break;

      case 'interests_suggestions':
        systemPrompt = `Tu es un expert en compatibilité et centres d'intérêt pour les célibataires musulmans.
Tu comprends la diversité des intérêts halal et modernes.`;

        userPrompt = `Suggère 5 centres d'intérêt pertinents basés sur ces informations:
- Intérêts actuels: ${data.currentInterests?.join(', ') || 'Aucun'}
- Profession: ${data.profession || 'Non spécifié'}
- Éducation: ${data.education || 'Non spécifié'}

Les intérêts doivent être halal, variés (spirituels, loisirs, culturels) et attractifs.
Retourne uniquement un tableau JSON avec 5 strings, sans texte supplémentaire.`;
        break;

      case 'profile_improvement':
        systemPrompt = `Tu es un expert en optimisation de profils pour une application de rencontre musulmane.
Tu analyses les profils de manière holistique et fournis des recommandations personnalisées et actionnables.`;

        userPrompt = `Analyse ce profil et fournis 3-5 recommandations concrètes pour améliorer les chances de match:

PROFIL:
- Nom: ${data.profileData?.full_name || 'Non défini'}
- Âge: ${data.profileData?.age || 'Non défini'}
- Localisation: ${data.profileData?.location || 'Non défini'}
- Profession: ${data.profileData?.profession || 'Non défini'}
- Éducation: ${data.profileData?.education || 'Non défini'}
- Bio: ${data.profileData?.bio ? `"${data.profileData.bio}"` : 'Vide'}
- Intérêts: ${data.profileData?.interests?.join(', ') || 'Aucun'}
- Photo: ${data.profileData?.avatar_url ? 'Oui' : 'Non'}

PRÉFÉRENCES ISLAMIQUES:
- Fréquence de prière: ${data.islamicPrefs?.prayer_frequency || 'Non défini'}
- Lecture du Coran: ${data.islamicPrefs?.quran_reading || 'Non défini'}
- Secte: ${data.islamicPrefs?.sect || 'Non défini'}
- Madhab: ${data.islamicPrefs?.madhab || 'Non défini'}
- Importance religion: ${data.islamicPrefs?.importance_of_religion || 'Non défini'}

STATISTIQUES:
- Score actuel: ${data.currentScore || 0}/100
- Sections manquantes: ${data.missingSections?.join(', ') || 'Aucune'}

Fournis des recommandations spécifiques, actionnables et personnalisées pour ce profil.
Concentre-toi sur les points faibles et les opportunités d'amélioration.
Retourne uniquement un tableau JSON avec 3-5 strings de recommandations, sans texte supplémentaire.`;
        break;

      default:
        throw new Error(`Unknown suggestion type: ${type}`);
    }

    console.log('🤖 Calling Lovable AI for suggestions...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.8, // More creative suggestions
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requêtes atteinte, veuillez réessayer plus tard.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({
            error: 'Crédits insuffisants, veuillez ajouter des crédits à votre workspace.',
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in AI response');
    }

    console.log('✅ AI suggestions generated successfully');

    // Parse the JSON response from the AI
    let suggestions;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      suggestions = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      // Fallback: try to extract array from the content
      const arrayMatch = content.match(/\[[\s\S]*\]/);
      if (arrayMatch) {
        suggestions = JSON.parse(arrayMatch[0]);
      } else {
        throw new Error('Failed to parse AI suggestions');
      }
    }

    return new Response(JSON.stringify({ suggestions }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-onboarding-suggestions:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: type === 'islamic_preferences' ? { suggestions: [], warnings: [] } : [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
