export interface IslamicGuidanceData {
  title: string;
  verse: string;
  source: string;
  application: string;
  category: string[];
}

export const islamicGuidanceDatabase: IslamicGuidanceData[] = [
  {
    title: 'Coopération dans le mariage',
    verse: 'Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l\'affection et de la bonté.',
    source: 'Coran, Sourate Ar-Rum (30:21)',
    application: 'Ce verset nous enseigne que le mariage doit être basé sur la tranquillité mutuelle, l\'affection et la bonté. Cela implique une coopération dans tous les aspects de la vie, y compris les responsabilités économiques et domestiques.',
    category: ['marriage', 'cooperation', 'general']
  },
  {
    title: 'Consultation mutuelle (Shura)',
    verse: 'Et qui répondent à l\'appel de leur Seigneur, accomplissent la Salât, se consultent entre eux à propos de leurs affaires.',
    source: 'Coran, Sourate Ash-Shura (42:38)',
    application: 'L\'Islam encourage la consultation mutuelle (Shura) dans les affaires importantes. Cela s\'applique également aux décisions familiales où les époux doivent se consulter et chercher des solutions ensemble.',
    category: ['decision_making', 'consultation', 'family_decisions']
  },
  {
    title: 'Droits et devoirs mutuels',
    verse: 'Et comportez-vous convenablement envers elles. Si vous avez de l\'aversion envers elles, il se peut que vous ayez de l\'aversion pour une chose où Allah a déposé un grand bien.',
    source: 'Coran, Sourate An-Nisa (4:19)',
    application: 'Ce verset établit le principe du traitement équitable et respectueux entre époux. Les droits et devoirs doivent être équilibrés, et chaque partenaire doit être traité avec dignité et respect.',
    category: ['rights', 'respect', 'equality']
  },
  {
    title: 'Justice et équité',
    verse: 'Ô vous qui croyez ! Observez strictement la justice et soyez des témoins (véridiques) comme Allah l\'ordonne, fût-ce contre vous-mêmes, vos père et mère et vos proches parents.',
    source: 'Coran, Sourate An-Nisa (4:135)',
    application: 'La justice doit prévaloir dans tous les aspects de la vie familiale. Cela inclut une répartition équitable des responsabilités domestiques et financières selon les capacités de chacun.',
    category: ['justice', 'domestic_responsibilities', 'fairness']
  },
  {
    title: 'Sustenance et responsabilité',
    verse: 'Les hommes ont autorité sur les femmes, en raison des faveurs qu\'Allah accorde à ceux-là sur celles-ci, et aussi à cause des dépenses qu\'ils font de leurs biens.',
    source: 'Coran, Sourate An-Nisa (4:34)',
    application: 'Ce verset doit être compris dans son contexte historique et social. Aujourd\'hui, la responsabilité financière peut être partagée selon les circonstances et les accords mutuels des époux.',
    category: ['economic_responsibility', 'leadership', 'financial_support']
  },
  {
    title: 'Patience et compréhension',
    verse: 'Et donnez-leur de vos biens en compensation. Il n\'y a pas de mal à ce que vous entreteniez de bons rapports avec elles, pourvu que vous agissiez avec droiture.',
    source: 'Coran, Sourate Al-Baqarah (2:241)',
    application: 'Même en cas de difficultés conjugales, l\'Islam encourage la patience, la compréhension et le maintien de relations respectueuses. Cela s\'applique aux défis quotidiens du mariage.',
    category: ['patience', 'understanding', 'conflict_resolution']
  },
  {
    title: 'Éducation et développement',
    verse: 'Et dis: "Seigneur, accrois mes connaissances !"',
    source: 'Coran, Sourate Ta-Ha (20:114)',
    application: 'L\'Islam encourage la quête du savoir pour tous, hommes et femmes. Le développement personnel et professionnel sont valorisés tant qu\'ils ne nuisent pas aux responsabilités familiales.',
    category: ['education', 'career', 'personal_development']
  },
  {
    title: 'Planification familiale',
    verse: 'Les mères, qui veulent donner un allaitement complet, allaiteront leurs bébés deux ans complets.',
    source: 'Coran, Sourate Al-Baqarah (2:233)',
    application: 'Ce verset montre l\'importance de la planification familiale consciente. Les décisions concernant les enfants doivent être prises ensemble, en tenant compte du bien-être de la famille.',
    category: ['children', 'family_planning', 'timeline']
  },
  {
    title: 'Communication respectueuse',
    verse: 'Et dis à Mes serviteurs d\'exprimer les meilleures paroles, car le Diable sème la discorde parmi eux.',
    source: 'Coran, Sourate Al-Isra (17:53)',
    application: 'La communication dans le couple doit toujours être respectueuse et constructive. Éviter les mots blessants et privilégier un dialogue ouvert et bienveillant.',
    category: ['communication', 'respect', 'kindness']
  },
  {
    title: 'Équilibre vie privée et sociale',
    verse: 'Et recherche, dans ce qu\'Allah t\'a donné, la Demeure dernière. Et n\'oublie pas ta part en cette vie.',
    source: 'Coran, Sourate Al-Qasas (28:77)',
    application: 'L\'Islam encourage un équilibre entre les devoirs spirituels, familiaux et sociaux. Il est important de maintenir cet équilibre dans la vie conjugale.',
    category: ['balance', 'spirituality', 'social_life']
  }
];

export const getGuidanceByCategory = (categories: string[]): IslamicGuidanceData[] => {
  return islamicGuidanceDatabase.filter(guidance => 
    guidance.category.some(cat => categories.includes(cat))
  );
};

export const getRandomGuidance = (count: number = 3): IslamicGuidanceData[] => {
  const shuffled = [...islamicGuidanceDatabase].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};