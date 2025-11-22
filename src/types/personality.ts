/**
 * Personality Questionnaire Types
 * Used for calculating personality compatibility in the matching algorithm
 */

export interface PersonalityQuestionnaire {
  id: string;
  user_id: string;

  // Life Goals & Ambitions (1-5 scale)
  career_ambition: number; // 1=Work to live, 5=Live to work
  family_priority: number; // 1=Low priority, 5=Top priority
  religious_growth: number; // 1=Not focused, 5=Top priority
  community_involvement: number; // 1=Private life, 5=Very involved

  // Communication & Conflict Resolution (1-5 scale)
  communication_style: number; // 1=Direct, 5=Indirect
  conflict_resolution: number; // 1=Avoidant, 5=Confrontational
  emotional_expression: number; // 1=Reserved, 5=Expressive

  // Financial Management (1-5 scale)
  spending_habits: number; // 1=Saver, 5=Spender
  financial_planning: number; // 1=Spontaneous, 5=Planner

  // Social & Lifestyle (1-5 scale)
  social_energy: number; // 1=Introvert, 5=Extrovert
  adventure_level: number; // 1=Homebody, 5=Explorer
  organization_level: number; // 1=Spontaneous, 5=Organized

  // Family Roles & Responsibilities (1-5 scale)
  household_roles: number; // 1=Traditional, 5=Equal
  decision_making: number; // 1=Independent, 5=Consultative
  parenting_style: number; // 1=Strict, 5=Lenient

  // Metadata
  completed_at: string;
  updated_at: string;
}

export interface QuestionnaireQuestion {
  id: string;
  field: keyof Omit<PersonalityQuestionnaire, 'id' | 'user_id' | 'completed_at' | 'updated_at'>;
  question: string;
  description?: string;
  leftLabel: string;
  rightLabel: string;
  category: 'goals' | 'communication' | 'finance' | 'social' | 'family';
}

export const PERSONALITY_QUESTIONS: QuestionnaireQuestion[] = [
  // Life Goals & Ambitions
  {
    id: 'career_ambition',
    field: 'career_ambition',
    question: 'Quelle importance accordez-vous à votre carrière professionnelle ?',
    description: 'Comment voyez-vous l\'équilibre entre vie professionnelle et personnelle ?',
    leftLabel: 'Je travaille pour vivre',
    rightLabel: 'Je vis pour travailler',
    category: 'goals',
  },
  {
    id: 'family_priority',
    field: 'family_priority',
    question: 'Quelle place occupe la famille dans vos priorités de vie ?',
    description: 'La famille est-elle au centre de vos décisions ?',
    leftLabel: 'Priorité modérée',
    rightLabel: 'Priorité absolue',
    category: 'goals',
  },
  {
    id: 'religious_growth',
    field: 'religious_growth',
    question: 'Dans quelle mesure la croissance spirituelle est-elle importante pour vous ?',
    description: 'Cherchez-vous activement à approfondir votre foi ?',
    leftLabel: 'Peu important',
    rightLabel: 'Très important',
    category: 'goals',
  },
  {
    id: 'community_involvement',
    field: 'community_involvement',
    question: 'À quel point êtes-vous impliqué(e) dans votre communauté ?',
    description: 'Participez-vous à des activités communautaires et associatives ?',
    leftLabel: 'Vie privée',
    rightLabel: 'Très impliqué(e)',
    category: 'goals',
  },

  // Communication & Conflict Resolution
  {
    id: 'communication_style',
    field: 'communication_style',
    question: 'Comment préférez-vous communiquer dans une relation ?',
    description: 'Êtes-vous plutôt direct ou diplomatique ?',
    leftLabel: 'Direct et franc',
    rightLabel: 'Diplomatique et subtil',
    category: 'communication',
  },
  {
    id: 'conflict_resolution',
    field: 'conflict_resolution',
    question: 'Comment gérez-vous les désaccords dans une relation ?',
    description: 'Abordez-vous les conflits ou préférez-vous les éviter ?',
    leftLabel: 'J\'évite les conflits',
    rightLabel: 'J\'aborde immédiatement',
    category: 'communication',
  },
  {
    id: 'emotional_expression',
    field: 'emotional_expression',
    question: 'Comment exprimez-vous vos émotions ?',
    description: 'Partagez-vous facilement vos sentiments ?',
    leftLabel: 'Réservé(e)',
    rightLabel: 'Très expressif(ve)',
    category: 'communication',
  },

  // Financial Management
  {
    id: 'spending_habits',
    field: 'spending_habits',
    question: 'Comment gérez-vous vos dépenses personnelles ?',
    description: 'Êtes-vous économe ou dépensier ?',
    leftLabel: 'Économe',
    rightLabel: 'Dépensier',
    category: 'finance',
  },
  {
    id: 'financial_planning',
    field: 'financial_planning',
    question: 'Planifiez-vous vos finances à l\'avance ?',
    description: 'Avez-vous un budget et des objectifs financiers ?',
    leftLabel: 'Spontané(e)',
    rightLabel: 'Planificateur(trice)',
    category: 'finance',
  },

  // Social & Lifestyle
  {
    id: 'social_energy',
    field: 'social_energy',
    question: 'Où puisez-vous votre énergie sociale ?',
    description: 'Préférez-vous les petits groupes ou les grandes réunions ?',
    leftLabel: 'Introverti(e)',
    rightLabel: 'Extraverti(e)',
    category: 'social',
  },
  {
    id: 'adventure_level',
    field: 'adventure_level',
    question: 'Quel est votre niveau d\'appétence pour l\'aventure ?',
    description: 'Préférez-vous la routine ou la nouveauté ?',
    leftLabel: 'Routine et confort',
    rightLabel: 'Aventure et nouveauté',
    category: 'social',
  },
  {
    id: 'organization_level',
    field: 'organization_level',
    question: 'Comment organisez-vous votre vie quotidienne ?',
    description: 'Êtes-vous spontané ou méthodique ?',
    leftLabel: 'Spontané(e)',
    rightLabel: 'Très organisé(e)',
    category: 'social',
  },

  // Family Roles & Responsibilities
  {
    id: 'household_roles',
    field: 'household_roles',
    question: 'Comment envisagez-vous les rôles au sein du foyer ?',
    description: 'Vision des responsabilités domestiques',
    leftLabel: 'Rôles traditionnels',
    rightLabel: 'Partenariat égal',
    category: 'family',
  },
  {
    id: 'decision_making',
    field: 'decision_making',
    question: 'Comment prenez-vous vos décisions importantes ?',
    description: 'De manière indépendante ou en consultant votre partenaire ?',
    leftLabel: 'Indépendant(e)',
    rightLabel: 'Toujours consulter',
    category: 'family',
  },
  {
    id: 'parenting_style',
    field: 'parenting_style',
    question: 'Quel style d\'éducation envisagez-vous pour vos enfants ?',
    description: 'Approche stricte ou permissive ?',
    leftLabel: 'Strict(e)',
    rightLabel: 'Permissif(ve)',
    category: 'family',
  },
];

export const CATEGORY_LABELS: Record<string, { title: string; icon: string }> = {
  goals: { title: 'Objectifs de vie', icon: '🎯' },
  communication: { title: 'Communication', icon: '💬' },
  finance: { title: 'Gestion financière', icon: '💰' },
  social: { title: 'Style de vie', icon: '🌟' },
  family: { title: 'Famille et rôles', icon: '👨‍👩‍👧‍👦' },
};
