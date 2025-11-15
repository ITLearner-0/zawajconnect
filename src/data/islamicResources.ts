import { IslamicResource, ResourceCategory } from '@/types/resources';

export const resourceCategories: ResourceCategory[] = [
  {
    id: 'marriage-prep',
    name: 'Préparation au Mariage',
    description: 'Ressources pour vous aider à préparer le mariage selon les principes islamiques',
    icon: 'book-heart',
  },
  {
    id: 'communication',
    name: 'Communication',
    description: "Apprendre les compétences de communication efficaces d'un point de vue islamique",
    icon: 'message-square',
  },
  {
    id: 'fiqh',
    name: 'Fiqh du Mariage',
    description: 'Comprendre la jurisprudence islamique relative au mariage',
    icon: 'scale',
  },
  {
    id: 'compatibility',
    name: 'Compatibilité',
    description: 'Trouver le bon conjoint selon les conseils islamiques',
    icon: 'heart-handshake',
  },
  {
    id: 'family',
    name: 'Vie de Famille',
    description: 'Construire une famille réussie selon les principes coraniques et la Sunna',
    icon: 'home',
  },
];

export const islamicResources: IslamicResource[] = [
  {
    id: '1',
    title: 'Choisir un Conjoint : La Voie Islamique',
    description:
      "Apprenez les critères islamiques pour sélectionner un conjoint et l'importance du caractère et de l'engagement religieux.",
    category: 'marriage-prep',
    author: 'Dr. Yasir Qadhi',
    contentType: 'article',
    content:
      "Lorsque l'on choisit un conjoint en Islam, le Prophète Muhammad (paix sur lui) nous a enseigné de prioriser l'engagement religieux et le caractère avant tout. Il a dit : 'Une femme est épousée pour quatre choses : sa richesse, son statut familial, sa beauté et sa religion. Choisissez celle qui est religieuse, que vos mains soient couvertes de poussière !' (Bukhari et Muslim)...",
    imageUrl: '/placeholder.svg',
    tags: ['sélection conjoint', 'critères mariage', 'mariage islamique'],
    createdAt: '2023-10-15',
    featured: true,
  },
  {
    id: '2',
    title: 'Les Droits et Responsabilités dans le Mariage',
    description: 'Comprendre les droits et responsabilités mutuels des époux en Islam.',
    category: 'fiqh',
    author: 'Sh. Omar Suleiman',
    contentType: 'article',
    content:
      "Le mariage en Islam est un pacte sacré qui établit des droits et responsabilités pour les deux époux. Allah dit dans le Coran : 'Et elles ont des droits équivalents à leurs obligations, conformément à la bienséance. Mais les hommes ont cependant une prédominance sur elles. Et Allah est Puissant et Sage.' (Coran 2:228)...",
    imageUrl: '/placeholder.svg',
    tags: ['droits mariage', 'responsabilités', 'fiqh islamique'],
    createdAt: '2023-09-20',
  },
  {
    id: '3',
    title: 'Communication Efficace entre Époux',
    description:
      'Conseils pratiques sur les compétences de communication basées sur les principes islamiques.',
    category: 'communication',
    author: 'Sr. Yasmin Mogahed',
    contentType: 'guide',
    content:
      "La communication est le fondement d'un mariage réussi. Le Prophète Muhammad (paix sur lui) était le meilleur exemple de communication efficace avec ses épouses. Il écoutait attentivement, parlait avec bonté et n'élevait jamais la voix par colère...",
    imageUrl: '/placeholder.svg',
    tags: ['communication', 'conseils mariage', 'résolution conflits'],
    createdAt: '2023-08-05',
  },
  {
    id: '4',
    title: 'Planification Financière pour les Couples Musulmans',
    description:
      'Directives islamiques sur la gestion des finances dans le mariage et éviter les pièges courants.',
    category: 'marriage-prep',
    author: 'Dr. Main Al-Qudah',
    contentType: 'guide',
    url: 'https://example.com/financial-planning',
    imageUrl: '/placeholder.svg',
    tags: ['finances', 'gestion patrimoine', 'planification'],
    createdAt: '2023-11-10',
  },
  {
    id: '5',
    title: 'Les Étiquettes de la Nuit de Noces',
    description: 'Guidance islamique pour les nouveaux mariés lors de leur nuit de noces.',
    category: 'marriage-prep',
    author: 'Ustadha Zaynab Ansari',
    contentType: 'article',
    content:
      "La nuit de noces est un moment spécial dans la vie d'un couple. L'Islam fournit de beaux conseils pour s'assurer que cette expérience intime soit confortable et bénie. Commencez au nom d'Allah, offrez un repas léger, priez deux rakats ensemble, et faites des invocations pour la bénédiction de votre union...",
    imageUrl: '/placeholder.svg',
    tags: ['nuit de noces', 'intimité', 'nouveaux mariés'],
    createdAt: '2023-07-22',
  },
  {
    id: '6',
    title: 'Résolution de Conflits dans le Mariage : La Voie Prophétique',
    description:
      'Apprenez comment le Prophète Muhammad (PSL) résolvait les conflits avec ses épouses.',
    category: 'communication',
    author: 'Sh. Abdul Nasir Jangda',
    contentType: 'video',
    url: 'https://example.com/conflict-resolution',
    imageUrl: '/placeholder.svg',
    tags: ['résolution conflits', 'exemple prophétique', 'disputes maritales'],
    createdAt: '2023-12-05',
  },
  {
    id: '7',
    title: 'Comprendre la Compatibilité au-delà des Traits Superficiels',
    description:
      'Perspective islamique sur ce qui rend les couples vraiment compatibles pour un mariage durable.',
    category: 'compatibility',
    author: 'Dr. Mohammad Akram Nadwi',
    contentType: 'article',
    content:
      "La compatibilité dans le mariage va au-delà de l'attraction physique ou du statut social. Le Prophète Muhammad (paix sur lui) a souligné le kafa'ah (compatibilité) en termes d'engagement religieux, de caractère et de valeurs. Cet article explore comment évaluer la compatibilité d'un point de vue islamique...",
    imageUrl: '/placeholder.svg',
    tags: ['compatibilité', 'sélection conjoint', 'succès mariage'],
    createdAt: '2023-10-30',
  },
  {
    id: '8',
    title: 'Le Rôle du Wali dans le Mariage',
    description: "Comprendre l'importance et les responsabilités du tuteur matrimonial en Islam.",
    category: 'fiqh',
    author: 'Sh. Yasir Birjas',
    contentType: 'guide',
    content:
      "Le wali (tuteur) joue un rôle crucial dans les mariages islamiques, particulièrement pour les femmes. Ce guide explique les qualifications d'un wali, leurs responsabilités, et la sagesse derrière cette exigence dans la loi islamique...",
    imageUrl: '/placeholder.svg',
    tags: ['wali', 'tuteur', 'mariage islamique'],
    createdAt: '2023-09-15',
    featured: true,
  },
  {
    id: '9',
    title: 'Planification Financière dans le Mariage Islamique',
    description:
      'Apprenez comment gérer les finances en tant que couple musulman selon les principes de la Charia.',
    category: 'marriage-prep',
    author: 'Dr. Hatem al-Haj',
    contentType: 'guide',
    content:
      "La gestion financière dans le mariage est un aspect crucial que beaucoup de couples négligent. L'Islam fournit des conseils complets sur la façon dont les époux doivent gérer leur richesse. Ce guide couvre des sujets comme les responsabilités financières du mari, comptes joints vs comptes séparés, budgétisation selon les principes islamiques, éviter le riba (intérêt), et investir dans des opportunités halal...",
    imageUrl: '/placeholder.svg',
    tags: ['finances', 'investissement halal', 'budgétisation', 'gestion patrimoine'],
    createdAt: '2023-11-25',
  },
  {
    id: '10',
    title: "L'Exemple du Prophète ﷺ en tant qu'Époux",
    description:
      "Leçons pratiques de la vie conjugale du Prophète Muhammad ﷺ que les couples peuvent appliquer aujourd'hui.",
    category: 'communication',
    author: 'Ustadha Hosai Mojaddidi',
    contentType: 'article',
    content:
      "Le Prophète Muhammad ﷺ était le meilleur des exemples dans tous les aspects de la vie, y compris dans la façon dont il traitait ses épouses. Il aidait aux tâches ménagères, s'engageait dans des activités ludiques avec ses épouses, et les consultait dans les affaires importantes. Aisha (RA) a rapporté : 'Le Prophète ﷺ avait l'habitude de réparer ses chaussures, coudre ses vêtements et travailler de ses mains comme n'importe lequel d'entre vous travaille dans sa maison.' Cet article explore les façons pratiques dont les couples modernes peuvent mettre en œuvre ces exemples prophétiques...",
    imageUrl: '/placeholder.svg',
    tags: ['exemple prophétique', 'sunna', 'harmonie maritale'],
    createdAt: '2023-10-12',
    featured: true,
  },
  {
    id: '11',
    title: 'Comprendre le Concept de Mahr en Islam',
    description:
      'Un guide complet sur le mahr (dot) dans les mariages islamiques - son but, ses types, et ses applications modernes.',
    category: 'fiqh',
    author: 'Sh. Joe Bradford',
    contentType: 'guide',
    content:
      "Le mahr est un élément essentiel du contrat de mariage islamique. C'est un cadeau du mari à sa femme au moment du mariage, symbolisant le respect, l'honneur et la sécurité financière. Ce guide explore les règles de fiqh liées au mahr des différents madhabs, discute des montants raisonnables dans le contexte actuel, et aborde les problèmes courants que les couples rencontrent concernant les négociations de dot...",
    imageUrl: '/placeholder.svg',
    tags: ['mahr', 'dot', 'fiqh islamique', 'contrat mariage'],
    createdAt: '2023-09-30',
  },
  {
    id: '12',
    title: "Conseil Prénuptial d'une Perspective Islamique",
    description:
      "L'importance du conseil avant le mariage et comment il s'aligne avec les valeurs islamiques de préparation et de compatibilité.",
    category: 'compatibility',
    author: 'Dr. Mariam Tanwir',
    contentType: 'video',
    url: 'https://example.com/premarital-counseling',
    imageUrl: '/placeholder.svg',
    tags: ['conseil', 'préparation', 'compatibilité'],
    createdAt: '2023-12-15',
  },
  {
    id: '13',
    title: 'Élever des Enfants dans une Société Occidentale : Directives Islamiques',
    description:
      "Équilibrer les valeurs islamiques et la culture occidentale lors de l'éducation des enfants musulmans.",
    category: 'family',
    author: 'Imam Suhaib Webb',
    contentType: 'article',
    content:
      "L'un des plus grands défis auxquels font face les parents musulmans dans les pays occidentaux est d'élever des enfants qui maintiennent leur identité islamique tout en naviguant dans la culture environnante. Cet article fournit des conseils pratiques sur l'établissement de fondations islamiques à la maison, la gestion des influences scolaires et médiatiques, la construction d'une communauté de soutien, et le maintien d'une communication ouverte avec les enfants au fur et à mesure qu'ils grandissent...",
    imageUrl: '/placeholder.svg',
    tags: ['parentalité', 'enfants', 'société occidentale', 'identité islamique'],
    createdAt: '2024-01-05',
    featured: true,
  },
  {
    id: '14',
    title: "L'Art du Désaccord dans le Mariage",
    description: 'Étiquettes islamiques pour gérer les conflits et désaccords entre époux.',
    category: 'communication',
    author: 'Sr. Dalia Mogahed',
    contentType: 'guide',
    content:
      "Les conflits sont inévitables dans toute relation, y compris le mariage. Ce qui compte, c'est comment les couples gèrent ces désaccords. Ce guide explore l'approche islamique de la résolution de conflits entre époux, puisant dans les conseils coraniques et les exemples prophétiques. Les sujets incluent le contrôle de la colère, parler respectueusement, se concentrer sur les problèmes plutôt que sur les personnalités, le bon moment pour les discussions, et rechercher la réconciliation...",
    imageUrl: '/placeholder.svg',
    tags: ['résolution conflits', 'communication', 'harmonie maritale'],
    createdAt: '2024-02-10',
  },
  {
    id: '15',
    title: "L'Intimité dans le Mariage : Une Perspective Islamique",
    description:
      "Comprendre l'intimité physique et émotionnelle dans les limites halal du mariage.",
    category: 'marriage-prep',
    author: 'Dr. Ekram & Dr. Mohamed Rida Beshir',
    contentType: 'book',
    url: 'https://example.com/intimacy-book',
    imageUrl: '/placeholder.svg',
    tags: ['intimité', 'relations maritales', 'connexion émotionnelle'],
    createdAt: '2023-08-22',
  },
  {
    id: '16',
    title: "Défis de l'Ère Numérique dans les Mariages Musulmans",
    description:
      "Aborder des questions comme les réseaux sociaux, la confidentialité numérique, et le temps d'écran dans les mariages musulmans modernes.",
    category: 'communication',
    author: 'Ustadh Wisam Sharieff',
    contentType: 'article',
    content:
      "L'ère numérique a introduit des défis uniques aux mariages que les générations précédentes n'ont pas connus. Cet article examine comment les couples musulmans peuvent naviguer des questions telles que les limites des réseaux sociaux, la confidentialité numérique entre époux, la gestion du temps d'écran, et le maintien d'une connexion réelle dans un monde de plus en plus virtuel. Il offre des solutions pratiques basées sur les principes islamiques de confiance, respect et équilibre...",
    imageUrl: '/placeholder.svg',
    tags: ['défis numériques', 'réseaux sociaux', 'problèmes modernes'],
    createdAt: '2024-03-01',
  },

  //Add new resources for enhanced resource center
  {
    id: '17',
    title: 'Les Étapes de la Rencontre Islamique',
    description:
      'Guide étape par étape pour une approche islamique de la rencontre, des premiers contacts au mariage.',
    category: 'compatibility',
    author: 'Sheikh Abdul Rahman Al-Sudais',
    contentType: 'guide',
    content:
      "La rencontre islamique suit des principes clairs qui protègent la dignité des deux parties tout en permettant une connaissance mutuelle appropriée. Ce guide détaille chaque étape : la niyyah (intention), la consultation familiale, les rencontres supervisées, l'évaluation de la compatibilité, et la prise de décision. Chaque étape est accompagnée de conseils pratiques et de références religieuses pour vous guider dans ce parcours béni...",
    imageUrl: '/placeholder.svg',
    tags: ['rencontre', 'étapes', 'supervision', 'intention'],
    createdAt: '2024-03-10',
    difficulty: 'beginner',
    readingTime: 25,
  },
  {
    id: '18',
    title: 'FAQ Complète du Mariage Islamique',
    description:
      'Réponses aux questions les plus fréquentes sur le mariage en Islam, basées sur les sources authentiques.',
    category: 'fiqh',
    author: 'Comité des Savants',
    contentType: 'faq',
    content:
      'Cette FAQ complète répond aux questions essentielles sur le mariage islamique : conditions de validité, droits et devoirs, résolution de conflits, questions financières, et bien plus. Chaque réponse est basée sur le Coran, la Sunna et les avis des savants reconnus...',
    imageUrl: '/placeholder.svg',
    tags: ['faq', 'questions', 'réponses', 'fiqh'],
    createdAt: '2024-02-20',
    featured: true,
  },
  {
    id: '19',
    title: 'Préparer sa Famille au Mariage',
    description:
      'Guide pour impliquer et préparer les familles des deux côtés pour un mariage harmonieux.',
    category: 'family',
    author: 'Dr. Tariq Ramadan',
    contentType: 'guide',
    content:
      'Le mariage islamique unit non seulement deux personnes mais aussi deux familles. Ce guide explore comment préparer et impliquer les familles de manière positive : communication inter-familiale, gestion des différences culturelles, préparation des cérémonies, et construction de relations durables. Des conseils pratiques pour naviguer les dynamiques familiales complexes tout en respectant les valeurs islamiques...',
    imageUrl: '/placeholder.svg',
    tags: ['famille', 'préparation', 'harmonie', 'communication'],
    createdAt: '2024-03-05',
    difficulty: 'intermediate',
    readingTime: 40,
  },
  {
    id: '20',
    title: 'La Dot (Mahr) : Droits et Pratiques',
    description:
      "Guide complet sur le mahr en Islam : signification, calcul, modalités et droits de l'épouse.",
    category: 'fiqh',
    author: 'Sheikh Yusuf Al-Qaradawi',
    contentType: 'article',
    content:
      "Le mahr est un droit fondamental de l'épouse en Islam, mais sa compréhension est souvent confuse. Cet article clarifie tous les aspects du mahr : sa signification spirituelle et juridique, les différents types (muqaddam et muakhar), les modalités de paiement, et la sagesse derrière cette institution. Il aborde aussi les pratiques contemporaines et les déviations à éviter, avec des exemples concrets et des conseils pratiques pour les couples modernes...",
    imageUrl: '/placeholder.svg',
    tags: ['mahr', 'dot', 'droits épouse', 'fiqh'],
    createdAt: '2024-02-28',
    featured: true,
  },
];

export const getResourcesByCategory = (categoryId: string): IslamicResource[] => {
  return islamicResources.filter((resource) => resource.category === categoryId);
};

export const getFeaturedResources = (): IslamicResource[] => {
  return islamicResources.filter((resource) => resource.featured);
};

export const getResourceById = (id: string): IslamicResource | undefined => {
  return islamicResources.find((resource) => resource.id === id);
};
