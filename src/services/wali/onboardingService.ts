
export interface OnboardingModule {
  id: string;
  title: string;
  description: string;
  duration_minutes: number;
  required: boolean;
  order: number;
  content_type: 'video' | 'text' | 'interactive' | 'quiz';
  content_url?: string;
  content_text?: string;
  quiz_questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

export interface WaliOnboardingProgress {
  wali_id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  progress_percentage: number;
  started_at?: string;
  completed_at?: string;
  quiz_score?: number;
  attempts: number;
}

export class OnboardingService {
  private static modules: OnboardingModule[] = [
    {
      id: 'intro',
      title: 'Introduction au Rôle de Wali',
      description: 'Comprendre les responsabilités et l\'importance du rôle de wali dans l\'Islam',
      duration_minutes: 15,
      required: true,
      order: 1,
      content_type: 'video',
      content_text: `
        En tant que wali, vous jouez un rôle crucial dans la protection et l'orientation de votre proche dans sa recherche du mariage. Vos responsabilités incluent:
        
        • Supervision des conversations pour maintenir les limites islamiques
        • Conseil et orientation basés sur les enseignements islamiques
        • Protection contre les comportements inappropriés
        • Facilitation des rencontres appropriées
        • Participation aux décisions importantes
      `
    },
    {
      id: 'supervision_guidelines',
      title: 'Directives de Supervision',
      description: 'Apprendre les meilleures pratiques pour superviser les interactions',
      duration_minutes: 20,
      required: true,
      order: 2,
      content_type: 'text',
      content_text: `
        Principes de supervision efficace:
        
        1. Supervision Active vs Passive
        - Active: Participation directe aux conversations
        - Passive: Surveillance discrète avec intervention si nécessaire
        
        2. Signaux d'Alerte
        - Demandes de rencontres privées
        - Conversations inappropriées
        - Pression ou urgence excessive
        
        3. Intervention Appropriée
        - Redirection respectueuse
        - Éducation sur les limites islamiques
        - Communication avec les autres walis si nécessaire
      `
    },
    {
      id: 'technology_tools',
      title: 'Utilisation des Outils Technologiques',
      description: 'Maîtriser les fonctionnalités de supervision sur la plateforme',
      duration_minutes: 25,
      required: true,
      order: 3,
      content_type: 'interactive',
      content_text: `
        Fonctionnalités de la plateforme:
        
        • Tableau de bord de supervision
        • Notifications en temps réel
        • Filtres de contenu automatiques
        • Outils de signalement
        • Paramètres de confidentialité
        • Communication avec d'autres walis
      `
    },
    {
      id: 'islamic_ethics',
      title: 'Éthique Islamique dans le Mariage',
      description: 'Révision des principes islamiques du mariage et des fiançailles',
      duration_minutes: 30,
      required: true,
      order: 4,
      content_type: 'text',
      quiz_questions: [
        {
          id: 'q1',
          question: 'Quelle est la principale responsabilité d\'un wali selon l\'Islam?',
          options: [
            'Choisir le conjoint pour son proche',
            'Protéger et guider son proche dans le processus de mariage',
            'Négocier les conditions financières',
            'Organiser la cérémonie de mariage'
          ],
          correct_answer: 1,
          explanation: 'Le wali doit protéger et guider, pas imposer ses choix.'
        },
        {
          id: 'q2',
          question: 'Dans quelles circonstances un wali peut-il refuser un prétendant?',
          options: [
            'Pour des raisons personnelles seulement',
            'Si le prétendant ne respecte pas les exigences islamiques',
            'Jamais, le choix revient entièrement à la personne',
            'Pour des raisons financières uniquement'
          ],
          correct_answer: 1,
          explanation: 'Le refus doit être basé sur des critères islamiques valides.'
        }
      ]
    },
    {
      id: 'crisis_management',
      title: 'Gestion des Situations Difficiles',
      description: 'Comment gérer les conflits et situations problématiques',
      duration_minutes: 20,
      required: false,
      order: 5,
      content_type: 'text',
      content_text: `
        Situations difficiles et solutions:
        
        1. Désaccord avec la personne supervisée
        - Écoute active et communication respectueuse
        - Référence aux enseignements islamiques
        - Consultation avec d'autres personnes de confiance
        
        2. Comportement inapproprié détecté
        - Documentation des incidents
        - Communication directe avec les parties concernées
        - Escalade vers les administrateurs si nécessaire
        
        3. Conflits entre familles
        - Médiation basée sur les principes islamiques
        - Recherche de solutions mutuellement bénéfiques
        - Implication d'érudits islamiques si nécessaire
      `
    }
  ];

  static getModules(): OnboardingModule[] {
    return this.modules;
  }

  static getRequiredModules(): OnboardingModule[] {
    return this.modules.filter(m => m.required);
  }

  static async getProgress(waliId: string): Promise<WaliOnboardingProgress[]> {
    // In a real implementation, this would fetch from the database
    // For now, return mock data
    return this.modules.map(module => ({
      wali_id: waliId,
      module_id: module.id,
      status: 'not_started',
      progress_percentage: 0,
      attempts: 0
    }));
  }

  static async updateProgress(
    waliId: string,
    moduleId: string,
    status: string,
    progressPercentage: number,
    quizScore?: number
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, this would update the database
      console.log('Updating progress:', { waliId, moduleId, status, progressPercentage, quizScore });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  static calculateOverallProgress(progressArray: WaliOnboardingProgress[]): number {
    const requiredModules = this.getRequiredModules();
    const completedRequired = progressArray.filter(p => 
      requiredModules.find(m => m.id === p.module_id) && p.status === 'completed'
    ).length;
    
    return (completedRequired / requiredModules.length) * 100;
  }

  static isOnboardingComplete(progressArray: WaliOnboardingProgress[]): boolean {
    return this.calculateOverallProgress(progressArray) === 100;
  }
}
