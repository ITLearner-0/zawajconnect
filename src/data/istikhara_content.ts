export interface DailyContent {
  day: number;
  hadith: {
    arabic: string;
    french: string;
    source: string;
  };
  reflection: string;
  dua?: string;
  advice: string;
}

export const istikharaDua = {
  arabic: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ ثُمَّ أَرْضِنِي بِهِ',
  transliteration: "Allâhumma innî astakhîruka bi 'ilmika, wa astaqdiruka bi qudratika, wa as'aluka min fadlika-l-'azîm, fa-innaka taqdiru wa lâ aqdiru, wa ta'lamu wa lâ a'lamu, wa anta 'allâmu-l-ghuyûb. Allâhumma in kunta ta'lamu anna hâdha-l-amra khayrun lî fî dînî wa ma'âshî wa 'âqibati amrî, fa-qdurhu lî wa yassirhu lî thumma bârik lî fîhi. Wa in kunta ta'lamu anna hâdha-l-amra sharrun lî fî dînî wa ma'âshî wa 'âqibati amrî, fa-srifhu 'annî wa-srifnî 'anhu, wa-qdur liya-l-khayra haythu kâna thumma ardinî bihi.",
  french: "Ô Allah, je Te demande de m'inspirer le bon choix par Ta science, je Te demande de m'accorder la capacité par Ta puissance, et je Te demande de Ta grâce immense. Car Tu es capable et je ne le suis pas, Tu sais et je ne sais pas, et Tu connais parfaitement les mystères. Ô Allah, si Tu sais que cette affaire est un bien pour ma religion, ma vie ici-bas et mon devenir, destine-la moi, facilite-la moi et bénis-la moi. Et si Tu sais que cette affaire est un mal pour ma religion, ma vie ici-bas et mon devenir, écarte-la de moi et écarte-moi d'elle, et destine-moi le bien où qu'il se trouve, puis rends-moi satisfait.",
  source: 'Sahih Al-Bukhârî, n°1162',
};

export const dailyContent: DailyContent[] = [
  {
    day: 1,
    hadith: {
      arabic: 'تُنْكَحُ الْمَرْأَةُ لِأَرْبَعٍ: لِمَالِهَا وَلِحَسَبِهَا وَلِجَمَالِهَا وَلِدِينِهَا فَاظْفَرْ بِذَاتِ الدِّينِ تَرِبَتْ يَدَاكَ',
      french: "On épouse une femme pour quatre choses : sa richesse, sa lignée, sa beauté et sa religion. Choisis celle qui a la religion, tu seras gagnant.",
      source: 'Al-Bukhârî & Muslim',
    },
    reflection: "Quelles sont les qualités que vous recherchez réellement chez un(e) époux/épouse ? Classez-les par ordre de priorité. La religion et le bon caractère sont-ils en tête de votre liste ?",
    advice: "Aujourd'hui, prenez le temps de faire la prière d'Istikhara après deux rak'at surérogatoires. Soyez sincère dans votre demande et ouvert(e) au résultat qu'Allah vous réserve.",
  },
  {
    day: 2,
    hadith: {
      arabic: 'إِذَا خَطَبَ إِلَيْكُمْ مَنْ تَرْضَوْنَ دِينَهُ وَخُلُقَهُ فَزَوِّجُوهُ',
      french: "Si quelqu'un dont vous êtes satisfaits de la religion et du caractère vous demande en mariage, mariez-le.",
      source: 'At-Tirmidhî',
    },
    reflection: "Le caractère (khuluq) de cette personne correspond-il à ce que le Prophète ﷺ nous recommande ? Comment se comporte-t-elle avec sa famille, ses amis, les inconnus ?",
    advice: "Observez les actions plus que les paroles. Le bon caractère se manifeste dans les moments difficiles, pas dans les moments faciles.",
  },
  {
    day: 3,
    hadith: {
      arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
      french: "Et parmi Ses signes, Il a créé pour vous des épouses de vous-mêmes pour que vous trouviez la quiétude auprès d'elles, et Il a mis entre vous de l'affection et de la miséricorde.",
      source: 'Coran, Sourate Ar-Rûm, 30:21',
    },
    reflection: "Ressentez-vous de la sakina (quiétude) en pensant à cette personne ? La mawadda (affection) et la rahma (miséricorde) sont-elles présentes dans votre relation ?",
    advice: "Les trois piliers du mariage islamique sont : la sakina, la mawadda et la rahma. Méditez sur chacun en pensant à cette personne.",
  },
  {
    day: 4,
    hadith: {
      arabic: 'خَيْرُكُمْ خَيْرُكُمْ لِأَهْلِهِ وَأَنَا خَيْرُكُمْ لِأَهْلِي',
      french: "Le meilleur d'entre vous est celui qui est le meilleur envers sa famille, et je suis le meilleur d'entre vous envers ma famille.",
      source: 'At-Tirmidhî',
    },
    reflection: "Comment cette personne traite-t-elle ses proches ? Est-elle respectueuse envers ses parents ? Patiente avec ses frères et sœurs ? C'est le meilleur indicateur de comment elle vous traitera.",
    advice: "Consultez votre Wali ou une personne de confiance. Le regard extérieur est précieux dans cette décision.",
  },
  {
    day: 5,
    hadith: {
      arabic: 'وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَى بِاللَّهِ وَكِيلًا',
      french: "Et place ta confiance en Allah. Allah suffit comme Protecteur.",
      source: 'Coran, Sourate Al-Ahzâb, 33:3',
    },
    reflection: "Faites-vous confiance au processus d'Allah ? Êtes-vous prêt(e) à accepter Sa réponse, même si elle ne correspond pas à vos désirs initiaux ?",
    advice: "Le tawakkul (confiance en Allah) ne signifie pas l'inaction. Faites vos efforts, consultez, et laissez Allah décider du résultat.",
  },
  {
    day: 6,
    hadith: {
      arabic: 'مَا تَرَكْتُ بَعْدِي فِتْنَةً أَضَرَّ عَلَى الرِّجَالِ مِنَ النِّسَاءِ',
      french: "Considère bien avant de t'engager, car le mariage est un engagement devant Allah. Il n'y a pas de banalité dans ce choix.",
      source: 'Parole attribuée aux salaf',
    },
    reflection: "Avez-vous discuté des sujets essentiels : enfants, finances, lieu de vie, belle-famille, pratique religieuse ? Quels sont vos points de convergence et de divergence ?",
    advice: "Relisez vos notes des jours précédents. La clarté vient souvent de la réflexion prolongée, pas de la décision impulsive.",
  },
  {
    day: 7,
    hadith: {
      arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
      french: "Et quiconque craint Allah, Il lui donnera une issue favorable et lui accordera Ses dons par des voies qu'il ne soupçonnait pas.",
      source: 'Coran, Sourate At-Talâq, 65:2-3',
    },
    reflection: "Après 7 jours de réflexion et de prière, quel est votre sentiment profond ? La paix ou l'inquiétude ? Le cœur du croyant est guidé par Allah.",
    advice: "C'est le moment de prendre votre décision. Pas de pression, pas de précipitation. Si vous n'êtes pas sûr(e), il est permis de prolonger votre réflexion.",
  },
];

export const moodLabels: Record<string, { label: string; emoji: string; color: string }> = {
  serene: { label: 'Serein(e)', emoji: '🤲', color: 'text-emerald-600 bg-emerald-100' },
  positive: { label: 'Positif/ve', emoji: '😊', color: 'text-blue-600 bg-blue-100' },
  neutral: { label: 'Neutre', emoji: '🤔', color: 'text-gray-600 bg-gray-100' },
  uncertain: { label: 'Incertain(e)', emoji: '💭', color: 'text-amber-600 bg-amber-100' },
  doubtful: { label: 'Hésitant(e)', emoji: '😔', color: 'text-orange-600 bg-orange-100' },
};
