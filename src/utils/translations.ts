export const compatibilityTranslations = {
  // Interface du test
  testTitle: 'Test de Compatibilité Matrimoniale selon le Coran et la Sunna',
  testDescription:
    'Répondez honnêtement à chaque question pour évaluer votre compatibilité avec de futurs partenaires selon les valeurs islamiques.',

  // Navigation
  previous: 'Précédent',
  next: 'Suivant',
  viewResults: 'Voir les Résultats',
  calculating: 'Calcul en cours...',
  retakeTest: 'Refaire le Test',

  // Niveaux d'accord
  agreementLevels: {
    stronglyDisagree: "Pas du tout d'accord",
    disagree: "Pas d'accord",
    neutral: 'Neutre/Sans opinion',
    agree: "D'accord",
    stronglyAgree: "Tout à fait d'accord",
  },

  // Catégories
  categories: {
    'Pratique Religieuse': 'Pratique Religieuse',
    'Objectifs Spirituels': 'Objectifs Spirituels',
    Fidélité: 'Fidélité et Confiance',
    'Engagement Long Terme': 'Engagement à Long Terme',
    'Valeurs Familiales': 'Valeurs Familiales',
    'Éducation et Finances': 'Éducation et Finances',
    'Mode de Vie': 'Mode de Vie',
    Communication: 'Communication',
  },

  // Paramètres
  advancedSettings: 'Paramètres Avancés',
  importance: "Niveau d'Importance",
  dealbreaker: 'Critère Non Négociable',
  minimumThreshold: 'Seuil Minimum Acceptable',

  // Résultats
  compatibilityScore: 'Score de Compatibilité',
  excellent: 'Excellente Compatibilité',
  veryGood: 'Très Bonne Compatibilité',
  good: 'Bonne Compatibilité',
  average: 'Compatibilité Moyenne',
  needsWork: 'Nécessite du Travail',

  // Correspondances
  findingMatches: 'Recherche de correspondances...',
  noMatches: 'Aucune correspondance trouvée',
  matchesFound: 'correspondances trouvées',

  // Statut de vérification
  verified: 'Vérifié(e)',
  emailVerified: 'Email vérifié',
  phoneVerified: 'Téléphone vérifié',
  idVerified: 'Identité vérifiée',

  // Erreurs et messages
  authRequired: 'Vous devez être connecté pour passer le test',
  testRequired: 'Vous devez passer le test de compatibilité',
  saveError: 'Erreur lors de la sauvegarde',
  loadError: 'Erreur lors du chargement',

  // Rappels islamiques
  islamicReminder: 'Rappel Spirituel',
  ayahMarriage:
    '"Et parmi Ses signes Il a créé de vous, pour vous, des épouses pour que vous viviez en tranquillité avec elles et Il a mis entre vous de l\'affection et de la bonté." - Coran 30:21',

  // Indicateurs de progression
  questionsAnswered: 'questions répondues',
  categoryProgress: 'Progression par catégorie',
  completed: 'Terminé',
  inProgress: 'En cours',
  started: 'Commencé',
  todo: 'À faire',
  percentComplete: '% terminé',
};

export function getTranslation(key: string): string {
  const keys = key.split('.');
  let value: any = compatibilityTranslations;

  for (const k of keys) {
    value = value?.[k];
    if (value === undefined) break;
  }

  return value || key;
}

export function formatAgreementLevel(value: number): string {
  if (value <= 25) return compatibilityTranslations.agreementLevels.stronglyDisagree;
  if (value <= 45) return compatibilityTranslations.agreementLevels.disagree;
  if (value <= 65) return compatibilityTranslations.agreementLevels.neutral;
  if (value <= 85) return compatibilityTranslations.agreementLevels.agree;
  return compatibilityTranslations.agreementLevels.stronglyAgree;
}

export function formatCompatibilityLevel(score: number): string {
  if (score >= 90) return compatibilityTranslations.excellent;
  if (score >= 80) return compatibilityTranslations.veryGood;
  if (score >= 70) return compatibilityTranslations.good;
  if (score >= 60) return compatibilityTranslations.average;
  return compatibilityTranslations.needsWork;
}
