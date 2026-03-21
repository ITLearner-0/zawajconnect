export interface CoupleQuestion {
  id: number;
  category: string;
  question: string;
  type: 'choice' | 'text' | 'scale';
  options?: string[];
}

export interface QuestionCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export const categories: QuestionCategory[] = [
  { id: 'finances', name: 'Finances', icon: 'Wallet', color: 'emerald', description: 'Gestion du budget et objectifs financiers' },
  { id: 'enfants', name: 'Enfants & Éducation', icon: 'Baby', color: 'pink', description: "Vision de la parentalité et de l'éducation" },
  { id: 'quotidien', name: 'Vie Quotidienne', icon: 'Home', color: 'blue', description: 'Organisation du foyer et habitudes' },
  { id: 'religion', name: 'Religion & Spiritualité', icon: 'Moon', color: 'amber', description: 'Pratique religieuse et valeurs spirituelles' },
  { id: 'belle-famille', name: 'Belle-Famille', icon: 'Users', color: 'purple', description: 'Relations familiales et limites' },
  { id: 'communication', name: 'Communication', icon: 'MessageCircle', color: 'cyan', description: 'Style de communication et résolution de conflits' },
  { id: 'objectifs', name: 'Objectifs de Vie', icon: 'Target', color: 'orange', description: 'Ambitions personnelles et projets communs' },
  { id: 'sante', name: 'Santé & Bien-être', icon: 'Heart', color: 'red', description: 'Santé physique et mentale' },
  { id: 'voyages', name: 'Voyages & Loisirs', icon: 'Plane', color: 'indigo', description: 'Loisirs, voyages et temps libre' },
  { id: 'intimite', name: 'Intimité & Vie Conjugale', icon: 'Shield', color: 'rose', description: 'Attentes et respect mutuel' },
];

export const questions: CoupleQuestion[] = [
  // Finances (10)
  { id: 1, category: 'finances', question: 'Comment voyez-vous la gestion du budget familial ?', type: 'choice', options: ['Compte commun uniquement', 'Comptes séparés', 'Un compte commun + comptes personnels', 'À discuter ensemble'] },
  { id: 2, category: 'finances', question: "Quelle est votre attitude face à l'épargne ?", type: 'choice', options: ['Épargner au maximum', 'Épargner raisonnablement', 'Profiter du présent', 'Investir activement'] },
  { id: 3, category: 'finances', question: 'Êtes-vous prêt(e) à soutenir financièrement vos beaux-parents si nécessaire ?', type: 'choice', options: ['Oui, sans hésiter', 'Oui, dans la mesure du possible', 'Seulement en cas d\'urgence', 'Non, chaque famille gère ses finances'] },
  { id: 4, category: 'finances', question: "Comment réagiriez-vous face à une dette importante de votre conjoint(e) ?", type: 'text' },
  { id: 5, category: 'finances', question: "Quel niveau de vie souhaitez-vous atteindre ensemble ?", type: 'choice', options: ['Simple et modeste', 'Confortable, classe moyenne', 'Aisé', 'Peu importe tant qu\'on est ensemble'] },
  { id: 6, category: 'finances', question: "La femme doit-elle contribuer financièrement au foyer ?", type: 'choice', options: ['Non, c\'est la responsabilité du mari', 'Seulement si elle le souhaite', 'Oui, de manière équitable', 'Selon les circonstances'] },
  { id: 7, category: 'finances', question: "Quelle importance accordez-vous à la zakât et à la sadaqa ?", type: 'choice', options: ['Essentielle, priorité absolue', 'Importante, régulièrement', 'Occasionnellement', 'Le minimum obligatoire'] },
  { id: 8, category: 'finances', question: "Souhaitez-vous être propriétaire ou locataire ?", type: 'choice', options: ['Propriétaire dès que possible', 'Locataire pour rester flexible', 'Propriétaire à long terme', 'Pas de préférence'] },
  { id: 9, category: 'finances', question: "Comment gérez-vous les dépenses imprévues ?", type: 'text' },
  { id: 10, category: 'finances', question: "Accepteriez-vous que votre conjoint(e) change de carrière pour un salaire plus bas ?", type: 'choice', options: ['Oui, le bonheur prime', 'Oui, avec un plan', 'Difficilement', 'Non'] },

  // Enfants & Éducation (10)
  { id: 11, category: 'enfants', question: "Combien d'enfants souhaitez-vous avoir ?", type: 'choice', options: ['1-2', '3-4', '5 ou plus', 'Je ne suis pas sûr(e)', 'Je n\'en souhaite pas'] },
  { id: 12, category: 'enfants', question: "Quel type d'école préférez-vous pour vos enfants ?", type: 'choice', options: ['École islamique', 'École publique + cours islamiques', 'École privée', 'Instruction à domicile', 'À décider ensemble'] },
  { id: 13, category: 'enfants', question: "Comment envisagez-vous la discipline des enfants ?", type: 'choice', options: ['Dialogue et explication', 'Fermeté bienveillante', 'Liberté encadrée', 'Stricte mais juste'] },
  { id: 14, category: 'enfants', question: "Souhaitez-vous que vos enfants mémorisent le Coran ?", type: 'choice', options: ['Oui, c\'est une priorité', 'Oui, si ils le souhaitent', 'Ce serait bien, sans pression', 'Pas nécessairement'] },
  { id: 15, category: 'enfants', question: "Comment répartir les tâches parentales ?", type: 'choice', options: ['Rôles traditionnels', 'Partage équitable', 'Selon les disponibilités', 'À discuter au cas par cas'] },
  { id: 16, category: 'enfants', question: "Que feriez-vous si vous ne pouviez pas avoir d'enfants naturellement ?", type: 'choice', options: ['Adoption (kafala)', 'Traitements médicaux', 'Accepter le destin d\'Allah', 'Toutes les options'] },
  { id: 17, category: 'enfants', question: "Dans quelle(s) langue(s) souhaitez-vous élever vos enfants ?", type: 'text' },
  { id: 18, category: 'enfants', question: "Quelle place pour les écrans dans la vie de vos enfants ?", type: 'choice', options: ['Très limitée', 'Modérée et contrôlée', 'Libre avec supervision', 'Aucune restriction'] },
  { id: 19, category: 'enfants', question: "Comment gérer les différences d'éducation entre vos deux familles ?", type: 'text' },
  { id: 20, category: 'enfants', question: "Quand souhaitez-vous avoir votre premier enfant ?", type: 'choice', options: ['Dès que possible après le mariage', 'Dans 1-2 ans', 'Dans 3-5 ans', 'Quand Allah le voudra'] },

  // Vie Quotidienne (10)
  { id: 21, category: 'quotidien', question: "Qui s'occupe des tâches ménagères ?", type: 'choice', options: ['Partage équitable', 'Principalement la femme', 'Principalement le mari', 'Aide ménagère externe', 'Chacun ses forces'] },
  { id: 22, category: 'quotidien', question: "Êtes-vous plutôt du matin ou du soir ?", type: 'choice', options: ['Lève-tôt (Fajr et plus)', 'Plutôt du matin', 'Plutôt du soir', 'Variable'] },
  { id: 23, category: 'quotidien', question: "Quelle importance accordez-vous à la nourriture halal certifiée ?", type: 'choice', options: ['Uniquement halal certifié', 'Halal ou zabiha', 'Halal mais flexible', 'Important mais pas strict'] },
  { id: 24, category: 'quotidien', question: "Comment voyez-vous les soirées en couple idéales ?", type: 'text' },
  { id: 25, category: 'quotidien', question: "Préférez-vous vivre en ville ou à la campagne ?", type: 'choice', options: ['Grande ville', 'Banlieue', 'Petite ville', 'Campagne', 'Peu importe'] },
  { id: 26, category: 'quotidien', question: "Quelle place pour les animaux de compagnie ?", type: 'choice', options: ['J\'adore les animaux', 'Un chat pourquoi pas', 'Pas d\'animaux à la maison', 'À discuter'] },
  { id: 27, category: 'quotidien', question: "Comment gérez-vous votre temps libre ?", type: 'choice', options: ['Activités ensemble', 'Chacun ses hobbies', 'Mix des deux', 'Famille et proches'] },
  { id: 28, category: 'quotidien', question: "Êtes-vous ordonné(e) ou plutôt désordonné(e) ?", type: 'choice', options: ['Très ordonné(e)', 'Plutôt ordonné(e)', 'Créativement désordonné(e)', 'Décontracté(e)'] },
  { id: 29, category: 'quotidien', question: "Acceptez-vous les invités fréquents à la maison ?", type: 'choice', options: ['Oui, la maison ouverte', 'De temps en temps', 'Rarement', 'Avec accord préalable'] },
  { id: 30, category: 'quotidien', question: "Comment gérez-vous la technologie au quotidien (téléphone, réseaux sociaux) ?", type: 'text' },

  // Religion & Spiritualité (10)
  { id: 31, category: 'religion', question: "Quelle importance accordez-vous à la prière en congrégation à la mosquée ?", type: 'choice', options: ['Les 5 prières à la mosquée', 'Joumou\'a et certaines prières', 'Occasionnellement', 'Prière à la maison suffit'] },
  { id: 32, category: 'religion', question: "Suivez-vous un madhab (école juridique) particulier ?", type: 'choice', options: ['Hanafi', 'Maliki', 'Shafi\'i', 'Hanbali', 'Pas de madhab spécifique'] },
  { id: 33, category: 'religion', question: "Quelle est votre relation avec le Coran au quotidien ?", type: 'choice', options: ['Lecture quotidienne', 'Plusieurs fois par semaine', 'Occasionnellement', 'Je souhaite m\'améliorer'] },
  { id: 34, category: 'religion', question: "Comment vivez-vous le Ramadan ?", type: 'text' },
  { id: 35, category: 'religion', question: "Le port du hijab/niqab est-il important pour vous ?", type: 'choice', options: ['Hijab obligatoire', 'Hijab souhaité', 'Choix personnel', 'Pas d\'importance'] },
  { id: 36, category: 'religion', question: "Participez-vous à des cours ou cercles islamiques ?", type: 'choice', options: ['Régulièrement', 'De temps en temps', 'Rarement', 'J\'aimerais commencer'] },
  { id: 37, category: 'religion', question: "Quelle place pour la musique dans votre vie ?", type: 'choice', options: ['Aucune musique', 'Uniquement nasheeds', 'Musique modérée', 'J\'écoute de tout'] },
  { id: 38, category: 'religion', question: "Comment voyez-vous l'évolution spirituelle en couple ?", type: 'text' },
  { id: 39, category: 'religion', question: "Pratiquez-vous les jeûnes surérogatoires (lundi, jeudi, Arafat...) ?", type: 'choice', options: ['Régulièrement', 'Parfois', 'Rarement', 'Je souhaite commencer'] },
  { id: 40, category: 'religion', question: "Souhaitez-vous faire le Hajj/Omra ensemble ?", type: 'choice', options: ['Dès que possible', 'Dans les premières années', 'Un jour insha Allah', 'Déjà accompli'] },

  // Belle-Famille (10)
  { id: 41, category: 'belle-famille', question: "Seriez-vous prêt(e) à vivre avec vos beaux-parents ?", type: 'choice', options: ['Oui, avec plaisir', 'Temporairement', 'Proche mais pas ensemble', 'Non, indépendance totale'] },
  { id: 42, category: 'belle-famille', question: "À quelle fréquence rendre visite à la belle-famille ?", type: 'choice', options: ['Chaque semaine', 'Deux fois par mois', 'Une fois par mois', 'Lors des occasions'] },
  { id: 43, category: 'belle-famille', question: "Comment gérer les désaccords avec la belle-famille ?", type: 'choice', options: ['En couple d\'abord, puis ensemble', 'Chacun gère sa famille', 'Médiation d\'un ancien', 'Dialogue ouvert avec tous'] },
  { id: 44, category: 'belle-famille', question: "Quelle influence la belle-famille devrait-elle avoir sur vos décisions ?", type: 'choice', options: ['Consultative importante', 'Avis bienvenu', 'Limitée', 'Aucune, c\'est notre couple'] },
  { id: 45, category: 'belle-famille', question: "Comment réagiriez-vous si vos beaux-parents n'approuvaient pas une décision ?", type: 'text' },
  { id: 46, category: 'belle-famille', question: "Êtes-vous prêt(e) à déménager pour vous rapprocher de la belle-famille ?", type: 'choice', options: ['Oui', 'Peut-être', 'Difficilement', 'Non'] },
  { id: 47, category: 'belle-famille', question: "Comment gérer les fêtes et occasions entre les deux familles ?", type: 'choice', options: ['Alternance', 'Réunir tout le monde', 'Chacun sa famille', 'Selon les occasions'] },
  { id: 48, category: 'belle-famille', question: "Accepteriez-vous qu'un parent âgé vive chez vous ?", type: 'choice', options: ['Oui, c\'est un devoir', 'Oui, temporairement', 'Avec des conditions', 'Préfère d\'autres solutions'] },
  { id: 49, category: 'belle-famille', question: "Quelle relation souhaitez-vous avec votre belle-mère/beau-père ?", type: 'text' },
  { id: 50, category: 'belle-famille', question: "Comment gérer les cadeaux et l'aide financière aux familles ?", type: 'choice', options: ['Généreux des deux côtés', 'Équitable', 'Selon nos moyens', 'Budget dédié'] },

  // Communication (10)
  { id: 51, category: 'communication', question: "Comment exprimez-vous votre mécontentement ?", type: 'choice', options: ['J\'en parle calmement', 'J\'ai besoin de temps pour réfléchir', 'Je m\'exprime vivement', 'J\'écris mes pensées'] },
  { id: 52, category: 'communication', question: "Êtes-vous à l'aise pour parler de vos émotions ?", type: 'choice', options: ['Très à l\'aise', 'Avec effort', 'Difficilement', 'Je préfère les montrer par des actes'] },
  { id: 53, category: 'communication', question: "Comment souhaitez-vous résoudre les conflits ?", type: 'choice', options: ['Discussion immédiate', 'Pause puis discussion', 'Médiation externe si besoin', 'Ne jamais dormir fâchés'] },
  { id: 54, category: 'communication', question: "Quel est votre langage de l'amour principal ?", type: 'choice', options: ['Paroles valorisantes', 'Moments de qualité', 'Cadeaux', 'Services rendus', 'Toucher physique'] },
  { id: 55, category: 'communication', question: "Comment réagissez-vous face aux critiques ?", type: 'text' },
  { id: 56, category: 'communication', question: "À quelle fréquence souhaitez-vous des moments en tête-à-tête ?", type: 'choice', options: ['Chaque jour', 'Plusieurs fois par semaine', 'Chaque semaine', 'Quand c\'est possible'] },
  { id: 57, category: 'communication', question: "Êtes-vous prêt(e) à suivre un conseil conjugal islamique si nécessaire ?", type: 'choice', options: ['Absolument', 'Probablement', 'En dernier recours', 'Je préfère gérer en couple'] },
  { id: 58, category: 'communication', question: "Comment gérez-vous le stress ?", type: 'choice', options: ['Prière et dhikr', 'Sport', 'Discussion', 'Solitude temporaire', 'Activité créative'] },
  { id: 59, category: 'communication', question: "Partagez-vous tout avec votre conjoint(e) ou gardez-vous des jardins secrets ?", type: 'choice', options: ['Transparence totale', 'Presque tout', 'Certaines choses restent privées', 'Chacun son espace'] },
  { id: 60, category: 'communication', question: "Que signifie le respect dans un couple pour vous ?", type: 'text' },

  // Objectifs de Vie (10)
  { id: 61, category: 'objectifs', question: "Où vous voyez-vous dans 5 ans ?", type: 'text' },
  { id: 62, category: 'objectifs', question: "Souhaitez-vous vivre à l'étranger un jour ?", type: 'choice', options: ['Oui, pays musulman', 'Oui, n\'importe où', 'Peut-être temporairement', 'Non, rester ici'] },
  { id: 63, category: 'objectifs', question: "L'un de vous devrait-il arrêter de travailler pour le foyer ?", type: 'choice', options: ['La femme au foyer', 'Celui qui le souhaite', 'Non, les deux travaillent', 'Temporairement pour les enfants'] },
  { id: 64, category: 'objectifs', question: "Quel est votre rêve le plus cher ?", type: 'text' },
  { id: 65, category: 'objectifs', question: "Quelle importance accordez-vous à la carrière professionnelle ?", type: 'choice', options: ['Priorité importante', 'Importante mais après la famille', 'Secondaire', 'Moyen de subsistance'] },
  { id: 66, category: 'objectifs', question: "Souhaitez-vous entreprendre ou être salarié(e) ?", type: 'choice', options: ['Entrepreneur(e)', 'Salarié(e) stable', 'Les deux', 'Pas de préférence'] },
  { id: 67, category: 'objectifs', question: "Comment voyez-vous votre contribution à la communauté musulmane ?", type: 'text' },
  { id: 68, category: 'objectifs', question: "Êtes-vous prêt(e) à soutenir les études de votre conjoint(e) ?", type: 'choice', options: ['Absolument', 'Oui, avec organisation', 'Si les finances le permettent', 'Ce n\'est pas une priorité'] },
  { id: 69, category: 'objectifs', question: "Quel héritage souhaitez-vous laisser à vos enfants ?", type: 'choice', options: ['Valeurs islamiques fortes', 'Stabilité financière', 'Éducation excellente', 'Tout cela'] },
  { id: 70, category: 'objectifs', question: "Comment gérer un désaccord majeur sur un objectif de vie ?", type: 'choice', options: ['Compromis', 'Istikhara et patience', 'Médiation', 'Le plus sage décide'] },

  // Santé & Bien-être (10)
  { id: 71, category: 'sante', question: "Pratiquez-vous une activité sportive régulière ?", type: 'choice', options: ['Quotidiennement', 'Plusieurs fois par semaine', 'Occasionnellement', 'Rarement'] },
  { id: 72, category: 'sante', question: "Comment gérez-vous votre santé mentale ?", type: 'choice', options: ['Prière et méditation', 'Thérapie professionnelle', 'Sport et nature', 'Entourage et famille'] },
  { id: 73, category: 'sante', question: "Avez-vous des conditions de santé à partager avant le mariage ?", type: 'choice', options: ['Oui, transparence totale', 'Seulement si c\'est grave', 'C\'est personnel', 'Pas de condition particulière'] },
  { id: 74, category: 'sante', question: "Quelle est votre attitude face au tabac ?", type: 'choice', options: ['Totalement contre', 'Tolérant(e)', 'Indifférent(e)', 'Fumeur/fumeuse'] },
  { id: 75, category: 'sante', question: "Comment abordez-vous l'alimentation ?", type: 'choice', options: ['Très sain et équilibré', 'Globalement sain', 'Je mange de tout', 'Foodie assumé(e)'] },
  { id: 76, category: 'sante', question: "Que pensez-vous de la médecine prophétique (hijama, miel, nigelle...) ?", type: 'choice', options: ['J\'y crois et pratique', 'Complémentaire à la médecine', 'Sceptique', 'Pas d\'avis'] },
  { id: 77, category: 'sante', question: "Comment réagiriez-vous face à une maladie grave de votre conjoint(e) ?", type: 'text' },
  { id: 78, category: 'sante', question: "Êtes-vous favorable à la thérapie de couple ?", type: 'choice', options: ['Oui, proactivement', 'Si nécessaire', 'En dernier recours', 'Non'] },
  { id: 79, category: 'sante', question: "Quelle importance accordez-vous au sommeil et au repos ?", type: 'choice', options: ['Très importante', 'Importante', 'Flexible', 'Je dors peu'] },
  { id: 80, category: 'sante', question: "Pratiquez-vous la roqya ou y croyez-vous ?", type: 'choice', options: ['Oui, régulièrement', 'En cas de besoin', 'Sceptique', 'Pas d\'avis'] },

  // Voyages & Loisirs (10)
  { id: 81, category: 'voyages', question: "Aimez-vous voyager ?", type: 'choice', options: ['Passionné(e) de voyage', 'J\'aime bien', 'Occasionnellement', 'Casanier(e)'] },
  { id: 82, category: 'voyages', question: "Quel type de vacances préférez-vous ?", type: 'choice', options: ['Culturel et historique', 'Plage et détente', 'Aventure et nature', 'Voyage spirituel (Omra, etc.)'] },
  { id: 83, category: 'voyages', question: "Quel budget vacances annuel vous semble raisonnable ?", type: 'choice', options: ['Moins de 1000€', '1000-3000€', '3000-5000€', 'Plus de 5000€', 'Selon les moyens'] },
  { id: 84, category: 'voyages', question: "Voyager sans votre conjoint(e), c'est acceptable ?", type: 'choice', options: ['Oui, chacun ses voyages', 'Parfois, avec la famille', 'Rarement', 'Toujours ensemble'] },
  { id: 85, category: 'voyages', question: "Quels sont vos hobbies principaux ?", type: 'text' },
  { id: 86, category: 'voyages', question: "Aimez-vous recevoir du monde à la maison ?", type: 'choice', options: ['Adore, très sociable', 'De temps en temps', 'Rarement', 'Préfère sortir'] },
  { id: 87, category: 'voyages', question: "Quel est votre rapport aux réseaux sociaux ?", type: 'choice', options: ['Très actif/ve', 'Modéré', 'Minimal', 'Pas de réseaux'] },
  { id: 88, category: 'voyages', question: "Comment passez-vous un week-end idéal ?", type: 'text' },
  { id: 89, category: 'voyages', question: "Êtes-vous plutôt soirée en famille ou sortie entre amis ?", type: 'choice', options: ['Famille avant tout', 'Les deux équitablement', 'Amis régulièrement', 'Ça dépend'] },
  { id: 90, category: 'voyages', question: "Souhaitez-vous des activités de couple régulières (sport, cours, etc.) ?", type: 'choice', options: ['Oui, c\'est essentiel', 'Ce serait bien', 'Pas nécessaire', 'Chacun ses activités'] },

  // Intimité & Vie Conjugale (10)
  { id: 91, category: 'intimite', question: "Qu'est-ce que le respect de l'intimité signifie pour vous ?", type: 'text' },
  { id: 92, category: 'intimite', question: "Comment voyez-vous les rôles dans le couple ?", type: 'choice', options: ['Rôles traditionnels islamiques', 'Partenariat égalitaire', 'Complémentarité', 'Flexible selon les situations'] },
  { id: 93, category: 'intimite', question: "Quelle importance accordez-vous aux petites attentions quotidiennes ?", type: 'choice', options: ['Très importante', 'Importante', 'Appréciée mais pas essentielle', 'Les actes comptent plus'] },
  { id: 94, category: 'intimite', question: "Comment maintenir la romance dans la durée ?", type: 'text' },
  { id: 95, category: 'intimite', question: "Êtes-vous prêt(e) à évoluer et changer pour votre couple ?", type: 'choice', options: ['Absolument', 'Sur certains points', 'Difficilement', 'On doit s\'accepter comme on est'] },
  { id: 96, category: 'intimite', question: "Que pensez-vous de la polygamie ?", type: 'choice', options: ['Autorisée et acceptable', 'Autorisée mais pas pour moi', 'Seulement dans des cas spécifiques', 'Fermement contre'] },
  { id: 97, category: 'intimite', question: "Comment gérer les périodes difficiles du couple ?", type: 'choice', options: ['Patience et prière', 'Communication intense', 'Aide extérieure', 'Espace temporaire'] },
  { id: 98, category: 'intimite', question: "Quelle est votre vision du mariage en Islam ?", type: 'text' },
  { id: 99, category: 'intimite', question: "Quels sont vos dealbreakers absolus dans un mariage ?", type: 'text' },
  { id: 100, category: 'intimite', question: "Qu'attendez-vous le plus de votre futur(e) époux/épouse ?", type: 'text' },
];
