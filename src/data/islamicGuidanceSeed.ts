export interface GuidanceEntry {
  category: string;
  title_fr: string;
  title_ar?: string;
  content_fr: string;
  source_reference: string;
  source_type: string;
  difficulty_level: string;
  display_context: string[];
}

export const guidanceSeedData: GuidanceEntry[] = [
  // CRITÈRES DU CHOIX DU CONJOINT
  {
    category: 'criteria',
    title_fr: "Les 4 critères du choix du conjoint",
    content_fr: "Le Prophète ﷺ a dit : « On épouse une femme pour quatre choses : sa richesse, sa lignée, sa beauté et sa religion. Choisis celle qui a la religion, tu seras gagnant. » Ce hadith établit clairement la hiérarchie des critères. Si la religion et le bon caractère sont solides, le reste se construit. L'inverse est rarement vrai.",
    source_reference: "Al-Bukhârî (5090) et Muslim (1466)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['matching', 'onboarding', 'dashboard'],
  },
  {
    category: 'criteria',
    title_fr: "Le bon caractère (khuluq) comme critère essentiel",
    content_fr: "Le Prophète ﷺ a dit : « Si quelqu'un dont vous êtes satisfaits de la religion et du caractère vous demande en mariage, mariez-le. Si vous ne le faites pas, il y aura de la corruption et un grand désordre sur terre. » Le caractère est indissociable de la religion. Un homme pieux mais au mauvais caractère n'est pas un bon parti.",
    source_reference: "At-Tirmidhî (1084)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['matching', 'onboarding'],
  },
  {
    category: 'criteria',
    title_fr: "Regarder sa future épouse",
    content_fr: "Le Prophète ﷺ a dit : « Quand l'un de vous veut demander en mariage une femme, qu'il regarde d'elle ce qui l'encouragerait à l'épouser, s'il le peut. » L'Islam ne demande pas de se marier à l'aveugle. Il est permis et même recommandé de voir la personne avant le mariage, dans le cadre du licite.",
    source_reference: "Ahmad et Abû Dâwûd",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['matching'],
  },
  {
    category: 'criteria',
    title_fr: "L'équivalence (kafâ'a) dans le mariage",
    content_fr: "Les savants ont discuté de la notion de kafâ'a (équivalence) entre les époux. Il ne s'agit pas d'égalité stricte mais de compatibilité dans les fondamentaux : pratique religieuse, milieu social, éducation. L'objectif est d'éviter les incompatibilités qui rendraient la vie commune difficile. La religion reste le critère principal.",
    source_reference: "Fiqh des 4 madhâhib",
    source_type: 'fiqh',
    difficulty_level: 'intermediate',
    display_context: ['matching'],
  },

  // DROITS ET DEVOIRS
  {
    category: 'rights_duties',
    title_fr: "Les droits de l'épouse en Islam",
    content_fr: "L'épouse a des droits fondamentaux : le mahr (dot), la nafaqa (entretien : logement, nourriture, vêtements), le bon traitement, et le droit de garder son propre argent. Allah dit : « Vivez avec elles de la meilleure façon » (An-Nisâ, 4:19). Le Prophète ﷺ a dit : « Le meilleur d'entre vous est celui qui est le meilleur envers sa femme. »",
    source_reference: "Coran, Sourate An-Nisâ 4:19 ; At-Tirmidhî",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['dashboard', 'istikhara'],
  },
  {
    category: 'rights_duties',
    title_fr: "Les droits de l'époux en Islam",
    content_fr: "L'époux a droit au respect, à l'obéissance dans le ma'rûf (ce qui est convenable), à la préservation de son foyer et de son honneur en son absence. Le Prophète ﷺ a dit : « La meilleure des femmes est celle qui te réjouit quand tu la regardes, qui t'obéit quand tu lui demandes, et qui préserve ton honneur et tes biens en ton absence. »",
    source_reference: "An-Nasâ'î",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['dashboard', 'istikhara'],
  },
  {
    category: 'rights_duties',
    title_fr: "Le mahr : droit inaliénable de l'épouse",
    content_fr: "Le mahr est un don obligatoire de l'époux à l'épouse. Il peut être de l'argent, des biens, ou même l'enseignement du Coran. Allah dit : « Donnez aux femmes leur mahr de bonne grâce » (An-Nisâ, 4:4). Le mahr de Fatima رضي الله عنها était une cotte de mailles. Le Prophète ﷺ a dit : « Le meilleur mariage est celui qui est le plus facile. »",
    source_reference: "Coran, An-Nisâ 4:4 ; Ahmad",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['dashboard'],
  },
  {
    category: 'rights_duties',
    title_fr: "La complémentarité des époux",
    content_fr: "Allah dit : « Elles sont un vêtement pour vous et vous êtes un vêtement pour elles » (Al-Baqarah, 2:187). Le vêtement protège, embellit et couvre les défauts. C'est la plus belle métaphore du couple en Islam : chacun protège l'autre, couvre ses faiblesses et l'embellit.",
    source_reference: "Coran, Sourate Al-Baqarah, 2:187",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['istikhara', 'chat'],
  },

  // COMMUNICATION
  {
    category: 'communication',
    title_fr: "La communication respectueuse dans le couple",
    content_fr: "Le Prophète ﷺ était le meilleur des époux en communication. Il écoutait, plaisantait gentiment, et ne haussait jamais la voix. Aïsha رضي الله عنها rapporte qu'il aidait aux tâches ménagères et participait à la vie du foyer. La communication en Islam commence par le respect mutuel, la patience et la douceur.",
    source_reference: "Al-Bukhârî, Livre des bonnes manières",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['chat'],
  },
  {
    category: 'communication',
    title_fr: "Résoudre les conflits comme le Prophète ﷺ",
    content_fr: "Quand un désaccord survient, le Prophète ﷺ ne criait pas, ne frappait pas, ne dénigrait pas. Il se retirait temporairement si nécessaire (comme lors de l'incident du choix des épouses), puis revenait avec sagesse. L'Islam recommande la médiation (hakam) avant toute rupture.",
    source_reference: "Coran, Sourate An-Nisâ 4:35",
    source_type: 'quran',
    difficulty_level: 'intermediate',
    display_context: ['chat'],
  },
  {
    category: 'communication',
    title_fr: "Les limites de la communication avant le mariage",
    content_fr: "Les échanges avant le mariage sont permis dans un cadre précis : présence ou information du Wali, sujets sérieux (religion, famille, projets), sans familiarité excessive. Le but est de connaître la personne pour prendre une décision éclairée, pas de développer une relation romantique pré-maritale.",
    source_reference: "Fatwa d'Ibn Bâz et Al-Uthaymîn",
    source_type: 'scholar',
    difficulty_level: 'beginner',
    display_context: ['chat', 'matching'],
  },

  // RELATIONS FAMILIALES
  {
    category: 'family_relations',
    title_fr: "Le rôle du Wali dans le mariage",
    content_fr: "Le Wali (tuteur) est un pilier du mariage islamique. Le Prophète ﷺ a dit : « Pas de mariage sans tuteur. » Le Wali protège les intérêts de sa protégée, vérifie le sérieux du prétendant, et participe à la négociation du contrat. C'est un rôle de protection, pas d'oppression.",
    source_reference: "Abû Dâwûd (2085) ; At-Tirmidhî (1101)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['onboarding', 'dashboard'],
  },
  {
    category: 'family_relations',
    title_fr: "Le respect de la belle-famille",
    content_fr: "Le Prophète ﷺ a insisté sur le bon traitement de la belle-famille. Le respect des beaux-parents est une extension du respect du conjoint. Cependant, cela ne signifie pas se soumettre à l'injustice. L'équilibre est de traiter la belle-famille avec bienveillance tout en préservant les limites du couple.",
    source_reference: "Sagesse des salaf",
    source_type: 'scholar',
    difficulty_level: 'intermediate',
    display_context: ['dashboard'],
  },
  {
    category: 'family_relations',
    title_fr: "Impliquer la famille dans la décision",
    content_fr: "Le mariage en Islam est l'union de deux familles. Impliquer ses parents tôt dans le processus est une sunnah et une sagesse. Ils apportent une perspective objective, une expérience de vie, et leur bénédiction (baraka). Même si l'avis final vous appartient, la consultation (shûra) familiale est vivement recommandée.",
    source_reference: "Coran, Sourate Ash-Shûra 42:38",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['matching', 'dashboard'],
  },

  // RÉSOLUTION DE CONFLITS
  {
    category: 'conflict_resolution',
    title_fr: "La médiation islamique (hakam)",
    content_fr: "Allah dit : « Si vous craignez le désaccord entre les deux conjoints, envoyez alors un arbitre de sa famille à lui et un arbitre de sa famille à elle. Si les deux veulent la réconciliation, Allah rétablira l'entente entre eux. » La médiation avant le divorce est une obligation islamique.",
    source_reference: "Coran, Sourate An-Nisâ 4:35",
    source_type: 'quran',
    difficulty_level: 'intermediate',
    display_context: ['dashboard'],
  },
  {
    category: 'conflict_resolution',
    title_fr: "La patience dans les épreuves conjugales",
    content_fr: "Le Prophète ﷺ a dit : « Le croyant ne doit pas détester sa croyante. S'il déteste en elle un caractère, il sera satisfait d'un autre. » Aucun couple n'est parfait. La patience (sabr) et le pardon sont les fondements d'un mariage durable. Cherchez les qualités, pas les défauts.",
    source_reference: "Muslim (1469)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['dashboard', 'chat'],
  },

  // SPIRITUEL
  {
    category: 'spiritual',
    title_fr: "La prière d'Istikhara pour le mariage",
    content_fr: "L'Istikhara est une sunnah recommandée pour toute décision importante. Le Prophète ﷺ l'enseignait à ses compagnons comme il leur enseignait une sourate du Coran. Priez 2 rak'at, puis récitez le dua en mentionnant votre besoin. Le résultat vient par la facilitation ou l'obstacle, pas nécessairement par un rêve.",
    source_reference: "Al-Bukhârî (1162)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['istikhara', 'matching'],
  },
  {
    category: 'spiritual',
    title_fr: "Le tawakkul dans la recherche du conjoint",
    content_fr: "Le Prophète ﷺ a dit : « Si vous vous en remettez véritablement à Allah, Il vous donnera votre subsistance comme Il la donne aux oiseaux : ils partent le matin le ventre vide et reviennent le soir rassasiés. » Faites vos efforts (sabab), puis remettez-vous à Allah (tawakkul). Le résultat Lui appartient.",
    source_reference: "At-Tirmidhî (2344)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['istikhara', 'dashboard'],
  },
  {
    category: 'spiritual',
    title_fr: "Le mariage comme moitié de la foi",
    content_fr: "Le Prophète ﷺ a dit : « Quand le serviteur d'Allah se marie, il a complété la moitié de sa foi. Qu'il craigne Allah pour l'autre moitié. » Le mariage n'est pas une fin en soi mais un moyen de compléter sa religion, de se rapprocher d'Allah, et de fonder une famille qui L'adore.",
    source_reference: "Al-Bayhaqî",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['onboarding', 'dashboard'],
  },
  {
    category: 'spiritual',
    title_fr: "Les trois piliers du couple : sakina, mawadda, rahma",
    content_fr: "Le verset 30:21 de la sourate Ar-Rûm mentionne trois dons divins dans le couple : as-sakîna (la quiétude), al-mawadda (l'affection profonde), et ar-rahma (la miséricorde). Ces trois éléments ne sont pas des options mais des signes d'Allah. Si vous les ressentez avec une personne, c'est un indicateur positif.",
    source_reference: "Coran, Sourate Ar-Rûm 30:21",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['istikhara', 'matching'],
  },

  // PRATIQUE
  {
    category: 'practical',
    title_fr: "Les étapes de la demande en mariage (khitba)",
    content_fr: "1. L'intérêt mutuel est manifesté\n2. Le Wali est informé et donne son accord de principe\n3. Les familles se rencontrent formellement\n4. Les conditions sont discutées (mahr, logement, etc.)\n5. L'Istikhara est faite par les deux parties\n6. La fatiha (accord) est prononcée\n7. Le contrat de mariage (nikah) est rédigé\n8. Le nikah est célébré",
    source_reference: "Fiqh du mariage - consensus des savants",
    source_type: 'fiqh',
    difficulty_level: 'beginner',
    display_context: ['dashboard', 'onboarding'],
  },
  {
    category: 'practical',
    title_fr: "Le contrat de mariage et ses clauses",
    content_fr: "Le contrat de mariage (aqd an-nikah) peut inclure des conditions, tant qu'elles ne contredisent pas la sharî'a. Les clauses permises incluent : le droit aux études, le lieu de résidence, le droit de travailler, etc. Le Prophète ﷺ a dit : « Les conditions les plus dignes d'être remplies sont celles par lesquelles vous avez rendu licites les relations intimes. »",
    source_reference: "Al-Bukhârî (2721) et Muslim (1418)",
    source_type: 'hadith',
    difficulty_level: 'intermediate',
    display_context: ['dashboard'],
  },
  {
    category: 'practical',
    title_fr: "La simplicité du mariage en Islam",
    content_fr: "Le Prophète ﷺ a dit : « Le mariage le plus béni est celui qui coûte le moins. » Et aussi : « Annoncez le mariage et faites-le dans les mosquées. » L'extravagance dans les cérémonies n'est pas une sunnah. La simplicité attire la baraka. Concentrez-vous sur l'essentiel : le contrat, la bénédiction, et le repas (walima).",
    source_reference: "Ahmad ; At-Tirmidhî",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['dashboard'],
  },

  // ENFANTS
  {
    category: 'children',
    title_fr: "L'éducation islamique des enfants",
    content_fr: "Le Prophète ﷺ a dit : « Chacun de vous est un berger et chacun de vous est responsable de son troupeau. » L'éducation des enfants commence par l'exemple des parents. Un foyer où Allah est mentionné, où le Coran est récité, et où la prière est établie, est le meilleur cadeau pour vos futurs enfants.",
    source_reference: "Al-Bukhârî (893) et Muslim (1829)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['dashboard'],
  },
  {
    category: 'children',
    title_fr: "Discuter des enfants avant le mariage",
    content_fr: "Il est essentiel de discuter de la vision parentale avant le mariage : nombre d'enfants souhaités, type d'éducation (islamique, publique, privée), rôle de chaque parent, place du Coran dans l'éducation. Un désaccord fondamental sur ces sujets peut être un véritable obstacle au mariage.",
    source_reference: "Conseil des savants contemporains",
    source_type: 'scholar',
    difficulty_level: 'beginner',
    display_context: ['matching'],
  },

  // PLUS DE CONTENU
  {
    category: 'criteria',
    title_fr: "Ne pas se fier aux apparences",
    content_fr: "Allah dit : « Ô hommes ! Nous vous avons créés d'un mâle et d'une femelle, et Nous avons fait de vous des nations et des tribus, pour que vous vous entre-connaissiez. Le plus noble d'entre vous auprès d'Allah est le plus pieux. » La vraie noblesse est dans la taqwa, pas dans l'apparence, la richesse ou la lignée.",
    source_reference: "Coran, Sourate Al-Hujurât 49:13",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['matching'],
  },
  {
    category: 'spiritual',
    title_fr: "L'intention pure (niyya) dans la recherche",
    content_fr: "Le Prophète ﷺ a dit : « Les actions ne valent que par les intentions. » Avant même de commencer votre recherche, purifiez votre intention. Cherchez-vous à compléter votre religion ? À fonder un foyer qui plaît à Allah ? À avoir une descendance pieuse ? L'intention pure attire la baraka divine.",
    source_reference: "Al-Bukhârî (1) et Muslim (1907)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['onboarding'],
  },
  {
    category: 'practical',
    title_fr: "La walima (repas de noces)",
    content_fr: "Le Prophète ﷺ a dit à Abdur-Rahman ibn Awf après son mariage : « Fais un repas de noces (walima), ne serait-ce qu'avec un mouton. » La walima est une sunnah fortement recommandée. C'est un moment de partage et de joie avec la communauté. Elle peut être simple, l'important est d'annoncer le mariage.",
    source_reference: "Al-Bukhârî (5167) et Muslim (1427)",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['dashboard'],
  },
  {
    category: 'rights_duties',
    title_fr: "Le devoir de bon traitement (mu'âshara bil-ma'rûf)",
    content_fr: "Allah ordonne : « Vivez avec elles de la meilleure façon (bil-ma'rûf). Si vous les détestez, il se peut que vous détestiez une chose dans laquelle Allah a placé un grand bien. » Le bon traitement n'est pas optionnel, c'est une obligation religieuse. Il englobe le respect, la douceur, la justice et la patience.",
    source_reference: "Coran, Sourate An-Nisâ 4:19",
    source_type: 'quran',
    difficulty_level: 'beginner',
    display_context: ['dashboard', 'chat'],
  },
  {
    category: 'communication',
    title_fr: "Écouter avant de parler",
    content_fr: "Le Prophète ﷺ écoutait ses épouses avec attention. Aïsha rapporte de longs dialogues où le Prophète l'écoutait patiemment. Dans le couple, écouter activement est plus important que de donner son avis. Avant de répondre, assurez-vous d'avoir compris ce que l'autre ressent, pas seulement ce qu'il dit.",
    source_reference: "Al-Bukhârî, Livre du mariage",
    source_type: 'hadith',
    difficulty_level: 'beginner',
    display_context: ['chat'],
  },
  {
    category: 'family_relations',
    title_fr: "Quand la famille s'oppose au mariage",
    content_fr: "Si le Wali refuse un prétendant sans raison valable (sharî'a), la femme peut recourir au juge islamique (qâdî) ou à un autre Wali. Les raisons valables de refus incluent : défaut de religion, de caractère, ou d'équivalence. Les raisons invalides incluent : la race, la nationalité, ou le niveau social seul.",
    source_reference: "Fiqh hanafite et malikite",
    source_type: 'fiqh',
    difficulty_level: 'advanced',
    display_context: ['dashboard'],
  },
];
