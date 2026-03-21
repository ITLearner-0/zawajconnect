export interface JourneyStep {
  step: number;
  title: string;
  subtitle: string;
  icon: string;
  description: string;
  islamicReference: string;
  islamicSource: string;
  questionsToAsk: string[];
  commonMistakes: string[];
  recommendedDuration: string;
  actionLabel: string;
  actionRoute: string;
}

export const journeySteps: JourneyStep[] = [
  {
    step: 1,
    title: 'Profil complet',
    subtitle: 'Se présenter avec sincérité',
    icon: 'User',
    description: "Un profil complet et honnête est la base d'une recherche sérieuse. Remplissez toutes les sections avec sincérité : vos qualités, votre pratique religieuse, vos attentes. C'est votre première impression auprès des familles.",
    islamicReference: "« Ô vous qui croyez ! Craignez Allah et soyez avec les véridiques. »",
    islamicSource: 'Coran, Sourate At-Tawba, 9:119',
    questionsToAsk: [
      'Mon profil reflète-t-il vraiment qui je suis ?',
      'Ai-je été honnête sur ma pratique religieuse ?',
      "Mes photos sont-elles décentes et représentatives ?",
    ],
    commonMistakes: [
      'Profil trop vague ou générique',
      'Exagération des qualités',
      "Omettre des informations importantes (divorcé, enfants, etc.)",
    ],
    recommendedDuration: '1-2 jours',
    actionLabel: 'Compléter mon profil',
    actionRoute: '/profile/edit',
  },
  {
    step: 2,
    title: 'Test de compatibilité',
    subtitle: 'Connaître ses valeurs profondes',
    icon: 'ClipboardCheck',
    description: "Le test de compatibilité vous aide à identifier vos valeurs profondes et vos critères non-négociables. Il permet au système de vous proposer des profils qui correspondent réellement à vos aspirations, au-delà des critères superficiels.",
    islamicReference: "« Et consultez-les à propos des affaires. »",
    islamicSource: 'Coran, Sourate Âl-Imrân, 3:159',
    questionsToAsk: [
      'Quels sont mes critères absolument non-négociables ?',
      "Suis-je ouvert(e) à des profils différents de ce que j'imaginais ?",
      "Ai-je répondu honnêtement, sans chercher à paraître ?",
    ],
    commonMistakes: [
      'Répondre ce qu\'on pense être "la bonne réponse"',
      'Critères trop restrictifs ou irréalistes',
      "Ne pas prendre le test au sérieux",
    ],
    recommendedDuration: '1 jour',
    actionLabel: 'Passer le test',
    actionRoute: '/compatibility-test',
  },
  {
    step: 3,
    title: 'Premier match',
    subtitle: 'Découvrir un profil compatible',
    icon: 'Heart',
    description: "Le premier match est un moment important. Ne vous précipitez pas. Étudiez le profil avec attention, regardez les points de compatibilité, et lisez la section familiale si disponible. C'est le début d'un processus sérieux, pas un jeu.",
    islamicReference: "« Et ne vous précipitez pas dans vos affaires. »",
    islamicSource: 'Sagesse des salaf',
    questionsToAsk: [
      "Ce profil correspond-il à mes critères essentiels ?",
      "Que penserait ma famille de cette personne ?",
      "Y a-t-il des signes d'alerte que j'ignore ?",
    ],
    commonMistakes: [
      "Se focaliser uniquement sur l'apparence physique",
      'Ignorer les incompatibilités fondamentales',
      "Contacter trop de profils en même temps",
    ],
    recommendedDuration: '1-2 semaines',
    actionLabel: 'Parcourir les profils',
    actionRoute: '/browse',
  },
  {
    step: 4,
    title: 'Échange supervisé',
    subtitle: 'Communiquer avec respect et sérieux',
    icon: 'MessageCircle',
    description: "L'échange supervisé est au cœur de la démarche islamique. Votre Wali est informé des conversations. Posez les questions essentielles : religion, famille, enfants, finances, projets de vie. L'objectif est de connaître la personne, pas de flirter.",
    islamicReference: "« Quand l'un de vous veut demander en mariage une femme, qu'il regarde d'elle ce qui l'encouragerait à l'épouser. »",
    islamicSource: 'Ahmad & Abu Dawud',
    questionsToAsk: [
      'Ai-je posé les questions vraiment importantes ?',
      'Le Wali est-il tenu informé de mes échanges ?',
      "Est-ce que je ressens du respect mutuel dans nos échanges ?",
    ],
    commonMistakes: [
      "Échanger sans supervision (sans Wali/mahram informé)",
      'Rester dans le superficiel trop longtemps',
      "S'attacher émotionnellement avant la décision",
    ],
    recommendedDuration: '2-4 semaines',
    actionLabel: 'Mes conversations',
    actionRoute: '/chat',
  },
  {
    step: 5,
    title: 'Istikhara & Réflexion',
    subtitle: "S'en remettre à Allah pour la décision",
    icon: 'Moon',
    description: "Avant de prendre votre décision, entrez dans une période de réflexion spirituelle. Priez l'Istikhara chaque jour pendant 7 jours, tenez un journal de réflexion, et observez les signes qu'Allah place sur votre chemin.",
    islamicReference: "« Allâhumma innî astakhîruka bi 'ilmika... » — Quand le Prophète ﷺ nous enseignait la prière de l'Istikhara, il nous l'enseignait comme une sourate du Coran.",
    islamicSource: 'Sahih Al-Bukhârî, n°1162',
    questionsToAsk: [
      'Après ma prière, est-ce que je ressens de la paix ou de l\'inquiétude ?',
      "Les portes s'ouvrent-elles naturellement ou se ferment-elles ?",
      "Que disent les gens de confiance autour de moi ?",
    ],
    commonMistakes: [
      "Attendre un rêve comme seul signe",
      "Ne faire l'Istikhara qu'une seule fois",
      "Confondre ses désirs personnels avec la guidance divine",
    ],
    recommendedDuration: '7 jours minimum',
    actionLabel: 'Commencer l\'Istikhara',
    actionRoute: '/istikhara-session',
  },
  {
    step: 6,
    title: 'Rencontre familiale',
    subtitle: 'Unir deux familles, pas seulement deux personnes',
    icon: 'Users',
    description: "Le mariage en Islam est l'union de deux familles. La rencontre entre les familles (khitba) est une étape clé. Le Wali représente la famille, les deux parties se présentent, et les conditions du mariage sont discutées.",
    islamicReference: "« Pas de mariage sans tuteur (wali). »",
    islamicSource: 'Abu Dawud & At-Tirmidhî',
    questionsToAsk: [
      'Les deux familles sont-elles alignées sur les valeurs essentielles ?',
      "Les conditions du mahr et du contrat sont-elles clarifiées ?",
      "Y a-t-il un sentiment de baraka (bénédiction) dans cette rencontre ?",
    ],
    commonMistakes: [
      "Exclure la famille du processus",
      "Ne pas discuter des conditions pratiques (mahr, logement, etc.)",
      "Céder à la pression sociale plutôt qu'écouter son cœur",
    ],
    recommendedDuration: '1-4 semaines',
    actionLabel: 'Planifier une rencontre',
    actionRoute: '/wali-dashboard',
  },
  {
    step: 7,
    title: 'Nikah ✨',
    subtitle: 'Le jour béni du mariage',
    icon: 'Sparkles',
    description: "Le nikah est un acte d'adoration. C'est un contrat sacré devant Allah avec des droits et des devoirs mutuels. Que ce jour soit le début d'une vie conjugale bénie, construite sur la taqwa, l'amour et la miséricorde.",
    islamicReference: "« Et parmi Ses signes, Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l'affection et de la bonté. »",
    islamicSource: 'Coran, Sourate Ar-Rûm, 30:21',
    questionsToAsk: [
      'Sommes-nous prêts à construire un foyer sur la taqwa ?',
      "Avons-nous clarifié nos droits et devoirs mutuels ?",
      "Notre intention est-elle sincère pour Allah ?",
    ],
    commonMistakes: [
      'Se focaliser sur la fête plutôt que sur le sens',
      'Négliger le contrat de mariage',
      "Oublier que le nikah est le début, pas la fin du chemin",
    ],
    recommendedDuration: "Quand Allah le décide",
    actionLabel: 'Mahr & Contrat',
    actionRoute: '/mahr-calculator',
  },
];
