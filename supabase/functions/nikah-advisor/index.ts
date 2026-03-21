import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AdvisorRequest {
  message: string;
  context_type: 'general' | 'profile_review' | 'compatibility' | 'preparation';
  session_id?: string;
  user_profile?: {
    age?: number;
    gender?: string;
    location?: string;
    religious_level?: string;
  };
}

const SYSTEM_PROMPTS: Record<string, string> = {
  general: `Tu es un conseiller matrimonial islamique bienveillant et savant. Tu donnes des conseils basés sur le Coran, la Sunna et la sagesse des savants. Tu t'exprimes en français. Tu es encourageant mais honnête. Tu ne donnes jamais de fatwa mais tu orientes vers les savants compétents pour les questions juridiques complexes. Tu rappelles toujours l'importance de la consultation familiale et du Wali.`,
  profile_review: `Tu es un conseiller qui aide les utilisateurs à améliorer leur profil de recherche matrimoniale. Tu donnes des conseils pratiques pour mieux se présenter tout en restant dans le cadre islamique. Sois constructif et bienveillant. Parle en français.`,
  compatibility: `Tu es un spécialiste de la compatibilité conjugale en Islam. Tu aides les utilisateurs à évaluer si une personne est compatible avec eux en se basant sur les critères islamiques : religion, caractère, famille, projets de vie. Parle en français.`,
  preparation: `Tu es un guide pour la préparation au mariage islamique. Tu couvres les aspects pratiques (mahr, contrat, walima), spirituels (istikhara, niyya), et relationnels (communication, droits et devoirs). Parle en français.`,
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, context_type, user_profile }: AdvisorRequest = await req.json();

    if (!message || !message.trim()) {
      return new Response(
        JSON.stringify({ error: 'Message requis' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const apiKey = OPENAI_API_KEY || LOVABLE_API_KEY;

    if (!apiKey) {
      const fallbackResponse = generateFallbackResponse(message, context_type);
      return new Response(
        JSON.stringify({ response: fallbackResponse, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[context_type] || SYSTEM_PROMPTS.general;
    let userContext = '';
    if (user_profile) {
      const parts = [];
      if (user_profile.age) parts.push(`Âge: ${user_profile.age}`);
      if (user_profile.gender) parts.push(`Genre: ${user_profile.gender}`);
      if (user_profile.location) parts.push(`Localisation: ${user_profile.location}`);
      if (user_profile.religious_level) parts.push(`Niveau religieux: ${user_profile.religious_level}`);
      if (parts.length > 0) {
        userContext = `\n\nContexte de l'utilisateur: ${parts.join(', ')}`;
      }
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt + userContext },
          { role: 'user', content: message },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error('[NIKAH_ADVISOR] API error:', response.status);
      const fallbackResponse = generateFallbackResponse(message, context_type);
      return new Response(
        JSON.stringify({ response: fallbackResponse, source: 'fallback' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content || generateFallbackResponse(message, context_type);

    return new Response(
      JSON.stringify({ response: aiResponse, source: 'ai' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[NIKAH_ADVISOR] Error:', error);
    return new Response(
      JSON.stringify({ error: 'Erreur du service. Veuillez réessayer.' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateFallbackResponse(message: string, context: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('istikhara') || lowerMessage.includes('استخارة')) {
    return "L'Istikhara est une prière de consultation que le Prophète ﷺ enseignait à ses compagnons. Priez 2 rak'at, puis récitez le dua d'Istikhara en mentionnant votre besoin. Le résultat se manifeste par la facilitation ou l'obstacle, pas nécessairement par un rêve. Faites-la avec sincérité et acceptez le décret d'Allah. (Al-Bukhârî, 1162)";
  }

  if (lowerMessage.includes('mahr') || lowerMessage.includes('dot')) {
    return "Le mahr est un droit inaliénable de l'épouse, c'est un don obligatoire du mari. Il peut être en argent, en biens, ou même l'enseignement du Coran. Le Prophète ﷺ a dit : « Le meilleur mariage est celui qui est le plus facile. » Il est recommandé de ne pas exagérer dans le montant. (An-Nisâ, 4:4)";
  }

  if (lowerMessage.includes('wali') || lowerMessage.includes('tuteur')) {
    return "Le Wali (tuteur) est un pilier du mariage islamique. Le Prophète ﷺ a dit : « Pas de mariage sans tuteur. » (Abû Dâwûd). Le Wali protège les intérêts de sa protégée et vérifie le sérieux du prétendant. C'est un rôle de protection. Si le Wali refuse sans raison valable en sharî'a, on peut recourir à un autre tuteur ou au juge.";
  }

  if (lowerMessage.includes('compatib') || lowerMessage.includes('critère')) {
    return "Les critères essentiels du choix du conjoint selon le Prophète ﷺ sont : la religion, le caractère, la famille et l'apparence. \"Choisis celle qui a la religion, tu seras gagnant.\" (Al-Bukhârî). L'équivalence (kafâ'a) en religion, éducation et milieu est aussi recommandée par les savants pour faciliter la vie commune.";
  }

  if (lowerMessage.includes('communic') || lowerMessage.includes('parler')) {
    return "La communication en Islam est basée sur le respect mutuel. Le Prophète ﷺ écoutait ses épouses, plaisantait avec elles et ne haussait jamais la voix. Avant le mariage, les échanges doivent se faire dans un cadre approprié : avec la connaissance du Wali, sur des sujets sérieux, et sans familiarité excessive.";
  }

  const generalResponses: Record<string, string> = {
    general: "Le mariage en Islam est un acte d'adoration. Le Prophète ﷺ a dit : « Quand le serviteur d'Allah se marie, il a complété la moitié de sa foi. » (Al-Bayhaqî). Prenez le temps de bien choisir, faites l'Istikhara, consultez votre famille et remettez-vous à Allah. Je suis là pour vous guider dans cette belle démarche.",
    profile_review: "Pour un profil attractif et honnête : soyez authentique, mentionnez votre pratique religieuse, vos valeurs familiales et vos projets de vie. Évitez l'excès et le défaut. Le Prophète ﷺ aimait la modération en toute chose.",
    compatibility: "La compatibilité en Islam se mesure sur la religion, le caractère (khuluq), les valeurs familiales et les projets de vie. Le Prophète ﷺ a dit : « Si quelqu'un dont vous êtes satisfaits de la religion et du caractère vous demande, mariez-le. » (At-Tirmidhî)",
    preparation: "La préparation au mariage comprend : purifier l'intention, l'Istikhara, les échanges encadrés, la rencontre des familles, la négociation du contrat et du mahr, puis le nikah et la walima. Chaque étape a sa sagesse.",
  };

  return generalResponses[context] || generalResponses.general;
}
