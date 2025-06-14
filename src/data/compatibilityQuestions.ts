
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
  // 1.1 Pratique religieuse
  {
    id: 1,
    question: "Je considère que la prière en commun (quand possible) renforce le lien conjugal.",
    category: "Pratique Religieuse",
    weight: 2.0,
    isBreaker: true,
    description: "La prière commune renforce l'unité spirituelle du couple."
  },
  {
    id: 2,
    question: "Je souhaite que nous nous encouragions mutuellement dans nos obligations religieuses.",
    category: "Pratique Religieuse",
    weight: 2.0,
    isBreaker: true,
    description: "L'entraide spirituelle est essentielle dans un mariage islamique."
  },
  {
    id: 3,
    question: "Il est important pour moi que nous lisions le Coran ensemble régulièrement.",
    category: "Pratique Religieuse",
    weight: 1.8,
    isBreaker: false,
    description: "La lecture commune du Coran enrichit la spiritualité conjugale."
  },
  {
    id: 4,
    question: "Je pense que les invocations (du'a) en couple sont essentielles.",
    category: "Pratique Religieuse",
    weight: 1.7,
    isBreaker: false,
    description: "Les invocations communes renforcent la spiritualité du couple."
  },
  {
    id: 5,
    question: "Nous devrions jeûner ensemble pendant le Ramadan quand c'est possible.",
    category: "Pratique Religieuse",
    weight: 1.6,
    isBreaker: false,
    description: "Le jeûne commun renforce la discipline spirituelle."
  },

  // 1.2 Objectifs spirituels communs
  {
    id: 6,
    question: "Notre mariage doit nous rapprocher d'Allah (SWT).",
    category: "Objectifs Spirituels",
    weight: 2.0,
    isBreaker: true,
    description: "Le mariage doit être un moyen d'amélioration spirituelle."
  },
  {
    id: 7,
    question: "Je veux que nous nous aidions mutuellement à devenir de meilleurs musulmans.",
    category: "Objectifs Spirituels",
    weight: 1.9,
    isBreaker: true,
    description: "L'amélioration spirituelle mutuelle est fondamentale."
  },
  {
    id: 8,
    question: "Accomplir le Hajj ensemble est un objectif important pour moi.",
    category: "Objectifs Spirituels",
    weight: 1.5,
    isBreaker: false,
    description: "Le pèlerinage ensemble renforce les liens spirituels."
  },
  {
    id: 9,
    question: "Étudier l'Islam ensemble renforcerait notre union.",
    category: "Objectifs Spirituels",
    weight: 1.6,
    isBreaker: false,
    description: "L'apprentissage religieux commun enrichit le couple."
  },
  {
    id: 10,
    question: "Je souhaite que notre foyer soit un exemple de piété.",
    category: "Objectifs Spirituels",
    weight: 1.7,
    isBreaker: false,
    description: "Être un exemple pour la communauté est important."
  },

  // 2. RÔLES ET RESPONSABILITÉS CONJUGALES
  // 2.1 Rôles selon la Sunna
  {
    id: 11,
    question: "Je comprends et accepte les responsabilités de l'époux selon l'Islam (qiwama).",
    category: "Rôles selon la Sunna",
    weight: 1.9,
    isBreaker: true,
    description: "Comprendre les rôles selon l'Islam est fondamental."
  },
  {
    id: 12,
    question: "Je comprends et accepte les responsabilités de l'épouse selon l'Islam.",
    category: "Rôles selon la Sunna",
    weight: 1.9,
    isBreaker: true,
    description: "Accepter les responsabilités religieuses est essentiel."
  },
  {
    id: 13,
    question: "Les décisions importantes doivent être prises par consultation mutuelle (shoura).",
    category: "Rôles selon la Sunna",
    weight: 1.8,
    isBreaker: false,
    description: "La consultation mutuelle est recommandée en Islam."
  },
  {
    id: 14,
    question: "L'homme a la responsabilité de subvenir aux besoins du foyer.",
    category: "Rôles selon la Sunna",
    weight: 1.8,
    isBreaker: true,
    description: "La responsabilité financière de l'homme est établie."
  },
  {
    id: 15,
    question: "La femme a le droit de conserver ses biens personnels.",
    category: "Rôles selon la Sunna",
    weight: 1.6,
    isBreaker: false,
    description: "Les droits financiers de la femme sont protégés."
  },

  // 2.2 Équilibre et complémentarité
  {
    id: 16,
    question: "Nous devons nous compléter dans nos forces et faiblesses.",
    category: "Complémentarité",
    weight: 1.7,
    isBreaker: false,
    description: "La complémentarité enrichit le couple."
  },
  {
    id: 17,
    question: "Je respecte l'autorité religieuse de mon époux/épouse dans leur domaine.",
    category: "Complémentarité",
    weight: 1.5,
    isBreaker: false,
    description: "Le respect mutuel des compétences est important."
  },
  {
    id: 18,
    question: "Les tâches ménagères peuvent être partagées selon les circonstances.",
    category: "Complémentarité",
    weight: 1.4,
    isBreaker: false,
    description: "La flexibilité dans les tâches est acceptable."
  },
  {
    id: 19,
    question: "Chacun doit contribuer selon ses capacités au bien-être familial.",
    category: "Complémentarité",
    weight: 1.6,
    isBreaker: false,
    description: "La contribution selon les capacités est équitable."
  },
  {
    id: 20,
    question: "L'entraide mutuelle est plus importante que les rôles strictement définis.",
    category: "Complémentarité",
    weight: 1.5,
    isBreaker: false,
    description: "L'entraide prime sur la rigidité des rôles."
  },

  // 3. COMMUNICATION ET COMPORTEMENT
  // 3.1 Modalités de communication
  {
    id: 21,
    question: "Nous devons toujours nous parler avec respect et douceur.",
    category: "Communication",
    weight: 1.9,
    isBreaker: true,
    description: "Le respect mutuel est un pilier du mariage islamique."
  },
  {
    id: 22,
    question: "Les critiques doivent être constructives et bienveillantes.",
    category: "Communication",
    weight: 1.7,
    isBreaker: false,
    description: "La bienveillance dans les critiques est essentielle."
  },
  {
    id: 23,
    question: "Il faut éviter les paroles blessantes même en colère.",
    category: "Communication",
    weight: 1.8,
    isBreaker: false,
    description: "Contrôler ses paroles même dans la colère."
  },
  {
    id: 24,
    question: "Écouter attentivement son conjoint est un devoir religieux.",
    category: "Communication",
    weight: 1.6,
    isBreaker: false,
    description: "L'écoute active est une obligation morale."
  },
  {
    id: 25,
    question: "Les problèmes doivent être résolus par le dialogue, pas le silence.",
    category: "Communication",
    weight: 1.7,
    isBreaker: false,
    description: "Le dialogue est préférable au silence."
  },

  // 3.2 Gestion des conflits
  {
    id: 26,
    question: "Nous ne devons jamais nous coucher en étant fâchés l'un contre l'autre.",
    category: "Gestion des Conflits",
    weight: 1.6,
    isBreaker: false,
    description: "Résoudre les conflits rapidement préserve l'harmonie."
  },
  {
    id: 27,
    question: "Demander pardon est un signe de force, pas de faiblesse.",
    category: "Gestion des Conflits",
    weight: 1.5,
    isBreaker: false,
    description: "L'humilité et le pardon renforcent le couple."
  },
  {
    id: 28,
    question: "Les médiateurs familiaux peuvent nous aider en cas de gros conflit.",
    category: "Gestion des Conflits",
    weight: 1.4,
    isBreaker: false,
    description: "Accepter l'aide extérieure est sage."
  },
  {
    id: 29,
    question: "Chacun doit reconnaître ses erreurs et s'améliorer.",
    category: "Gestion des Conflits",
    weight: 1.6,
    isBreaker: false,
    description: "La reconnaissance des erreurs favorise la croissance."
  },
  {
    id: 30,
    question: "La réconciliation doit toujours être recherchée avant toute séparation.",
    category: "Gestion des Conflits",
    weight: 1.8,
    isBreaker: true,
    description: "Épuiser toutes les possibilités de réconciliation."
  },

  // 4. ASPECTS FINANCIERS ET MATÉRIELS
  // 4.1 Gestion financière
  {
    id: 31,
    question: "Le mari doit assurer la nafaqah (entretien) de son épouse.",
    category: "Gestion Financière",
    weight: 1.8,
    isBreaker: true,
    description: "La nafaqah est une obligation religieuse de l'époux."
  },
  {
    id: 32,
    question: "L'épouse peut contribuer financièrement si elle le souhaite.",
    category: "Gestion Financière",
    weight: 1.4,
    isBreaker: false,
    description: "La contribution volontaire de l'épouse est acceptée."
  },
  {
    id: 33,
    question: "Les décisions financières importantes doivent être communes.",
    category: "Gestion Financière",
    weight: 1.7,
    isBreaker: false,
    description: "La consultation financière renforce l'unité."
  },
  {
    id: 34,
    question: "Nous devons éviter les dépenses excessives (israf).",
    category: "Gestion Financière",
    weight: 1.5,
    isBreaker: false,
    description: "L'Islam encourage la modération dans les dépenses."
  },
  {
    id: 35,
    question: "La zakat et les aumônes sont prioritaires dans notre budget.",
    category: "Gestion Financière",
    weight: 1.6,
    isBreaker: false,
    description: "Les obligations religieuses financières sont prioritaires."
  },

  // 4.2 Mode de vie
  {
    id: 36,
    question: "Nous préférons une vie simple plutôt que le luxe excessif.",
    category: "Mode de Vie",
    weight: 1.4,
    isBreaker: false,
    description: "La simplicité est une vertu islamique."
  },
  {
    id: 37,
    question: "Économiser pour l'avenir est important pour notre famille.",
    category: "Mode de Vie",
    weight: 1.5,
    isBreaker: false,
    description: "La prévoyance financière est sage."
  },
  {
    id: 38,
    question: "Aider nos familles respectives financièrement est un devoir.",
    category: "Mode de Vie",
    weight: 1.6,
    isBreaker: false,
    description: "L'aide aux familles est un devoir religieux."
  },
  {
    id: 39,
    question: "Investir dans l'éducation religieuse a la priorité.",
    category: "Mode de Vie",
    weight: 1.7,
    isBreaker: false,
    description: "L'éducation religieuse est un investissement prioritaire."
  },
  {
    id: 40,
    question: "Nous devons être transparents sur nos finances.",
    category: "Mode de Vie",
    weight: 1.6,
    isBreaker: false,
    description: "La transparence financière renforce la confiance."
  },

  // 5. ÉDUCATION DES ENFANTS
  // 5.1 Principes éducatifs
  {
    id: 41,
    question: "L'éducation religieuse de nos enfants est notre priorité absolue.",
    category: "Éducation des Enfants",
    weight: 2.0,
    isBreaker: true,
    description: "L'éducation islamique des enfants est primordiale."
  },
  {
    id: 42,
    question: "Nous devons enseigner l'arabe et le Coran à nos enfants.",
    category: "Éducation des Enfants",
    weight: 1.8,
    isBreaker: false,
    description: "L'apprentissage de l'arabe et du Coran est essentiel."
  },
  {
    id: 43,
    question: "L'éducation des garçons et des filles est également importante.",
    category: "Éducation des Enfants",
    weight: 1.7,
    isBreaker: false,
    description: "L'égalité dans l'éducation des enfants."
  },
  {
    id: 44,
    question: "Nous devons être des modèles de comportement islamique.",
    category: "Éducation des Enfants",
    weight: 1.8,
    isBreaker: false,
    description: "L'exemple parental est fondamental."
  },
  {
    id: 45,
    question: "La discipline doit être juste et mesurée selon la Sunna.",
    category: "Éducation des Enfants",
    weight: 1.6,
    isBreaker: false,
    description: "La discipline équilibrée selon les enseignements prophétiques."
  },

  // 5.2 Transmission des valeurs
  {
    id: 46,
    question: "Nos enfants doivent apprendre le respect des parents (birr al-walidayn).",
    category: "Transmission des Valeurs",
    weight: 1.8,
    isBreaker: false,
    description: "Le respect des parents est un pilier de l'Islam."
  },
  {
    id: 47,
    question: "L'honnêteté et la sincérité doivent être inculquées dès le plus jeune âge.",
    category: "Transmission des Valeurs",
    weight: 1.7,
    isBreaker: false,
    description: "Les valeurs morales fondamentales."
  },
  {
    id: 48,
    question: "Nos enfants doivent connaître leur héritage islamique.",
    category: "Transmission des Valeurs",
    weight: 1.6,
    isBreaker: false,
    description: "La connaissance de l'héritage culturel et religieux."
  },
  {
    id: 49,
    question: "L'équilibre entre éducation religieuse et séculaire est important.",
    category: "Transmission des Valeurs",
    weight: 1.5,
    isBreaker: false,
    description: "Équilibrer les deux types d'éducation."
  },
  {
    id: 50,
    question: "Nous devons préparer nos enfants à être de bons musulmans dans la société.",
    category: "Transmission des Valeurs",
    weight: 1.7,
    isBreaker: false,
    description: "Intégration harmonieuse dans la société."
  },

  // 6. RELATIONS FAMILIALES ET SOCIALES
  // 6.1 Relations avec les belle-familles
  {
    id: 51,
    question: "Respecter et honorer les parents de mon conjoint est un devoir.",
    category: "Relations Familiales",
    weight: 1.7,
    isBreaker: false,
    description: "Le respect des beaux-parents est important en Islam."
  },
  {
    id: 52,
    question: "Maintenir de bonnes relations avec la famille élargie est important.",
    category: "Relations Familiales",
    weight: 1.5,
    isBreaker: false,
    description: "Les liens familiaux élargis renforcent l'unité."
  },
  {
    id: 53,
    question: "En cas de conflit familial, la sagesse et la patience sont nécessaires.",
    category: "Relations Familiales",
    weight: 1.6,
    isBreaker: false,
    description: "Gérer les conflits familiaux avec sagesse."
  },
  {
    id: 54,
    question: "L'épouse doit respecter la famille de son mari et vice versa.",
    category: "Relations Familiales",
    weight: 1.6,
    isBreaker: false,
    description: "Le respect mutuel des familles."
  },
  {
    id: 55,
    question: "Les visites familiales doivent être équilibrées entre les deux familles.",
    category: "Relations Familiales",
    weight: 1.4,
    isBreaker: false,
    description: "L'équité dans les relations familiales."
  },

  // 6.2 Vie sociale et communautaire
  {
    id: 56,
    question: "Participer aux activités de la communauté musulmane est important.",
    category: "Vie Sociale",
    weight: 1.4,
    isBreaker: false,
    description: "L'engagement communautaire renforce la foi."
  },
  {
    id: 57,
    question: "Nos amitiés doivent être choisies selon les critères islamiques.",
    category: "Vie Sociale",
    weight: 1.5,
    isBreaker: false,
    description: "Choisir des amis qui renforcent la foi."
  },
  {
    id: 58,
    question: "Nous devons donner l'exemple d'un couple musulman uni.",
    category: "Vie Sociale",
    weight: 1.6,
    isBreaker: false,
    description: "Être un exemple pour la communauté."
  },
  {
    id: 59,
    question: "Aider les nécessiteux de notre communauté est un devoir.",
    category: "Vie Sociale",
    weight: 1.5,
    isBreaker: false,
    description: "La solidarité communautaire est importante."
  },
  {
    id: 60,
    question: "Inviter et recevoir selon la tradition prophétique renforce les liens.",
    category: "Vie Sociale",
    weight: 1.3,
    isBreaker: false,
    description: "L'hospitalité selon la Sunna."
  },

  // 7. INTIMITÉ ET VIE PRIVÉE
  // 7.1 Respect mutuel dans l'intimité
  {
    id: 61,
    question: "L'intimité conjugale est un droit et un devoir mutuels.",
    category: "Intimité",
    weight: 1.8,
    isBreaker: true,
    description: "L'intimité conjugale est reconnue comme un droit mutuel en Islam."
  },
  {
    id: 62,
    question: "La pudeur et le respect doivent toujours être préservés.",
    category: "Intimité",
    weight: 1.7,
    isBreaker: false,
    description: "La pudeur est une valeur centrale de l'Islam."
  },
  {
    id: 63,
    question: "Les besoins de chacun doivent être pris en considération avec bienveillance.",
    category: "Intimité",
    weight: 1.6,
    isBreaker: false,
    description: "La considération mutuelle dans l'intimité."
  },
  {
    id: 64,
    question: "La communication ouverte sur ces sujets, dans le respect, est importante.",
    category: "Intimité",
    weight: 1.5,
    isBreaker: false,
    description: "Communication respectueuse sur l'intimité."
  },
  {
    id: 65,
    question: "Les enseignements prophétiques sur l'intimité doivent être suivis.",
    category: "Intimité",
    weight: 1.7,
    isBreaker: false,
    description: "Suivre les guidance prophétiques."
  },

  // 7.2 Pudeur et comportement
  {
    id: 66,
    question: "Maintenir sa présentation et son hygiène est un respect mutuel.",
    category: "Pudeur",
    weight: 1.4,
    isBreaker: false,
    description: "L'hygiène et la présentation sont importantes."
  },
  {
    id: 67,
    question: "La discrétion sur notre vie privée est essentielle.",
    category: "Pudeur",
    weight: 1.6,
    isBreaker: false,
    description: "Protéger l'intimité du couple."
  },
  {
    id: 68,
    question: "Se parfumer et se parer pour son conjoint est recommandé.",
    category: "Pudeur",
    weight: 1.3,
    isBreaker: false,
    description: "Se faire beau pour son conjoint est encouragé."
  },
  {
    id: 69,
    question: "Respecter les moments d'intimité et de solitude de chacun.",
    category: "Pudeur",
    weight: 1.4,
    isBreaker: false,
    description: "Respecter l'espace personnel."
  },
  {
    id: 70,
    question: "La tendresse et l'affection doivent s'exprimer quotidiennement.",
    category: "Pudeur",
    weight: 1.5,
    isBreaker: false,
    description: "Exprimer l'affection au quotidien."
  },

  // 8. PROJETS DE VIE ET OBJECTIFS COMMUNS
  // 8.1 Aspirations spirituelles
  {
    id: 71,
    question: "Nous voulons que notre mariage soit béni dans cette vie et l'au-delà.",
    category: "Aspirations Spirituelles",
    weight: 2.0,
    isBreaker: true,
    description: "Le mariage doit viser la satisfaction d'Allah."
  },
  {
    id: 72,
    question: "Devenir des époux comme ceux décrits dans le Coran est notre objectif.",
    category: "Aspirations Spirituelles",
    weight: 1.8,
    isBreaker: false,
    description: "Aspirer à l'idéal coranique du couple."
  },
  {
    id: 73,
    question: "Nous souhaitons que notre descendance soit pieuse et bénie.",
    category: "Aspirations Spirituelles",
    weight: 1.7,
    isBreaker: false,
    description: "Aspirer à une descendance pieuse."
  },
  {
    id: 74,
    question: "Contribuer positivement à la Ummah est important pour nous.",
    category: "Aspirations Spirituelles",
    weight: 1.6,
    isBreaker: false,
    description: "Servir la communauté musulmane."
  },
  {
    id: 75,
    question: "Nous voulons mourir en état de foi et être réunis au Paradis.",
    category: "Aspirations Spirituelles",
    weight: 1.9,
    isBreaker: false,
    description: "L'objectif ultime spirituel."
  },

  // 8.2 Réalisations terrestres
  {
    id: 76,
    question: "Équilibrer notre réussite professionnelle avec nos devoirs religieux.",
    category: "Réalisations Terrestres",
    weight: 1.6,
    isBreaker: false,
    description: "L'équilibre entre dunya et akhira est important."
  },
  {
    id: 77,
    question: "Posséder une maison où pratiquer librement notre religion.",
    category: "Réalisations Terrestres",
    weight: 1.5,
    isBreaker: false,
    description: "Un foyer propice à la pratique religieuse."
  },
  {
    id: 78,
    question: "Voyager ensemble pour découvrir l'héritage islamique.",
    category: "Réalisations Terrestres",
    weight: 1.3,
    isBreaker: false,
    description: "Explorer l'héritage islamique ensemble."
  },
  {
    id: 79,
    question: "Construire un héritage positif pour nos enfants et petits-enfants.",
    category: "Réalisations Terrestres",
    weight: 1.6,
    isBreaker: false,
    description: "Laisser un héritage positif."
  },
  {
    id: 80,
    question: "Vieillir ensemble dans la dignité et la piété.",
    category: "Réalisations Terrestres",
    weight: 1.7,
    isBreaker: false,
    description: "Vieillir ensemble dans la foi."
  },

  // 9. DÉFIS ET ÉPREUVES
  // 9.1 Face aux difficultés
  {
    id: 81,
    question: "Les épreuves d'Allah doivent nous rapprocher, pas nous séparer.",
    category: "Face aux Difficultés",
    weight: 1.8,
    isBreaker: false,
    description: "Les épreuves testent et renforcent la foi du couple."
  },
  {
    id: 82,
    question: "Nous devons nous soutenir mutuellement dans la maladie.",
    category: "Face aux Difficultés",
    weight: 1.7,
    isBreaker: false,
    description: "Le soutien mutuel dans l'adversité."
  },
  {
    id: 83,
    question: "La patience (sabr) est essentielle face aux difficultés financières.",
    category: "Face aux Difficultés",
    weight: 1.6,
    isBreaker: false,
    description: "La patience dans les difficultés économiques."
  },
  {
    id: 84,
    question: "Prier ensemble lors des moments difficiles renforce notre union.",
    category: "Face aux Difficultés",
    weight: 1.7,
    isBreaker: false,
    description: "La prière commune dans l'adversité."
  },
  {
    id: 85,
    question: "Accepter le qadar (destin) d'Allah ensemble nous unit.",
    category: "Face aux Difficultés",
    weight: 1.6,
    isBreaker: false,
    description: "Accepter ensemble la volonté divine."
  },

  // 9.2 Croissance personnelle
  {
    id: 86,
    question: "Nous devons nous aider à corriger nos défauts.",
    category: "Croissance Personnelle",
    weight: 1.6,
    isBreaker: false,
    description: "L'amélioration mutuelle est un objectif du mariage."
  },
  {
    id: 87,
    question: "Accepter les critiques constructives avec humilité.",
    category: "Croissance Personnelle",
    weight: 1.5,
    isBreaker: false,
    description: "L'humilité face aux conseils."
  },
  {
    id: 88,
    question: "Chercher constamment à s'améliorer pour plaire à Allah et à son conjoint.",
    category: "Croissance Personnelle",
    weight: 1.7,
    isBreaker: false,
    description: "L'amélioration continue pour Allah et le conjoint."
  },
  {
    id: 89,
    question: "Apprendre de nos erreurs et ne pas les répéter.",
    category: "Croissance Personnelle",
    weight: 1.5,
    isBreaker: false,
    description: "Tirer des leçons de ses erreurs."
  },
  {
    id: 90,
    question: "Grandir spirituellement ensemble tout au long de notre vie.",
    category: "Croissance Personnelle",
    weight: 1.6,
    isBreaker: false,
    description: "La croissance spirituelle continue."
  },

  // 10. ENGAGEMENT ET FIDÉLITÉ
  // 10.1 Fidélité et loyauté
  {
    id: 91,
    question: "La fidélité absolue est un pilier non négociable de notre mariage.",
    category: "Fidélité",
    weight: 2.0,
    isBreaker: true,
    description: "La fidélité est fondamentale dans le mariage islamique."
  },
  {
    id: 92,
    question: "Protéger l'honneur et la réputation de mon conjoint est primordial.",
    category: "Fidélité",
    weight: 1.8,
    isBreaker: false,
    description: "Protéger l'honneur mutuel."
  },
  {
    id: 93,
    question: "Ne jamais trahir la confiance de mon époux/épouse.",
    category: "Fidélité",
    weight: 1.9,
    isBreaker: true,
    description: "La confiance est sacrée."
  },
  {
    id: 94,
    question: "Éviter toute situation qui pourrait mener à l'infidélité.",
    category: "Fidélité",
    weight: 1.8,
    isBreaker: false,
    description: "Prévenir les situations à risque."
  },
  {
    id: 95,
    question: "Considérer notre mariage comme un amanah (dépôt sacré) d'Allah.",
    category: "Fidélité",
    weight: 1.9,
    isBreaker: true,
    description: "Le mariage comme responsabilité divine."
  },

  // 10.2 Engagement à long terme
  {
    id: 96,
    question: "Notre mariage doit durer jusqu'à la mort, inch'Allah.",
    category: "Engagement Long Terme",
    weight: 1.9,
    isBreaker: true,
    description: "L'engagement à vie est l'idéal du mariage islamique."
  },
  {
    id: 97,
    question: "Nous devons tout faire pour préserver notre union.",
    category: "Engagement Long Terme",
    weight: 1.8,
    isBreaker: false,
    description: "Préserver l'union par tous les moyens."
  },
  {
    id: 98,
    question: "Le divorce ne doit être envisagé qu'en dernier recours extrême.",
    category: "Engagement Long Terme",
    weight: 1.8,
    isBreaker: true,
    description: "Le divorce comme dernier recours."
  },
  {
    id: 99,
    question: "Renouveler constamment notre engagement l'un envers l'autre.",
    category: "Engagement Long Terme",
    weight: 1.6,
    isBreaker: false,
    description: "Renouveler l'engagement mutuel."
  },
  {
    id: 100,
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
