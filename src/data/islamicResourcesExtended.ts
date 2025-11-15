import { FaqItem } from '@/types/resources';

export const matrimonialFaqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Quelle est la différence entre les fiançailles islamiques et le mariage civil ?',
    answer:
      "Les fiançailles islamiques (khitbah) sont une promesse de mariage qui peut être rompue sans procédure légale. Le mariage islamique (nikah) est un contrat religieux qui nécessite des témoins, un tuteur (wali) pour la femme, et un mahr (dot). Le mariage civil est la reconnaissance légale par l'État.\n\nEn Islam, le nikah est considéré comme le vrai mariage, même s'il doit être accompagné du mariage civil pour être reconnu légalement dans de nombreux pays.",
    category: 'marriage-contract',
    tags: ['fiançailles', 'nikah', 'mariage civil', 'khitbah'],
    references: [
      "Coran 4:21 - 'Elles ont reçu de vous un engagement solennel'",
      'Sahih Bukhari 5136 - Hadith sur les conditions du mariage',
      'Fiqh us-Sunna par Sayyid Sabiq',
    ],
    author: 'Imam Hassan Al-Maghribi',
    lastUpdated: '2024-01-15',
  },
  {
    id: 'faq-2',
    question: 'Est-il permis de se rencontrer seul(e) avec son/sa fiancé(e) ?',
    answer:
      "Non, il n'est pas permis de se retrouver seul avec son/sa fiancé(e) avant le nikah (contrat de mariage). Cette règle s'appelle 'khalwa' (isolement) et s'applique à toute personne non-mahram.\n\nLes rencontres doivent se faire en présence d'un mahram (tuteur ou membre de la famille) ou dans un lieu public. Cette règle protège la chasteté et évite les tentations.\n\nAprès le nikah, même sans la célébration (zafaf), les époux peuvent se retrouver seuls car ils sont mariés religieusement.",
    category: 'courtship',
    tags: ['khalwa', 'fiançailles', 'rencontre', 'mahram'],
    references: [
      "Hadith: 'Aucun homme ne reste seul avec une femme sans que le diable soit le troisième' (Tirmidhi)",
      'Fiqh des relations pré-maritales par Sheikh Ibn Uthaymin',
    ],
    author: 'Dr. Aisha Abdel-Rahman',
    lastUpdated: '2024-02-10',
  },
  {
    id: 'faq-3',
    question: 'Quel est le montant approprié pour le mahr (dot) ?',
    answer:
      "Il n'y a pas de montant fixe pour le mahr en Islam. Le Prophète ﷺ a dit : 'Le meilleur mahr est le plus facile.' L'important est que le montant soit raisonnable et que les deux parties soient d'accord.\n\nLe mahr peut être :\n- De l'argent\n- Des bijoux\n- Des biens immobiliers\n- Même l'enseignement du Coran (comme dans le cas du Prophète avec Safiyya)\n\nIl faut éviter les excès qui peuvent créer des difficultés financières ou des discriminations sociales.",
    category: 'marriage-contract',
    tags: ['mahr', 'dot', 'montant', 'facilité'],
    references: [
      "Hadith: 'Le meilleur mahr est le plus facile' (Abu Dawud)",
      "Coran 4:4 - 'Donnez aux épouses leur mahr de bon gré'",
      'Fiqh du mariage par Sheikh Salih Al-Fawzan',
    ],
    author: 'Sheikh Omar Sulaiman',
    lastUpdated: '2024-01-20',
  },
  {
    id: 'faq-4',
    question: 'Comment gérer les désaccords familiaux concernant le choix du conjoint ?',
    answer:
      "Les désaccords familiaux sont délicats mais peuvent être résolus avec sagesse et patience :\n\n1. **Communication respectueuse** : Expliquez vos raisons de manière calme et réfléchie\n2. **Implication des sages** : Demandez l'aide d'un imam ou d'une personne respectée de la communauté\n3. **Compromis** : Cherchez des solutions qui respectent les préoccupations légitimes\n4. **Istikharah** : Priez la prière de consultation (Salat al-Istikharah)\n5. **Temps** : Donnez du temps à la famille pour accepter\n\nSi l'opposition est basée sur des préjugés non-islamiques (race, statut social), les parents ne peuvent pas s'opposer à un mariage avec une personne pieuse et compatible.",
    category: 'family',
    tags: ['famille', 'désaccords', 'parents', 'communication'],
    references: [
      "Hadith: 'Si quelqu'un dont vous agréez la religion et le caractère demande votre fille en mariage, mariez-la à lui' (Tirmidhi)",
      'Conseils familiaux islamiques par Dr. Jamal Badawi',
    ],
    author: 'Ustadha Yasmin Mogahed',
    lastUpdated: '2024-02-05',
  },
  {
    id: 'faq-5',
    question: 'Quels sont les droits de la femme dans le contrat de mariage ?',
    answer:
      "La femme a de nombreux droits garantis par l'Islam dans le contrat de mariage :\n\n**Droits financiers :**\n- Recevoir son mahr (dot) intégralement\n- Être entretenue financièrement (nafaqah)\n- Garder ses biens personnels\n\n**Droits personnels :**\n- Être traitée avec bonté et respect\n- Avoir son intimité respectée\n- Pouvoir visiter sa famille\n- Continuer ses études/travail (si convenu)\n\n**Droits religieux :**\n- Pratiquer sa religion librement\n- Avoir du temps pour ses adorations\n\n**Droits légaux :**\n- Inclure des conditions dans le contrat\n- Demander le divorce si les conditions ne sont pas respectées",
    category: 'marriage-contract',
    tags: ['droits femme', 'contrat', 'mahr', 'nafaqah'],
    references: [
      "Coran 4:19 - 'Comportez-vous envers elles de manière convenable'",
      "Hadith: 'Les meilleurs d'entre vous sont les meilleurs envers leurs épouses' (Tirmidhi)",
      'Fiqh des droits matrimoniaux par Sheikh Yusuf Al-Qaradawi',
    ],
    author: 'Dr. Ingrid Mattson',
    lastUpdated: '2024-01-25',
  },
  {
    id: 'faq-6',
    question: 'Comment faire la prière de consultation (Istikharah) pour le mariage ?',
    answer:
      "La prière d'Istikharah est recommandée pour toute décision importante, surtout le mariage :\n\n**Comment la faire :**\n1. Faire ses ablutions\n2. Prier 2 rakats de prière volontaire\n3. Réciter la dua d'Istikharah après la prière\n4. Demander à Allah de faciliter ce qui est bien et d'éloigner ce qui est mal\n\n**Après l'Istikharah :**\n- Ne cherchez pas de rêves ou de signes spéciaux\n- Observez si les choses se facilitent ou se compliquent\n- Continuez à faire cette prière pendant plusieurs jours\n- Prenez la décision qui vous semble la plus sage\n\nL'Istikharah ne remplace pas la réflexion et la consultation, mais demande la guidance divine.",
    category: 'courtship',
    tags: ['istikharah', 'prière', 'consultation', 'guidance'],
    references: [
      "Hadith d'Istikharah complet (Sahih Bukhari 1166)",
      "Guide de l'Istikharah par Sheikh Ibn Baz",
    ],
    author: 'Imam Suhaib Webb',
    lastUpdated: '2024-02-15',
  },
];

export const courtshipGuides = [
  {
    id: 'guide-1',
    title: 'Guide Complet des Fiançailles Islamiques',
    description:
      'Tout ce que vous devez savoir sur les fiançailles en Islam, de la demande aux préparatifs du mariage.',
    category: 'courtship',
    author: 'Dr. Yasir Qadhi',
    contentType: 'guide' as const,
    difficulty: 'beginner' as const,
    readingTime: 45,
    content:
      'Ce guide complet vous accompagne à travers toutes les étapes des fiançailles islamiques...',
    tags: ['fiançailles', 'khitbah', 'préparation', 'étapes'],
    createdAt: '2024-01-10',
    featured: true,
  },
  {
    id: 'guide-2',
    title: 'Communication Respectueuse Avant le Mariage',
    description:
      'Apprendre à communiquer efficacement et respectueusement avec son/sa futur(e) époux/épouse.',
    category: 'communication',
    author: 'Ustadha Zaynab Ansari',
    contentType: 'guide' as const,
    difficulty: 'intermediate' as const,
    readingTime: 30,
    content:
      "La communication est la clé d'un mariage réussi. Ce guide explore les principes islamiques...",
    tags: ['communication', 'respect', 'dialogue', 'préparation'],
    createdAt: '2024-01-15',
  },
  {
    id: 'guide-3',
    title: 'Impliquer les Familles dans le Processus',
    description:
      'Guide pour naviguer les dynamiques familiales et impliquer les deux familles de manière harmonieuse.',
    category: 'family',
    author: 'Sheikh Hamza Yusuf',
    contentType: 'guide' as const,
    difficulty: 'advanced' as const,
    readingTime: 60,
    content:
      "L'implication des familles est cruciale dans le mariage islamique. Ce guide avancé...",
    tags: ['famille', 'harmonie', 'médiation', 'tradition'],
    createdAt: '2024-01-20',
  },
];
