import { IslamicResource, ResourceCategory } from "@/types/resources";

export const resourceCategories: ResourceCategory[] = [
  {
    id: "marriage-prep",
    name: "Marriage Preparation",
    description: "Resources to help you prepare for marriage in accordance with Islamic principles",
    icon: "book-heart"
  },
  {
    id: "communication",
    name: "Communication",
    description: "Learn effective communication skills from an Islamic perspective",
    icon: "message-square"
  },
  {
    id: "fiqh",
    name: "Fiqh of Marriage",
    description: "Understanding the Islamic jurisprudence related to marriage",
    icon: "scale"
  },
  {
    id: "compatibility",
    name: "Compatibility",
    description: "Finding the right spouse according to Islamic guidance",
    icon: "heart-handshake"
  },
  {
    id: "family",
    name: "Family Life",
    description: "Building a successful family according to Quranic principles and Sunnah",
    icon: "home"
  }
];

export const islamicResources: IslamicResource[] = [
  {
    id: "1",
    title: "Choosing a Spouse: The Islamic Way",
    description: "Learn about the Islamic criteria for selecting a spouse and the importance of character and religious commitment.",
    category: "marriage-prep",
    author: "Dr. Yasir Qadhi",
    contentType: "article",
    content: "When choosing a spouse in Islam, the Prophet Muhammad (peace be upon him) taught us to prioritize religious commitment and character above all else. He said, 'A woman is married for four things: her wealth, her family status, her beauty, and her religion. Choose the one who is religious, may your hands be rubbed with dust!' (Bukhari and Muslim)...",
    imageUrl: "/placeholder.svg",
    tags: ["spouse selection", "marriage criteria", "islamic marriage"],
    createdAt: "2023-10-15",
    featured: true
  },
  {
    id: "2",
    title: "The Rights and Responsibilities in Marriage",
    description: "Understanding the mutual rights and responsibilities of spouses in Islam.",
    category: "fiqh",
    author: "Sh. Omar Suleiman",
    contentType: "article",
    content: "Marriage in Islam is a sacred covenant that establishes rights and responsibilities for both spouses. Allah says in the Quran, 'And they (women) have rights similar to those (of men) over them in kindness, and men are a degree above them. Allah is Mighty, Wise.' (Quran 2:228)...",
    imageUrl: "/placeholder.svg",
    tags: ["marriage rights", "responsibilities", "islamic fiqh"],
    createdAt: "2023-09-20"
  },
  {
    id: "3",
    title: "Effective Communication Between Spouses",
    description: "Practical advice on communication skills based on Islamic principles.",
    category: "communication",
    author: "Sr. Yasmin Mogahed",
    contentType: "guide",
    content: "Communication is the foundation of a successful marriage. The Prophet Muhammad (peace be upon him) was the best example of effective communication with his wives. He listened attentively, spoke kindly, and never raised his voice in anger...",
    imageUrl: "/placeholder.svg",
    tags: ["communication", "marriage advice", "conflict resolution"],
    createdAt: "2023-08-05"
  },
  {
    id: "4",
    title: "Financial Planning for Muslim Couples",
    description: "Islamic guidelines on managing finances in marriage and avoiding common pitfalls.",
    category: "marriage-prep",
    author: "Dr. Main Al-Qudah",
    contentType: "guide",
    url: "https://example.com/financial-planning",
    imageUrl: "/placeholder.svg",
    tags: ["finances", "wealth management", "planning"],
    createdAt: "2023-11-10"
  },
  {
    id: "5",
    title: "The Etiquettes of the Wedding Night",
    description: "Islamic guidance for newly married couples on their wedding night.",
    category: "marriage-prep",
    author: "Ustadha Zaynab Ansari",
    contentType: "article",
    content: "The wedding night is a special moment in a couple's life. Islam provides beautiful guidance to ensure this intimate experience is comfortable and blessed. Begin with the name of Allah, offer a light meal, pray two rakats together, and make dua for blessing in your union...",
    imageUrl: "/placeholder.svg",
    tags: ["wedding night", "intimacy", "newlyweds"],
    createdAt: "2023-07-22"
  },
  {
    id: "6",
    title: "Conflict Resolution in Marriage: The Prophetic Way",
    description: "Learn how the Prophet Muhammad (PBUH) resolved conflicts with his wives.",
    category: "communication",
    author: "Sh. Abdul Nasir Jangda",
    contentType: "video",
    url: "https://example.com/conflict-resolution",
    imageUrl: "/placeholder.svg",
    tags: ["conflict resolution", "prophetic example", "marital disputes"],
    createdAt: "2023-12-05"
  },
  {
    id: "7",
    title: "Understanding Compatibility Beyond Superficial Traits",
    description: "Islamic perspective on what makes couples truly compatible for a lasting marriage.",
    category: "compatibility",
    author: "Dr. Mohammad Akram Nadwi",
    contentType: "article",
    content: "Compatibility in marriage goes beyond physical attraction or social status. The Prophet Muhammad (peace be upon him) emphasized kafa'ah (compatibility) in terms of religious commitment, character, and values. This article explores how to assess compatibility from an Islamic perspective...",
    imageUrl: "/placeholder.svg",
    tags: ["compatibility", "spouse selection", "marriage success"],
    createdAt: "2023-10-30"
  },
  {
    id: "8",
    title: "The Role of the Wali in Marriage",
    description: "Understanding the importance and responsibilities of the marriage guardian in Islam.",
    category: "fiqh",
    author: "Sh. Yasir Birjas",
    contentType: "guide",
    content: "The wali (guardian) plays a crucial role in Islamic marriages, particularly for women. This guide explains the qualifications of a wali, their responsibilities, and the wisdom behind this requirement in Islamic law...",
    imageUrl: "/placeholder.svg",
    tags: ["wali", "guardian", "islamic marriage"],
    createdAt: "2023-09-15",
    featured: true
  },
  {
    id: "9",
    title: "Financial Planning in Islamic Marriage",
    description: "Learn how to manage finances as a Muslim couple according to Shariah principles.",
    category: "marriage-prep",
    author: "Dr. Hatem al-Haj",
    contentType: "guide",
    content: "Financial management in marriage is a crucial aspect that many couples overlook. Islam provides comprehensive guidance on how spouses should handle their wealth. This guide covers topics like the husband's financial responsibilities, joint accounts vs. separate accounts, budgeting according to Islamic principles, avoiding riba (interest), and investing in halal opportunities...",
    imageUrl: "/placeholder.svg",
    tags: ["finances", "halal investing", "budgeting", "wealth management"],
    createdAt: "2023-11-25"
  },
  {
    id: "10",
    title: "The Prophet's ﷺ Example of Being a Spouse",
    description: "Practical lessons from the Prophet Muhammad's ﷺ married life that couples can implement today.",
    category: "communication",
    author: "Ustadha Hosai Mojaddidi",
    contentType: "article",
    content: "The Prophet Muhammad ﷺ was the best of examples in all aspects of life, including how he treated his wives. He would help with household chores, engage in playful activities with his wives, and consult them in important matters. Aisha (RA) reported: 'The Prophet ﷺ used to mend his shoes, sew his clothes and work with his hands as any of you works in his house.' This article explores practical ways modern couples can implement these prophetic examples...",
    imageUrl: "/placeholder.svg",
    tags: ["prophetic example", "sunnah", "marital harmony"],
    createdAt: "2023-10-12",
    featured: true
  },
  {
    id: "11",
    title: "Understanding the Concept of Mahr in Islam",
    description: "A comprehensive guide to mahr (dowry) in Islamic marriages - its purpose, types, and modern applications.",
    category: "fiqh",
    author: "Sh. Joe Bradford",
    contentType: "guide",
    content: "Mahr is an essential element of an Islamic marriage contract. It is a gift from the husband to his wife at the time of marriage, symbolizing respect, honor, and financial security. This guide explores the fiqh rulings related to mahr from different madhabs, discusses reasonable amounts in today's context, and addresses common issues couples face regarding dowry negotiations...",
    imageUrl: "/placeholder.svg",
    tags: ["mahr", "dowry", "islamic fiqh", "marriage contract"],
    createdAt: "2023-09-30"
  },
  {
    id: "12",
    title: "Premarital Counseling from an Islamic Perspective",
    description: "The importance of counseling before marriage and how it aligns with Islamic values of preparation and compatibility.",
    category: "compatibility",
    author: "Dr. Mariam Tanwir",
    contentType: "video",
    url: "https://example.com/premarital-counseling",
    imageUrl: "/placeholder.svg",
    tags: ["counseling", "preparation", "compatibility"],
    createdAt: "2023-12-15"
  },
  {
    id: "13",
    title: "Raising Children in a Western Society: Islamic Guidelines",
    description: "Balancing Islamic values and Western culture when raising Muslim children.",
    category: "family",
    author: "Imam Suhaib Webb",
    contentType: "article",
    content: "One of the greatest challenges Muslim parents face in Western countries is raising children who maintain their Islamic identity while navigating the surrounding culture. This article provides practical advice on establishing Islamic foundations at home, dealing with schools and media influences, building a support community, and maintaining open communication with children as they grow...",
    imageUrl: "/placeholder.svg",
    tags: ["parenting", "children", "western society", "islamic identity"],
    createdAt: "2024-01-05",
    featured: true
  },
  {
    id: "14",
    title: "The Art of Disagreement in Marriage",
    description: "Islamic etiquettes of handling conflicts and disagreements between spouses.",
    category: "communication",
    author: "Sr. Dalia Mogahed",
    contentType: "guide",
    content: "Conflicts are inevitable in any relationship, including marriage. What matters is how couples handle these disagreements. This guide explores the Islamic approach to conflict resolution between spouses, drawing from Quranic guidance and prophetic examples. Topics include controlling anger, speaking respectfully, focusing on issues rather than personalities, the proper timing of discussions, and seeking reconciliation...",
    imageUrl: "/placeholder.svg",
    tags: ["conflict resolution", "communication", "marital harmony"],
    createdAt: "2024-02-10"
  },
  {
    id: "15",
    title: "Intimacy in Marriage: An Islamic Perspective",
    description: "Understanding physical and emotional intimacy within the halal boundaries of marriage.",
    category: "marriage-prep",
    author: "Dr. Ekram & Dr. Mohamed Rida Beshir",
    contentType: "book",
    url: "https://example.com/intimacy-book",
    imageUrl: "/placeholder.svg",
    tags: ["intimacy", "marital relations", "emotional connection"],
    createdAt: "2023-08-22"
  },
  {
    id: "16",
    title: "Digital Age Challenges in Muslim Marriages",
    description: "Addressing issues like social media, digital privacy, and screen time in modern Muslim marriages.",
    category: "communication",
    author: "Ustadh Wisam Sharieff",
    contentType: "article",
    content: "The digital age has introduced unique challenges to marriages that previous generations didn't face. This article examines how Muslim couples can navigate issues such as social media boundaries, digital privacy between spouses, managing screen time, and maintaining real connection in an increasingly virtual world. It offers practical solutions based on Islamic principles of trust, respect, and balance...",
    imageUrl: "/placeholder.svg",
    tags: ["digital challenges", "social media", "modern issues"],
    createdAt: "2024-03-01"
  }
];

export const getResourcesByCategory = (categoryId: string): IslamicResource[] => {
  return islamicResources.filter(resource => resource.category === categoryId);
};

export const getFeaturedResources = (): IslamicResource[] => {
  return islamicResources.filter(resource => resource.featured);
};

export const getResourceById = (id: string): IslamicResource | undefined => {
  return islamicResources.find(resource => resource.id === id);
};
