
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
