
export interface Question {
  id: number;
  question: string;
  category: string;
  weight: number;
  isBreaker: boolean;
  description?: string;
}

export const questions: Question[] = [
  // 1. FONDEMENTS SPIRITUELS ET RELIGIEUX
  {
    id: 1,
    question: "Je considère que la prière en commun (quand possible) renforce le lien conjugal.",
    category: "Fondements Spirituels",
    weight: 2.0,
    isBreaker: true,
    description: "La prière commune renforce l'unité spirituelle du couple."
  },
  {
    id: 2,
    question: "Je souhaite que nous nous encouragions mutuellement dans nos obligations religieuses.",
    category: "Fondements Spirituels",
    weight: 2.0,
    isBreaker: true,
    description: "L'entraide spirituelle est essentielle dans un mariage islamique."
  },
  {
    id: 3,
    question: "Il est important pour moi que nous lisions le Coran ensemble régulièrement.",
    category: "Fondements Spirituels",
    weight: 1.8,
    isBreaker: false,
    description: "La lecture commune du Coran enrichit la spiritualité conjugale."
  },
  {
    id: 4,
    question: "Notre mariage doit nous rapprocher d'Allah (SWT).",
    category: "Objectifs Spirituels",
    weight: 2.0,
    isBreaker: true,
    description: "Le mariage doit être un moyen d'amélioration spirituelle."
  },
  {
    id: 5,
    question: "Accomplir le Hajj ensemble est un objectif important pour moi.",
    category: "Objectifs Spirituels",
    weight: 1.5,
    isBreaker: false,
    description: "Le pèlerinage ensemble renforce les liens spirituels."
  },

  // 2. RÔLES ET RESPONSABILITÉS CONJUGALES
  {
    id: 6,
    question: "Je comprends et accepte les responsabilités de l'époux selon l'Islam (qiwama).",
    category: "Rôles Conjugaux",
    weight: 1.9,
    isBreaker: true,
    description: "Comprendre les rôles selon l'Islam est fondamental."
  },
  {
    id: 7,
    question: "Les décisions importantes doivent être prises par consultation mutuelle (shoura).",
    category: "Rôles Conjugaux",
    weight: 1.8,
    isBreaker: false,
    description: "La consultation mutuelle est recommandée en Islam."
  },
  {
    id: 8,
    question: "Nous devons nous compléter dans nos forces et faiblesses.",
    category: "Complémentarité",
    weight: 1.7,
    isBreaker: false,
    description: "La complémentarité enrichit le couple."
  },

  // 3. COMMUNICATION ET COMPORTEMENT
  {
    id: 9,
    question: "Nous devons toujours nous parler avec respect et douceur.",
    category: "Communication",
    weight: 1.9,
    isBreaker: true,
    description: "Le respect mutuel est un pilier du mariage islamique."
  },
  {
    id: 10,
    question: "Nous ne devons jamais nous coucher en étant fâchés l'un contre l'autre.",
    category: "Gestion des Conflits",
    weight: 1.6,
    isBreaker: false,
    description: "Résoudre les conflits rapidement préserve l'harmonie."
  },

  // 4. ASPECTS FINANCIERS ET MATÉRIELS
  {
    id: 11,
    question: "Le mari doit assurer la nafaqah (entretien) de son épouse.",
    category: "Gestion Financière",
    weight: 1.8,
    isBreaker: true,
    description: "La nafaqah est une obligation religieuse de l'époux."
  },
  {
    id: 12,
    question: "Nous devons éviter les dépenses excessives (israf).",
    category: "Mode de Vie",
    weight: 1.5,
    isBreaker: false,
    description: "L'Islam encourage la modération dans les dépenses."
  },

  // 5. ÉDUCATION DES ENFANTS
  {
    id: 13,
    question: "L'éducation religieuse de nos enfants est notre priorité absolue.",
    category: "Éducation des Enfants",
    weight: 2.0,
    isBreaker: true,
    description: "L'éducation islamique des enfants est primordiale."
  },
  {
    id: 14,
    question: "Nos enfants doivent apprendre le respect des parents (birr al-walidayn).",
    category: "Transmission des Valeurs",
    weight: 1.8,
    isBreaker: false,
    description: "Le respect des parents est un pilier de l'Islam."
  },

  // 6. RELATIONS FAMILIALES ET SOCIALES
  {
    id: 15,
    question: "Respecter et honorer les parents de mon conjoint est un devoir.",
    category: "Relations Familiales",
    weight: 1.7,
    isBreaker: false,
    description: "Le respect des beaux-parents est important en Islam."
  },
  {
    id: 16,
    question: "Participer aux activités de la communauté musulmane est important.",
    category: "Vie Sociale",
    weight: 1.4,
    isBreaker: false,
    description: "L'engagement communautaire renforce la foi."
  },

  // 7. INTIMITÉ ET VIE PRIVÉE
  {
    id: 17,
    question: "L'intimité conjugale est un droit et un devoir mutuels.",
    category: "Intimité",
    weight: 1.8,
    isBreaker: true,
    description: "L'intimité conjugale est reconnue comme un droit mutuel en Islam."
  },
  {
    id: 18,
    question: "La pudeur et le respect doivent toujours être préservés.",
    category: "Pudeur",
    weight: 1.7,
    isBreaker: false,
    description: "La pudeur est une valeur centrale de l'Islam."
  },

  // 8. PROJETS DE VIE ET OBJECTIFS COMMUNS
  {
    id: 19,
    question: "Nous voulons que notre mariage soit béni dans cette vie et l'au-delà.",
    category: "Aspirations Spirituelles",
    weight: 2.0,
    isBreaker: true,
    description: "Le mariage doit viser la satisfaction d'Allah."
  },
  {
    id: 20,
    question: "Équilibrer notre réussite professionnelle avec nos devoirs religieux.",
    category: "Réalisations Terrestres",
    weight: 1.6,
    isBreaker: false,
    description: "L'équilibre entre dunya et akhira est important."
  },

  // 9. DÉFIS ET ÉPREUVES
  {
    id: 21,
    question: "Les épreuves d'Allah doivent nous rapprocher, pas nous séparer.",
    category: "Face aux Difficultés",
    weight: 1.8,
    isBreaker: false,
    description: "Les épreuves testent et renforcent la foi du couple."
  },
  {
    id: 22,
    question: "Nous devons nous aider à corriger nos défauts.",
    category: "Croissance Personnelle",
    weight: 1.6,
    isBreaker: false,
    description: "L'amélioration mutuelle est un objectif du mariage."
  },

  // 10. ENGAGEMENT ET FIDÉLITÉ
  {
    id: 23,
    question: "La fidélité absolue est un pilier non négociable de notre mariage.",
    category: "Fidélité",
    weight: 2.0,
    isBreaker: true,
    description: "La fidélité est fondamentale dans le mariage islamique."
  },
  {
    id: 24,
    question: "Notre mariage doit durer jusqu'à la mort, inch'Allah.",
    category: "Engagement Long Terme",
    weight: 1.9,
    isBreaker: true,
    description: "L'engagement à vie est l'idéal du mariage islamique."
  },
  {
    id: 25,
    question: "Faire du'a pour la bénédiction d'Allah sur notre union.",
    category: "Engagement Long Terme",
    weight: 1.7,
    isBreaker: false,
    description: "Les invocations renforcent la baraka du mariage."
  }
];

// Group questions by category for easier display
export const questionsByCategory = questions.reduce((acc, question) => {
  if (!acc[question.category]) {
    acc[question.category] = [];
  }
  acc[question.category].push(question);
  return acc;
}, {} as Record<string, Question[]>);

// Calculate max possible weighted score
export const calculateMaxPossibleScore = (): number => {
  let totalWeight = 0;
  
  for (const question of questions) {
    totalWeight += question.weight;
  }
  
  return totalWeight * 100; // 100 is max value for each question
};
