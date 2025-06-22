
export interface ResourceCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface IslamicResource {
  id: string;
  title: string;
  description: string;
  category: string;
  author?: string;
  source?: string;
  contentType: 'article' | 'video' | 'guide' | 'book' | 'faq';
  url?: string;
  content?: string;
  imageUrl?: string;
  tags: string[];
  createdAt: string;
  featured?: boolean;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  readingTime?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
  references?: string[];
  author?: string;
  lastUpdated: string;
}

export interface ResourceStats {
  totalResources: number;
  totalReads: number;
  averageRating: number;
  popularTags: string[];
}
